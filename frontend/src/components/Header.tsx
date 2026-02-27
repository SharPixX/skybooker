import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plane, Search, LogIn, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-dark-800/80 backdrop-blur-md border-b border-dark-600 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-sky flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plane className="w-4 h-4 text-white -rotate-45" />
          </div>
          <span className="text-lg font-bold text-fg">
            Sky<span className="text-sky">Booker</span>
          </span>
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

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-dark-700 transition-colors"
            title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm text-fg-muted">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline max-w-[120px] truncate">{user?.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-fg-subtle hover:text-neon-red transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </div>
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
