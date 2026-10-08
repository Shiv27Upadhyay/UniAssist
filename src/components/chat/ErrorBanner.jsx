import React from 'react';
import { AlertCircle, RefreshCw, PlayCircle } from 'lucide-react';

export default function ErrorBanner({ onRetry, onTryDemoMode }) {
  return (
    <div className="error-banner-container animate-fade-in">
      <div className="error-header">
        <AlertCircle size={20} className="error-icon" />
        <div className="error-text-group">
          <h4 className="error-title">Unable to reach the server</h4>
          <p className="error-desc">
            The university chatbot service could not be contacted. You can retry the request or switch to Demo Mode.
          </p>
        </div>
      </div>

      <div className="error-actions">
        {onRetry && (
          <button type="button" className="btn-error-retry" onClick={onRetry}>
            <RefreshCw size={14} />
            <span>Retry Request</span>
          </button>
        )}
        {onTryDemoMode && (
          <button type="button" className="btn-error-demo" onClick={onTryDemoMode}>
            <PlayCircle size={14} />
            <span>Try Demo Mode</span>
          </button>
        )}
      </div>
    </div>
  );
}
