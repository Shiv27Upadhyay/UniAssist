from typing import List, Optional
import numpy as np
from app.config import settings

class EmbeddingService:
    _instance: Optional["EmbeddingService"] = None
    _model = None

    def __init__(self, model_name: Optional[str] = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self._mock_mode: bool = False

    @classmethod
    def get_instance(cls) -> "EmbeddingService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_model(self):
        if self._model is None and not self._mock_mode:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except Exception as e:
                print(f"[Warning] Could not load SentenceTransformer '{self.model_name}': {e}")
                print("[Info] Falling back to deterministic mock embedding for development.")
                self._mock_mode = True

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        """Generate L2-normalized embeddings for a list of texts."""
        if not texts:
            return np.empty((0, 384), dtype="float32")

        self._load_model()
        if self._mock_mode or self._model is None:
            dim = 384
            vecs = []
            for text in texts:
                np.random.seed(abs(hash(text)) % (2**32))
                v = np.random.randn(dim).astype("float32")
                norm = np.linalg.norm(v)
                vecs.append(v / (norm if norm > 0 else 1.0))
            return np.vstack(vecs).astype("float32")

        embeddings = self._model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True,
        )
        return embeddings.astype("float32")

    def embed_query(self, query: str) -> np.ndarray:
        """Generate L2-normalized embedding for a single query."""
        vecs = self.embed_texts([query])
        return vecs[0]
