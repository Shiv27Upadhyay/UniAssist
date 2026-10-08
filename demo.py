import os
from ai.service import AIService
from ai.schemas import QueryRequest, RetrievedContext
from ai.config import config

def run_demo():
    print("="*50)
    print("UniAssist AI Layer Demo")
    print("="*50)

    if not config.LLM_API_KEY or config.LLM_API_KEY == "your_gemini_api_key_here":
        print("\n[WARNING] LLM_API_KEY is not set in the environment or .env file.")
        print("The demo will use the fallback response because the provider won't be able to authenticate.")
        print("To test the real LLM, copy .env.example to .env and add your Gemini API key.\n")

    # Initialize the AI Service
    ai_service = AIService()

    # We mock the retrieval layer (Friend 2's job) by hardcoding some demo context.
    demo_context = [
        RetrievedContext(
            document_id="academic-2026-v1",
            title="Academic Regulations 2026 - DEMO",
            section="Attendance",
            page=12,
            content="Students are required to maintain a minimum of 75% attendance in all theory and practical classes. Failure to meet this requirement will result in being debarred from the final examinations.",
            similarity=0.92
        )
    ]

    print("\n--- TEST 1: Question supported by context ---")
    query1 = "What is the minimum attendance requirement?"
    print(f"User Question: {query1}")
    
    request1 = QueryRequest(
        query=query1,
        retrieved_context=demo_context
    )
    
    response1 = ai_service.generate_answer(request1)
    print("\nAI Response:")
    print(f"Answer: {response1.answer}")
    print(f"Grounded: {response1.is_grounded}")
    print(f"Confidence: {response1.confidence}")
    print(f"Sources: {response1.sources}")
    print(f"Suggested Follow-ups: {response1.suggested_questions}")

    print("\n\n--- TEST 2: Question NOT in context (Fallback Demo) ---")
    query2 = "What are the library timings?"
    print(f"User Question: {query2}")
    
    request2 = QueryRequest(
        query=query2,
        retrieved_context=demo_context # The context is about attendance, not library
    )
    
    response2 = ai_service.generate_answer(request2)
    print("\nAI Response:")
    print(f"Answer: {response2.answer}")
    print(f"Grounded: {response2.is_grounded}")
    print(f"Confidence: {response2.confidence}")


if __name__ == "__main__":
    run_demo()
