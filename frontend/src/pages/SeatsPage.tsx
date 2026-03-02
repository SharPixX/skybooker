import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getFlightById, bookSeat } from '../api';
import { useAuth } from '../context/AuthContext';
import { Flight, Seat } from '../types';
import { isAxiosError } from 'axios';
import { Plane, ArrowRight, Loader2, AlertCircle, Clock, Info, Shield, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

/* ─── Aircraft Layout Definitions ─── */

interface LayoutConfig {
  businessRows: number[];
  businessLetters: string[];
  economyRows: number[];
  economyLetters: string[];
  exitRows: number[];
  columns: string[][]; // groups separated by aisles
  businessColumns: string[][];
}

const BOEING_737: LayoutConfig = {
  businessRows: [1, 2, 3, 4],
  businessLetters: ['A', 'C', 'D', 'F'],
  economyRows: Array.from({ length: 26 }, (_, i) => i + 5), // 5-30
  economyLetters: ['A', 'B', 'C', 'D', 'E', 'F'],
  exitRows: [1, 12, 25],
  columns: [['A', 'B', 'C'], ['D', 'E', 'F']],
  businessColumns: [['A', 'C'], ['D', 'F']],
};

const BOEING_777: LayoutConfig = {
  businessRows: [1, 2, 3, 4, 5],
  businessLetters: ['A', 'C', 'D', 'G', 'H', 'K'],
  economyRows: Array.from({ length: 40 }, (_, i) => i + 6), // 6-45
  economyLetters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'],
  exitRows: [1, 20, 35],
  columns: [['A', 'B', 'C'], ['D', 'E', 'F', 'G'], ['H', 'J', 'K']],
  businessColumns: [['A', 'C'], ['D', 'G'], ['H', 'K']],
};

function getLayout(aircraftType?: string): LayoutConfig {
  if (aircraftType?.includes('777')) return BOEING_777;
  return BOEING_737;
}

export default function SeatsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [classFilter, setClassFilter] = useState<'all' | 'business' | 'economy'>('all');
  const seatMapRef = useRef<HTMLDivElement>(null);

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
        } catch { /* keep current */ }
      }
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-7 h-7 text-sky animate-spin" />
        <p className="text-sm text-fg-subtle">Загружаем схему самолёта...</p>
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
  const layout = getLayout(flight.aircraftType);
  const is777 = flight.aircraftType?.includes('777');

  // Build seat map: seatNumber -> seat
  const seatMap = new Map<string, Seat>();
  for (const seat of seats) {
    seatMap.set(seat.seatNumber, seat);
  }

  const businessSeats = seats.filter(s => s.class === 'business');
  const economySeats = seats.filter(s => s.class === 'economy');
  const availBusiness = businessSeats.filter(s => s.status === 'AVAILABLE').length;
  const availEconomy = economySeats.filter(s => s.status === 'AVAILABLE').length;

  const businessPrices = businessSeats.filter(s => s.status === 'AVAILABLE').map(s => parseFloat(s.price));
  const economyPrices = economySeats.filter(s => s.status === 'AVAILABLE').map(s => parseFloat(s.price));
  const minBusiness = businessPrices.length > 0 ? Math.min(...businessPrices) : 0;
  const minEconomy = economyPrices.length > 0 ? Math.min(...economyPrices) : 0;

  function getSeatStyle(seat: Seat, isBusiness: boolean) {
    const base = isBusiness ? 'w-11 h-11 rounded-lg' : 'w-8 h-8 rounded-md';
    if (selectedSeat?.id === seat.id) return `${base} bg-neon-blue/30 border-2 border-neon-blue text-neon-blue shadow-lg shadow-neon-blue/20`;
    if (seat.status === 'LOCKED') return `${base} bg-amber-500/15 border border-amber-500/30 text-amber-400/50 cursor-not-allowed`;
    if (seat.status === 'BOOKED') return `${base} bg-dark-700/60 border border-dark-600/50 text-dark-500 cursor-not-allowed`;
    if (isBusiness) return `${base} bg-amber-900/20 border border-amber-500/30 text-amber-200/80 hover:bg-amber-500/25 hover:border-amber-400/50 cursor-pointer`;
    return `${base} bg-dark-600/50 border border-dark-500/50 text-fg-subtle hover:bg-dark-500/60 hover:border-dark-400/50 cursor-pointer`;
  }

  function renderSeatButton(seatNumber: string, isBusiness: boolean) {
    const seat = seatMap.get(seatNumber);
    if (!seat) return <div key={seatNumber} className={isBusiness ? 'w-11 h-11' : 'w-8 h-8'} />;

    return (
      <button
        key={seat.id}
        disabled={seat.status !== 'AVAILABLE'}
        onClick={() => setSelectedSeat(selectedSeat?.id === seat.id ? null : seat)}
        className={`${getSeatStyle(seat, isBusiness)} text-[10px] font-medium flex items-center justify-center transition-all duration-150`}
        title={seat.status === 'AVAILABLE' ? `${seat.seatNumber} · ${parseFloat(seat.price).toLocaleString('ru-RU')} ₽ · ${isBusiness ? 'Бизнес' : 'Эконом'}` : `${seat.seatNumber} — занято`}
      >
        {seat.status === 'BOOKED' ? '×' : seat.status === 'LOCKED' ? '—' : seat.seatNumber.slice(-1)}
      </button>
    );
  }

  function renderRow(rowNum: number, letters: string[][], isBusiness: boolean, isExit: boolean) {
    return (
      <div key={rowNum} className={`flex items-center justify-center gap-0.5 ${isExit ? 'mb-4 relative' : 'mb-0.5'}`}>
        {letters.map((group, gi) => (
          <div key={gi} className="flex gap-0.5">
            {group.map(letter => renderSeatButton(`${rowNum}${letter}`, isBusiness))}
            {gi < letters.length - 1 && (
              <div className={`${isBusiness ? 'w-8' : 'w-6'} flex items-center justify-center`}>
                {gi === 0 && (
                  <span className="text-[9px] text-fg-faint font-mono">{rowNum}</span>
                )}
              </div>
            )}
          </div>
        ))}
        {/* Row number on right for 2-aisle layouts */}
        {letters.length === 2 && (
          <div className="w-6 flex items-center justify-center">
            <span className="text-[9px] text-fg-faint font-mono">{rowNum}</span>
          </div>
        )}
        {isExit && (
          <div className="absolute -bottom-3 left-0 right-0 flex items-center justify-center">
            <span className="text-[8px] text-neon-green/60 tracking-widest uppercase">выход</span>
          </div>
        )}
      </div>
    );
  }

  const showBusiness = classFilter === 'all' || classFilter === 'business';
  const showEconomy = classFilter === 'all' || classFilter === 'economy';

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-sky bg-sky/10 px-2 py-0.5 rounded">{flight.flightNumber}</span>
                <span className="text-[10px] font-mono text-fg-subtle bg-dark-700 px-2 py-0.5 rounded">{flight.aircraftType || 'Boeing 737-800'}</span>
              </div>
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
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-dark-800 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-amber-300/80 uppercase tracking-wide">Бизнес</span>
          </div>
          <div className="text-lg font-bold text-fg">{availBusiness}<span className="text-xs text-fg-subtle font-normal">/{businessSeats.length}</span></div>
          {minBusiness > 0 && <div className="text-[11px] text-fg-subtle">от {minBusiness.toLocaleString('ru-RU')} ₽</div>}
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-sky" />
            <span className="text-[11px] text-fg-subtle uppercase tracking-wide">Эконом</span>
          </div>
          <div className="text-lg font-bold text-fg">{availEconomy}<span className="text-xs text-fg-subtle font-normal">/{economySeats.length}</span></div>
          {minEconomy > 0 && <div className="text-[11px] text-fg-subtle">от {minEconomy.toLocaleString('ru-RU')} ₽</div>}
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="text-[11px] text-fg-subtle uppercase tracking-wide mb-1">Всего мест</div>
          <div className="text-lg font-bold text-fg">{seats.length}</div>
          <div className="text-[11px] text-neon-green">{availBusiness + availEconomy} свободно</div>
        </div>
        <div className="bg-dark-800 border border-dark-600 rounded-lg p-3">
          <div className="text-[11px] text-fg-subtle uppercase tracking-wide mb-1">Рядов</div>
          <div className="text-lg font-bold text-fg">{is777 ? 45 : 30}</div>
          <div className="text-[11px] text-fg-subtle">{is777 ? '3+4+3' : '3+3'} компоновка</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat map */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-fg">Схема салона</h3>

            {/* Class filter */}
            <div className="flex gap-1 bg-dark-800 border border-dark-600 rounded-lg p-0.5">
              {(['all', 'business', 'economy'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setClassFilter(f)}
                  className={`px-3 py-1 text-[11px] rounded-md transition-all ${classFilter === f ? 'bg-dark-600 text-fg' : 'text-fg-subtle hover:text-fg'}`}
                >
                  {f === 'all' ? 'Все' : f === 'business' ? 'Бизнес' : 'Эконом'}
                </button>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-[11px] text-fg-subtle mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-900/20 border border-amber-500/30" />
              <span>Бизнес</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-dark-600/50 border border-dark-500/50" />
              <span>Эконом</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-neon-blue/30 border-2 border-neon-blue" />
              <span>Выбрано</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-dark-700/60 border border-dark-600/50 opacity-50" />
              <span>Занято</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-amber-500/15 border border-amber-500/30" />
              <span>Заблокировано</span>
            </div>
          </div>

          {/* Airplane body */}
          <div ref={seatMapRef} className="bg-dark-800 border border-dark-600 rounded-2xl overflow-hidden">
            {/* Nose */}
            <div className="relative">
              <div className="mx-auto" style={{ width: is777 ? '340px' : '250px' }}>
                <svg viewBox={is777 ? '0 0 340 50' : '0 0 250 50'} className="w-full h-12 text-dark-600">
                  <path
                    d={is777
                      ? 'M170,2 Q340,2 340,50 L0,50 Q0,2 170,2'
                      : 'M125,2 Q250,2 250,50 L0,50 Q0,2 125,2'}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <text x={is777 ? '170' : '125'} y="32" textAnchor="middle" className="fill-fg-subtle" fontSize="10" fontFamily="monospace">
                    {flight.aircraftType || 'Boeing 737-800'}
                  </text>
                </svg>
              </div>
            </div>

            <div className="px-4 pb-4 overflow-x-auto">
              <div className="min-w-fit mx-auto" style={{ width: 'fit-content' }}>
                {/* Business section */}
                {showBusiness && (
                  <>
                    <div className="flex items-center justify-center gap-1 mb-2 mt-2">
                      <Crown className="w-3 h-3 text-amber-400 mr-1" />
                      <span className="text-[10px] text-amber-300/80 uppercase tracking-widest">Бизнес-класс</span>
                    </div>
                    <div className="flex justify-center gap-0.5 mb-2 text-[9px] text-fg-subtle font-mono uppercase">
                      {layout.businessColumns.map((group, gi) => (
                        <div key={gi} className="flex gap-0.5">
                          {group.map(l => (
                            <div key={l} className="w-11 text-center">{l}</div>
                          ))}
                          {gi < layout.businessColumns.length - 1 && <div className="w-8" />}
                        </div>
                      ))}
                      {layout.businessColumns.length === 2 && <div className="w-6" />}
                    </div>

                    {layout.businessRows.map(rowNum =>
                      renderRow(rowNum, layout.businessColumns, true, layout.exitRows.includes(rowNum))
                    )}

                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-dark-600" />
                      <span className="text-[9px] text-fg-faint uppercase tracking-widest">эконом</span>
                      <div className="flex-1 h-px bg-dark-600" />
                    </div>
                  </>
                )}

                {/* Economy section */}
                {showEconomy && (
                  <>
                    {!showBusiness && (
                      <div className="flex items-center justify-center gap-1 mb-2 mt-2">
                        <Shield className="w-3 h-3 text-sky mr-1" />
                        <span className="text-[10px] text-fg-subtle uppercase tracking-widest">Эконом-класс</span>
                      </div>
                    )}
                    <div className="flex justify-center gap-0.5 mb-2 text-[9px] text-fg-subtle font-mono uppercase">
                      {layout.columns.map((group, gi) => (
                        <div key={gi} className="flex gap-0.5">
                          {group.map(l => (
                            <div key={l} className="w-8 text-center">{l}</div>
                          ))}
                          {gi < layout.columns.length - 1 && <div className="w-6" />}
                        </div>
                      ))}
                      {layout.columns.length === 2 && <div className="w-6" />}
                    </div>

                    {layout.economyRows.map(rowNum =>
                      renderRow(rowNum, layout.columns, false, layout.exitRows.includes(rowNum))
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tail */}
            <div className="relative">
              <div className="mx-auto" style={{ width: is777 ? '340px' : '250px' }}>
                <svg viewBox={is777 ? '0 0 340 40' : '0 0 250 40'} className="w-full h-10 text-dark-600">
                  <path
                    d={is777
                      ? 'M0,0 L340,0 Q340,40 170,40 Q0,40 0,0'
                      : 'M0,0 L250,0 Q250,40 125,40 Q0,40 0,0'}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
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
                    <span className="text-fg-muted">Самолёт</span>
                    <span className="text-fg text-xs font-mono">{flight.aircraftType || 'Boeing 737-800'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-muted">Место</span>
                    <span className="text-fg font-mono font-bold text-lg">{selectedSeat.seatNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-fg-muted">Класс</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      selectedSeat.class === 'business'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-sky/10 text-sky'
                    }`}>
                      {selectedSeat.class === 'business' ? 'Бизнес' : 'Эконом'}
                    </span>
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
