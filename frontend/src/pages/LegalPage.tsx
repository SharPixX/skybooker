import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Wallet } from 'lucide-react';

const legalSections = [
  {
    title: 'Правила покупки и бронирования',
    icon: FileText,
    items: [
      'Бронь создается после выбора места.',
      'Удержание места действует 15 минут до подтверждения.',
      'Условия возврата и обмена зависят от тарифа.',
    ],
  },
  {
    title: 'Аккаунт и персональные данные',
    icon: ShieldCheck,
    items: [
      'Кабинет хранит данные, необходимые для входа и управления поездкой.',
      'Личные данные используются только для маршрута, брони и уведомлений.',
      'Изменения профиля и пароля доступны в настройках кабинета.',
    ],
  },
  {
    title: 'Бронирование и удержание',
    icon: Wallet,
    items: [
      'После подтверждения маршрут сохраняется в кабинете пассажира.',
      'При неуспешной оплате бронирование может быть отменено.',
      'Фактические правила поездки всегда проверяются до покупки билета.',
    ],
  },
] as const;

export default function LegalPage() {
  return (
    <div className="air-page">
      <div className="air-container">
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--air-muted)]">
          <Link to="/" className="font-semibold text-[var(--air-ink)]">
            Главная
          </Link>
          <span>/</span>
          <span>Правовая информация</span>
        </div>

        <section className="air-surface-card-strong px-5 py-6 md:px-8 md:py-8">
          <div className="air-section-kicker">Документы</div>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-6xl">
            Правила покупки, бронирования и перевозки
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--air-muted)] md:text-base">
            На странице собраны основные правила покупки билета, бронирования, обработки данных и условий по тарифу.
          </p>
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-3">
          {legalSections.map((section) => {
            const Icon = section.icon;

            return (
              <div key={section.title} className="air-link-card px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[rgba(79,130,255,0.1)] text-[var(--air-blue-deep)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">{section.title}</div>
                <div className="mt-4 space-y-3">
                  {section.items.map((item) => (
                    <div key={item} className="air-dot-list-item">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <div className="mt-6 rounded-[28px] bg-[rgba(17,24,39,0.04)] px-5 py-5 text-sm leading-relaxed text-[var(--air-muted)] md:text-base">
          Последнее обновление: 14 марта 2026. Для конкретного билета и поездки ориентируйтесь на условия выбранного тарифа и маршрутные данные при покупке.
        </div>
      </div>
    </div>
  );
}
