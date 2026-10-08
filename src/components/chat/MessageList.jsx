import React, { useRef, useEffect } from 'react';
import WelcomeScreen from './WelcomeScreen';
import MessageBubble from './MessageBubble';
import ThinkingLoader from './ThinkingLoader';
import ErrorBanner from './ErrorBanner';

export default function MessageList({
  messages = [],
  isLoading,
  currentStep,
  error,
  onRetry,
  onTryDemoMode,
  onSelectPrompt
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, currentStep, error]);

  if (messages.length === 0 && !isLoading && !error) {
    return (
      <div className="message-list-container welcome-viewport">
        <WelcomeScreen onSelectPrompt={onSelectPrompt} />
        <div ref={bottomRef} />
      </div>
    );
  }

  return (
    <div className="message-list-container">
      <div className="messages-stream">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onSelectQuestion={onSelectPrompt}
          />
        ))}

        {isLoading && (
          <ThinkingLoader currentStep={currentStep} />
        )}

        {error && (
          <ErrorBanner
            onRetry={onRetry}
            onTryDemoMode={onTryDemoMode}
          />
        )}

        <div ref={bottomRef} className="scroll-anchor" />
      </div>
    </div>
  );
}
