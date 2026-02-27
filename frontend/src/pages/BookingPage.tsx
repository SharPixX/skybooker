import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBooking, cancelBooking } from '../api';
import { Booking } from '../types';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plane,
  Download,
  Copy,
} from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const STATUS_CONFIG: Record<string, { icon: typeof Clock; label: string; sublabel: string; color: string; bg: string }> = {
  PENDING: {
    icon: Clock,
    label: 'Ожидание оплаты',
    sublabel: 'Идёт обработка платежа...',
    color: 'text-neon-orange',
    bg: 'bg-neon-orange/8 border-neon-orange/20',
  },
  CONFIRMED: {
    icon: CheckCircle2,
    label: 'Билет оформлен',
    sublabel: 'Оплата прошла успешно',
    color: 'text-neon-green',
    bg: 'bg-neon-green/8 border-neon-green/20',
  },
  CANCELLED: {
    icon: XCircle,
    label: 'Бронирование отменено',
    sublabel: 'Место освобождено',
    color: 'text-fg-muted',
    bg: 'bg-slate-500/8 border-slate-500/20',
  },
  FAILED: {
    icon: AlertTriangle,
    label: 'Ошибка оплаты',
    sublabel: 'Не удалось списать средства',
    color: 'text-neon-red',
    bg: 'bg-neon-red/8 border-neon-red/20',
  },
};

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [progressPct, setProgressPct] = useState(100);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getBooking(id);
        setBooking(data);
      } catch {
        setError('Бронирование не найдено');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Poll when PENDING
  useEffect(() => {
    if (booking?.status !== 'PENDING') return;
    intervalRef.current = setInterval(async () => {
      if (!id) return;
      try {
        const data = await getBooking(id);
        setBooking(data);
        if (data.status !== 'PENDING') clearInterval(intervalRef.current!);
      } catch { /* ignore */ }
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [booking?.status, id]);

  // Countdown
  useEffect(() => {
    if (!booking || booking.status !== 'PENDING') { setTimeLeft(''); setProgressPct(0); return; }
    const createdMs = new Date(booking.createdAt).getTime();
    const expiresMs = new Date(booking.expiresAt).getTime();
    const totalMs = expiresMs - createdMs;
    const update = () => {
      const diff = expiresMs - Date.now();
      if (diff <= 0) { setTimeLeft('0:00'); setProgressPct(0); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
      setProgressPct(Math.max(0, Math.min(100, (diff / totalMs) * 100)));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [booking?.status, booking?.expiresAt]);

  const handleCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      setBooking(await cancelBooking(id));
    } catch {
      setError('Не удалось отменить');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyId = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-7 h-7 text-sky animate-spin" />
        <p className="text-sm text-fg-subtle">Загружаем бронирование...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <XCircle className="w-10 h-10 text-neon-red mx-auto mb-3" />
        <p className="text-fg-muted mb-3">{error || 'Бронирование не найдено'}</p>
        <Link to="/" className="text-sky text-sm hover:underline">← На главную</Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;
  const seat = booking.seat;
  const flight = seat?.flight;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-subtle mb-6">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg-muted">Бронирование</span>
      </div>

      {/* Status card */}
      <div className={`border rounded-xl p-5 mb-6 ${config.bg}`}>
        <div className="flex items-start gap-3">
          <StatusIcon className={`w-6 h-6 mt-0.5 ${config.color}`} />
          <div className="flex-1">
            <h2 className={`text-lg font-bold ${config.color}`}>{config.label}</h2>
            <p className={`text-sm mt-0.5 ${config.color} opacity-70`}>{config.sublabel}</p>

            {booking.status === 'PENDING' && timeLeft && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex-1 bg-dark-900/40 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-neon-orange/60 rounded-full transition-all duration-1000 ease-linear" 
                    style={{ width: `${progressPct}%` }} 
                  />
                </div>
                <span className="text-xs font-mono text-neon-orange">{timeLeft}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ticket-style details */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
        {/* Flight details */}
        {flight && (
          <div className="p-5 border-b border-dark-600">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="w-4 h-4 text-sky -rotate-45" />
              <span className="font-mono text-sky text-sm">{flight.flightNumber}</span>
              <span className="text-xs text-fg-subtle">·</span>
              <span className="text-xs text-fg-subtle">
                {format(new Date(flight.departureTime), 'd MMMM yyyy', { locale: ru })}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex-1">
                <p className="text-[10px] text-fg-subtle uppercase mb-0.5">Вылет</p>
                <p className="text-fg font-medium">{flight.departureAirport.city}</p>
                <p className="text-xs text-fg-subtle">{flight.departureAirport.code} · {format(new Date(flight.departureTime), 'HH:mm')}</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ArrowRight className="w-4 h-4 text-fg-faint" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-[10px] text-fg-subtle uppercase mb-0.5">Прибытие</p>
                <p className="text-fg font-medium">{flight.destinationAirport.city}</p>
              </div>
            </div>
          </div>
        )}

        {/* Seat & price */}
        <div className="p-5 border-b border-dark-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-fg-subtle uppercase mb-0.5">Место</p>
              <p className="text-fg font-mono text-xl font-bold">{seat.seatNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-fg-subtle uppercase mb-0.5">Стоимость</p>
              <p className="text-fg text-xl font-bold">
                {parseFloat(seat.price).toLocaleString('ru-RU')}
                <span className="text-sm text-fg-muted ml-1">₽</span>
              </p>
            </div>
          </div>
        </div>

        {/* Booking info */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-fg-subtle">
            <div className="flex items-center gap-1.5">
              <span>Номер: {booking.id.slice(0, 8).toUpperCase()}</span>
              <button onClick={handleCopyId} className="text-fg-faint hover:text-fg-muted transition-colors" title="Скопировать">
                <Copy className="w-3 h-3" />
              </button>
              {copied && <span className="text-neon-green text-[10px]">Скопировано</span>}
            </div>
            <span>{format(new Date(booking.createdAt), 'dd.MM.yyyy HH:mm')}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 flex gap-3">
        {booking.status === 'PENDING' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 py-2.5 border border-dark-600 text-fg-muted rounded-lg hover:border-neon-red/30 hover:text-neon-red transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Отменить'}
          </button>
        )}

        {booking.status === 'CONFIRMED' && (
          <button className="flex-1 py-2.5 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/90 transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <Download className="w-4 h-4" />
            Скачать билет
          </button>
        )}

        <Link
          to="/"
          className="flex-1 py-2.5 bg-dark-700 text-fg-secondary rounded-lg hover:bg-dark-600 transition-all text-center text-sm"
        >
          Найти ещё рейсы
        </Link>

        {(booking.status === 'CANCELLED' || booking.status === 'FAILED') && flight && (
          <Link
            to={`/flights/${flight.id}/seats`}
            className="flex-1 py-2.5 bg-neon-blue text-white font-medium rounded-lg hover:bg-neon-blue/90 transition-all text-center text-sm"
          >
            Забронировать снова
          </Link>
        )}
      </div>
    </div>
  );
}
