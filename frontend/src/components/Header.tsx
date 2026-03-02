import { Link, useLocation } from 'react-router-dom';
import { Search, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="bg-dark-800/80 backdrop-blur-md border-b border-dark-600 sticky top-0 z-50 overflow-visible">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between overflow-visible">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0 -ml-4">
          <img
            src="/logo.png"
            alt="LidarAir"
            className="h-36 max-w-[260px] sm:max-w-[320px] object-contain"
          />
        </Link>

        <nav className="flex items-center gap-3">
          {!isHome && (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Поиск</span>
            </Link>
          )}

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 border border-dark-600 hover:border-sky/50 transition-all group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neon-blue to-sky flex items-center justify-center text-xs text-white font-bold shadow-[0_0_10px_rgba(0,195,255,0.2)]">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-fg group-hover:text-white transition-colors max-w-[120px] truncate">
                Личный кабинет
              </span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors bg-dark-700 px-3 py-1.5 rounded-lg border border-dark-600 hover:border-sky/30"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Войти</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
