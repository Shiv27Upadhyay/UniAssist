import json
from typing import List, Optional
from google import genai
from google.genai import types
from pydantic import ValidationError as PydanticValidationError

from .schemas import QueryRequest, QueryResponse, LLMAnswer, Message, RetrievedContext, Source
from .config import config
from .prompts import SYSTEM_PROMPT, build_context_string
from .grounding import is_context_sufficient, calculate_confidence
from .validator import validate_llm_answer, extract_and_validate_sources
from .exceptions import ProviderError, ValidationError

class LLMProvider:
    """Abstraction for the LLM Provider. Currently uses Google Gemini."""
    def __init__(self):
        self.client = genai.Client(api_key=config.LLM_API_KEY)
        self.model_name = config.LLM_MODEL
        
    def generate_structured_response(self, system_instruction: str, prompt: str, history: List[Message]) -> LLMAnswer:
        try:
            # Build history contents
            contents = []
            for msg in history:
                role = "user" if msg.role == "user" else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
            
            # Add current prompt
            contents.append(types.Content(role="user", parts=[types.Part.from_text(text=prompt)]))
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=config.TEMPERATURE,
                    max_output_tokens=config.MAX_TOKENS,
                    response_mime_type="application/json",
                    response_schema=LLMAnswer,
                ),
            )
            
            # Parse response
            if not response.text:
                raise ProviderError("Empty response from LLM.")
                
            try:
                parsed = json.loads(response.text)
                return LLMAnswer(**parsed)
            except (json.JSONDecodeError, PydanticValidationError) as e:
                raise ProviderError(f"Failed to parse structured LLM response: {str(e)}")
                
        except Exception as e:
            raise ProviderError(f"LLM generation failed: {str(e)}")


class AIService:
    def __init__(self, provider: Optional[LLMProvider] = None):
        self.provider = provider or LLMProvider()
        
    def generate_answer(self, request: QueryRequest) -> QueryResponse:
        """
        Main entry point for generating a grounded answer.
        """
        # 1. Check if we have context at all
        if not is_context_sufficient(request.retrieved_context):
            return self._build_fallback_response()
            
        # 2. Build the context and prompt
        context_str = build_context_string(request.retrieved_context)
        prompt = f"Retrieved University Context:\n{context_str}\n\nQuestion:\n{request.query}"
        
        try:
            # 3. Call LLM
            llm_answer = self.provider.generate_structured_response(
                system_instruction=SYSTEM_PROMPT,
                prompt=prompt,
                history=request.history
            )
            
            # 4. Validate
            validate_llm_answer(llm_answer, request.retrieved_context)
            
            # 5. Extract sources and calculate confidence
            if llm_answer.is_grounded:
                sources = extract_and_validate_sources(request.retrieved_context)
                confidence = calculate_confidence(True, request.retrieved_context)
            else:
                sources = []
                confidence = 0.0
                
            return QueryResponse(
                answer=llm_answer.answer,
                is_grounded=llm_answer.is_grounded,
                confidence=confidence,
                sources=sources,
                suggested_questions=llm_answer.suggested_questions
            )
            
        except (ProviderError, ValidationError) as e:
            print(f"[INTERNAL ERROR LOG]: {str(e)}")
            return self._build_fallback_response()
            
    def _build_fallback_response(self) -> QueryResponse:
        """Builds a safe fallback response."""
        return QueryResponse(
            answer="This information is not available in the official university knowledge base. UniAssist does not guess or generate unsupported university information.",
            is_grounded=False,
            confidence=0.0,
            sources=[],
            suggested_questions=[]
        )
