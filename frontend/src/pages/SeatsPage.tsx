import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { isAxiosError } from 'axios';
import { ArrowRight, Crown, Info, Loader2, Plane, ShieldCheck, Ticket } from 'lucide-react';
import { bookSeat, getFlightById } from '../api';
import { useAuth } from '../context/AuthContext';
import { createMockBooking, getMockFlightById } from '../mockData';
import type { Flight, Seat } from '../types';

interface LayoutConfig {
  businessRows: number[];
  economyRows: number[];
  exitRows: number[];
  columns: string[][];
  businessColumns: string[][];
}

const BOEING_737: LayoutConfig = {
  businessRows: [1, 2, 3, 4],
  economyRows: Array.from({ length: 26 }, (_, index) => index + 5),
  exitRows: [12, 25],
  columns: [['A', 'B', 'C'], ['D', 'E', 'F']],
  businessColumns: [['A', 'C'], ['D', 'F']],
};

const BOEING_777: LayoutConfig = {
  businessRows: [1, 2, 3, 4, 5],
  economyRows: Array.from({ length: 40 }, (_, index) => index + 6),
  exitRows: [20, 35],
  columns: [['A', 'B', 'C'], ['D', 'E', 'F', 'G'], ['H', 'J', 'K']],
  businessColumns: [['A', 'C'], ['D', 'G'], ['H', 'K']],
};

const fareBenefits = {
  light: ['Ручная кладь и базовые условия тарифа', 'Подходит для короткой поездки', 'Багаж и место можно добавить позже'],
  comfort: ['Багаж включен в тариф', 'Стандартные места уже доступны', 'Оптимальный вариант для отпуска и семьи'],
  business: ['Приоритет на земле и в аэропорту', 'Больше пространства в салоне', 'Гибкие условия по поездке'],
} as const;

function getLayout(aircraftType?: string): LayoutConfig {
  if (aircraftType?.includes('777')) {
    return BOEING_777;
  }

  return BOEING_737;
}

function formatPrice(value: string) {
  return `${parseFloat(value).toLocaleString('ru-RU')} ₽`;
}

export default function SeatsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [classFilter, setClassFilter] = useState<'all' | 'business' | 'economy'>('all');

  const fare = (searchParams.get('fare') as 'light' | 'comfort' | 'business' | null) ?? 'comfort';
  const fareTitle = fare === 'light' ? 'Light' : fare === 'business' ? 'Business' : 'Comfort';
  const isMockSelection = Boolean(selectedSeat?.id.startsWith('mock-'));

  useEffect(() => {
    setClassFilter(fare === 'business' ? 'business' : 'all');
  }, [fare]);

  useEffect(() => {
    async function loadFlight() {
      if (!id) {
        return;
      }

      try {
        const data = await getFlightById(id);
        setFlight(data);
      } catch {
        const mockFlight = getMockFlightById(id);
        if (mockFlight) {
          setFlight(mockFlight);
        } else {
          setError('Не удалось загрузить схему салона.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadFlight();
  }, [id]);

  const handleBook = async () => {
    if (!selectedSeat) {
      return;
    }

    if (selectedSeat.id.startsWith('mock-') && flight) {
      const mockBooking = createMockBooking(flight, selectedSeat);
      navigate(`/booking/${mockBooking.id}`);
      return;
    }

    if (!isAuthenticated) {
      navigate('/auth', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    setBooking(true);
    setError('');

    try {
      const { booking: bookingResult } = await bookSeat(selectedSeat.id);
      navigate(`/booking/${bookingResult.id}`);
    } catch (unknownError) {
      const message = isAxiosError(unknownError)
        ? unknownError.response?.data?.message
        : 'Место уже занято. Выберите другое место.';
      setError(message || 'Место уже занято. Выберите другое место.');
      setSelectedSeat(null);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="air-page">
        <div className="air-container">
          <div className="air-surface-card flex items-center justify-center gap-3 px-5 py-16 text-[var(--air-muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Загружаем схему салона...
          </div>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="air-page">
        <div className="air-container">
          <div className="air-surface-card px-6 py-12 text-center">
            <div className="text-2xl font-extrabold text-[var(--air-ink)]">Рейс не найден</div>
            <div className="mt-3 text-sm leading-relaxed text-[var(--air-muted)]">
              Попробуйте вернуться к выбору рейсов и запустить поиск заново.
            </div>
            <Link to="/flights" className="air-secondary-button mt-6">
              К рейсам
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const layout = getLayout(flight.aircraftType);
  const seats = flight.seats ?? [];
  const seatMap = new Map<string, Seat>();
  seats.forEach((seat) => seatMap.set(seat.seatNumber, seat));

  const businessSeats = seats.filter((seat) => seat.class === 'business');
  const economySeats = seats.filter((seat) => seat.class === 'economy');
  const availableBusiness = businessSeats.filter((seat) => seat.status === 'AVAILABLE').length;
  const availableEconomy = economySeats.filter((seat) => seat.status === 'AVAILABLE').length;
  const minBusiness = businessSeats
    .filter((seat) => seat.status === 'AVAILABLE')
    .map((seat) => parseFloat(seat.price))
    .sort((left, right) => left - right)[0];
  const minEconomy = economySeats
    .filter((seat) => seat.status === 'AVAILABLE')
    .map((seat) => parseFloat(seat.price))
    .sort((left, right) => left - right)[0];

  const renderSeatButton = (seatNumber: string, isBusiness: boolean) => {
    const seat = seatMap.get(seatNumber);
    const size = isBusiness ? 'h-11 w-11 rounded-[14px]' : 'h-9 w-9 rounded-[12px]';

    if (!seat) {
      return <div key={seatNumber} className={size} />;
    }

    const classes = ['air-seat', size];

    if (selectedSeat?.id === seat.id) {
      classes.push('air-seat-selected');
    } else if (seat.status === 'LOCKED') {
      classes.push('air-seat-locked');
    } else if (seat.status === 'BOOKED') {
      classes.push('air-seat-booked');
    } else if (isBusiness) {
      classes.push('air-seat-business');
    } else {
      classes.push('air-seat-available');
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={seat.status !== 'AVAILABLE'}
        onClick={() => setSelectedSeat((current) => (current?.id === seat.id ? null : seat))}
        className={classes.join(' ')}
        title={`${seat.seatNumber} • ${formatPrice(seat.price)}`}
      >
        {seat.seatNumber.slice(-1)}
      </button>
    );
  };

  const renderRow = (rowNumber: number, groups: string[][], isBusiness: boolean, isExit: boolean) => (
    <div key={rowNumber} className={`relative mb-2 flex items-center justify-center gap-1 ${isExit ? 'pb-4' : ''}`}>
      {groups.map((group, groupIndex) => (
        <div key={`${rowNumber}-${groupIndex}`} className="flex items-center gap-1">
          {group.map((letter) => renderSeatButton(`${rowNumber}${letter}`, isBusiness))}
          {groupIndex < groups.length - 1 && (
            <div className={`${isBusiness ? 'w-8' : 'w-6'} flex items-center justify-center text-[11px] font-bold text-[var(--air-muted)]`}>
              {groupIndex === 0 ? rowNumber : ''}
            </div>
          )}
        </div>
      ))}

      {groups.length === 2 && <div className="w-6 text-center text-[11px] font-bold text-[var(--air-muted)]">{rowNumber}</div>}

      {isExit && (
        <div className="absolute bottom-0 left-0 right-0 text-center text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-emerald)]">
          Выход
        </div>
      )}
    </div>
  );

  const showBusiness = classFilter === 'all' || classFilter === 'business';
  const showEconomy = classFilter === 'all' || classFilter === 'economy';

  return (
    <div className="air-page">
      <div className="air-container">
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--air-muted)]">
          <Link to="/" className="font-semibold text-[var(--air-ink)]">
            Главная
          </Link>
          <span>/</span>
          <Link to="/flights" className="font-semibold text-[var(--air-ink)]">
            Рейсы
          </Link>
          <span>/</span>
          <span>Место в салоне</span>
        </div>

        <section className="air-dark-card px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 xl:grid-cols-[1fr_auto] xl:items-end">
            <div>
              <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
                Выбор места
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">
                {flight.departureAirport.city} → {flight.destinationAirport.city}
              </h1>
              <div className="mt-4 air-meta-row">
                <div className="air-dark-pill">
                  <Plane className="h-4 w-4 text-[var(--air-yellow)]" />
                  {flight.flightNumber}
                </div>
                <div className="air-dark-pill">
                  <Ticket className="h-4 w-4 text-[var(--air-yellow)]" />
                  {flight.aircraftType || 'Boeing 737-800'}
                </div>
                <div className="air-dark-pill">
                  <ShieldCheck className="h-4 w-4 text-[var(--air-yellow)]" />
                  {format(new Date(flight.departureTime), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Эконом</div>
                <div className="mt-2 text-2xl font-extrabold text-white">{availableEconomy} мест</div>
                <div className="mt-2 text-sm text-white/64">от {minEconomy ? `${minEconomy.toLocaleString('ru-RU')} ₽` : '—'}</div>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/6 px-4 py-4">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Business</div>
                <div className="mt-2 text-2xl font-extrabold text-white">{availableBusiness} мест</div>
                <div className="mt-2 text-sm text-white/64">от {minBusiness ? `${minBusiness.toLocaleString('ru-RU')} ₽` : '—'}</div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <section className="mt-5 rounded-[24px] border border-[rgba(213,78,78,0.22)] bg-[rgba(213,78,78,0.08)] px-5 py-4 text-sm font-semibold text-[var(--air-danger)]">
            {error}
          </section>
        )}

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="air-surface-card px-5 py-6 md:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">Схема салона</div>
                <div className="mt-2 text-sm leading-relaxed text-[var(--air-muted)]">
                  Выберите место в салоне. После подтверждения бронь удерживается 15 минут до завершения покупки.
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setClassFilter('all')}
                  className={`air-pill ${classFilter === 'all' ? 'border-[rgba(41,80,215,0.18)] bg-[rgba(79,130,255,0.12)] text-[var(--air-blue-deep)]' : ''}`}
                >
                  Все места
                </button>
                <button
                  type="button"
                  onClick={() => setClassFilter('economy')}
                  className={`air-pill ${classFilter === 'economy' ? 'border-[rgba(41,80,215,0.18)] bg-[rgba(79,130,255,0.12)] text-[var(--air-blue-deep)]' : ''}`}
                >
                  Эконом
                </button>
                <button
                  type="button"
                  onClick={() => setClassFilter('business')}
                  className={`air-pill ${classFilter === 'business' ? 'border-[rgba(41,80,215,0.18)] bg-[rgba(79,130,255,0.12)] text-[var(--air-blue-deep)]' : ''}`}
                >
                  <Crown className="h-4 w-4 text-[var(--air-yellow-deep)]" />
                  Business
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="air-pill">
                <span className="air-seat air-seat-available h-6 w-6 rounded-[10px] text-[10px]">A</span>
                Доступно
              </div>
              <div className="air-pill">
                <span className="air-seat air-seat-business h-6 w-6 rounded-[10px] text-[10px]">B</span>
                Бизнес
              </div>
              <div className="air-pill">
                <span className="air-seat air-seat-booked h-6 w-6 rounded-[10px] text-[10px]">X</span>
                Недоступно
              </div>
            </div>

            <div className="air-divider my-6" />

            <div className="overflow-x-auto">
              <div className="mx-auto min-w-[540px] rounded-[28px] bg-[rgba(17,24,39,0.04)] p-5 md:p-6">
                <div className="mb-6 flex items-center justify-center">
                  <div className="inline-flex items-center gap-3 rounded-full border border-[var(--air-border)] bg-white px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">
                    <span>Нос</span>
                    <Plane className="h-4 w-4 -rotate-45 text-[var(--air-blue-deep)]" />
                  </div>
                </div>

                {showBusiness && (
                  <div className="mb-8">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="air-pill">
                        <Crown className="h-4 w-4 text-[var(--air-yellow-deep)]" />
                        Business
                      </div>
                    </div>
                    <div className="space-y-1">
                      {layout.businessRows.map((rowNumber) =>
                        renderRow(rowNumber, layout.businessColumns, true, layout.exitRows.includes(rowNumber)),
                      )}
                    </div>
                  </div>
                )}

                {showEconomy && (
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="air-pill">
                        <ShieldCheck className="h-4 w-4 text-[var(--air-emerald)]" />
                        Эконом
                      </div>
                    </div>
                    <div className="space-y-1">
                      {layout.economyRows.map((rowNumber) =>
                        renderRow(rowNumber, layout.columns, false, layout.exitRows.includes(rowNumber)),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="air-dark-card px-5 py-6 md:px-6 xl:sticky xl:top-28">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Тариф</div>
                  <div className="mt-2 text-3xl font-extrabold tracking-[-0.05em]">{fareTitle}</div>
                </div>
                <div className="air-dark-pill">
                  <Info className="h-4 w-4 text-[var(--air-yellow)]" />
                  Место и итог
                </div>
              </div>

              <div className="air-divider my-5" />

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Маршрут</div>
                <div className="mt-2 text-lg font-extrabold">
                  {flight.flightNumber} • {flight.departureAirport.code} → {flight.destinationAirport.code}
                </div>
                <div className="mt-2 text-sm text-white/68">
                  {format(new Date(flight.departureTime), 'd MMMM yyyy, HH:mm', { locale: ru })}
                </div>
              </div>

              <div className="air-divider my-5" />

              <div className="space-y-3">
                {fareBenefits[fare].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3 text-sm font-semibold text-white/88">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[var(--air-yellow)]" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="air-divider my-5" />

              <div className="rounded-[26px] border border-white/10 bg-white/6 p-5">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Выбранное место</div>
                {selectedSeat ? (
                  <>
                    <div className="mt-3 text-4xl font-extrabold tracking-[-0.05em]">{selectedSeat.seatNumber}</div>
                    <div className="mt-2 text-lg font-bold text-[var(--air-yellow)]">{formatPrice(selectedSeat.price)}</div>
                    <div className="mt-2 text-sm leading-relaxed text-white/72">
                      {selectedSeat.class === 'business'
                        ? 'Место в бизнес-салоне с повышенным комфортом.'
                        : 'Место в экономическом салоне выбранного рейса.'}
                    </div>
                  </>
                ) : (
                  <div className="mt-3 text-sm leading-relaxed text-white/72">
                    Выберите место на схеме салона, чтобы увидеть итоговую стоимость и перейти к бронированию.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleBook}
                disabled={!selectedSeat || booking}
                className="air-primary-button mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Переходим к бронированию
                  </>
                ) : isMockSelection || isAuthenticated ? (
                  <>
                    Подтвердить место
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Войти и продолжить
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-4 text-xs leading-relaxed text-white/60">
                После выбора места бронь удерживается 15 минут. Если место уже занято, страница предложит выбрать другой вариант.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
