import sys
from pathlib import Path
from app.config import settings
from app.knowledge_base.loader import discover_documents
from app.knowledge_base.chunker import chunk_documents
from app.retrieval.embeddings import EmbeddingService
from app.retrieval.vector_store import VectorStore

def run_ingestion() -> bool:
    print(f"[Ingest] Scanning knowledge base directory: {settings.KNOWLEDGE_BASE_PATH}")
    if not settings.KNOWLEDGE_BASE_PATH.exists():
        settings.KNOWLEDGE_BASE_PATH.mkdir(parents=True, exist_ok=True)

    documents, ocr_required = discover_documents(settings.KNOWLEDGE_BASE_PATH)
    total_found = len(documents) + len(ocr_required)

    if total_found == 0:
        print(f"No documents found in '{settings.KNOWLEDGE_BASE_PATH}'. Place PDF, TXT, or MD files there to index.")
        return False

    print(f"\nOfficial documents found: {total_found}")
    print(f"Successfully processed: {len(documents)}")
    print(f"OCR required: {len(ocr_required)}")
    if ocr_required:
        for fname in ocr_required:
            print(f"  - [DOCUMENT REQUIRES OCR]: {fname}")

    chunks = chunk_documents(documents)
    if not chunks:
        print("[Ingest] No text chunks could be extracted from documents.")
        return False

    print(f"\nDocuments indexed: {len(documents)}")
    print(f"Chunks created: {len(chunks)}")
    print("Generating embeddings with SentenceTransformers...")

    embed_service = EmbeddingService.get_instance()
    texts = [c["text"] for c in chunks]
    embeddings = embed_service.embed_texts(texts)

    vector_store = VectorStore.get_instance()
    vector_store.build_and_save(chunks, embeddings)

    print("FAISS index created successfully.")
    return True

if __name__ == "__main__":
    success = run_ingestion()
    sys.exit(0 if success else 1)
