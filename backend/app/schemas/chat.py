from typing import List, Optional, Literal
from pydantic import BaseModel, Field, field_validator

class KnowledgeBaseStatus(BaseModel):
    status: str = "active"
    indexed_documents: int = 0
    version: str = "2026.1"

class HealthResponse(BaseModel):
    status: str = "ok"
    knowledge_base: KnowledgeBaseStatus

class MessageItem(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str = Field(..., min_length=1)

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str = Field(..., min_length=1, description="Student user query")
    history: Optional[List[MessageItem]] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Message must not be empty or whitespace only.")
        return trimmed

class SourceItem(BaseModel):
    title: str
    section: Optional[str] = "General"
    page: Optional[int] = 1
    document_id: str
    source_url: Optional[str] = None
    document_date: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    response: str
    is_grounded: bool
    confidence: float
    sources: List[SourceItem] = Field(default_factory=list)
    suggested_questions: List[str] = Field(default_factory=list)

class ErrorResponse(BaseModel):
    error: bool = True
    message: str
