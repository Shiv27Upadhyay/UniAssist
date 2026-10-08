from ai.schemas import QueryRequest

def test_no_context(mock_service):
    request = QueryRequest(
        query="What is the university policy on X?",
        retrieved_context=[]
    )
    
    response = mock_service.generate_answer(request)
    
    assert response.is_grounded is False
    assert response.confidence == 0.0
    assert len(response.sources) == 0
    assert "not available" in response.answer.lower()
