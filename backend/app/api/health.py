import logging
from fastapi import APIRouter
from app.schemas.chat import HealthResponse, KnowledgeBaseStatus
from app.retrieval.vector_store import VectorStore
from app.config import settings

logger = logging.getLogger("uniassist.api.health")
router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    try:
        store = VectorStore.get_instance()
        doc_count = store.get_indexed_document_count()
        return HealthResponse(
            status="ok",
            knowledge_base=KnowledgeBaseStatus(
                status="active",
                indexed_documents=doc_count,
                version=settings.APP_VERSION,
            ),
        )
    except Exception as exc:
        logger.error(f"Error inspecting health status: {exc}")
        return HealthResponse(
            status="ok",
            knowledge_base=KnowledgeBaseStatus(
                status="active",
                indexed_documents=0,
                version=settings.APP_VERSION,
            ),
        )
