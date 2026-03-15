import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, LifeBuoy, Luggage, ShieldCheck, Ticket } from 'lucide-react';
import dubaiPhoto from '../assets/destinations/dubai.jpg';
import heroPlanePhoto from '../assets/hero/yandex-plane-hero.jpg';
import kazanPhoto from '../assets/destinations/kazan.jpg';
import saintPetersburgPhoto from '../assets/destinations/saint-petersburg.jpg';
import sochiPhoto from '../assets/destinations/sochi.jpg';
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
    image: sochiPhoto,
    imagePosition: 'center 62%',
    overlay:
      'linear-gradient(180deg, rgba(8,17,28,0.08) 0%, rgba(8,17,28,0.18) 30%, rgba(8,17,28,0.82) 100%), linear-gradient(145deg, rgba(23,83,142,0.44), rgba(255,213,121,0.18))',
  },
  {
    city: 'Санкт-Петербург',
    route: 'Москва → Санкт-Петербург',
    price: 'от 7 802 ₽',
    subtitle: 'Деловой и городской маршрут на каждый день',
    params: 'from=Москва%20(DME)&to=Санкт-Петербург%20(LED)&date=2026-03-18&trip=oneway&passengers=1&cabin=comfort',
    image: saintPetersburgPhoto,
    imagePosition: 'center 48%',
    overlay:
      'linear-gradient(180deg, rgba(9,18,31,0.12) 0%, rgba(9,18,31,0.2) 28%, rgba(9,18,31,0.84) 100%), linear-gradient(145deg, rgba(66,92,158,0.42), rgba(255,255,255,0.12))',
  },
  {
    city: 'Дубай',
    route: 'Москва → Дубай',
    price: 'от 12 500 ₽',
    subtitle: 'Прямой вылет без лишних пересадок',
    params: 'from=Москва%20(SVO)&to=Дубай%20(DXB)&date=2026-03-18&trip=oneway&passengers=1&cabin=business',
    image: dubaiPhoto,
    imagePosition: 'center 56%',
    overlay:
      'linear-gradient(180deg, rgba(14,10,24,0.08) 0%, rgba(14,10,24,0.18) 28%, rgba(14,10,24,0.84) 100%), linear-gradient(145deg, rgba(82,66,149,0.44), rgba(255,183,103,0.2))',
  },
  {
    city: 'Казань',
    route: 'Москва → Казань',
    price: 'от 5 400 ₽',
    subtitle: 'Короткий перелет на выходные',
    params: 'from=Москва%20(DME)&to=Казань%20(KZN)&date=2026-03-18&trip=oneway&passengers=1&cabin=economy',
    image: kazanPhoto,
    imagePosition: 'center 58%',
    overlay:
      'linear-gradient(180deg, rgba(8,20,19,0.08) 0%, rgba(8,20,19,0.18) 28%, rgba(8,20,19,0.82) 100%), linear-gradient(145deg, rgba(28,117,106,0.42), rgba(255,222,118,0.18))',
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
        <section
          id="search"
          className="air-dark-card relative min-h-[440px] overflow-hidden px-5 py-7 md:min-h-[520px] md:px-8 md:py-10 xl:min-h-[580px] xl:py-12"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-[0.9]"
            style={{
              backgroundImage: `url(${heroPlanePhoto})`,
              backgroundPosition: 'center 52%',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, rgba(13,24,41,0.96) 0%, rgba(13,24,41,0.92) 28%, rgba(13,24,41,0.58) 54%, rgba(13,24,41,0.82) 100%),
                linear-gradient(180deg, rgba(8,16,29,0.1) 0%, rgba(8,16,29,0.46) 62%, rgba(8,16,29,0.86) 100%)
              `,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute -right-16 top-0 h-[340px] w-[340px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(255,210,88,0.34) 0%, rgba(255,210,88,0.16) 34%, rgba(255,210,88,0) 72%)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute bottom-[-120px] left-[-90px] h-[280px] w-[320px] rounded-full blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(255,108,74,0.18) 0%, rgba(255,108,74,0.08) 32%, rgba(255,108,74,0) 72%)',
            }}
          />

          <div className="relative z-10 flex min-h-[380px] flex-col justify-between air-fade-up md:min-h-[440px] xl:min-h-[500px]">
            <div>
              <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
                Yandex Air
              </div>

              <div className="mt-5">
                <div className="max-w-[700px]">
                  <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.92] tracking-[-0.07em] md:text-7xl">
                    Билеты Yandex Air
                    <span className="mt-2 block air-display">без лишних слов</span>
                  </h1>
                </div>
              </div>
            </div>

            <div className="mt-12 xl:mt-16">
              <BookingSearchPanel />
            </div>
          </div>
        </section>

        <section id="destinations" className="mt-8">
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
                className="group relative min-h-[320px] overflow-hidden rounded-[30px] border border-white/14 p-5 text-white shadow-[0_28px_70px_rgba(17,24,39,0.18)] transition-transform duration-500 hover:-translate-y-[4px]"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.05]"
                  style={{
                    backgroundImage: `url(${destination.image})`,
                    backgroundPosition: destination.imagePosition,
                  }}
                />
                <div aria-hidden="true" className="absolute inset-0" style={{ background: destination.overlay }} />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)] opacity-80"
                />

                <div className="relative flex h-full flex-col justify-between">
                  <div>
                    <div className="inline-flex rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/92 backdrop-blur-sm">
                      {destination.route}
                    </div>
                    <div className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-white [text-shadow:0_10px_30px_rgba(8,17,28,0.38)]">
                      {destination.city}
                    </div>
                    <div className="mt-3 max-w-[220px] text-sm leading-relaxed text-white/84 [text-shadow:0_8px_24px_rgba(8,17,28,0.34)]">
                      {destination.subtitle}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/72">Билеты</div>
                    <div className="mt-2 text-2xl font-extrabold text-white [text-shadow:0_10px_26px_rgba(8,17,28,0.35)]">
                      {destination.price}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.to}
                className="group rounded-[26px] border border-white/40 bg-white/60 p-5 shadow-[0_8px_32px_rgba(16,24,38,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-[2px] hover:bg-white/80 hover:shadow-[0_12px_40px_rgba(16,24,38,0.12)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/50 bg-white/70 text-[var(--air-blue-deep)] shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">{action.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-[var(--air-muted)]">{action.description}</div>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--air-ink)] transition-transform group-hover:translate-x-1">
                  Открыть
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
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
                  <div key={fare.title} className={index === 1 ? 'air-dark-card p-5 md:p-6' : 'air-soft-card p-5 md:p-6'}>
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
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">Что проверить перед покупкой</h2>
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
