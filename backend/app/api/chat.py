import logging
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from app.schemas.chat import ChatRequest, ChatResponse, ErrorResponse
from app.services.chat_service import ChatService

logger = logging.getLogger("uniassist.api.chat")
router = APIRouter(prefix="/api", tags=["Chat"])

chat_service = ChatService()

@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
    },
)
async def chat_endpoint(request: ChatRequest):
    try:
        response = await chat_service.handle_chat(request)
        return response
    except Exception as exc:
        logger.error(f"Server error processing chat request: {exc}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": True, "message": "Unable to process the request."},
        )
