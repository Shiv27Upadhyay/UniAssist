# UniAssist — AI-Powered Student Chatbot (Backend)

UniAssist is an official university information assistant engineered for the IEEE Day Hackathon 2026 (Problem Statement PS-3). UniAssist answers student queries **strictly and exclusively** using verified university knowledge base documents (PDF, TXT, Markdown).

---

## Key Principle: Zero Hallucination

UniAssist enforces rigorous anti-hallucination safeguards:
- **Similarity Threshold Filter**: Retrieval queries below the confidence threshold (`RETRIEVAL_THRESHOLD=0.45`) return an immediate "Information Unavailable" response without calling the LLM.
- **Strict Context Boundary**: The LLM prompt isolates retrieved chunks as untrusted reference data, explicitly barring the use of external knowledge or assumptions.
- **Traceable Real Sources**: Citations and metadata (`document_id`, `title`, `section`, `page`) are constructed exclusively from actually retrieved chunks. UniAssist never fabricates documents or citations.
- **Prompt Injection Defense**: User queries cannot override systemic grounding instructions or leak unverified data.

---

## Architecture

```
React / Vite Frontend (http://localhost:5173)
       │
       │ HTTP POST /api/chat  |  GET /api/health
       ▼
FastAPI Backend (Uvicorn, Python 3.10)
       │
       ▼
Query Processing & Embeddings (sentence-transformers/all-MiniLM-L6-v2)
       │
       ▼
FAISS Vector Search (IndexFlatIP with L2 Normalization)
       │
       ▼
Cosine Similarity Evaluation vs RETRIEVAL_THRESHOLD (0.45)
       │
       ├─────────────────────────────────┬─────────────────────────────────┐
       ▼                                 ▼                                 ▼
Below Threshold                    Above Threshold                    Post-Gen Verification
Information Unavailable            Grounded Context Prompt            Grounded Flag: True
No LLM Call                        OpenAI-Compatible LLM / Demo       Real Sources Metadata
is_grounded: false                 is_grounded: true                  Suggested Questions
```

---

## Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── health.py        # GET /api/health with dynamic doc counts
│   │   └── chat.py          # POST /api/chat query endpoint
│   ├── knowledge_base/
│   │   ├── loader.py        # Multi-format doc loader (PDF with page retention, TXT, MD)
│   │   ├── chunker.py       # Sentence-aware chunker retaining metadata
│   │   └── ingest.py        # Ingestion CLI tool (python -m app.knowledge_base.ingest)
│   ├── retrieval/
│   │   ├── embeddings.py    # SentenceTransformers embedding service
│   │   └── vector_store.py  # FAISS index and metadata store
│   ├── schemas/
│   │   └── chat.py          # Pydantic validation schemas
│   ├── services/
│   │   ├── chat_service.py  # Retrieval orchestration, scoring, fallback logic
│   │   └── llm_service.py   # OpenAI-compatible LLM client & Demo Mode
│   ├── config.py            # Environment settings and paths
│   └── main.py              # FastAPI app, CORS, error handlers
├── data/
│   ├── documents/           # University documents (PDF, TXT, MD)
│   └── index/               # Persisted FAISS index & metadata.json
├── tests/
│   ├── test_health.py       # Health check & CORS tests
│   ├── test_retrieval.py    # Loader, chunker, vector store tests
│   └── test_chat.py         # Grounding, fallback, validation, injection tests
├── .env.example
├── .gitignore
├── pytest.ini
├── requirements.txt
└── README.md
```

---

## Prerequisites & Installation

### Requirements
- Python 3.10+
- Windows, macOS, or Linux

### 1. Create and Activate Virtual Environment
```bash
# Windows
py -3.10 -m venv venv
venv\Scripts\activate

# macOS / Linux
python3.10 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Parameters in `.env`:
| Variable | Default | Description |
|---|---|---|
| `LLM_API_KEY` | *(empty)* | Optional. OpenAI-compatible API key. If empty, runs in safe extractive Demo Mode. |
| `LLM_MODEL` | `gpt-4o-mini` | Model identifier |
| `LLM_BASE_URL` | `https://api.openai.com/v1` | Base URL for LLM provider |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | HuggingFace embedding model |
| `VECTOR_DB_PATH` | `data/index` | Directory for FAISS index and metadata |
| `KNOWLEDGE_BASE_PATH` | `data/documents` | Directory containing source documents |
| `RETRIEVAL_THRESHOLD` | `0.45` | Minimum cosine similarity threshold |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed CORS origin for React frontend |

---

## Ingesting Documents

Place any official PDF, TXT, or Markdown documents in `data/documents/`. Then run:
```bash
python -m app.knowledge_base.ingest
```

Output:
```
[Ingest] Scanning knowledge base directory: data/documents
[Ingest] Found 4 document(s).
  - Academic Regulations 2026 (academic_regulations_2026.txt): 3 page(s), Category: Academic
  - Campus Health Guide 2026 (campus_health_guide_2026.pdf): 2 page(s), Category: Campus Services
  - Examination Rules 2026 (examination_rules_2026.txt): 3 page(s), Category: Examination
  - Library Services 2026 (library_services_2026.txt): 3 page(s), Category: Library
[Ingest] Created 14 chunk(s). Generating embeddings...
[VectorStore] Index saved successfully with 14 vectors.
Indexed 4 documents
Created 14 chunks
FAISS index saved successfully
```

---

## Running the Backend

Start the development server with Uvicorn:
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be accessible at:
- Root: `http://127.0.0.1:8000/`
- Health: `http://127.0.0.1:8000/api/health`
- Chat: `http://127.0.0.1:8000/api/chat`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

---

## API Endpoints

### 1. Health Check
`GET /api/health`

Response:
```json
{
  "status": "ok",
  "knowledge_base": {
    "status": "active",
    "indexed_documents": 4,
    "version": "2026.1"
  }
}
```

### 2. Chat Query
`POST /api/chat`

Request:
```json
{
  "session_id": "session-123",
  "message": "What is the minimum attendance requirement?",
  "history": []
}
```

Grounded Response (Context Found):
```json
{
  "session_id": "session-123",
  "response": "According to Academic Regulations 2026 (Section 1: Attendance Requirements): Every registered undergraduate and postgraduate student must maintain a minimum attendance of 75% in each registered theory and laboratory course during the semester to be eligible to appear for the End Semester Examinations.",
  "is_grounded": true,
  "confidence": 0.77,
  "sources": [
    {
      "title": "Academic Regulations 2026",
      "section": "Section 1: Attendance Requirements",
      "page": 1,
      "document_id": "academic-regulations-2026"
    }
  ],
  "suggested_questions": [
    "What is the minimum attendance requirement?",
    "What happens if my attendance is below the requirement?",
    "How is attendance calculated?"
  ]
}
```

Refusal Response (Out of Scope / Low Similarity):
```json
{
  "session_id": "session-123",
  "response": "This information is not available in the official university knowledge base. UniAssist does not guess or generate unsupported university information.",
  "is_grounded": false,
  "confidence": 0.21,
  "sources": [],
  "suggested_questions": [
    "What are the attendance requirements?",
    "What are the examination rules?",
    "What are the library timings?"
  ]
}
```

---

## Running Automated Tests

Run the full pytest suite:
```bash
python -m pytest -v
```
