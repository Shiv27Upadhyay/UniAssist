import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, FileText, Check } from 'lucide-react';

export default function SourceCitation({ sources = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="source-citation-container">
      <button
        type="button"
        className="source-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle grounded source references"
      >
        <div className="source-toggle-label">
          <BookOpen size={13} className="source-icon" />
          <span>Sources ({sources.length})</span>
          <span className="source-badge-verified">
            <Check size={11} /> Verified
          </span>
        </div>
        {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>

      {isOpen && (
        <div className="source-details-list animate-fade-in">
          {sources.map((src, idx) => (
            <div key={src.id || idx} className="source-card">
              <div className="source-card-header">
                <FileText size={13} className="doc-icon" />
                <span className="source-title">{src.title}</span>
              </div>
              <div className="source-meta">
                {src.section && <span className="source-section">{src.section}</span>}
                {src.page && <span className="source-page">&bull; {src.page}</span>}
              </div>
              {src.snippet && (
                <div className="source-snippet">
                  <span className="quote-mark">“</span>
                  {src.snippet}
                  <span className="quote-mark">”</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
