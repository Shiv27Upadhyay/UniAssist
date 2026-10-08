import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Check, Copy, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import SourceCitation from './SourceCitation';
import FallbackCard from './FallbackCard';

export default function MessageBubble({ message, onSelectQuestion }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  if (isUser) {
    return (
      <div className="message-row user-row animate-fade-in">
        <div className="message-content-wrapper user-content-wrapper">
          <div className="user-bubble">
            <p className="user-text">{message.content}</p>
          </div>
          {formattedTime && <span className="message-time user-time">{formattedTime}</span>}
        </div>
        <div className="avatar user-avatar" title="Student">
          <User size={15} />
        </div>
      </div>
    );
  }

  // Assistant Message
  const isGrounded = message.is_grounded !== false;

  return (
    <div className="message-row bot-row animate-fade-in">
      <div className="avatar bot-avatar" title="UniAssist">
        <Bot size={16} />
      </div>

      <div className="message-content-wrapper bot-content-wrapper">
        <div className={`bot-bubble-card ${!isGrounded ? 'bot-fallback-mode' : ''}`}>
          {/* Header Row */}
          <div className="bot-bubble-header">
            <div className="bot-identity">
              <span className="bot-name">UniAssist</span>
              <span className="bot-role-tag">Assistant</span>
            </div>

            {isGrounded ? (
              <div className="grounded-badge" title="Grounded in official university documentation (Demo)">
                <ShieldCheck size={12} className="grounded-icon" />
                <span>✓ Grounded &bull; Official KB (Demo)</span>
              </div>
            ) : (
              <div className="unverified-badge" title="Information unavailable in university records">
                <AlertCircle size={11} />
                <span>Unavailable in KB</span>
              </div>
            )}
          </div>

          {/* Formatted Markdown Content */}
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="markdown-link"
                    {...props}
                  >
                    {children}
                  </a>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Collapsible Source Citation */}
          {isGrounded && message.sources && message.sources.length > 0 && (
            <SourceCitation sources={message.sources} />
          )}

          {/* Information Unavailable Fallback */}
          {!isGrounded && (
            <FallbackCard
              onSelectQuestion={onSelectQuestion}
              suggestedQuestions={message.suggested_questions}
            />
          )}

          {/* Action Bar (Copy & Timestamp) */}
          <div className="bot-bubble-actions">
            <button
              type="button"
              className="btn-copy-msg"
              onClick={handleCopy}
              title="Copy answer"
              aria-label="Copy answer to clipboard"
            >
              {copied ? (
                <>
                  <Check size={11} className="copy-success" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={11} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {formattedTime && <span className="message-time">{formattedTime}</span>}
          </div>
        </div>

        {/* Suggested Follow-up Question Chips */}
        {isGrounded && message.suggested_questions && message.suggested_questions.length > 0 && (
          <div className="suggested-followups animate-fade-in">
            <span className="followup-label">
              <Sparkles size={11} /> Try asking:
            </span>
            <div className="followup-chips-row">
              {message.suggested_questions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="followup-chip"
                  onClick={() => onSelectQuestion && onSelectQuestion(q)}
                  aria-label={`Ask suggested query: ${q}`}
                >
                  <span>{q}</span>
                  <ArrowRight size={10} className="chip-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
