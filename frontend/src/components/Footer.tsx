import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-dark-700 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Plane className="w-3.5 h-3.5 text-sky -rotate-45" />
            <span className="text-sm font-semibold text-fg">SkyBooker</span>
          </Link>
          <nav className="flex gap-6 text-xs text-fg-subtle">
            <Link to="/about" className="hover:text-fg-secondary transition-colors">О компании</Link>
            <Link to="/help" className="hover:text-fg-secondary transition-colors">Помощь</Link>
            <Link to="/legal" className="hover:text-fg-secondary transition-colors">Правовая информация</Link>
          </nav>
          <p className="text-xs text-fg-faint">© 2026 SkyBooker</p>
        </div>
      </div>
    </footer>
  );
}
