import { Link } from 'react-router-dom';
import { Compass, Plane, ShieldCheck } from 'lucide-react';

const metrics = [
  { label: 'Рейсы', value: 'Поиск, выбор и бронь в одном потоке' },
  { label: 'Тарифы', value: 'Условия видны до оплаты' },
  { label: 'Кабинет', value: 'Билеты и маршруты под рукой' },
] as const;

const highlights = [
  {
    title: 'Спокойный путь от поиска до билета',
    description:
      'Yandex Air собирает ключевые действия авиапокупки в один понятный сценарий: маршрут, рейсы, место, бронь и кабинет пассажира.',
  },
  {
    title: 'Все важное видно заранее',
    description:
      'Стоимость, тариф, условия багажа и действия после покупки не прячутся за следующими шагами и остаются читаемыми на каждом экране.',
  },
] as const;

const principles = [
  {
    title: 'Понятный маршрут',
    text: 'Каждый экран отвечает на один вопрос: найти рейс, выбрать тариф, место или проверить бронь.',
    icon: Compass,
  },
  {
    title: 'Видимые условия',
    text: 'Багаж, обмен и правила тарифа доступны еще до оформления билета.',
    icon: ShieldCheck,
  },
  {
    title: 'Один сервисный слой',
    text: 'Покупка, маршрут и кабинет пассажира собраны в одном интерфейсе без лишних переходов.',
    icon: Plane,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="air-page">
      <div className="air-container">
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--air-muted)]">
          <Link to="/" className="font-semibold text-[var(--air-ink)]">
            Главная
          </Link>
          <span>/</span>
          <span>О компании</span>
        </div>

        <section className="air-surface-card-strong px-5 py-6 md:px-8 md:py-8">
          <div className="air-section-kicker">О Yandex Air</div>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-6xl">
            Авиакомпания, где важное видно до покупки билета
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--air-muted)] md:text-base">
            Yandex Air объединяет поиск рейсов, тарифы, выбор места и управление поездкой в одном спокойном интерфейсе.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="air-soft-card p-5 md:p-6">
              <div className="air-quiet-label">{metric.label}</div>
              <div className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">{metric.value}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 xl:grid-cols-2">
          {highlights.map((item, index) => (
            <div key={item.title} className={index === 1 ? 'air-dark-card p-5 md:p-6' : 'air-surface-card p-5 md:p-6'}>
              <div
                className="air-section-kicker"
                style={index === 1 ? { color: 'rgba(248,245,238,0.72)' } : undefined}
              >
                Подход
              </div>
              <div
                className="mt-4 text-3xl font-extrabold tracking-[-0.05em]"
                style={index === 1 ? { color: 'white' } : { color: 'var(--air-ink)' }}
              >
                {item.title}
              </div>
              <div
                className="mt-4 text-sm leading-relaxed md:text-base"
                style={index === 1 ? { color: 'rgba(248,245,238,0.74)' } : { color: 'var(--air-muted)' }}
              >
                {item.description}
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {principles.map((principle) => {
            const Icon = principle.icon;

            return (
              <div key={principle.title} className="air-link-card px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[rgba(79,130,255,0.1)] text-[var(--air-blue-deep)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">{principle.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-[var(--air-muted)]">{principle.text}</div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
