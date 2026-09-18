import { useUrls } from './hooks/useUrls';
import Navbar from './components/Navbar';
import HeroInput from './components/HeroInput';
import StatsStrip from './components/StatsStrip';
import UrlList from './components/UrlList';
import Toast from './components/Toast';
import './App.css';

function App() {
  const {
    urls,
    totalCount,
    loading,
    submitting,
    refreshingCode,
    toast,
    newlyCreated,
    search,
    setSearch,
    stats,
    shortenLink,
    updateClickCount,
    deleteLink,
    loadLinks,
    showToast,
    hideToast,
    setNewlyCreated,
  } = useUrls();

  return (
    <div className="app-viewport">
      <Navbar totalCount={totalCount} />

      <main className="main-content-layout">
        <HeroInput
          onShorten={shortenLink}
          submitting={submitting}
          newlyCreated={newlyCreated}
          onDismissNew={() => setNewlyCreated(null)}
          onToast={showToast}
        />

        <StatsStrip stats={stats} />

        <UrlList
          urls={urls}
          loading={loading}
          searchQuery={search}
          onSearchChange={setSearch}
          onRefreshClicks={updateClickCount}
          refreshingCode={refreshingCode}
          onDelete={deleteLink}
          onRefreshAll={() => loadLinks(false)}
          onToast={showToast}
        />
      </main>

      <footer className="footer-bar">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logo">SNIP.</span>
            <span className="footer-tagline">Architected for frictionless web redirection.</span>
          </div>

          <div className="footer-tech">
            <span className="tech-badge">Node + Express</span>
            <span className="tech-badge">MongoDB</span>
            <span className="tech-badge">React + Vite</span>
          </div>
        </div>
      </footer>

      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

export default App;
