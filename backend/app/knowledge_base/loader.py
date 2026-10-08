import json
import os
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
try:
    import pymupdf as fitz
except ImportError:
    import fitz

class DocumentPage:
    def __init__(self, page_number: int, text: str, section: str = "General"):
        self.page_number = page_number
        self.text = text
        self.section = section

class LoadedDocument:
    def __init__(
        self,
        document_id: str,
        title: str,
        source: str,
        category: str,
        pages: List[DocumentPage],
        source_url: Optional[str] = None,
        source_page_url: Optional[str] = None,
        document_date: Optional[str] = None,
        requires_ocr: bool = False,
    ):
        self.document_id = document_id
        self.title = title
        self.source = source
        self.category = category
        self.pages = pages
        self.source_url = source_url
        self.source_page_url = source_page_url
        self.document_date = document_date
        self.requires_ocr = requires_ocr

def clean_text(text: str) -> str:
    """Normalize whitespace and strip unprintable characters."""
    text = re.sub(r'\r\n', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def detect_section(text: str, default_section: str = "General") -> str:
    """Extract probable section header from the first few lines of text."""
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for line in lines[:5]:
        md_match = re.match(r'^#{1,4}\s+(.+)$', line)
        if md_match:
            return md_match.group(1).strip()
        sec_match = re.match(r'^(Section|Article|Clause|Policy|Part|Chapter)\s*[\d\.]*[:\-]?\s*(.+)?$', line, re.IGNORECASE)
        if sec_match:
            return line
        if line.isupper() and 4 < len(line) < 60:
            return line.title()
    return default_section

def load_pdf(file_path: Path, meta: Optional[Dict[str, Any]] = None) -> LoadedDocument:
    meta = meta or {}
    doc_id = meta.get("document_id") or file_path.stem.lower()
    title = meta.get("title") or file_path.stem.replace("-", " ").replace("_", " ").title()
    category = meta.get("category", "Other")
    source_url = meta.get("source_url")
    source_page_url = meta.get("source_page_url")
    document_date = meta.get("document_date")

    pages: List[DocumentPage] = []
    total_extracted_chars = 0

    pdf = fitz.open(str(file_path))
    try:
        for page_idx in range(len(pdf)):
            page = pdf[page_idx]
            raw_text = page.get_text("text")
            cleaned = clean_text(raw_text)
            total_extracted_chars += len(cleaned)
            if cleaned:
                section = detect_section(cleaned, default_section=f"Page {page_idx + 1}")
                pages.append(DocumentPage(page_number=page_idx + 1, text=cleaned, section=section))
    finally:
        pdf.close()

    # Check if image-only/scanned PDF requiring OCR
    requires_ocr = False
    if total_extracted_chars < 50:
        requires_ocr = True
        print(f"[Warning] DOCUMENT REQUIRES OCR: {file_path.name}")

    return LoadedDocument(
        document_id=doc_id,
        title=title,
        source=file_path.name,
        category=category,
        pages=pages,
        source_url=source_url,
        source_page_url=source_page_url,
        document_date=document_date,
        requires_ocr=requires_ocr,
    )

def load_text_or_markdown(file_path: Path, meta: Optional[Dict[str, Any]] = None) -> LoadedDocument:
    meta = meta or {}
    doc_id = meta.get("document_id") or file_path.stem.lower()
    title = meta.get("title") or file_path.stem.replace("-", " ").replace("_", " ").title()
    category = meta.get("category", "Other")
    source_url = meta.get("source_url")
    source_page_url = meta.get("source_page_url")
    document_date = meta.get("document_date")

    pages: List[DocumentPage] = []
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    cleaned = clean_text(content)
    if not cleaned:
        return LoadedDocument(
            document_id=doc_id,
            title=title,
            source=file_path.name,
            category=category,
            pages=[],
            source_url=source_url,
            source_page_url=source_page_url,
            document_date=document_date,
        )

    pattern = r'(?:^|\n)\s*[-=]{3,}\s*Page\s+(\d+)\s*[-=]{3,}\s*\n'
    matches = list(re.finditer(pattern, cleaned, flags=re.IGNORECASE))
    if matches:
        for idx, match in enumerate(matches):
            page_num = int(match.group(1))
            start_pos = match.end()
            end_pos = matches[idx + 1].start() if idx + 1 < len(matches) else len(cleaned)
            page_text = cleaned[start_pos:end_pos].strip()
            if page_text:
                section = detect_section(page_text, default_section=f"Section {page_num}")
                pages.append(DocumentPage(page_number=page_num, text=page_text, section=section))
    else:
        section = detect_section(cleaned, default_section="General")
        pages.append(DocumentPage(page_number=1, text=cleaned, section=section))

    return LoadedDocument(
        document_id=doc_id,
        title=title,
        source=file_path.name,
        category=category,
        pages=pages,
        source_url=source_url,
        source_page_url=source_page_url,
        document_date=document_date,
    )

def load_document(file_path: Path, manifest: Optional[Dict[str, Any]] = None) -> LoadedDocument:
    meta = None
    if manifest and file_path.name in manifest:
        meta = manifest[file_path.name]

    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return load_pdf(file_path, meta=meta)
    else:
        return load_text_or_markdown(file_path, meta=meta)

def discover_documents(documents_dir: Path) -> Tuple[List[LoadedDocument], List[str]]:
    """Discovers and loads documents from directory.
    Returns: (list_of_loaded_documents, list_of_ocr_required_filenames)
    """
    if not documents_dir.exists() or not documents_dir.is_dir():
        return [], []

    manifest = {}
    manifest_file = documents_dir / "documents_manifest.json"
    if manifest_file.exists():
        try:
            with open(manifest_file, "r", encoding="utf-8") as f:
                manifest = json.load(f)
        except Exception as e:
            print(f"[Warning] Failed to load documents_manifest.json: {e}")

    supported_exts = [".pdf", ".txt", ".md", ".markdown"]
    loaded_docs: List[LoadedDocument] = []
    ocr_required: List[str] = []

    for file_path in sorted(documents_dir.iterdir()):
        if file_path.is_file() and file_path.suffix.lower() in supported_exts:
            try:
                doc = load_document(file_path, manifest=manifest)
                if doc.requires_ocr or not doc.pages:
                    ocr_required.append(file_path.name)
                else:
                    loaded_docs.append(doc)
            except Exception as e:
                print(f"[Warning] Error loading {file_path.name}: {e}")

    return loaded_docs, ocr_required
