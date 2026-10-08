import React from 'react';
import {
  Plus,
  MessageSquare,
  Sparkles,
  GraduationCap,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  onNewChat,
  sessions = [],
  currentSessionId,
  onSelectSession
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Top Branding */}
        <div className="sidebar-brand-container">
          <div className="brand-logo-group">
            <div className="brand-icon-box">
              <GraduationCap size={20} className="brand-icon" />
            </div>
            <div className="brand-text-group">
              <h2 className="brand-name">UniAssist</h2>
              <span className="brand-tagline">University AI Assistant</span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Hackathon Indicator */}
        <div className="sidebar-hackathon-badge">
          <div className="badge-inner">
            <Sparkles size={12} className="ieee-sparkle" />
            <span>IEEE Day Hackathon 2026</span>
          </div>
        </div>

        {/* New Conversation Button */}
        <div className="sidebar-action-box">
          <button
            type="button"
            className="btn-new-chat"
            onClick={onNewChat}
            aria-label="Start a new conversation"
          >
            <Plus size={15} />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Recent Conversations */}
        <div className="sidebar-sessions-section">
          <div className="sidebar-section-heading">
            <span>Recent</span>
          </div>

          <div className="sidebar-sessions-list">
            {sessions.map((sess) => {
              const isActive = sess.id === currentSessionId;
              return (
                <button
                  key={sess.id}
                  type="button"
                  className={`session-item ${isActive ? 'session-active' : ''}`}
                  onClick={() => onSelectSession(sess.id)}
                  title={sess.title}
                  aria-label={`Open conversation: ${sess.title}`}
                >
                  <MessageSquare size={13} className="session-icon" />
                  <span className="session-title">{sess.title}</span>
                  {isActive && <ChevronRight size={13} className="session-active-indicator" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Knowledge Base Card */}
        <div className="sidebar-footer">
          <div className="kb-status-card">
            <div className="kb-status-top">
              <div className="kb-indicator-dot">
                <span className="kb-pulse-dot"></span>
                <span className="kb-title">Knowledge Base</span>
              </div>
              <span className="kb-docs-count">42 docs</span>
            </div>
            <div className="kb-status-sub">
              <ShieldCheck size={11} className="shield-icon" />
              <span>Demo KB Active &bull; Grounded</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
