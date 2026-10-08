from ai.schemas import QueryRequest, RetrievedContext, Message

def test_followup(mock_service):
    request = QueryRequest(
        query="What happens if I don't meet it?",
        history=[
            Message(role="user", content="What is the attendance requirement?"),
            Message(role="assistant", content="The requirement is 75%.")
        ],
        retrieved_context=[
            RetrievedContext(
                document_id="doc1",
                title="Academic Regulations",
                content="Students who do not meet the 75% attendance requirement will not be permitted to take the final examination.",
                similarity=0.9
            )
        ]
    )
    
    response = mock_service.generate_answer(request)
    
    assert response.is_grounded is True
    assert response.confidence > 0.0
