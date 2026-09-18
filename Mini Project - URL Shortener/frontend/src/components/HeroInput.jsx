import { useState } from 'react';
import { BACKEND_URL } from '../services/urlService';
import './HeroInput.css';

export default function HeroInput({ onShorten, submitting, newlyCreated, onDismissNew, onToast }) {
  const [inputUrl, setInputUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim() || submitting) return;

    try {
      await onShorten(inputUrl);
      setInputUrl('');
    } catch {
      // Handled in hook toast
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        onToast('Pasted from clipboard! 📋', 'info');
      }
    } catch {
      onToast('Clipboard access denied by browser', 'error');
    }
  };

  const handleCopyNew = (shortUrl) => {
    const fullUrl = `${BACKEND_URL}/${shortUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    onToast('Copied to clipboard! ⚡', 'success');
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section className="hero-section">
      <div className="hero-badge-wrap">
        <span className="hero-pill-badge">
          <span className="pill-flare" />
          NEXT-GEN SHORTENER ENGINE
        </span>
      </div>

      <h1 className="hero-title">
        TINY STRINGS.<br />
        <span className="hero-gradient-txt">MAXIMUM VELOCITY.</span>
      </h1>

      <p className="hero-sub">
        Transform unruly web addresses into sleek, trackable micro-links in milliseconds.
      </p>

      {/* Main Input Form */}
      <form className="hero-input-form" onSubmit={handleSubmit}>
        <div className="input-glow-ring" />
        <div className="input-inner-shell">
          <div className="input-icon-slot">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>

          <input
            type="text"
            className="hero-url-field"
            placeholder="Paste your extensive URL here (e.g. https://github.com/...)"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={submitting}
            required
          />

          {!inputUrl && (
            <button
              type="button"
              className="quick-paste-btn"
              onClick={handlePaste}
              title="Paste from clipboard"
            >
              Paste
            </button>
          )}

          <button
            type="submit"
            className={`hero-submit-btn ${submitting ? 'is-loading' : ''}`}
            disabled={submitting || !inputUrl.trim()}
          >
            {submitting ? (
              <span className="btn-spinner" />
            ) : (
              <>
                <span>SNIP IT</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Instant Created Card */}
      {newlyCreated && (
        <div className="created-card-container">
          <div className="created-card-glow" />
          <div className="created-card-inner">
            <div className="created-info">
              <span className="created-tag">SUCCESSFULLY FORGED</span>
              <div className="created-links-row">
                <span className="created-short-domain">
                  localhost:3000/api/url/
                  <strong className="highlight-code">{newlyCreated.shortUrl}</strong>
                </span>
              </div>
              <span className="created-orig-dest" title={newlyCreated.orignalUrl}>
                Target: {newlyCreated.orignalUrl}
              </span>
            </div>

            <div className="created-actions">
              <button
                className={`created-copy-btn ${copied ? 'copied-active' : ''}`}
                onClick={() => handleCopyNew(newlyCreated.shortUrl)}
              >
                {copied ? '✓ COPIED!' : 'COPY SHORT LINK'}
              </button>

              <a
                href={`${BACKEND_URL}/${newlyCreated.shortUrl}`}
                target="_blank"
                rel="noreferrer"
                className="created-visit-btn"
              >
                VISIT ↗
              </a>

              <button
                className="created-close-btn"
                onClick={onDismissNew}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
