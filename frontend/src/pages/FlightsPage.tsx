import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowRight, ChevronDown, Clock3, Filter, Loader2, Plane, Ticket, Users } from 'lucide-react';
import { searchFlights } from '../api';
import { searchMockFlights } from '../mockData';
import type { Flight, Pagination } from '../types';
import BookingSearchPanel from '../components/BookingSearchPanel';

const PAGE_SIZE = 20;

const sortOptions = [
  { key: 'price', label: 'По цене' },
  { key: 'time', label: 'По времени' },
  { key: 'duration', label: 'По длительности' },
] as const;

function formatPrice(price: number | null | undefined) {
  if (price == null) {
    return '—';
  }

  return `${price.toLocaleString('ru-RU')} ₽`;
}

function formatDuration(minutes?: number | null) {
  if (!minutes) {
    return '—';
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours} ч ${remainder.toString().padStart(2, '0')} мин`;
}

function getFareCards(flight: Flight) {
  return [
    {
      id: 'light',
      title: 'Light',
      subtitle: 'Базовый тариф',
      price: flight.minEconomyPrice ?? flight.minPrice ?? null,
      items: ['Ручная кладь', 'Место за доплату', 'Базовые условия'],
    },
    {
      id: 'comfort',
      title: 'Comfort',
      subtitle: 'Оптимальный тариф',
      price: flight.standardPrice ?? flight.minEconomyPrice ?? flight.minPrice ?? null,
      items: ['Багаж 23 кг', 'Стандартное место', 'Изменение даты с доплатой'],
    },
    {
      id: 'business',
      title: 'Business',
      subtitle: 'Приоритетный тариф',
      price: flight.minBusinessPrice ?? null,
      items: ['Приоритет', 'Бизнес-зал', 'Гибкий маршрут'],
    },
  ] as const;
}

export default function FlightsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'duration'>('price');
  const [usingMockData, setUsingMockData] = useState(false);

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const returnDate = searchParams.get('returnDate') || '';
  const trip = (searchParams.get('trip') as 'oneway' | 'roundtrip' | null) ?? 'oneway';
  const passengers = Number(searchParams.get('passengers') || '1');
  const cabin = (searchParams.get('cabin') as 'economy' | 'comfort' | 'business' | null) ?? 'economy';

  useEffect(() => {
    async function loadFlights() {
      setLoading(true);
      setPagination(null);
      setUsingMockData(false);

      try {
        const { flights: data, pagination: pageInfo } = await searchFlights({
          from,
          to,
          date,
          page: 1,
          limit: PAGE_SIZE,
        });

        setFlights(data);
        setPagination(pageInfo);
      } catch {
        const fallback = searchMockFlights({
          from,
          to,
          date,
          page: 1,
          limit: PAGE_SIZE,
        });

        setUsingMockData(true);
        setFlights(fallback.flights);
        setPagination(fallback.pagination);
      } finally {
        setLoading(false);
      }
    }

    loadFlights();
  }, [from, to, date]);

  const loadMore = async () => {
    if (!pagination || pagination.page >= pagination.totalPages) {
      return;
    }

    setLoadingMore(true);

    try {
      if (usingMockData) {
        const nextPage = pagination.page + 1;
        const fallback = searchMockFlights({
          from,
          to,
          date,
          page: nextPage,
          limit: PAGE_SIZE,
        });

        setFlights((current) => [...current, ...fallback.flights]);
        setPagination(fallback.pagination);
        return;
      }

      const nextPage = pagination.page + 1;
      const { flights: data, pagination: pageInfo } = await searchFlights({
        from,
        to,
        date,
        page: nextPage,
        limit: PAGE_SIZE,
      });

      setFlights((current) => [...current, ...data]);
      setPagination(pageInfo);
    } catch {
      const nextPage = (pagination?.page ?? 1) + 1;
      const pages = Array.from({ length: nextPage }, (_, index) =>
        searchMockFlights({
          from,
          to,
          date,
          page: index + 1,
          limit: PAGE_SIZE,
        }),
      );

      const fallback = pages[pages.length - 1];
      const combinedFlights = pages.flatMap((pageResult) => pageResult.flights);
      setUsingMockData(true);
      setFlights(combinedFlights);
      setPagination(fallback.pagination);
    } finally {
      setLoadingMore(false);
    }
  };

  const sortedFlights = useMemo(() => {
    return [...flights].sort((left, right) => {
      if (sortBy === 'price') {
        return (left.minPrice ?? Number.MAX_SAFE_INTEGER) - (right.minPrice ?? Number.MAX_SAFE_INTEGER);
      }

      if (sortBy === 'time') {
        return new Date(left.departureTime).getTime() - new Date(right.departureTime).getTime();
      }

      return (left.durationMinutes ?? Number.MAX_SAFE_INTEGER) - (right.durationMinutes ?? Number.MAX_SAFE_INTEGER);
    });
  }, [flights, sortBy]);

  const fromCity = from ? from.split(' (')[0] : 'Москва';
  const toCity = to ? to.split(' (')[0] : 'Все направления';
  const preferredFare = cabin === 'business' ? 'business' : cabin === 'comfort' ? 'comfort' : 'light';
  const cabinLabel = cabin === 'business' ? 'Бизнес' : cabin === 'comfort' ? 'Комфорт' : 'Эконом';
  const passengersLabel = passengers === 1 ? '1 пассажир' : passengers < 5 ? `${passengers} пассажира` : `${passengers} пассажиров`;
  const visibleTotal = sortedFlights.length;

  return (
    <div className="air-page">
      <div className="air-container">
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--air-muted)]">
          <Link to="/" className="font-semibold text-[var(--air-ink)]">
            Главная
          </Link>
          <span>/</span>
          <span>Рейсы</span>
        </div>

        <section className="air-dark-card px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr] xl:items-end">
            <div>
              <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
                Выбор рейса
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">
                {fromCity} → {toCity}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/72 md:text-base">
                Сравните время вылета, тариф и условия по каждому рейсу, затем перейдите к выбору места в салоне.
              </p>

              <div className="mt-5 air-meta-row">
                <div className="air-dark-pill">
                  <Clock3 className="h-4 w-4 text-[var(--air-yellow)]" />
                  {date ? format(new Date(date), 'd MMMM yyyy', { locale: ru }) : 'Ближайшие вылеты'}
                </div>
                {trip === 'roundtrip' && returnDate && (
                  <div className="air-dark-pill">
                    <ChevronDown className="h-4 w-4 rotate-[-90deg] text-[var(--air-yellow)]" />
                    Обратно {format(new Date(returnDate), 'd MMMM', { locale: ru })}
                  </div>
                )}
                <div className="air-dark-pill">
                  <Users className="h-4 w-4 text-[var(--air-yellow)]" />
                  {passengersLabel}
                </div>
                <div className="air-dark-pill">
                  <Ticket className="h-4 w-4 text-[var(--air-yellow)]" />
                  {cabinLabel}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Доступно</div>
                <div className="mt-3 text-3xl font-extrabold text-white">
                  {visibleTotal} {visibleTotal === 1 ? 'рейс' : visibleTotal < 5 ? 'рейса' : 'рейсов'}
                </div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Выбранный класс</div>
                <div className="mt-3 text-3xl font-extrabold text-white">{cabinLabel}</div>
              </div>
            </div>
          </div>

          {usingMockData && (
            <div className="mt-5 inline-flex rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/68">
              Показаны доступные варианты для выбранного направления
            </div>
          )}
        </section>

        <section className="mt-6">
          <BookingSearchPanel
            variant="compact"
            initialFrom={from}
            initialTo={to}
            initialDate={date}
            initialReturnDate={returnDate}
            initialTripType={trip}
            initialPassengers={passengers}
            initialCabin={cabin}
            title="Изменить параметры"
            description="Уточните маршрут, дату и класс обслуживания прямо на этой странице."
          />
        </section>

        <section className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSortBy(option.key)}
                className={[
                  'air-pill transition-colors',
                  sortBy === option.key
                    ? 'border-[rgba(41,80,215,0.18)] bg-[rgba(79,130,255,0.12)] text-[var(--air-blue-deep)]'
                    : '',
                ].join(' ')}
              >
                <Filter className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>

          <div className="air-pill">
            <Plane className="h-4 w-4 text-[var(--air-blue-deep)]" />
            {visibleTotal} {visibleTotal === 1 ? 'рейс после фильтра' : visibleTotal < 5 ? 'рейса после фильтра' : 'рейсов после фильтра'}
          </div>
        </section>

        <section className="mt-6 space-y-4">
          {loading ? (
            <div className="air-surface-card flex items-center justify-center gap-3 px-5 py-14 text-[var(--air-muted)]">
              <Loader2 className="h-5 w-5 animate-spin" />
              Загружаем рейсы...
            </div>
          ) : sortedFlights.length === 0 ? (
            <div className="air-surface-card px-6 py-12 text-center">
              <div className="text-2xl font-extrabold text-[var(--air-ink)]">Рейсы не найдены</div>
              <div className="mt-3 text-sm leading-relaxed text-[var(--air-muted)]">
                Для выбранного маршрута сейчас нет подходящих вариантов. Измените дату или направление.
              </div>
              <div className="mt-6 flex justify-center">
                <Link to="/#search" className="air-secondary-button">
                  Вернуться к поиску
                </Link>
              </div>
            </div>
          ) : (
            sortedFlights.map((flight) => (
              <article key={flight.id} className="air-surface-card-strong px-5 py-5 md:px-6 md:py-6">
                <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="air-pill">
                        <Plane className="h-4 w-4 text-[var(--air-blue-deep)]" />
                        {flight.flightNumber}
                      </div>
                      <div className="air-pill">Прямой рейс</div>
                      <div className="air-pill">
                        <Clock3 className="h-4 w-4 text-[var(--air-blue-deep)]" />
                        {formatDuration(flight.durationMinutes)}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
                      <div>
                        <div className="text-5xl font-extrabold tracking-[-0.06em] text-[var(--air-ink)]">
                          {format(new Date(flight.departureTime), 'HH:mm')}
                        </div>
                        <div className="mt-2 text-sm font-bold text-[var(--air-ink)]">
                          {flight.departureAirport.city} ({flight.departureAirport.code})
                        </div>
                        <div className="mt-1 text-sm text-[var(--air-muted)]">{flight.departureAirport.name}</div>
                      </div>

                      <div className="flex min-w-[170px] flex-col items-center gap-2 text-center">
                        <div className="flex w-full items-center gap-3 text-[var(--air-muted)]">
                          <div className="h-px flex-1 bg-[rgba(17,24,39,0.12)]" />
                          <ArrowRight className="h-4 w-4 shrink-0" />
                          <div className="h-px flex-1 bg-[rgba(17,24,39,0.12)]" />
                        </div>
                        <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">
                          Без пересадок
                        </div>
                      </div>

                      <div className="md:text-right">
                        <div className="text-5xl font-extrabold tracking-[-0.06em] text-[var(--air-ink)]">
                          {flight.arrivalTime ? format(new Date(flight.arrivalTime), 'HH:mm') : '—'}
                        </div>
                        <div className="mt-2 text-sm font-bold text-[var(--air-ink)]">
                          {flight.destinationAirport.city} ({flight.destinationAirport.code})
                        </div>
                        <div className="mt-1 text-sm text-[var(--air-muted)]">{flight.destinationAirport.name}</div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                      <div className="air-data-card">
                        <div className="air-quiet-label">Вылет</div>
                        <strong>{format(new Date(flight.departureTime), 'd MMMM, EEE', { locale: ru })}</strong>
                      </div>
                      <div className="air-data-card">
                        <div className="air-quiet-label">Места в экономе</div>
                        <strong>{flight.economySeatsAvail ?? 0}</strong>
                      </div>
                      <div className="air-data-card">
                        <div className="air-quiet-label">Места в бизнесе</div>
                        <strong>{flight.businessSeatsAvail ?? 0}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-3">
                    {getFareCards(flight).map((fare) => (
                      <button
                        key={fare.id}
                        type="button"
                        onClick={() => navigate(`/flights/${flight.id}/seats?fare=${fare.id}`)}
                        className={[
                          'rounded-[26px] p-5 text-left transition-transform duration-300 hover:-translate-y-[1px]',
                          fare.id === preferredFare
                            ? 'air-dark-card'
                            : 'border border-[var(--air-border)] bg-[rgba(255,255,255,0.76)]',
                        ].join(' ')}
                        disabled={fare.price == null}
                      >
                        <div
                          className="text-[11px] font-extrabold uppercase tracking-[0.18em]"
                          style={fare.id === preferredFare ? { color: 'rgba(248,245,238,0.62)' } : { color: 'var(--air-muted)' }}
                        >
                          {fare.subtitle}
                        </div>
                        <div
                          className="mt-3 text-2xl font-extrabold tracking-[-0.05em]"
                          style={fare.id === preferredFare ? { color: 'white' } : { color: 'var(--air-ink)' }}
                        >
                          {fare.title}
                        </div>
                        <div
                          className="mt-2 text-3xl font-extrabold tracking-[-0.05em]"
                          style={fare.id === preferredFare ? { color: 'white' } : { color: 'var(--air-ink)' }}
                        >
                          {formatPrice(fare.price)}
                        </div>

                        <div className="air-divider my-4" />

                        <div className="space-y-3">
                          {fare.items.map((item) => (
                            <div
                              key={item}
                              className="flex items-start gap-2 text-sm font-semibold"
                              style={fare.id === preferredFare ? { color: 'rgba(248,245,238,0.88)' } : { color: 'var(--air-ink)' }}
                            >
                              <span className="mt-1 h-2 w-2 rounded-full bg-[var(--air-yellow)]" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>

                        <div
                          className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold"
                          style={fare.id === preferredFare ? { color: 'white' } : { color: 'var(--air-ink)' }}
                        >
                          Выбрать и перейти к месту
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        {pagination && pagination.page < pagination.totalPages && (
          <div className="mt-6 flex justify-center">
            <button type="button" onClick={loadMore} className="air-secondary-button" disabled={loadingMore}>
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Загружаем еще рейсы
                </>
              ) : (
                'Показать еще'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
