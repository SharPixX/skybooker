import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFlightById, bookSeat } from '../api';
import { useAuth } from '../context/AuthContext';
import { Flight, Seat } from '../types';
import { isAxiosError } from 'axios';
import { Plane, ArrowRight, Loader2, AlertCircle, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function SeatsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        const data = await getFlightById(id);
        setFlight(data);
      } catch {
        setError('Не удалось загрузить рейс');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleBook = async () => {
    if (!selectedSeat) return;
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    setBooking(true);
    setError('');
    try {
      const { booking } = await bookSeat(selectedSeat.id);
      navigate(`/booking/${booking.id}`);
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.message
        : 'Место уже занято. Выберите другое.';
      setError(msg || 'Место уже занято. Выберите другое.');
      setSelectedSeat(null);
      if (id) {
        try {
          const data = await getFlightById(id);
          setFlight(data);
        } catch {
          // Seat map will keep current state
        }
      }
    } finally {
      setBooking(false);
    }
  };

  const getSeatClass = (seat: Seat) => {
    if (selectedSeat?.id === seat.id) return 'seat-selected';
    if (seat.status === 'LOCKED') return 'seat-locked';
    if (seat.status === 'BOOKED') return 'seat-booked';
    return 'seat-available';
  };

  const getSeatLabel = (seat: Seat) => {
    if (seat.status === 'LOCKED') return '—';
    if (seat.status === 'BOOKED') return '×';
    return seat.seatNumber.slice(-1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-7 h-7 text-sky animate-spin" />
        <p className="text-sm text-fg-subtle">Загружаем схему мест...</p>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="text-center py-20">
        <p className="text-fg-muted">Рейс не найден</p>
        <Link to="/" className="text-sky text-sm hover:underline mt-2 inline-block">На главную</Link>
      </div>
    );
  }

  const seats = flight.seats ?? [];

  const seatRows: Record<string, Seat[]> = {};
  for (const seat of seats) {
    const row = seat.seatNumber.replace(/[A-F]/g, '');
    if (!seatRows[row]) seatRows[row] = [];
    seatRows[row].push(seat);
  }

  const availableCount = seats.filter(s => s.status === 'AVAILABLE').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-subtle mb-6">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <Link to={`/flights?from=${encodeURIComponent(flight.departureAirport.city)}`} className="hover:text-fg transition-colors">Рейсы</Link>
        <span>/</span>
        <span className="text-fg-muted">{flight.flightNumber}</span>
      </div>

      {/* Flight card */}
      <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-sky/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-sky -rotate-45" />
            </div>
            <div>
              <span className="text-xs font-mono text-sky bg-sky/10 px-2 py-0.5 rounded">{flight.flightNumber}</span>
              <div className="flex items-center gap-2 text-fg mt-1">
                <span className="font-medium">{flight.departureAirport.city} ({flight.departureAirport.code})</span>
                <ArrowRight className="w-3.5 h-3.5 text-fg-subtle" />
                <span className="font-medium">{flight.destinationAirport.city} ({flight.destinationAirport.code})</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-fg-muted">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(new Date(flight.departureTime), 'd MMMM yyyy, HH:mm', { locale: ru })}</span>
            </div>
            <span className="text-neon-green text-xs">{availableCount} мест свободно</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat map */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-fg">Выберите место</h3>

            {/* Legend */}
            <div className="flex gap-3 text-[11px] text-fg-subtle">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-dark-600 border border-dark-500" />
                <span>Свободно</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-neon-blue/25 border-2 border-neon-blue" />
                <span>Выбрано</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-dark-700 border border-dark-600 opacity-50" />
                <span>Занято</span>
              </div>
            </div>
          </div>

          {/* Airplane */}
          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 overflow-x-auto overflow-y-hidden">
            <div className="min-w-fit mx-auto">
              {/* Column headers */}
              <div className="flex justify-center gap-1 mb-3 text-[10px] text-fg-subtle font-mono uppercase">
              {['A', 'B', 'C', '', 'D', 'E', 'F'].map((letter, i) => (
                <div key={i} className={`flex items-center justify-center ${letter === '' ? 'w-7' : 'w-10 h-5'}`}>
                  {letter}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Object.entries(seatRows).map(([rowNum, seats]) => (
              <div key={rowNum} className="flex justify-center gap-1 mb-1.5 items-center">
                {seats.slice(0, 3).map((seat) => (
                  <button
                    key={seat.id}
                    disabled={seat.status !== 'AVAILABLE'}
                    onClick={() => setSelectedSeat(selectedSeat?.id === seat.id ? null : seat)}
                    className={`w-10 h-10 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${getSeatClass(seat)}`}
                    title={seat.status === 'AVAILABLE' ? `${seat.seatNumber} · ${parseFloat(seat.price).toLocaleString('ru-RU')} ₽` : seat.seatNumber}
                  >
                    {getSeatLabel(seat)}
                  </button>
                ))}
                <div className="w-7 flex items-center justify-center text-[10px] text-fg-faint font-mono">
                  {rowNum}
                </div>
                {seats.slice(3).map((seat) => (
                  <button
                    key={seat.id}
                    disabled={seat.status !== 'AVAILABLE'}
                    onClick={() => setSelectedSeat(selectedSeat?.id === seat.id ? null : seat)}
                    className={`w-10 h-10 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${getSeatClass(seat)}`}
                    title={seat.status === 'AVAILABLE' ? `${seat.seatNumber} · ${parseFloat(seat.price).toLocaleString('ru-RU')} ₽` : seat.seatNumber}
                  >
                    {getSeatLabel(seat)}
                  </button>
                ))}
              </div>
            ))}
            </div>
          </div>
        </div>

        {/* Booking panel */}
        <div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5 sticky top-20">
            <h3 className="text-base font-semibold text-fg mb-4">Ваш выбор</h3>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-neon-red/10 border border-neon-red/20 rounded-lg text-neon-red text-sm mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {selectedSeat ? (
              <div className="space-y-3">
                <div className="bg-dark-700 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-muted">Рейс</span>
                    <span className="text-fg font-mono">{flight.flightNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-muted">Маршрут</span>
                    <span className="text-fg text-xs">{flight.departureAirport.city} → {flight.destinationAirport.city}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-muted">Место</span>
                    <span className="text-fg font-mono font-bold text-lg">{selectedSeat.seatNumber}</span>
                  </div>
                </div>

                <div className="border-t border-dark-600 pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-fg-muted">К оплате</span>
                    <span className="text-2xl font-bold text-fg">
                      {parseFloat(selectedSeat.price).toLocaleString('ru-RU')}
                      <span className="text-sm text-fg-muted ml-1">₽</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="w-full py-3 bg-neon-blue text-white font-semibold rounded-lg hover:bg-neon-blue/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Бронируем...
                    </>
                  ) : (
                    'Забронировать'
                  )}
                </button>

                <div className="flex items-start gap-1.5 text-[11px] text-fg-subtle">
                  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>Место будет зарезервировано на 15 минут. Оплата спишется автоматически.</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-fg-subtle">
                <div className="w-12 h-12 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-3">
                  <Plane className="w-5 h-5 text-fg-faint -rotate-45" />
                </div>
                <p className="text-sm">Выберите место на схеме</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
