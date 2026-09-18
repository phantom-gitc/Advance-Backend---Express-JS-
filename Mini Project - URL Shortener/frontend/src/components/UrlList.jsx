import UrlCard from './UrlCard';
import './UrlList.css';

export default function UrlList({
  urls,
  loading,
  searchQuery,
  onSearchChange,
  onRefreshClicks,
  refreshingCode,
  onDelete,
  onRefreshAll,
  onToast,
}) {
  return (
    <section className="url-list-section">
      <div className="list-controls-bar">
        <div className="list-title-group">
          <h2 className="list-section-title">ACTIVE LINKS</h2>
          <span className="list-count-badge">{urls.length}</span>
        </div>

        <div className="list-actions-cluster">
          <div className="search-input-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="list-search-field"
              placeholder="Search by code or URL..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
              >
                ✕
              </button>
            )}
          </div>

          <button
            className="refresh-all-btn"
            onClick={onRefreshAll}
            title="Reload all links"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Sync</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      ) : urls.length > 0 ? (
        <div className="cards-grid">
          {urls.map((item) => (
            <UrlCard
              key={item._id || item.shortUrl}
              item={item}
              onRefreshClicks={onRefreshClicks}
              isRefreshing={refreshingCode === item.shortUrl}
              onDelete={onDelete}
              onToast={onToast}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state-box">
          <div className="empty-icon-ring">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <h3 className="empty-title">
            {searchQuery ? 'No matching links found' : 'No links generated yet'}
          </h3>
          <p className="empty-sub">
            {searchQuery
              ? 'Try clearing your search query above.'
              : 'Paste a link in the box above to generate your first ultra-fast short URL.'}
          </p>
        </div>
      )}
    </section>
  );
}
