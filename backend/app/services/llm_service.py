import logging
from typing import List, Dict, Any, Optional
import httpx
from app.config import settings
from app.schemas.chat import MessageItem

logger = logging.getLogger("uniassist.llm")

SYSTEM_PROMPT = """You are UniAssist, a university information assistant for GSFC University.
Answer the user's question ONLY using the provided university knowledge context.
Do not use unsupported external knowledge.
Do not invent university policies, dates, rules, fees, procedures, facilities, regulations, or other university information.
If the provided context does not contain enough information to answer the question, state that the information is unavailable in the official university knowledge base.
Keep answers concise, clear, and useful for students."""

class LLMService:
    def __init__(self):
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.base_url = settings.LLM_BASE_URL

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def _build_context_prompt(self, context_chunks: List[Dict[str, Any]]) -> str:
        if not context_chunks:
            return "[NO CONTEXT AVAILABLE]"

        parts = []
        for i, chunk in enumerate(context_chunks, 1):
            title = chunk.get("title", "Unknown")
            sec = chunk.get("section", "General")
            page = chunk.get("page", 1)
            date = chunk.get("document_date", "")
            text = chunk.get("text", "").strip()
            date_str = f" | Date: {date}" if date else ""
            parts.append(
                f"--- Document {i}: {title}{date_str} | Section: {sec} | Page: {page} ---\n{text}"
            )
        return "\n\n".join(parts)

    def _demo_grounded_response(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
    ) -> str:
        """Deterministic grounded extraction for demo/development when no LLM API key is set."""
        if not context_chunks:
            return (
                "This information is not available in the official university knowledge base. "
                "UniAssist does not guess or generate unsupported university information."
            )

        primary = context_chunks[0]
        title = primary.get("title", "University Document")
        section = primary.get("section", "General")
        date = primary.get("document_date", "")
        text = primary.get("text", "").strip()

        # Clean text
        clean_lines = [
            l.strip() for l in text.split("\n")
            if l.strip() and not l.startswith("===") and not l.startswith("---")
        ]
        clean_body = " ".join(clean_lines)
        sentences = [s.strip() for s in clean_body.split(". ") if len(s.strip()) > 15]

        # Find sentence most relevant to query words
        query_words = set(query.lower().split())
        best_sentence = sentences[0] if sentences else clean_body[:250]
        max_overlap = -1
        for s in sentences:
            overlap = sum(1 for w in query_words if w in s.lower())
            if overlap > max_overlap:
                max_overlap = overlap
                best_sentence = s

        if best_sentence and not best_sentence.endswith("."):
            best_sentence += "."

        date_suffix = f" (dated {date})" if date else ""
        return f"According to {title}{date_suffix} [{section}]: {best_sentence}"

    async def generate_response(
        self,
        query: str,
        context_chunks: List[Dict[str, Any]],
        history: Optional[List[MessageItem]] = None,
    ) -> str:
        """Generate grounded response using OpenAI-compatible API or Demo mode."""
        if not self.is_configured:
            return self._demo_grounded_response(query, context_chunks)

        formatted_context = self._build_context_prompt(context_chunks)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
        ]

        if history:
            for item in history[-4:]:
                if item.role in ("user", "assistant"):
                    messages.append({"role": item.role, "content": item.content})

        user_prompt_content = f"""=== OFFICIAL UNIVERSITY CONTEXT (UNTRUSTED DATA) ===
{formatted_context}
=== END CONTEXT ===

STUDENT QUESTION:
{query}

Please answer the student's question based strictly on the above university context. If the context does not contain the answer, reply that the information is unavailable in the official university knowledge base."""

        messages.append({"role": "user", "content": user_prompt_content})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.1,
            "max_tokens": 600,
        }

        url = f"{self.base_url}/chat/completions"
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code != 200:
                    logger.error(f"LLM API error status {res.status_code}: {res.text}")
                    raise RuntimeError(f"LLM API returned status code {res.status_code}")
                data = res.json()
                answer = data["choices"][0]["message"]["content"].strip()
                return answer
        except httpx.RequestError as exc:
            logger.error(f"LLM request connection error: {exc}")
            raise RuntimeError("Failed to connect to LLM service.") from exc
        except Exception as exc:
            logger.error(f"Unexpected LLM processing error: {exc}")
            raise RuntimeError("LLM service processing failure.") from exc
