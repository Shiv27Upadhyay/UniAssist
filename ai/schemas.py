from pydantic import BaseModel, Field
from typing import List, Optional

class Message(BaseModel):
    role: str
    content: str

class RetrievedContext(BaseModel):
    document_id: str
    title: str
    section: Optional[str] = None
    page: Optional[int] = None
    content: str
    similarity: Optional[float] = None
    
class Source(BaseModel):
    document_id: str
    title: str
    section: Optional[str] = None
    page: Optional[int] = None

class QueryRequest(BaseModel):
    query: str
    history: List[Message] = Field(default_factory=list)
    retrieved_context: List[RetrievedContext] = Field(default_factory=list)

class LLMAnswer(BaseModel):
    answer: str
    is_grounded: bool
    suggested_questions: List[str] = Field(default_factory=list)

class QueryResponse(BaseModel):
    answer: str
    is_grounded: bool
    confidence: float
    sources: List[Source] = Field(default_factory=list)
    suggested_questions: List[str] = Field(default_factory=list)
