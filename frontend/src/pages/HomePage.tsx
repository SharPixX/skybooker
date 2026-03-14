import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Clock3, LifeBuoy, Luggage, ShieldCheck, Ticket } from 'lucide-react';
import BookingSearchPanel from '../components/BookingSearchPanel';

const quickActions = [
  {
    title: 'Управление бронированием',
    description: 'Откройте билеты, статус оплаты и последние поездки в кабинете пассажира.',
    to: '/profile',
    icon: Ticket,
  },
  {
    title: 'Багаж и правила',
    description: 'Проверьте нормы багажа, обмен, возврат и условия тарифа до покупки билета.',
    to: '/help',
    icon: Luggage,
  },
  {
    title: 'Документы и условия',
    description: 'Правила покупки, удержания брони, оплаты и поездки собраны в одном месте.',
    to: '/legal',
    icon: ShieldCheck,
  },
] as const;

const destinations = [
  {
    city: 'Сочи',
    route: 'Москва → Сочи',
    price: 'от 5 490 ₽',
    subtitle: 'Короткий прямой маршрут к морю',
    params: 'from=Москва%20(SVO)&to=Сочи%20(AER)&date=2026-03-18&trip=oneway&passengers=1&cabin=economy',
    style: {
      background:
        'linear-gradient(155deg, rgba(20,39,71,0.96), rgba(55,126,178,0.84) 54%, rgba(255,213,79,0.48))',
    },
  },
  {
    city: 'Санкт-Петербург',
    route: 'Москва → Санкт-Петербург',
    price: 'от 7 802 ₽',
    subtitle: 'Деловой и городской маршрут на каждый день',
    params: 'from=Москва%20(DME)&to=Санкт-Петербург%20(LED)&date=2026-03-18&trip=oneway&passengers=1&cabin=comfort',
    style: {
      background:
        'linear-gradient(155deg, rgba(30,32,57,0.98), rgba(78,112,180,0.86) 56%, rgba(255,255,255,0.3))',
    },
  },
  {
    city: 'Дубай',
    route: 'Москва → Дубай',
    price: 'от 12 500 ₽',
    subtitle: 'Прямой вылет без лишних пересадок',
    params: 'from=Москва%20(SVO)&to=Дубай%20(DXB)&date=2026-03-18&trip=oneway&passengers=1&cabin=business',
    style: {
      background:
        'linear-gradient(155deg, rgba(31,23,63,0.98), rgba(81,70,164,0.82) 50%, rgba(255,170,90,0.6))',
    },
  },
  {
    city: 'Казань',
    route: 'Москва → Казань',
    price: 'от 5 400 ₽',
    subtitle: 'Короткий перелет на выходные',
    params: 'from=Москва%20(DME)&to=Казань%20(KZN)&date=2026-03-18&trip=oneway&passengers=1&cabin=economy',
    style: {
      background:
        'linear-gradient(155deg, rgba(12,46,55,0.98), rgba(32,120,109,0.82) 52%, rgba(255,213,79,0.42))',
    },
  },
] as const;

const fareFamilies = [
  {
    title: 'Light',
    subtitle: 'Для короткой поездки',
    features: ['Ручная кладь', 'Место за доплату', 'Обмен по правилам тарифа'],
  },
  {
    title: 'Comfort',
    subtitle: 'Самый удобный баланс',
    features: ['Багаж 23 кг', 'Стандартный выбор места', 'Изменение даты с доплатой'],
  },
  {
    title: 'Business',
    subtitle: 'Приоритет и пространство',
    features: ['Приоритетная регистрация', 'Бизнес-зал', 'Гибкие условия по маршруту'],
  },
] as const;

const serviceHighlights = [
  {
    title: 'Багаж и ручная кладь',
    description: 'Нормы багажа лучше проверить заранее: они зависят от тарифа и маршрута.',
    icon: Luggage,
  },
  {
    title: 'Возврат и обмен',
    description: 'Условия возврата и изменения даты всегда видны до оплаты билета.',
    icon: BadgeCheck,
  },
  {
    title: 'Поддержка по поездке',
    description: 'После покупки билет, бронь и статусы доступны в кабинете пассажира.',
    icon: LifeBuoy,
  },
] as const;

export default function HomePage() {
  return (
    <div className="air-page">
      <div className="air-container">
        <section id="search" className="air-dark-card overflow-hidden px-5 py-6 md:px-8 md:py-8">
          <div className="air-fade-up">
            <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
              Yandex Air
            </div>
            <div className="mt-5 grid gap-6 xl:grid-cols-[0.78fr_1.22fr] xl:items-end">
              <div>
                <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.92] tracking-[-0.07em] md:text-7xl">
                  Билеты Yandex Air
                  <span className="mt-2 block air-display">без лишних слов</span>
                </h1>
                <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/72 md:text-base">
                  Спокойный airline-сервис, где поиск, тариф и следующий шаг читаются сразу, без перегруженных экранов.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <div className="air-dark-pill">
                  <Clock3 className="h-4 w-4 text-[var(--air-yellow)]" />
                  Быстрый путь от поиска до билета
                </div>
                <div className="air-dark-pill">
                  <ShieldCheck className="h-4 w-4 text-[var(--air-yellow)]" />
                  Тарифы понятны до оплаты
                </div>
              </div>
            </div>

            <div className="mt-8">
              <BookingSearchPanel />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.title} to={action.to} className="air-link-card px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[rgba(79,130,255,0.1)] text-[var(--air-blue-deep)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">{action.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-[var(--air-muted)]">{action.description}</div>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--air-ink)]">
                  Открыть
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </section>

        <section id="destinations" className="mt-16">
          <div className="air-section-head">
            <div className="air-section-kicker">Направления</div>
            <h2 className="text-4xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-5xl">
              Популярные маршруты, с которых удобно начать поиск
            </h2>
            <p>Откройте готовое направление в один клик и сразу перейдите к выбору рейсов.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {destinations.map((destination) => (
              <Link
                key={destination.city}
                to={`/flights?${destination.params}`}
                className="min-h-[300px] overflow-hidden rounded-[30px] p-5 text-white shadow-[0_28px_70px_rgba(17,24,39,0.18)] transition-transform duration-300 hover:-translate-y-[2px]"
                style={destination.style}
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="inline-flex rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/84">
                      {destination.route}
                    </div>
                    <div className="mt-5 text-3xl font-extrabold tracking-[-0.05em]">{destination.city}</div>
                    <div className="mt-3 max-w-[220px] text-sm leading-relaxed text-white/76">{destination.subtitle}</div>
                  </div>

                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/62">Билеты</div>
                    <div className="mt-2 text-2xl font-extrabold">{destination.price}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="tariffs" className="mt-16">
          <div className="air-surface-card-strong px-5 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
              <div>
                <div className="air-section-kicker">Тарифы</div>
                <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-5xl">
                  Тарифы, которые читаются до выбора места
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--air-muted)] md:text-base">
                  На выдаче сразу видно, что входит в тариф: багаж, выбор места и правила по маршруту.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {fareFamilies.map((fare, index) => (
                  <div
                    key={fare.title}
                    className={index === 1 ? 'air-dark-card p-5 md:p-6' : 'air-soft-card p-5 md:p-6'}
                  >
                    <div
                      className="text-[11px] font-extrabold uppercase tracking-[0.18em]"
                      style={index === 1 ? { color: 'rgba(248,245,238,0.62)' } : { color: 'var(--air-muted)' }}
                    >
                      {fare.subtitle}
                    </div>
                    <div
                      className="mt-3 text-3xl font-extrabold tracking-[-0.05em]"
                      style={index === 1 ? { color: 'white' } : { color: 'var(--air-ink)' }}
                    >
                      {fare.title}
                    </div>

                    <div className="air-divider my-5" />

                    <div className="space-y-3">
                      {fare.features.map((feature) => (
                        <div
                          key={feature}
                          className="flex items-start gap-3 text-sm font-semibold"
                          style={index === 1 ? { color: 'rgba(248,245,238,0.88)' } : { color: 'var(--air-ink)' }}
                        >
                          <span className="mt-1 h-2 w-2 rounded-full bg-[var(--air-yellow)]" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 air-dark-card px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr] xl:items-start">
            <div>
              <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
                Перед покупкой
              </div>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">
                Что проверить перед покупкой
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/72 md:text-base">
                Условия тарифа, нормы багажа и правила обмена должны быть видны заранее, а не после оплаты.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {serviceHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/8 text-[var(--air-yellow)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-white">{item.title}</div>
                    <div className="mt-3 text-sm leading-relaxed text-white/70">{item.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="air-surface-card-strong px-5 py-6 md:px-8 md:py-8">
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-center">
              <div>
                <div className="air-section-kicker">Следующий шаг</div>
                <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-5xl">
                  Готовы к покупке
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--air-muted)] md:text-base">
                  Начните с поиска маршрута, затем выберите рейс, место и завершите бронирование в спокойном потоке.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 xl:justify-end">
                <Link to="/#search" className="air-primary-button">
                  Найти билет
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/profile" className="air-secondary-button">
                  Открыть кабинет
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
