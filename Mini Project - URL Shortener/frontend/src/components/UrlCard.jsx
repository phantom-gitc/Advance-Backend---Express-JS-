import { useState } from 'react';
import { BACKEND_URL } from '../services/urlService';
import './UrlCard.css';

export default function UrlCard({ item, onRefreshClicks, isRefreshing, onDelete, onToast }) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // get clean domain from full url
  const getDomain = (urlStr) => {
    try {
      return new URL(urlStr).hostname.replace('www.', '');
    } catch {
      return 'web';
    }
  };

  const domain = getDomain(item.orignalUrl);
  const fullShortUrl = `${BACKEND_URL}/${item.shortUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    onToast('Link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(item.shortUrl);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="url-card">
      <div className="card-top-row">
        <div className="domain-chip">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
            alt=""
            className="domain-favicon"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="domain-name">{domain}</span>
        </div>

        <div className="card-top-actions">
          <span className="clicks-badge">
            <strong className="clicks-count">{item.clickedCount || 0}</strong>
            <span className="clicks-text">clicks</span>
          </span>

          <button
            className={`icon-btn refresh-btn ${isRefreshing ? 'is-spinning' : ''}`}
            onClick={() => onRefreshClicks(item.shortUrl)}
            title="Refresh click count"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>

          <button
            className={`icon-btn delete-btn ${confirmDelete ? 'is-confirm' : ''}`}
            onClick={handleDeleteClick}
            title={confirmDelete ? 'Click again to confirm delete' : 'Delete link'}
          >
            {confirmDelete ? '!' : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="card-mid-row">
        <div className="short-url-display" onClick={handleCopy} title="Click to copy">
          <span className="short-prefix">api/url/</span>
          <span className="short-code">{item.shortUrl}</span>
          <span className={`copy-pill ${copied ? 'is-copied' : ''}`}>
            {copied ? '✓' : 'Copy'}
          </span>
        </div>

        <p className="original-url-text" title={item.orignalUrl}>
          {item.orignalUrl}
        </p>
      </div>

      <div className="card-bottom-row">
        <span className="card-date">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Active'}
        </span>

        <div className="card-btn-group">
          <button
            className={`action-btn copy-action ${copied ? 'is-copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>

          <a href={fullShortUrl} target="_blank" rel="noreferrer" className="action-btn visit-action">
            Visit ↗
          </a>
        </div>
      </div>
    </div>
  );
}
