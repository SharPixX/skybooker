import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { searchFlights } from '../api';
import { Flight, Pagination } from '../types';
import { Plane, Loader2, Search, ChevronDown, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const PAGE_SIZE = 20;

/* ─── Tariff definitions ─── */
interface Tariff {
  id: 'basic' | 'standard' | 'business';
  name: string;
  color: string;         // border/accent color class
  bgColor: string;       // background
  headerBg: string;      // header background
  badge?: string;        // optional badge text
  features: { icon: 'check' | 'paid' | 'no'; text: string }[];
}

const TARIFFS: Tariff[] = [
  {
    id: 'basic',
    name: 'Базовый',
    color: 'border-sky/40',
    bgColor: 'bg-sky/5',
    headerBg: 'bg-sky/10',
    features: [
      { icon: 'check', text: 'Ручная кладь 36×30×27 см' },
      { icon: 'paid', text: 'Багаж платный' },
      { icon: 'paid', text: 'Выбор места платный' },
      { icon: 'check', text: 'Мили бонус до 50%' },
      { icon: 'paid', text: 'Обмен с неустойкой 5 000 ₽' },
      { icon: 'no', text: 'Тариф невозвратный' },
    ],
  },
  {
    id: 'standard',
    name: 'Оптимальный',
    color: 'border-neon-blue/50',
    bgColor: 'bg-neon-blue/5',
    headerBg: 'bg-neon-blue/10',
    badge: 'Популярный',
    features: [
      { icon: 'check', text: 'Ручная кладь 36×30×27 см' },
      { icon: 'check', text: 'Багаж 10 кг × 1 место' },
      { icon: 'check', text: 'Выбор места 19-32 ряд' },
      { icon: 'check', text: 'Мили бонус до 75%' },
      { icon: 'paid', text: 'Обмен с неустойкой 5 000 ₽' },
      { icon: 'no', text: 'Тариф невозвратный' },
    ],
  },
  {
    id: 'business',
    name: 'Максимум',
    color: 'border-amber-400/40',
    bgColor: 'bg-amber-500/5',
    headerBg: 'bg-amber-500/10',
    features: [
      { icon: 'check', text: 'Ручная кладь 36×30×27 см' },
      { icon: 'check', text: 'Багаж 20 кг × 1 место' },
      { icon: 'check', text: 'Выбор мест кроме 1ABC и 2DEF' },
      { icon: 'check', text: 'Мили бонус до 100%' },
      { icon: 'check', text: 'Обмен бесплатный' },
      { icon: 'check', text: 'Возврат бесплатный*' },
    ],
  },
];

function FeatureIcon({ type }: { type: 'check' | 'paid' | 'no' }) {
  if (type === 'check') return <Check className="w-3.5 h-3.5 text-neon-green flex-shrink-0" />;
  if (type === 'paid') return <span className="w-3.5 h-3.5 flex items-center justify-center text-amber-400 flex-shrink-0 text-[10px] font-bold">₽</span>;
  return <X className="w-3.5 h-3.5 text-neon-red/60 flex-shrink-0" />;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h} ч ${m > 0 ? `${m} м` : ''}`.trim();
}

function formatPrice(price: number | null | undefined): string {
  if (price == null) return '—';
  return price.toLocaleString('ru-RU') + ' ₽';
}

const MOCK_FLIGHTS: Flight[] = [
  {
    id: 'mock-1',
    flightNumber: 'SU-1020',
    aircraftType: 'Boeing 737-800',
    departureAirport: { id: '1', code: 'SVO', name: 'Шереметьево', city: 'Москва', country: 'Россия' },
    destinationAirport: { id: '2', code: 'AER', name: 'Адлер', city: 'Сочи', country: 'Россия' },
    departureTime: new Date(Date.now() + 3 * 3600_000).toISOString(),
    arrivalTime: new Date(Date.now() + 5.5 * 3600_000).toISOString(),
    durationMinutes: 150,
    minPrice: 3990,
    minEconomyPrice: 3990,
    standardPrice: 5490,
    minBusinessPrice: 14500,
    economySeatsAvail: 48,
    businessSeatsAvail: 8,
  },
  {
    id: 'mock-2',
    flightNumber: 'S7-412',
    aircraftType: 'Boeing 737-800',
    departureAirport: { id: '1', code: 'SVO', name: 'Шереметьево', city: 'Москва', country: 'Россия' },
    destinationAirport: { id: '2', code: 'AER', name: 'Адлер', city: 'Сочи', country: 'Россия' },
    departureTime: new Date(Date.now() + 7 * 3600_000).toISOString(),
    arrivalTime: new Date(Date.now() + 9.5 * 3600_000).toISOString(),
    durationMinutes: 155,
    minPrice: 4290,
    minEconomyPrice: 4290,
    standardPrice: 6100,
    minBusinessPrice: 16800,
    economySeatsAvail: 12,
    businessSeatsAvail: 4,
  },
  {
    id: 'mock-3',
    flightNumber: 'DP-507',
    aircraftType: 'Boeing 777-300',
    departureAirport: { id: '1', code: 'SVO', name: 'Шереметьево', city: 'Москва', country: 'Россия' },
    destinationAirport: { id: '3', code: 'DXB', name: 'Дубай', city: 'Дубай', country: 'ОАЭ' },
    departureTime: new Date(Date.now() + 12 * 3600_000).toISOString(),
    arrivalTime: new Date(Date.now() + 17.5 * 3600_000).toISOString(),
    durationMinutes: 330,
    minPrice: 12500,
    minEconomyPrice: 12500,
    standardPrice: 18900,
    minBusinessPrice: 38000,
    economySeatsAvail: 86,
    businessSeatsAvail: 14,
  },
];

export default function FlightsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>(MOCK_FLIGHTS);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'time' | 'duration'>('price');
  const [showTariffInfo, setShowTariffInfo] = useState(true);

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      setPagination(null);
      try {
        const { flights: data, pagination: pg } = await searchFlights({ from, to, date, page: 1, limit: PAGE_SIZE });
        setFlights(data.length > 0 ? data : MOCK_FLIGHTS);
        setPagination(pg);
      } catch {
        // API недоступна — показываем моки
        setFlights(MOCK_FLIGHTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [from, to, date]);

  const loadMore = useCallback(async () => {
    if (!pagination || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const { flights: data, pagination: pg } = await searchFlights({ from, to, date, page: nextPage, limit: PAGE_SIZE });
      setFlights((prev) => [...prev, ...data]);
      setPagination(pg);
    } catch { /* silent */ } finally {
      setLoadingMore(false);
    }
  }, [pagination, from, to, date]);

  // Sort flights
  const sortedFlights = [...flights].sort((a, b) => {
    if (sortBy === 'price') return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
    if (sortBy === 'time') return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    if (sortBy === 'duration') return (a.durationMinutes ?? Infinity) - (b.durationMinutes ?? Infinity);
    return 0;
  });

  const total = pagination?.total ?? flights.length;
  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  const fromCity = from ? from.split(' (')[0] : '';
  const toCity = to ? to.split(' (')[0] : '';

  function getTariffPrice(flight: Flight, tariffId: string): number | null {
    if (tariffId === 'basic') return flight.minEconomyPrice ?? null;
    if (tariffId === 'standard') return flight.standardPrice ?? null;
    if (tariffId === 'business') return flight.minBusinessPrice ?? null;
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-subtle mb-6">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg-muted">Выбор рейса</span>
      </div>

      {/* Title — like reference: "Выберите рейс: City1 → City2 Date" */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-fg">
          {fromCity || toCity ? (
            <>
              Выберите рейс:{' '}
              <span className="text-sky">{fromCity}</span>
              {fromCity && toCity && (
                <span className="text-fg-subtle mx-2">→</span>
              )}
              <span className="text-sky">{toCity}</span>
              {date && (
                <span className="text-fg ml-3">
                  {format(new Date(date), 'd MMMM yyyy', { locale: ru })}
                </span>
              )}
            </>
          ) : (
            'Все доступные рейсы'
          )}
        </h1>
      </div>

      {/* Tariff headers — desktop: sticky table header like Pobeda */}
      {!loading && flights.length > 0 && (
        <div className="hidden lg:block mb-4">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-0 border border-dark-600 rounded-xl overflow-hidden">
            {/* Sort column */}
            <div className="bg-dark-800 p-4 border-r border-dark-600">
              <div className="text-xs text-fg-subtle mb-2">Сортировать</div>
              <div className="flex flex-col gap-1">
                {[
                  { key: 'price' as const, label: 'По цене' },
                  { key: 'time' as const, label: 'По времени' },
                  { key: 'duration' as const, label: 'По длительности' },
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSortBy(s.key)}
                    className={`text-left text-sm px-2 py-1 rounded transition-all ${
                      sortBy === s.key ? 'text-sky bg-sky/10' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    {s.label} {sortBy === s.key && '▼'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tariff columns */}
            {TARIFFS.map((tariff) => (
              <div key={tariff.id} className={`${tariff.headerBg} p-4 border-r border-dark-600 last:border-r-0 relative`}>
                {tariff.badge && (
                  <div className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-0">
                    <span className="bg-neon-blue text-white text-[10px] font-bold px-3 py-1 rounded-b-lg uppercase tracking-wider">
                      {tariff.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-base font-bold text-fg text-center mb-3 mt-1">{tariff.name}</h3>
                {showTariffInfo && (
                  <div className="space-y-1.5">
                    {tariff.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-fg-muted">
                        <FeatureIcon type={f.icon} />
                        <span>{f.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowTariffInfo(!showTariffInfo)}
            className="text-[11px] text-fg-subtle hover:text-fg mt-1 transition-colors"
          >
            {showTariffInfo ? 'Скрыть условия тарифов ▲' : 'Показать условия тарифов ▼'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-7 h-7 text-sky animate-spin" />
          <p className="text-sm text-fg-subtle">Ищем рейсы...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-neon-red text-sm">{error}</p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && flights.length === 0 && (
        <div className="text-center py-20">
          <Plane className="w-10 h-10 text-dark-500 mx-auto mb-3" />
          <p className="text-fg-muted">Рейсов не найдено</p>
          <p className="text-fg-subtle text-sm mt-1 mb-4">Попробуйте изменить параметры поиска</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neon-blue text-white text-sm font-medium rounded-lg hover:bg-neon-blue/90 transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            Новый поиск
          </Link>
        </div>
      )}

      {/* Flight rows */}
      <div className="space-y-3">
        {sortedFlights.map((flight) => {
          const depTime = new Date(flight.departureTime);
          const arrTime = flight.arrivalTime ? new Date(flight.arrivalTime) : null;
          const duration = flight.durationMinutes;
          const depCode = flight.departureAirport.code;
          const arrCode = flight.destinationAirport.code;

          return (
            <div
              key={flight.id}
              className="border border-dark-600 rounded-xl overflow-hidden hover:border-dark-500 transition-all"
            >
              {/* Desktop: grid with tariff columns */}
              <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_1fr]">
                {/* Flight info column */}
                <div className="bg-dark-800 p-4 border-r border-dark-600">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono text-sky bg-sky/10 px-2 py-0.5 rounded">{flight.flightNumber}</span>
                    {flight.aircraftType && (
                      <span className="text-[10px] text-fg-subtle font-mono bg-dark-700 px-1.5 py-0.5 rounded">{flight.aircraftType}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-1">
                    <div className="text-lg font-bold text-fg">
                      {format(depTime, 'HH:mm')}
                    </div>
                    <div className="text-fg-faint">–</div>
                    <div className="text-lg font-bold text-fg">
                      {arrTime ? format(arrTime, 'HH:mm') : '—'}
                    </div>
                    {duration != null && (
                      <div className="text-xs text-fg-subtle ml-auto bg-dark-700 px-2 py-0.5 rounded">
                        {formatDuration(duration)}
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-fg-muted">
                    {flight.departureAirport.city} {depCode} – {flight.destinationAirport.city} {arrCode}
                  </div>
                  <div className="text-[11px] text-neon-green mt-1">
                    Прямой рейс
                  </div>
                </div>

                {/* Tariff price columns */}
                {TARIFFS.map((tariff) => {
                  const price = getTariffPrice(flight, tariff.id);
                  const isAvailable = price != null;
                  return (
                    <button
                      key={tariff.id}
                      onClick={() => isAvailable && navigate(`/flights/${flight.id}/seats`)}
                      disabled={!isAvailable}
                      className={`p-4 border-r border-dark-600 last:border-r-0 transition-all text-center ${
                        isAvailable
                          ? `${tariff.bgColor} hover:bg-opacity-80 cursor-pointer group`
                          : 'bg-dark-800/50 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <div className="text-2xl font-bold text-fg group-hover:text-sky transition-colors">
                            {formatPrice(price)}
                          </div>
                          <div className="text-[10px] text-fg-subtle mt-1 uppercase">
                            {tariff.id === 'business'
                              ? `${flight.businessSeatsAvail ?? 0} мест`
                              : `${flight.economySeatsAvail ?? 0} мест`}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-fg-subtle">Нет мест</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile: compact card */}
              <div
                className="lg:hidden bg-dark-800 p-4 cursor-pointer"
                onClick={() => navigate(`/flights/${flight.id}/seats`)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-sky bg-sky/10 px-2 py-0.5 rounded">{flight.flightNumber}</span>
                    {duration != null && (
                      <span className="text-[11px] text-fg-subtle bg-dark-700 px-2 py-0.5 rounded">
                        {formatDuration(duration)}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-neon-green">Прямой рейс</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-fg">{format(depTime, 'HH:mm')}</span>
                  <span className="text-fg-faint">–</span>
                  <span className="text-lg font-bold text-fg">{arrTime ? format(arrTime, 'HH:mm') : '—'}</span>
                </div>

                <div className="text-xs text-fg-muted mb-3">
                  {flight.departureAirport.city} {depCode} – {flight.destinationAirport.city} {arrCode}
                </div>

                {/* Mobile tariff prices row */}
                <div className="grid grid-cols-3 gap-2">
                  {TARIFFS.map((tariff) => {
                    const price = getTariffPrice(flight, tariff.id);
                    return (
                      <div key={tariff.id} className={`rounded-lg p-2 text-center ${tariff.bgColor} border ${tariff.color}`}>
                        <div className="text-[10px] text-fg-subtle font-medium mb-0.5">{tariff.name}</div>
                        <div className="text-sm font-bold text-fg">
                          {price != null ? formatPrice(price) : '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 bg-dark-700 border border-dark-500 text-fg-secondary text-sm rounded-lg
                       hover:border-sky/50 hover:text-fg transition-all disabled:opacity-50"
          >
            {loadingMore ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            Показать ещё ({total - flights.length})
          </button>
        </div>
      )}

      {/* Footer note */}
      {!loading && flights.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-[11px] text-fg-subtle">
          <span>* Условия возврата зависят от тарифа и времени до вылета</span>
          <Link to="/" className="flex items-center gap-1 text-fg-muted hover:text-sky transition-colors">
            <Search className="w-3 h-3" />
            Изменить поиск
          </Link>
        </div>
      )}
    </div>
  );
}
