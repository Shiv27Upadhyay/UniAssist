import React, { useRef, useEffect } from 'react';
import { Send, CornerDownLeft } from 'lucide-react';

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  disabled
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea smoothly up to 160px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && !disabled) {
        onSend();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading && !disabled) {
      onSend();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className={`chat-input-container ${isLoading ? 'input-disabled' : ''}`}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLoading
                ? "UniAssist is retrieving university records..."
                : "Ask UniAssist anything about your university..."
            }
            disabled={isLoading || disabled}
            className="chat-textarea"
            aria-label="Ask UniAssist a question"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            className={`send-button ${input.trim() && !isLoading ? 'send-active' : ''}`}
            title="Send message (Enter)"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>

        <div className="input-helper-bar">
          <span className="shortcut-hint">
            <CornerDownLeft size={10} className="shortcut-icon" />
            <span><strong>Enter</strong> to send &bull; <strong>Shift + Enter</strong> for new line</span>
          </span>
          <span className="grounding-integrity-note">
            Grounded &bull; IEEE Day Hackathon 2026
          </span>
        </div>
      </form>
    </div>
  );
}
