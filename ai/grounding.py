from typing import List
from .schemas import RetrievedContext
from .config import config

def is_context_sufficient(retrieved_context: List[RetrievedContext]) -> bool:
    """
    Determines if the retrieved context is sufficient to attempt an answer.
    Checks if there's any context at all, and if we have similarity scores,
    checks if at least one chunk is above the configured threshold.
    """
    if not retrieved_context:
        return False
        
    has_similarities = any(ctx.similarity is not None for ctx in retrieved_context)
    if has_similarities:
        return any(
            ctx.similarity is not None and ctx.similarity >= config.RETRIEVAL_THRESHOLD
            for ctx in retrieved_context
        )
        
    return True

def calculate_confidence(
    is_grounded: bool, 
    retrieved_context: List[RetrievedContext], 
    llm_confidence_hint: float = 0.0
) -> float:
    """
    Calculate confidence based on deterministic rules:
    - If not grounded, 0.0
    - If highly relevant chunks exist, boost score.
    - If there are conflicts or low similarity, lower score.
    """
    if not is_grounded or not retrieved_context:
        return 0.0
        
    base_confidence = 0.8
    
    similarities = [ctx.similarity for ctx in retrieved_context if ctx.similarity is not None]
    if similarities:
        max_sim = max(similarities)
        # Scale between 0.7 and 1.0 depending on similarity
        if max_sim > 0.9:
            base_confidence = 0.95
        elif max_sim > 0.8:
            base_confidence = 0.85
        else:
            base_confidence = 0.75
            
    # Simple strategy: bounded between 0.0 and 1.0
    return max(0.0, min(1.0, base_confidence))
