from ai.schemas import QueryRequest, RetrievedContext

def test_irrelevant_context(mock_service):
    request = QueryRequest(
        query="What are the library timings?",
        retrieved_context=[
            RetrievedContext(
                document_id="doc1",
                title="Academic Regulations",
                content="Attendance regulations only.",
                similarity=0.1 # Below threshold
            )
        ]
    )
    
    response = mock_service.generate_answer(request)
    
    assert response.is_grounded is False
    assert response.confidence == 0.0
    assert len(response.sources) == 0
    assert "not available" in response.answer.lower()
