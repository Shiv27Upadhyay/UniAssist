from typing import List
from .schemas import LLMAnswer, RetrievedContext, Source
from .exceptions import ValidationError

def validate_llm_answer(answer: LLMAnswer, context: List[RetrievedContext]) -> bool:
    """
    Validates that the LLM response is grounded and doesn't contain bad format.
    """
    if not answer.answer:
        raise ValidationError("Answer cannot be empty.")
        
    if not context and answer.is_grounded:
        raise ValidationError("Answer cannot be grounded if no context was provided.")
        
    return True

def extract_and_validate_sources(context: List[RetrievedContext]) -> List[Source]:
    """
    Application-level source validation.
    We don't let the LLM invent sources. We simply attach the metadata 
    of the retrieved context that was provided.
    """
    sources = []
    for ctx in context:
        sources.append(Source(
            document_id=ctx.document_id,
            title=ctx.title,
            section=ctx.section,
            page=ctx.page
        ))
    return sources
