import React from 'react';
import { AlertTriangle, Mail, Building, ArrowRight, ShieldAlert } from 'lucide-react';

export default function FallbackCard({ onSelectQuestion, suggestedQuestions = [] }) {
  return (
    <div className="fallback-card-wrapper animate-fade-in" role="alert">
      <div className="fallback-header">
        <div className="fallback-icon-box">
          <AlertTriangle size={16} className="fallback-icon" />
        </div>
        <div className="fallback-title-group">
          <h4 className="fallback-title">Information unavailable</h4>
          <p className="fallback-desc">
            This information is not available in the current knowledge base.
          </p>
        </div>
      </div>

      <div className="fallback-body">
        <div className="fallback-policy-box">
          <ShieldAlert size={13} className="policy-icon" />
          <p className="fallback-policy-note">
            <strong>Anti-Hallucination Policy:</strong> UniAssist does not guess or generate unsupported university information.
          </p>
        </div>

        <div className="fallback-contacts">
          <div className="contact-item">
            <Mail size={12} className="contact-icon" />
            <span>Student Support: <code>helpdesk@university.edu</code></span>
          </div>
          <div className="contact-item">
            <Building size={12} className="contact-icon" />
            <span>Admin Office: Room 102, Ground Floor</span>
          </div>
        </div>
      </div>

      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="fallback-suggestions">
          <span className="suggestions-label">Try asking:</span>
          <div className="suggestions-chips-grid">
            {suggestedQuestions.slice(0, 3).map((q, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => onSelectQuestion && onSelectQuestion(q)}
                aria-label={`Ask suggested topic: ${q}`}
              >
                <span>{q}</span>
                <ArrowRight size={11} className="chip-arrow" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
