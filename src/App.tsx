import LaundryOrdersSection from './components/LaundryOrdersSection';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-topbar">
        <a className="app-brand" href="/" aria-label="Laundryrku beranda">
          <span className="app-brand__mark" aria-hidden="true">L</span>
          <span className="app-brand__name">Laundry<span>rku</span></span>
        </a>
        <div className="app-topbar__label">Sistem Manajemen Laundry</div>
      </header>

      <main className="app-main">
        <div className="app-welcome">
          <div>
            <p className="app-welcome__eyebrow">DASHBOARD LAUNDRY</p>
            <h1>Selamat datang di Laundryrku</h1>
            <p>Kelola pesanan pelanggan, layanan, dan status cucian dengan lebih mudah.</p>
          </div>
          <div className="app-welcome__icon" aria-hidden="true">✦</div>
        </div>

        <LaundryOrdersSection />
      </main>

      <footer className="app-footer">© {new Date().getFullYear()} Laundryrku · Pengelolaan pesanan laundry</footer>
    </div>
  );
}
