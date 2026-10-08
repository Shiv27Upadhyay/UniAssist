import uuid
import logging
from typing import List, Dict, Any, Optional
from app.config import settings
from app.schemas.chat import ChatRequest, ChatResponse, SourceItem, MessageItem
from app.retrieval.embeddings import EmbeddingService
from app.retrieval.vector_store import VectorStore
from app.services.llm_service import LLMService

logger = logging.getLogger("uniassist.chat")

DEFAULT_FALLBACK_TEXT = (
    "This information is not available in the official university knowledge base. "
    "UniAssist does not guess or generate unsupported university information."
)

DEFAULT_SUGGESTED_QUESTIONS = [
    "What is the university's attendance policy?",
    "What are the promotion and passing criteria?",
    "What is the scholarship policy?",
]

CATEGORY_SUGGESTIONS = {
    "Attendance": [
        "What is the minimum attendance requirement?",
        "What is the university's attendance policy?",
        "How is attendance calculated for students?",
    ],
    "Examination": [
        "What are the promotion and passing criteria?",
        "What is the examination manual?",
        "What is the re-checking and re-assessment policy?",
        "What is the grace marks policy?",
    ],
    "Academic": [
        "What is the classification of award of degree or diploma?",
        "What is the student evaluation and promotion policy?",
        "What are the CEC evaluation criteria?",
    ],
    "Scholarship": [
        "What is the scholarship policy?",
        "Who is eligible for university scholarships?",
        "What are the scholarship renewal criteria?",
    ],
    "Placement": [
        "What is the placement policy?",
        "What are the eligibility criteria for campus placement?",
        "What is the placement registration process?",
    ],
    "Sports": [
        "What is the sports policy for students?",
        "What facilities are provided under the sports policy?",
        "What attendance relaxation is given for sports participation?",
    ],
    "Student Conduct": [
        "What does the student code of conduct say?",
        "What actions constitute academic misconduct?",
        "What are the disciplinary procedures?",
    ],
    "Transportation": [
        "What is the bus cancellation policy?",
        "What is the refund process for bus services?",
    ],
    "Hostel/Bhavan": [
        "What is the Bhavan refund policy?",
        "What are the hostel food refund rules?",
    ],
    "IPR": [
        "What is the university IPR policy?",
        "What is the GUIITAR council startup policy?",
    ],
}

class ChatService:
    def __init__(self):
        self.embedding_service = EmbeddingService.get_instance()
        self.vector_store = VectorStore.get_instance()
        self.llm_service = LLMService()

    def _determine_suggestions(self, chunks: List[Dict[str, Any]]) -> List[str]:
        if not chunks:
            return DEFAULT_SUGGESTED_QUESTIONS

        categories = {c.get("category") for c in chunks if c.get("category")}
        suggestions: List[str] = []
        for cat in categories:
            if cat in CATEGORY_SUGGESTIONS:
                suggestions.extend(CATEGORY_SUGGESTIONS[cat])

        if not suggestions:
            return DEFAULT_SUGGESTED_QUESTIONS

        unique = []
        for q in suggestions:
            if q not in unique:
                unique.append(q)
            if len(unique) >= 3:
                break
        return unique

    def _prepare_search_query(self, message: str, history: Optional[List[MessageItem]]) -> str:
        if not history:
            return message
        pronouns = ["it", "they", "this", "that", "the requirement", "the policy", "the rule"]
        lower_msg = message.lower()
        if len(message.split()) <= 6 or any(p in lower_msg for p in pronouns):
            for item in reversed(history):
                if item.role == "user":
                    return f"{item.content} {message}"
        return message

    async def handle_chat(self, request: ChatRequest) -> ChatResponse:
        session_id = request.session_id or str(uuid.uuid4())
        user_message = request.message.strip()

        # Step 1: Query embedding
        search_query = self._prepare_search_query(user_message, request.history)
        query_embedding = self.embedding_service.embed_query(search_query)

        # Step 2: Vector retrieval
        raw_results = self.vector_store.search(query_embedding, top_k=settings.TOP_K)

        # Step 3: Evaluate similarity threshold
        reliable_chunks: List[Dict[str, Any]] = []
        top_confidence = 0.0

        if raw_results:
            top_confidence = raw_results[0][1]
            for chunk, score in raw_results:
                if score >= settings.RETRIEVAL_THRESHOLD:
                    reliable_chunks.append(chunk)

        # Step 4: Strict Fallback if context is not reliable
        if not reliable_chunks:
            logger.info(
                f"Query '{user_message}' below threshold {settings.RETRIEVAL_THRESHOLD} (best: {top_confidence:.3f}). Returning fallback."
            )
            return ChatResponse(
                session_id=session_id,
                response=DEFAULT_FALLBACK_TEXT,
                is_grounded=False,
                confidence=round(top_confidence, 2) if top_confidence > 0 else 0.21,
                sources=[],
                suggested_questions=DEFAULT_SUGGESTED_QUESTIONS,
            )

        # Step 5: Grounded LLM Generation
        response_text = await self.llm_service.generate_response(
            query=user_message,
            context_chunks=reliable_chunks,
            history=request.history,
        )

        # Step 6: Post-generation Grounding Check
        unavailability_markers = [
            "information is not available",
            "information unavailable",
            "not available in the official university knowledge base",
            "does not contain information",
            "no information provided",
        ]
        is_grounded = True
        if any(marker in response_text.lower() for marker in unavailability_markers):
            is_grounded = False
            sources: List[SourceItem] = []
            confidence = 0.25
        else:
            seen_sources = set()
            sources = []
            for chunk in reliable_chunks:
                doc_id = chunk.get("document_id", "doc")
                sec = chunk.get("section", "General")
                page = chunk.get("page", 1)
                key = (doc_id, page, sec)
                if key not in seen_sources:
                    seen_sources.add(key)
                    sources.append(
                        SourceItem(
                            title=chunk.get("title", "Official Document"),
                            section=sec,
                            page=page,
                            document_id=doc_id,
                            source_url=chunk.get("source_url"),
                            document_date=chunk.get("document_date"),
                        )
                    )
            confidence = round(top_confidence, 2)

        suggested_questions = self._determine_suggestions(reliable_chunks)

        return ChatResponse(
            session_id=session_id,
            response=response_text,
            is_grounded=is_grounded,
            confidence=confidence,
            sources=sources,
            suggested_questions=suggested_questions,
        )
