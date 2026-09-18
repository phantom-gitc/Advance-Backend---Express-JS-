import './StatsStrip.css';

export default function StatsStrip({ stats }) {
  return (
    <div className="stats-strip-container">
      <div className="stat-card">
        <div className="stat-glow stat-glow-lime" />
        <span className="stat-label">TOTAL GENERATED</span>
        <div className="stat-val-group">
          <span className="stat-val">{stats.totalLinks}</span>
          <span className="stat-unit">links</span>
        </div>
        <div className="stat-bar">
          <div className="stat-fill" style={{ width: `${Math.min(stats.totalLinks * 10, 100)}%` }} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-glow stat-glow-cyan" />
        <span className="stat-label">TOTAL ENGAGEMENTS</span>
        <div className="stat-val-group">
          <span className="stat-val stat-val-cyan">{stats.totalClicks}</span>
          <span className="stat-unit">clicks</span>
        </div>
        <div className="stat-bar">
          <div className="stat-fill stat-fill-cyan" style={{ width: `${Math.min(stats.totalClicks * 10, 100)}%` }} />
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-glow stat-glow-violet" />
        <span className="stat-label">TOP PERFORMER</span>
        <div className="stat-val-group">
          <span className="stat-val stat-val-mono">
            {stats.topClicked?.shortUrl ? `/${stats.topClicked.shortUrl}` : '—'}
          </span>
          {stats.topClicked?.clickedCount > 0 && (
            <span className="stat-tag">{stats.topClicked.clickedCount} hits</span>
          )}
        </div>
        <div className="stat-bar">
          <div className="stat-fill stat-fill-violet" style={{ width: stats.topClicked?.clickedCount ? '85%' : '0%' }} />
        </div>
      </div>
    </div>
  );
}
