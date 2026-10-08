import json
import os
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import numpy as np
from app.config import settings

class VectorStore:
    _instance: Optional["VectorStore"] = None

    def __init__(self, index_dir: Optional[Path] = None):
        self.index_dir: Path = index_dir or settings.VECTOR_DB_PATH
        self.index_file: Path = self.index_dir / "uniassist.index"
        self.metadata_file: Path = self.index_dir / "metadata.json"
        self.index = None
        self.metadata: List[Dict[str, Any]] = []
        self._loaded: bool = False

    @classmethod
    def get_instance(cls) -> "VectorStore":
        if cls._instance is None:
            cls._instance = cls()
            cls._instance.load()
        return cls._instance

    def is_ready(self) -> bool:
        return self._loaded and self.index is not None and self.index.ntotal > 0

    def get_indexed_document_count(self) -> int:
        if not self.metadata:
            return 0
        doc_ids = {item.get("document_id") for item in self.metadata if item.get("document_id")}
        return len(doc_ids)

    def get_total_chunks(self) -> int:
        return len(self.metadata)

    def build_and_save(self, chunks: List[Dict[str, Any]], embeddings: np.ndarray) -> None:
        import faiss

        if len(chunks) == 0 or embeddings.shape[0] == 0:
            print("[VectorStore] No chunks to index.")
            return

        dim = embeddings.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(embeddings)

        self.index_dir.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(self.index_file))

        with open(self.metadata_file, "w", encoding="utf-8") as f:
            json.dump(chunks, f, ensure_ascii=False, indent=2)

        self.index = index
        self.metadata = chunks
        self._loaded = True
        print(f"[VectorStore] Index saved successfully with {index.ntotal} vectors.")

    def load(self) -> bool:
        if not self.index_file.exists() or not self.metadata_file.exists():
            self._loaded = False
            return False

        try:
            import faiss
            self.index = faiss.read_index(str(self.index_file))
            with open(self.metadata_file, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)
            self._loaded = True
            return True
        except Exception as e:
            print(f"[VectorStore] Error loading index: {e}")
            self._loaded = False
            return False

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 4,
    ) -> List[Tuple[Dict[str, Any], float]]:
        if not self.is_ready():
            return []

        if query_vector.ndim == 1:
            query_vector = np.expand_dims(query_vector, axis=0)

        query_vector = query_vector.astype("float32")
        k = min(top_k, self.index.ntotal)
        if k <= 0:
            return []

        distances, indices = self.index.search(query_vector, k)

        results: List[Tuple[Dict[str, Any], float]] = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx >= 0 and idx < len(self.metadata):
                score = float(dist)
                normalized_score = max(0.0, min(1.0, score))
                results.append((self.metadata[idx], normalized_score))

        return results
