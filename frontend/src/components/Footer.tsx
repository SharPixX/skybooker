import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MapPinned, Smartphone } from 'lucide-react';

const companyLinks = [
  { label: 'О компании', to: '/about' },
  { label: 'Помощь', to: '/help' },
  { label: 'Правовая информация', to: '/legal' },
  { label: 'Личный кабинет', to: '/profile' },
];

const serviceLinks = [
  { label: 'Найти билет', to: '/' },
  { label: 'Популярные направления', to: '/#destinations' },
  { label: 'Тарифы и условия', to: '/#tariffs' },
  { label: 'Помощь и правила', to: '/help' },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--air-border)] bg-[rgba(255,255,255,0.44)]">
      <div className="air-container py-8 md:py-10">
        <div className="air-surface-card px-5 py-6 md:px-8">
          <div className="air-grid-two items-start">
            <div>
              <div className="air-section-kicker">Yandex Air</div>
              <h2 className="mt-4 max-w-xl text-3xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-4xl">
                Купить билет, проверить бронь и подготовиться к вылету можно в одном месте.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--air-muted)] md:text-base">
                Поиск рейса, выбор места, статус бронирования и помощь собраны в одном интерфейсе
                без лишних переходов.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="air-pill">
                  <Smartphone className="h-4 w-4 text-[var(--air-blue-deep)]" />
                  Кабинет пассажира
                </div>
                <div className="air-pill">
                  <MapPinned className="h-4 w-4 text-[var(--air-emerald)]" />
                  Маршруты по России и за ее пределами
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">
                  Компания
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {companyLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="flex items-center justify-between rounded-[18px] border border-[var(--air-border)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-sm font-bold text-[var(--air-ink)] transition-colors hover:bg-white"
                    >
                      {link.label}
                      <ArrowUpRight className="h-4 w-4 text-[var(--air-muted)]" />
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">
                  Разделы
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  {serviceLinks.map((link) =>
                    link.to.startsWith('/#') ? (
                      <a
                        key={link.label}
                        href={link.to}
                        className="flex items-center justify-between rounded-[18px] border border-[var(--air-border)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-sm font-bold text-[var(--air-ink)] transition-colors hover:bg-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-4 w-4 text-[var(--air-muted)]" />
                      </a>
                    ) : (
                      <Link
                        key={link.label}
                        to={link.to}
                        className="flex items-center justify-between rounded-[18px] border border-[var(--air-border)] bg-[rgba(255,255,255,0.7)] px-4 py-3 text-sm font-bold text-[var(--air-ink)] transition-colors hover:bg-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-4 w-4 text-[var(--air-muted)]" />
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="air-divider my-6" />

          <div className="flex flex-col gap-4 text-sm text-[var(--air-muted)] md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-[var(--air-ink)]">Поддержка</span>
              <span>24/7</span>
              <span>•</span>
              <span>support@yandexair.ru</span>
              <span>•</span>
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Поддержка пассажиров
              </span>
            </div>
            <div>© 2026 Yandex Air. Покупка, бронирование и управление перелетами.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
