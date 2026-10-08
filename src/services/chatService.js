import { MOCK_KNOWLEDGE_BASE, OUT_OF_SCOPE_FALLBACK } from './mockData.js';

/**
 * Service adapter for UniAssist Chatbot
 * Implements strict intent classification, multi-step retrieval progression,
 * grounded responses, and fallback for out-of-scope queries.
 */

export const RETRIEVAL_STEPS = [
  "Searching university records...",
  "Finding relevant information...",
  "Formulating response..."
];

export async function sendChatMessage({
  message,
  history = [],
  onProgress = () => {},
  useLiveApi = false,
  apiEndpoint = '/api/chat',
  simulateError = false
}) {
  const cleanQuery = message.trim().toLowerCase();

  // 1. Error simulation check (e.g. typing "/error", "simulate error", or enabling simulateError)
  if (
    simulateError ||
    cleanQuery === '/error' ||
    cleanQuery === 'simulate error' ||
    cleanQuery === 'server error' ||
    cleanQuery === 'trigger error'
  ) {
    onProgress(RETRIEVAL_STEPS[0]);
    await delay(400);
    throw new Error("Unable to reach the server. Backend connection timed out (503 Service Unavailable).");
  }

  // 2. If live API mode is requested
  if (useLiveApi) {
    try {
      onProgress(RETRIEVAL_STEPS[0]);
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      onProgress(RETRIEVAL_STEPS[2]);
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn("Live API request failed, throwing error for UI banner", err);
      throw new Error("Unable to reach the server. Live API endpoint is offline.");
    }
  }

  // 3. Multi-step simulated retrieval progression
  onProgress(RETRIEVAL_STEPS[0]);
  await delay(350);

  onProgress(RETRIEVAL_STEPS[1]);
  await delay(400);

  onProgress(RETRIEVAL_STEPS[2]);
  await delay(350);

  // 4. Strict Intent & Knowledge Base Topic Classification
  const matchedItem = classifyTopicIntent(cleanQuery);

  if (matchedItem) {
    return {
      session_id: "sess_demo_" + Date.now(),
      response: matchedItem.response,
      is_grounded: matchedItem.is_grounded !== false,
      confidence: matchedItem.confidence || 0.95,
      sources: matchedItem.sources || [],
      suggested_questions: matchedItem.suggested_questions || []
    };
  }

  // 5. Explicit Fallback for Out-of-Scope / Unsupported Questions
  return {
    session_id: "sess_demo_" + Date.now(),
    response: OUT_OF_SCOPE_FALLBACK.response,
    is_grounded: false,
    confidence: OUT_OF_SCOPE_FALLBACK.confidence,
    sources: [],
    suggested_questions: OUT_OF_SCOPE_FALLBACK.suggested_questions
  };
}

/**
 * Strict topic-intent classification algorithm
 * Prevents false-positive matches (e.g. "smartphone" matching "phone")
 */
function classifyTopicIntent(query) {
  let bestItem = null;
  let maxScore = 0;

  for (const item of MOCK_KNOWLEDGE_BASE) {
    // 1. Negative Token Check: if query contains disallowed words for this topic, skip immediately
    if (item.negativeTokens && item.negativeTokens.some(regex => regex.test(query))) {
      continue;
    }

    // 2. Required Domain Anchor Check: query MUST contain at least one required domain token
    const hasRequiredAnchor = item.requiredTokens && item.requiredTokens.some(regex => regex.test(query));
    if (!hasRequiredAnchor) {
      continue;
    }

    let score = 0;

    // Direct question or substring match
    const itemQuestionLower = item.question.toLowerCase();
    if (query.length > 8 && itemQuestionLower.includes(query)) {
      score += 100;
    } else if (itemQuestionLower.startsWith(query)) {
      score += 80;
    }

    // Pattern structure matches
    if (item.patterns) {
      for (const pattern of item.patterns) {
        if (pattern.test(query)) {
          score += 40;
        }
      }
    }

    // Required token count bonus
    if (item.requiredTokens) {
      for (const tokenRegex of item.requiredTokens) {
        if (tokenRegex.test(query)) {
          score += 20;
        }
      }
    }

    if (score > maxScore && score >= 20) {
      maxScore = score;
      bestItem = item;
    }
  }

  return bestItem;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
