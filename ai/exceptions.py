class AIServiceError(Exception):
    """Base class for all AI service exceptions."""
    pass

class ProviderError(AIServiceError):
    """Raised when the LLM provider fails."""
    pass

class ValidationError(AIServiceError):
    """Raised when the generated answer fails grounding validation."""
    pass
