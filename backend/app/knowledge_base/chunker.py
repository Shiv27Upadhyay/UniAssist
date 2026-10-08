import re
from typing import List, Dict, Any
from app.knowledge_base.loader import LoadedDocument, DocumentPage, detect_section

def split_text_into_chunks(
    text: str,
    target_size: int = 650,
    overlap: int = 120,
) -> List[str]:
    """Split text into chunks of target size with character overlap on sentence/paragraph boundaries."""
    text = text.strip()
    if not text:
        return []
    
    if len(text) <= target_size:
        return [text]

    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks: List[str] = []
    current_chunk = ""

    for para in paragraphs:
        if len(para) > target_size:
            sentences = re.split(r'(?<=[.!?])\s+', para)
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue
                if len(current_chunk) + len(sentence) + 1 <= target_size:
                    current_chunk = f"{current_chunk} {sentence}".strip()
                else:
                    if current_chunk:
                        chunks.append(current_chunk)
                        tail = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
                        current_chunk = f"{tail} {sentence}".strip()
                    else:
                        chunks.append(sentence)
                        current_chunk = ""
        else:
            if len(current_chunk) + len(para) + 2 <= target_size:
                current_chunk = f"{current_chunk}\n\n{para}".strip()
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                    tail = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
                    current_chunk = f"{tail}\n\n{para}".strip()
                else:
                    chunks.append(para)
                    current_chunk = ""

    if current_chunk and (not chunks or current_chunk != chunks[-1]):
        chunks.append(current_chunk)

    return chunks

def chunk_documents(
    documents: List[LoadedDocument],
    target_size: int = 650,
    overlap: int = 120,
) -> List[Dict[str, Any]]:
    chunks_data: List[Dict[str, Any]] = []

    for doc in documents:
        for page in doc.pages:
            raw_page_chunks = split_text_into_chunks(page.text, target_size=target_size, overlap=overlap)
            for idx, chunk_text in enumerate(raw_page_chunks):
                section = detect_section(chunk_text, default_section=page.section)
                chunk_entry = {
                    "chunk_id": f"{doc.document_id}-p{page.page_number}-c{idx+1}",
                    "document_id": doc.document_id,
                    "title": doc.title,
                    "section": section,
                    "page": page.page_number,
                    "category": doc.category,
                    "source": doc.source,
                    "source_url": doc.source_url,
                    "source_page_url": doc.source_page_url,
                    "document_date": doc.document_date,
                    "text": chunk_text,
                }
                chunks_data.append(chunk_entry)

    return chunks_data
