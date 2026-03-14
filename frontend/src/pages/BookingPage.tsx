import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle2, Clock3, Copy, Loader2, ShieldCheck, Ticket, XCircle } from 'lucide-react';
import { cancelBooking, confirmBooking, getBooking } from '../api';
import { getMockBookingById, updateMockBookingStatus } from '../mockData';
import { saveRecentBooking } from '../recentBookings';
import type { Booking } from '../types';

const statusConfig = {
  PENDING: {
    title: 'Ожидаем подтверждение оплаты',
    subtitle: 'Место удерживается за вами. Завершите оплату, пока таймер активен.',
    icon: Clock3,
    tone: 'warning',
  },
  CONFIRMED: {
    title: 'Билет оформлен',
    subtitle: 'Маршрут подтвержден. Детали поездки доступны в кабинете пассажира.',
    icon: CheckCircle2,
    tone: 'success',
  },
  CANCELLED: {
    title: 'Бронирование отменено',
    subtitle: 'Место вернулось в продажу. При необходимости маршрут можно выбрать заново.',
    icon: XCircle,
    tone: 'neutral',
  },
  FAILED: {
    title: 'Не удалось завершить оплату',
    subtitle: 'Проверьте статус оплаты и попробуйте выбрать другой рейс.',
    icon: XCircle,
    tone: 'danger',
  },
} as const;

function getStatusClasses(tone: 'warning' | 'success' | 'neutral' | 'danger') {
  if (tone === 'success') {
    return 'border-[rgba(20,133,111,0.18)] bg-[rgba(20,133,111,0.08)] text-[var(--air-emerald)]';
  }

  if (tone === 'warning') {
    return 'border-[rgba(242,179,0,0.22)] bg-[rgba(255,213,79,0.16)] text-[var(--air-ink)]';
  }

  if (tone === 'danger') {
    return 'border-[rgba(213,78,78,0.2)] bg-[rgba(213,78,78,0.08)] text-[var(--air-danger)]';
  }

  return 'border-[rgba(17,24,39,0.12)] bg-[rgba(17,24,39,0.04)] text-[var(--air-muted-strong)]';
}

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(100);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function loadBooking() {
      if (!id) {
        return;
      }

      try {
        const data = await getBooking(id);
        setBooking(data);
      } catch {
        const mockBooking = getMockBookingById(id);
        if (mockBooking) {
          setBooking(mockBooking);
        } else {
          setError('Бронирование не найдено.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadBooking();
  }, [id]);

  useEffect(() => {
    if (booking) {
      saveRecentBooking(booking);
    }
  }, [booking]);

  useEffect(() => {
    if (booking?.status !== 'PENDING' || !id) {
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const data = await getBooking(id);
        setBooking(data);
        if (data.status !== 'PENDING' && pollRef.current) {
          clearInterval(pollRef.current);
        }
      } catch {
        // Ignore intermittent polling errors.
      }
    }, 3000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [booking?.status, id]);

  useEffect(() => {
    if (!booking || booking.status !== 'PENDING') {
      setTimeLeft('');
      setProgress(0);
      return;
    }

    const createdAt = new Date(booking.createdAt).getTime();
    const expiresAt = new Date(booking.expiresAt).getTime();
    const total = expiresAt - createdAt;

    const updateCountdown = () => {
      const diff = expiresAt - Date.now();

      if (diff <= 0) {
        setTimeLeft('0:00');
        setProgress(0);
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      setProgress(Math.max(0, Math.min(100, (diff / total) * 100)));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [booking]);

  const handleCancel = async () => {
    if (!id) {
      return;
    }

    setCancelling(true);

    try {
      if (booking?.id.startsWith('demo-')) {
        const updatedBooking = updateMockBookingStatus(booking.id, 'CANCELLED');
        if (updatedBooking) {
          setBooking(updatedBooking);
        }
        return;
      }

      const data = await cancelBooking(id);
      setBooking(data);
    } catch {
      setError('Не удалось отменить бронирование.');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirm = async () => {
    if (!id || !booking) {
      return;
    }

    setConfirming(true);
    setError('');

    try {
      if (booking.id.startsWith('demo-')) {
        const updatedBooking = updateMockBookingStatus(booking.id, 'CONFIRMED');
        if (updatedBooking) {
          setBooking(updatedBooking);
        }
        return;
      }

      const data = await confirmBooking(id);
      setBooking(data);
    } catch {
      setError('Не удалось подтвердить бронирование.');
    } finally {
      setConfirming(false);
    }
  };

  const handleCopy = async () => {
    if (!booking) {
      return;
    }

    await navigator.clipboard.writeText(booking.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="air-page">
        <div className="air-container">
          <div className="air-surface-card flex items-center justify-center gap-3 px-5 py-16 text-[var(--air-muted)]">
            <Loader2 className="h-5 w-5 animate-spin" />
            Загружаем статус бронирования...
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="air-page">
        <div className="air-container">
          <div className="air-surface-card px-6 py-12 text-center">
            <div className="text-2xl font-extrabold text-[var(--air-ink)]">Бронирование не найдено</div>
            <div className="mt-3 text-sm leading-relaxed text-[var(--air-muted)]">
              {error || 'Проверьте номер брони или начните поиск маршрута заново.'}
            </div>
            <Link to="/#search" className="air-secondary-button mt-6">
              Вернуться к поиску
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const config = statusConfig[booking.status];
  const StatusIcon = config.icon;
  const flight = booking.seat.flight;

  return (
    <div className="air-page">
      <div className="air-container">
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--air-muted)]">
          <Link to="/" className="font-semibold text-[var(--air-ink)]">
            Главная
          </Link>
          <span>/</span>
          <span>Бронирование</span>
        </div>

        <section className={`rounded-[30px] border px-5 py-6 md:px-8 md:py-8 ${getStatusClasses(config.tone)}`}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60">
                <StatusIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] opacity-70">Статус бронирования</div>
                <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.05em] md:text-4xl">{config.title}</h1>
                <div className="mt-2 max-w-2xl text-sm leading-relaxed opacity-80 md:text-base">{config.subtitle}</div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/30 bg-white/50 px-5 py-4">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] opacity-70">Номер брони</div>
              <div className="mt-2 flex items-center gap-3">
                <div className="text-lg font-extrabold">{booking.id.slice(0, 8).toUpperCase()}</div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 transition-colors hover:bg-white/60"
                  title="Скопировать номер брони"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              {copied && <div className="mt-2 text-xs font-bold">Скопировано</div>}
            </div>
          </div>

          {booking.status === 'PENDING' && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm font-bold">
                <span>Время удержания места</span>
                <span>{timeLeft}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/40">
                <div className="h-full rounded-full bg-[var(--air-yellow)] transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </section>

        {error && (
          <section className="mt-5 rounded-[24px] border border-[rgba(213,78,78,0.22)] bg-[rgba(213,78,78,0.08)] px-5 py-4 text-sm font-semibold text-[var(--air-danger)]">
            {error}
          </section>
        )}

        <section className="mt-6 grid gap-5 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="air-surface-card-strong px-5 py-6 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(79,130,255,0.08)] text-[var(--air-blue-deep)]">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <div className="air-quiet-label">Маршрут</div>
                <div className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">
                  {flight.departureAirport.city} → {flight.destinationAirport.city}
                </div>
              </div>
            </div>

            <div className="air-divider my-6" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="air-data-card">
                <div className="air-quiet-label">Вылет</div>
                <strong>{format(new Date(flight.departureTime), 'HH:mm')}</strong>
                <div className="mt-2 text-sm font-bold text-[var(--air-ink)]">
                  {flight.departureAirport.city} ({flight.departureAirport.code})
                </div>
                <div className="mt-1 text-sm text-[var(--air-muted)]">
                  {format(new Date(flight.departureTime), 'd MMMM yyyy', { locale: ru })}
                </div>
              </div>

              <div className="air-data-card">
                <div className="air-quiet-label">Прилет</div>
                <strong>{flight.arrivalTime ? format(new Date(flight.arrivalTime), 'HH:mm') : '—'}</strong>
                <div className="mt-2 text-sm font-bold text-[var(--air-ink)]">
                  {flight.destinationAirport.city} ({flight.destinationAirport.code})
                </div>
                <div className="mt-1 text-sm text-[var(--air-muted)]">
                  {flight.arrivalTime ? format(new Date(flight.arrivalTime), 'd MMMM yyyy', { locale: ru }) : 'Время уточняется'}
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="air-data-card">
                <div className="air-quiet-label">Рейс</div>
                <strong>{flight.flightNumber}</strong>
              </div>
              <div className="air-data-card">
                <div className="air-quiet-label">Место</div>
                <strong>{booking.seat.seatNumber}</strong>
              </div>
              <div className="air-data-card">
                <div className="air-quiet-label">Стоимость</div>
                <strong>{parseFloat(booking.seat.price).toLocaleString('ru-RU')} ₽</strong>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="air-dark-card px-5 py-6 md:px-6">
              <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
                Следующие шаги
              </div>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/72 md:text-base">
                <p>Подтвердите бронь, чтобы закрепить место и сохранить маршрут в кабинете пассажира.</p>
                <p>Если статус уже изменился, маршрут и дальнейшие действия будут доступны в кабинете.</p>
              </div>

              <div className="mt-6 grid gap-3">
                {booking.status === 'PENDING' && (
                  <button type="button" onClick={handleConfirm} disabled={confirming} className="air-primary-button justify-center">
                    {confirming ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Подтверждаем бронь
                      </>
                    ) : (
                      'Подтвердить бронирование'
                    )}
                  </button>
                )}

                <Link to="/profile" className="air-tertiary-button justify-center">
                  Открыть кабинет пассажира
                </Link>
                <Link to="/help" className="air-tertiary-button justify-center">
                  Нужна помощь по бронированию
                </Link>
              </div>
            </div>

            <div className="air-surface-card px-5 py-6 md:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(20,133,111,0.12)] text-[var(--air-emerald)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-extrabold text-[var(--air-ink)]">Контроль статуса</div>
                  <div className="mt-1 text-sm text-[var(--air-muted)]">
                    Бронирование обновляется автоматически, пока оплата находится в процессе.
                  </div>
                </div>
              </div>

              {booking.status === 'PENDING' && (
                <div className="mt-5 grid gap-3">
                  <button type="button" onClick={handleCancel} disabled={cancelling} className="air-secondary-button w-full justify-center">
                    {cancelling ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Отменяем бронь
                      </>
                    ) : (
                      'Отменить бронирование'
                    )}
                  </button>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
