import tempfile
from pathlib import Path
import numpy as np
import pytest

from app.knowledge_base.loader import load_text_or_markdown, load_pdf, LoadedDocument, DocumentPage
from app.knowledge_base.chunker import chunk_documents, split_text_into_chunks
from app.retrieval.vector_store import VectorStore

def test_load_text_document(tmp_path):
    doc_path = tmp_path / "test_regulations.txt"
    doc_path.write_text(
        "=== Page 1 ===\n## Section 1: Attendance\nStudents must attend 75% of classes.\n\n"
        "=== Page 2 ===\n## Section 2: Exams\nExams start in December.",
        encoding="utf-8"
    )
    doc = load_text_or_markdown(doc_path)
    assert doc.document_id == "test-regulations"
    assert doc.title == "Test Regulations"
    assert len(doc.pages) == 2
    assert doc.pages[0].page_number == 1
    assert "Attendance" in doc.pages[0].section
    assert doc.pages[1].page_number == 2

def test_chunking_preserves_metadata():
    pages = [
        DocumentPage(page_number=1, text="Paragraph one on grading policies.", section="Grading"),
        DocumentPage(page_number=2, text="Paragraph two on graduation credits.", section="Credits"),
    ]
    doc = LoadedDocument(
        document_id="academic-2026",
        title="Academic Regulations",
        source="regulations.txt",
        category="Academic",
        pages=pages,
    )
    chunks = chunk_documents([doc])
    assert len(chunks) == 2
    for chunk in chunks:
        assert "document_id" in chunk
        assert "title" in chunk
        assert "section" in chunk
        assert "page" in chunk
        assert "category" in chunk
        assert "source" in chunk
        assert "text" in chunk
        assert chunk["document_id"] == "academic-2026"

def test_split_text_into_chunks_overlap():
    long_text = "Sentence one. " * 50
    chunks = split_text_into_chunks(long_text, target_size=100, overlap=20)
    assert len(chunks) > 1
    assert all(len(c) <= 200 for c in chunks)

def test_vector_store_lifecycle(tmp_path):
    store = VectorStore(index_dir=tmp_path)
    assert not store.is_ready()
    assert store.get_indexed_document_count() == 0

    chunks = [
        {
            "chunk_id": "c1",
            "document_id": "doc-1",
            "title": "Doc 1",
            "section": "Sec 1",
            "page": 1,
            "category": "Academic",
            "source": "doc1.txt",
            "text": "Attendance is 75 percent.",
        },
        {
            "chunk_id": "c2",
            "document_id": "doc-2",
            "title": "Doc 2",
            "section": "Sec 2",
            "page": 1,
            "category": "Library",
            "source": "doc2.txt",
            "text": "Library closes at 10 PM.",
        },
    ]

    # Create dummy normalized 2D vectors
    dim = 384
    v1 = np.ones((1, dim), dtype="float32")
    v1 = v1 / np.linalg.norm(v1)
    v2 = np.zeros((1, dim), dtype="float32")
    v2[0, 0] = 1.0
    embeddings = np.vstack([v1, v2])

    store.build_and_save(chunks, embeddings)
    assert store.is_ready()
    assert store.get_indexed_document_count() == 2
    assert store.get_total_chunks() == 2

    # Query with identical vector v1
    results = store.search(v1[0], top_k=2)
    assert len(results) == 2
    top_chunk, top_score = results[0]
    assert top_chunk["document_id"] == "doc-1"
    assert top_score >= 0.99  # Normalized cosine similarity close to 1.0
