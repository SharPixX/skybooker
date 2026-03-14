import { Link, NavLink, useLocation } from 'react-router-dom';
import { LogIn, Search, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const mainLinks = [
  { label: 'Направления', href: '/#destinations' },
  { label: 'Тарифы', href: '/#tariffs' },
  { label: 'Помощь', to: '/help' },
  { label: 'О компании', to: '/about' },
];

const utilityLinks = [
  { label: 'Купить билет', to: '/' },
  { label: 'Мои бронирования', to: '/profile' },
  { label: 'Правила перелета', to: '/help' },
  { label: 'Документы', to: '/legal' },
];

export default function Header() {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--air-border)] bg-[rgba(247,243,236,0.84)] backdrop-blur-xl">
      <div className="hidden border-b border-[var(--air-border)] md:block">
        <div className="air-container flex h-10 items-center justify-between gap-6 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">
          <div className="flex items-center gap-5">
            {utilityLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'transition-colors hover:text-[var(--air-ink)]',
                    isActive ? 'text-[var(--air-ink)]' : '',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div>Поддержка 24/7 • Онлайн-статус рейса и бронирования</div>
        </div>
      </div>

      <div className="air-container flex min-h-[76px] items-center justify-between gap-6 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] bg-[var(--air-panel)] text-white shadow-[0_18px_38px_rgba(16,24,38,0.22)]">
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[var(--air-yellow)]" />
            <span className="relative text-lg font-extrabold tracking-[-0.04em] text-[var(--air-panel)]">A</span>
            <span className="relative -ml-1 text-lg font-extrabold tracking-[-0.04em] text-white">Y</span>
          </div>
          <div className="leading-none">
            <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--air-muted)]">
              Авиакомпания
            </div>
            <div className="mt-1 text-[1.15rem] font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">
              Yandex Air
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {mainLinks.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'rounded-full px-4 py-2 text-sm font-bold transition-colors',
                    isActive
                      ? 'bg-[rgba(16,24,38,0.08)] text-[var(--air-ink)]'
                      : 'text-[var(--air-muted-strong)] hover:bg-[rgba(16,24,38,0.05)] hover:text-[var(--air-ink)]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm font-bold text-[var(--air-muted-strong)] transition-colors hover:bg-[rgba(16,24,38,0.05)] hover:text-[var(--air-ink)]"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {location.pathname !== '/' && (
            <Link
              to="/"
              className="hidden h-11 items-center gap-2 rounded-full border border-[var(--air-border)] bg-[rgba(255,255,255,0.68)] px-4 text-sm font-bold text-[var(--air-ink)] transition-colors hover:bg-white md:inline-flex"
            >
              <Search className="h-4 w-4" />
              Новый поиск
            </Link>
          )}

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="flex h-11 items-center gap-2 rounded-full bg-[var(--air-panel)] px-4 text-sm font-bold text-white shadow-[0_18px_38px_rgba(16,24,38,0.18)] transition-transform hover:-translate-y-[1px]"
            >
              <UserCircle2 className="h-4 w-4 text-[var(--air-yellow)]" />
              <span className="hidden sm:inline">{user?.name || 'Профиль'}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex h-11 items-center gap-2 rounded-full bg-[var(--air-panel)] px-4 text-sm font-bold text-white shadow-[0_18px_38px_rgba(16,24,38,0.18)] transition-transform hover:-translate-y-[1px]"
            >
              <LogIn className="h-4 w-4 text-[var(--air-yellow)]" />
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
