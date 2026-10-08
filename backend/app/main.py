import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.api.health import router as health_router
from app.api.chat import router as chat_router
from app.retrieval.vector_store import VectorStore
from app.retrieval.embeddings import EmbeddingService

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("uniassist")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing UniAssist services...")
    # Pre-warm vector store and embeddings
    store = VectorStore.get_instance()
    logger.info(f"Loaded vector store with {store.get_indexed_document_count()} documents.")
    embedder = EmbeddingService.get_instance()
    embedder._load_model()
    logger.info("Embedding service ready.")
    yield
    logger.info("Shutting down UniAssist services...")

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered University Student Assistant (PS-3)",
    version=settings.APP_VERSION,
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(chat_router)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "UniAssist API is running",
        "version": settings.APP_VERSION,
        "status": "healthy",
        "docs": "/docs",
    }

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": True,
            "message": "Invalid request format or missing required fields.",
            "details": [err.get("msg", str(err)) for err in exc.errors()],
        },
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception processing {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": True, "message": "Unable to process the request."},
    )
