import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MessageList from './components/chat/MessageList';
import ChatInput from './components/chat/ChatInput';
import { sendChatMessage } from './services/chatService';
import './App.css';

const INITIAL_SESSION_HISTORY = {
  'sess-current': [],
  'sess-exam': [
    {
      id: 'hist-1',
      role: 'user',
      content: 'What is the minimum attendance requirement for semester exams?',
      timestamp: '2026-10-08T10:00:00.000Z'
    },
    {
      id: 'hist-2',
      role: 'assistant',
      content: `According to university regulations, students must maintain a **minimum of 75% attendance** in each registered theory and practical course to be eligible to appear for the End-Semester Examinations.

### Attendance Rules Summary:
| Attendance Range | Status | Action Required |
| :--- | :--- | :--- |
| **75% & Above** | ✅ Eligible | Direct Hall Ticket issuance |
| **65% to 74%** | ⚠️ Condonation Eligible | Submit medical certificates to Dean's Office |
| **Below 65%** | ❌ Ineligible | Course repeat / Grade 'W' (Withdrawn) |

> **Important Rule:** Medical certificates and condonation applications must be submitted to the Academic Section within **7 working days** of returning to campus.`,
      is_grounded: true,
      confidence: 0.96,
      sources: [
        {
          id: 'doc_acad_01',
          title: 'Academic Regulations 2026 — DEMO',
          section: 'Section 8.2: Attendance Requirements',
          page: 'Page 12',
          snippet: 'A student shall be considered to have satisfied the attendance requirement if he/she has attended at least 75% of the total number of periods scheduled in that course.'
        }
      ],
      suggested_questions: [
        'What happens if attendance is below the requirement?',
        'How is attendance calculated?'
      ],
      timestamp: '2026-10-08T10:00:02.000Z'
    }
  ],
  'sess-ieee': [
    {
      id: 'hist-3',
      role: 'user',
      content: 'How do I participate in the IEEE Day Hackathon 2026 and join the student branch?',
      timestamp: '2026-10-08T09:00:00.000Z'
    },
    {
      id: 'hist-4',
      role: 'assistant',
      content: `Welcome to the **IEEE Student Branch & IEEE Day Hackathon 2026**!

### 1. IEEE Day Hackathon 2026 Details:
* **Date:** October 2026
* **Problem Statements:**
  1. *PS-1:* University Repository Management System
  2. *PS-2:* Smart Student Career Profile
  3. *PS-3:* **AI-Powered Student Chatbot (UniAssist)**
* **Deliverable:** Working functional prototype + live architecture presentation.

### 2. Joining the IEEE Student Branch:
1. Visit **ieee.org** or the university student branch coordinator desk.
2. Enter University Branch Code: **STB-GSFC-2026**.
3. **Member Benefits:**
   - Free access to IEEE Xplore digital papers
   - Discounts on IEEE conferences & certifications
   - Hackathon mentorship & technical workshop access.`,
      is_grounded: true,
      confidence: 0.99,
      sources: [
        {
          id: 'doc_ieee_04',
          title: 'IEEE Student Branch Charter 2026 — DEMO',
          section: 'Section 1.2: Hackathon Tracks & Membership Process',
          page: 'Page 4',
          snippet: 'IEEE Student Branch coordinates coding hackathons, technical symposiums, and innovation challenges for undergraduate students.'
        }
      ],
      suggested_questions: [
        'What are the attendance requirements?',
        'What is Problem Statement 3 about?'
      ],
      timestamp: '2026-10-08T09:00:02.000Z'
    }
  ]
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState(null);
  const [lastUserMessage, setLastUserMessage] = useState('');
  const [useLiveApi, setUseLiveApi] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sidebar Sessions Management
  const [sessions, setSessions] = useState([
    { id: 'sess-current', title: 'New Conversation' },
    { id: 'sess-exam', title: 'Mid-Sem Exam Rules' },
    { id: 'sess-ieee', title: 'IEEE Hackathon 2026' }
  ]);
  const [currentSessionId, setCurrentSessionId] = useState('sess-current');

  // Archive of past sessions for smooth sidebar switching
  const [sessionHistory, setSessionHistory] = useState(INITIAL_SESSION_HISTORY);

  const handleSendMessage = async (textOverride = null) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : input;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const queryText = textToSend.trim();
    setInput('');
    setError(null);
    setLastUserMessage(queryText);

    // 1. Create and render User Message immediately
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    // Update active session title if this is the first message
    if (messages.length === 0) {
      const displayTitle = queryText.length > 26 ? queryText.slice(0, 26) + '...' : queryText;
      setSessions(prev =>
        prev.map(s => (s.id === currentSessionId ? { ...s, title: displayTitle } : s))
      );
    }

    setIsLoading(true);

    try {
      // 2. Call Service Adapter (Multi-step retrieval progression)
      const data = await sendChatMessage({
        message: queryText,
        history: newMessages.map(m => ({ role: m.role, content: m.content })),
        onProgress: (step) => setCurrentStep(step),
        useLiveApi
      });

      // 3. Create Assistant Message
      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        is_grounded: data.is_grounded !== false,
        confidence: data.confidence || 0.95,
        sources: data.sources || [],
        suggested_questions: data.suggested_questions || [],
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);

      // Save to session history
      setSessionHistory(prev => ({
        ...prev,
        [currentSessionId]: finalMessages
      }));
    } catch (err) {
      console.error("Chat error encountered:", err);
      setError(err);
      // Save state up to user message
      setSessionHistory(prev => ({
        ...prev,
        [currentSessionId]: newMessages
      }));
    } finally {
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      setError(null);
      handleSendMessage(lastUserMessage);
    }
  };

  const handleTryDemoMode = () => {
    setUseLiveApi(false);
    setError(null);
    if (lastUserMessage) {
      handleSendMessage(lastUserMessage);
    }
  };

  const handleNewChat = () => {
    const newId = `sess-${Date.now()}`;
    setError(null);
    setInput('');
    setMessages([]);
    setSessions(prev => [{ id: newId, title: 'New Conversation' }, ...prev]);
    setCurrentSessionId(newId);
    setSessionHistory(prev => ({ ...prev, [newId]: [] }));

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSelectSession = (id) => {
    if (id === currentSessionId) return;

    // Save current messages to history before switching
    setSessionHistory(prev => ({
      ...prev,
      [currentSessionId]: messages
    }));

    // Switch to selected session
    setCurrentSessionId(id);
    setMessages(sessionHistory[id] || []);
    setError(null);
    setInput('');

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleToggleMode = () => {
    setUseLiveApi(prev => !prev);
  };

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
      />

      {/* Main Conversation Canvas */}
      <main className="main-content-area">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
          onResetChat={handleNewChat}
          useLiveApi={useLiveApi}
          onToggleMode={handleToggleMode}
        />

        <div className="chat-viewport-wrapper">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            currentStep={currentStep}
            error={error}
            onRetry={handleRetry}
            onTryDemoMode={handleTryDemoMode}
            onSelectPrompt={(promptQuery) => handleSendMessage(promptQuery)}
          />

          <ChatInput
            input={input}
            setInput={setInput}
            onSend={() => handleSendMessage()}
            isLoading={isLoading}
            disabled={false}
          />
        </div>
      </main>
    </div>
  );
}
