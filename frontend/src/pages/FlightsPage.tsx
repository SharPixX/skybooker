import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { searchFlights } from '../api';
import { Flight, Pagination } from '../types';
import { Plane, Clock, ArrowRight, Users, Loader2, Search, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const PAGE_SIZE = 20;

export default function FlightsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  // Initial load
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      setFlights([]);
      setPagination(null);
      try {
        const { flights: data, pagination: pg } = await searchFlights({ from, to, date, page: 1, limit: PAGE_SIZE });
        setFlights(data);
        setPagination(pg);
      } catch {
        setError('Не удалось загрузить рейсы');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [from, to, date]);

  // Load more
  const loadMore = useCallback(async () => {
    if (!pagination || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = pagination.page + 1;
      const { flights: data, pagination: pg } = await searchFlights({ from, to, date, page: nextPage, limit: PAGE_SIZE });
      setFlights((prev) => [...prev, ...data]);
      setPagination(pg);
    } catch {
      // silently fail on load-more
    } finally {
      setLoadingMore(false);
    }
  }, [pagination, from, to, date]);

  const plural = (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'рейс';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'рейса';
    return 'рейсов';
  };

  const total = pagination?.total ?? flights.length;
  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-subtle mb-6">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg-muted">Результаты поиска</span>
      </div>

      {/* Search summary */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-fg mb-1">
            {from || to ? (
              <span className="flex items-center gap-2 flex-wrap">
                {from && <span>{from.split(' (')[0]}</span>}
                {from && to && <ArrowRight className="w-4 h-4 text-sky" />}
                {to && <span>{to.split(' (')[0]}</span>}
              </span>
            ) : (
              'Все доступные рейсы'
            )}
          </h2>
          <div className="flex items-center gap-3 text-sm text-fg-subtle">
            {date && (
              <span>{format(new Date(date), 'd MMMM yyyy', { locale: ru })}</span>
            )}
            {!loading && (
              <span>
                {total} {plural(total)}
              </span>
            )}
          </div>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          Изменить поиск
        </Link>
      </div>

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

      {/* Flight cards */}
      <div className="space-y-3">
        {flights.map((flight) => {
          const minPrice = flight.minPrice;
          const available = flight.availableSeats ?? 0;
          return (
            <div
              key={flight.id}
              onClick={() => navigate(`/flights/${flight.id}/seats`)}
              className="bg-dark-800 border border-dark-600 rounded-xl p-5 hover:border-dark-500 cursor-pointer transition-all group"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Flight info */}
                <div className="flex items-center gap-5 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-sky/10 flex items-center justify-center flex-shrink-0 group-hover:bg-sky/15 transition-colors">
                    <Plane className="w-5 h-5 text-sky -rotate-45" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-mono text-sky bg-sky/10 px-2 py-0.5 rounded">
                      {flight.flightNumber}
                    </span>
                    <div className="flex items-center gap-2 text-fg mt-1.5">
                      <span className="font-medium truncate">{flight.departureAirport.city}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-fg-subtle flex-shrink-0" />
                      <span className="font-medium truncate">{flight.destinationAirport.city}</span>
                    </div>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5 text-fg-muted flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-sm">
                    {format(new Date(flight.departureTime), 'd MMM, HH:mm', { locale: ru })}
                  </span>
                </div>

                {/* Seats + Price */}
                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-3.5 h-3.5 text-fg-subtle" />
                    <span className={available > 5 ? 'text-neon-green' : available > 0 ? 'text-neon-orange' : 'text-neon-red'}>
                      {available > 0 ? `${available} мест` : 'Нет мест'}
                    </span>
                  </div>

                  {minPrice != null ? (
                    <div className="text-right min-w-[80px]">
                      <p className="text-[10px] text-fg-subtle uppercase">от</p>
                      <p className="text-lg font-bold text-fg">
                        {minPrice.toLocaleString('ru-RU')}
                        <span className="text-xs text-fg-muted ml-1">₽</span>
                      </p>
                    </div>
                  ) : (
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm text-fg-subtle">—</p>
                    </div>
                  )}
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
    </div>
  );
}
