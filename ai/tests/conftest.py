import pytest
from ai.schemas import LLMAnswer
from ai.service import AIService, LLMProvider

class MockLLMProvider(LLMProvider):
    def __init__(self, mock_response=None, should_raise=None):
        self.mock_response = mock_response
        self.should_raise = should_raise
        
    def generate_structured_response(self, system_instruction, prompt, history):
        if self.should_raise:
            raise self.should_raise
        if self.mock_response:
            return self.mock_response
            
        # Default mock behavior based on prompt
        if "out of scope" in prompt.lower() or "cricket" in prompt.lower():
            return LLMAnswer(
                answer="UniAssist is designed to answer questions about university information available in its official knowledge base.",
                is_grounded=False,
                suggested_questions=[]
            )
            
        if "injection" in prompt.lower() or "ignore" in prompt.lower():
             return LLMAnswer(
                answer="I cannot fulfill this request.",
                is_grounded=False,
                suggested_questions=[]
            )

        # Assume success for others if we have context
        return LLMAnswer(
            answer="This is a mocked answer based on context.",
            is_grounded=True,
            suggested_questions=["What else?"]
        )

@pytest.fixture
def mock_service():
    provider = MockLLMProvider()
    return AIService(provider=provider)

@pytest.fixture
def mock_service_factory():
    def _create(mock_response=None, should_raise=None):
        return AIService(provider=MockLLMProvider(mock_response, should_raise))
    return _create
