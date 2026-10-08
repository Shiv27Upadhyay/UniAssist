from ai.schemas import QueryRequest, RetrievedContext

def test_grounded(mock_service):
    request = QueryRequest(
        query="What is the minimum attendance requirement?",
        retrieved_context=[
            RetrievedContext(
                document_id="doc1",
                title="Academic Regulations",
                page=12,
                content="The minimum attendance requirement is 75%.",
                similarity=0.95
            )
        ]
    )
    
    response = mock_service.generate_answer(request)
    
    assert response.is_grounded is True
    assert response.confidence > 0.0
    assert len(response.sources) == 1
    assert response.sources[0].document_id == "doc1"
