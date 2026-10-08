import React from 'react';
import { Bot, Search, Database, FileCheck } from 'lucide-react';

export default function ThinkingLoader({ currentStep = "Searching university records..." }) {
  const getStepIcon = () => {
    if (currentStep.includes("Searching")) {
      return <Search size={13} className="step-icon animate-pulse" />;
    }
    if (currentStep.includes("Finding")) {
      return <Database size={13} className="step-icon animate-pulse" />;
    }
    return <FileCheck size={13} className="step-icon animate-pulse" />;
  };

  return (
    <div className="message-row bot-row thinking-row animate-fade-in">
      <div className="avatar bot-avatar" title="UniAssist">
        <Bot size={16} />
      </div>

      <div className="thinking-bubble-card">
        <div className="thinking-header">
          <div className="pulse-dots">
            <span className="dot dot-1"></span>
            <span className="dot dot-2"></span>
            <span className="dot dot-3"></span>
          </div>
          <span className="thinking-brand">Retrieval Engine</span>
        </div>

        <div className="thinking-step-box">
          <div className="step-icon-wrapper">
            {getStepIcon()}
          </div>
          <span className="thinking-step-text">{currentStep}</span>
        </div>
      </div>
    </div>
  );
}
