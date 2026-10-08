from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from ai.service import AIService
from ai.schemas import QueryRequest, RetrievedContext
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    # Hardcoded demo context for the hackathon MVP
    # This represents what "Friend 2" (the backend guy) would normally fetch from a DB
    demo_context = [
        RetrievedContext(
            document_id="policy-01",
            title="University Policies",
            section="General",
            page=1,
            content="The central library working hours are Monday to Friday: 9:00 AM - 5:00 PM. Book borrowing limit is 3 books for undergraduates for 7 days. Attendance requirement for semester exams is 80%.",
            similarity=0.95
        )
    ]
    
    ai_request = QueryRequest(
        query=request.message,
        retrieved_context=demo_context
    )
    
    ai_response = ai_service.generate_answer(ai_request)
    
    return {
        "response": ai_response.answer,
        "is_grounded": ai_response.is_grounded,
        "confidence": ai_response.confidence,
        "sources": ai_response.sources,
        "suggested_questions": ai_response.suggested_questions
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
