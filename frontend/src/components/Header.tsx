import { Link, useLocation } from 'react-router-dom';
import { Plane, Search, LogIn, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-dark-800/80 backdrop-blur-md border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-2.5 group z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-sky flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plane className="w-4 h-4 text-white -rotate-45" />
          </div>
          <span className="text-lg font-bold text-fg">
            Lidar<span className="text-sky">Air</span>
          </span>
        </Link>

        {/* Centered logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/logo.png"
            alt="LidarAir"
            className="h-8 object-contain opacity-80"
          />
        </div>

        <nav className="flex items-center gap-3 z-10">
          {!isHome && (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Поиск</span>
            </Link>
          )}

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-dark-700 transition-colors"
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

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
