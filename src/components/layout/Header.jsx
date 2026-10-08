import React from 'react';
import { Menu, Bot, RefreshCw, Layers } from 'lucide-react';

export default function Header({
  onToggleSidebar,
  onResetChat,
  useLiveApi,
  onToggleMode
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="header-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="header-brand-info">
          <div className="header-avatar">
            <Bot size={18} />
          </div>
          <div className="header-titles">
            <div className="header-title-row">
              <h1 className="header-app-name">UniAssist</h1>
              <span className="header-ps-badge">PS-3</span>
            </div>
            <span className="header-subtitle">University AI Assistant</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Grounded KB Status Tag */}
        <div className="header-status-badge" title="Grounded in official university knowledge base">
          <span className="status-dot"></span>
          <span className="status-label">KB Active</span>
        </div>

        {/* Demo Mode Switcher */}
        <button
          type="button"
          className={`mode-badge ${useLiveApi ? 'mode-live' : 'mode-mock'}`}
          onClick={onToggleMode}
          title={useLiveApi ? 'Connected to live backend API' : 'Running in offline Demo Mode'}
          aria-label="Toggle Demo or Live API mode"
        >
          <Layers size={12} />
          <span>{useLiveApi ? 'Live API' : 'Demo Mode'}</span>
        </button>

        {/* Reset / New Chat Action */}
        <button
          type="button"
          className="header-action-btn"
          onClick={onResetChat}
          title="Start New Conversation"
          aria-label="Start New Conversation"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </header>
  );
}
