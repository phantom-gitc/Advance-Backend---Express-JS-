import './Navbar.css';

export default function Navbar({ totalCount }) {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon">
            <span className="icon-bar" />
          </div>
          <span className="brand-name">SNIP</span>
          <span className="brand-tag">LITE</span>
        </div>

        <div className="navbar-meta">
          <div className="status-badge">
            <span className="status-dot" />
            <span className="status-text">Live</span>
          </div>

          <div className="count-badge">
            <span className="count-num">{totalCount}</span>
            <span className="count-text">links</span>
          </div>
        </div>
      </div>
    </header>
  );
}
