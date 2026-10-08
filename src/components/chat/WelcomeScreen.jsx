import React from 'react';
import {
  GraduationCap,
  FileCheck,
  BookOpen,
  Sparkles,
  Building2,
  PhoneCall,
  ArrowUpRight,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { STARTER_PROMPTS } from '../../services/mockData';

export default function WelcomeScreen({ onSelectPrompt }) {
  const getIcon = (iconName) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap size={18} className="prompt-icon-svg" />;
      case 'FileCheck':
        return <FileCheck size={18} className="prompt-icon-svg" />;
      case 'BookOpen':
        return <BookOpen size={18} className="prompt-icon-svg" />;
      case 'Sparkles':
        return <Sparkles size={18} className="prompt-icon-svg" />;
      case 'Building2':
        return <Building2 size={18} className="prompt-icon-svg" />;
      case 'PhoneCall':
        return <PhoneCall size={18} className="prompt-icon-svg" />;
      default:
        return <Sparkles size={18} className="prompt-icon-svg" />;
    }
  };

  return (
    <div className="welcome-screen-container animate-fade-in">
      {/* Compact Hero Section */}
      <div className="welcome-hero">
        <div className="welcome-avatar-wrapper">
          <div className="welcome-avatar">
            <Bot size={28} />
          </div>
          <div className="welcome-avatar-badge" title="Grounded AI Engine">
            <ShieldCheck size={12} />
          </div>
        </div>

        <h2 className="welcome-title">How can I help you today?</h2>
        <p className="welcome-subtitle">
          Ask about academics, exams, campus services, and university information.
        </p>

        <div className="welcome-grounding-pill">
          <span className="pulse-dot"></span>
          <span>Grounded in university knowledge</span>
        </div>
      </div>

      {/* 2-Column Responsive Starter Cards Grid */}
      <div className="starter-prompts-section">
        <div className="starter-cards-grid">
          {STARTER_PROMPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="starter-card"
              onClick={() => onSelectPrompt(item.query)}
              aria-label={`Ask: ${item.title}`}
            >
              <div className="starter-card-left">
                <div className="starter-icon-box">
                  {getIcon(item.icon)}
                </div>
              </div>

              <div className="starter-card-content">
                <div className="starter-card-top">
                  <h3 className="starter-card-title">{item.title}</h3>
                  <ArrowUpRight size={14} className="starter-arrow" />
                </div>
                <p className="starter-card-desc">“{item.query}”</p>
                <span className="starter-category-tag">{item.tag}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
