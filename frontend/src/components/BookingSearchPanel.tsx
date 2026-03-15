import { startTransition, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Search, ShieldCheck } from 'lucide-react';
import CityInput from './CityInput';
import { DatePicker } from './DatePicker';

interface BookingSearchPanelProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialReturnDate?: string;
  initialTripType?: 'oneway' | 'roundtrip';
  initialPassengers?: number;
  initialCabin?: 'economy' | 'comfort' | 'business';
  variant?: 'hero' | 'compact';
  title?: string;
  description?: string;
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="air-input-group block min-w-0">
      <div className="air-input-label">{label}</div>
      <div className="air-field air-input-surface flex min-h-[72px] items-center px-4">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-bold text-[var(--air-ink)] outline-none"
        >
          {children}
        </select>
      </div>
    </label>
  );
}

export default function BookingSearchPanel({
  initialFrom = '',
  initialTo = '',
  initialDate = '',
  initialReturnDate = '',
  initialTripType = 'oneway',
  initialPassengers = 1,
  initialCabin = 'economy',
  variant = 'hero',
  title,
  description,
}: BookingSearchPanelProps) {
  const navigate = useNavigate();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate);
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>(initialTripType);
  const [passengers, setPassengers] = useState(initialPassengers);
  const [cabin, setCabin] = useState<'economy' | 'comfort' | 'business'>(initialCabin);

  useEffect(() => setFrom(initialFrom), [initialFrom]);
  useEffect(() => setTo(initialTo), [initialTo]);
  useEffect(() => setDate(initialDate), [initialDate]);
  useEffect(() => setReturnDate(initialReturnDate), [initialReturnDate]);
  useEffect(() => setTripType(initialTripType), [initialTripType]);
  useEffect(() => setPassengers(initialPassengers), [initialPassengers]);
  useEffect(() => setCabin(initialCabin), [initialCabin]);

  const isCompact = variant === 'compact';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (from.trim()) {
      params.set('from', from.trim());
    }

    if (to.trim()) {
      params.set('to', to.trim());
    }

    if (date.trim()) {
      params.set('date', date.trim());
    }

    if (tripType === 'roundtrip' && returnDate.trim()) {
      params.set('returnDate', returnDate.trim());
    }

    params.set('trip', tripType);
    params.set('passengers', String(passengers));
    params.set('cabin', cabin);

    startTransition(() => {
      navigate(`/flights?${params.toString()}`);
    });
  };

  if (!isCompact) {
    return (
      <form onSubmit={handleSubmit} className="air-search-panel-hero w-full p-4 md:p-5">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="air-search-toggle">
              <button
                type="button"
                onClick={() => setTripType('oneway')}
                data-active={tripType === 'oneway'}
                className="air-search-toggle-button"
              >
                В одну сторону
              </button>
              <button
                type="button"
                onClick={() => setTripType('roundtrip')}
                data-active={tripType === 'roundtrip'}
                className="air-search-toggle-button"
              >
                Туда и обратно
              </button>
            </div>

            <div className="air-search-assurance">
              <ShieldCheck className="h-4 w-4 text-[var(--air-emerald)]" />
              Прозрачные тарифы и правила до оплаты
            </div>
          </div>

          <div
            className={[
              'air-search-bar grid gap-3 xl:items-end',
              tripType === 'roundtrip'
                ? 'xl:grid-cols-[minmax(0,1.46fr)_56px_minmax(0,1.46fr)_minmax(0,1.18fr)_minmax(0,1.18fr)_minmax(0,0.92fr)_minmax(0,0.92fr)_188px]'
                : 'xl:grid-cols-[minmax(0,1.52fr)_56px_minmax(0,1.52fr)_minmax(0,1.24fr)_minmax(0,0.94fr)_minmax(0,0.94fr)_188px]',
            ].join(' ')}
          >
            <CityInput
              label="Откуда"
              placeholder="Москва (SVO)"
              value={from}
              onChange={setFrom}
              type="from"
            />

            <div className="flex min-w-0 flex-col justify-end">
              <div aria-hidden="true" className="hidden h-[34px] xl:block" />
              <button
                type="button"
                onClick={() => {
                  const currentFrom = from;
                  setFrom(to);
                  setTo(currentFrom);
                }}
                className="air-search-swap"
                aria-label="Поменять местами направления"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            <CityInput
              label="Куда"
              placeholder="Сочи (AER)"
              value={to}
              onChange={setTo}
              type="to"
            />

            <DatePicker value={date} onChange={setDate} label="Дата вылета" panelTitle="Дата вылета" />

            {tripType === 'roundtrip' && (
              <DatePicker
                value={returnDate}
                onChange={setReturnDate}
                label="Дата обратно"
                panelTitle="Дата обратно"
                minDate={date || undefined}
              />
            )}

            <SelectField label="Пассажиры" value={String(passengers)} onChange={(next) => setPassengers(Number(next))}>
              {[1, 2, 3, 4, 5, 6].map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? 'пассажир' : count < 5 ? 'пассажира' : 'пассажиров'}
                </option>
              ))}
            </SelectField>

            <SelectField
              label="Класс"
              value={cabin}
              onChange={(next) => setCabin(next as 'economy' | 'comfort' | 'business')}
            >
              <option value="economy">Эконом</option>
              <option value="comfort">Комфорт</option>
              <option value="business">Бизнес</option>
            </SelectField>

            <div className="flex min-w-0 flex-col justify-end">
              <div aria-hidden="true" className="hidden h-[34px] xl:block" />
              <button type="submit" className="air-primary-button air-search-submit w-full min-w-[180px] px-6">
                <Search className="h-4 w-4" />
                Найти рейсы
              </button>
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="air-surface-card w-full px-5 py-5 md:px-6">
      {(title || description) && (
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            {title && <div className="text-2xl font-extrabold text-[var(--air-ink)]">{title}</div>}
            {description && (
              <div className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--air-muted)]">
                {description}
              </div>
            )}
          </div>

          <div className="air-pill">
            <ShieldCheck className="h-4 w-4 text-[var(--air-emerald)]" />
            Прозрачные тарифы и правила до оплаты
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-fit rounded-full border border-[var(--air-border)] bg-[rgba(255,255,255,0.72)] p-1">
          <button
            type="button"
            onClick={() => setTripType('oneway')}
            className={[
              'rounded-full px-4 py-2 text-sm font-extrabold transition-colors',
              tripType === 'oneway' ? 'bg-[var(--air-panel)] text-white' : 'text-[var(--air-muted-strong)]',
            ].join(' ')}
          >
            В одну сторону
          </button>
          <button
            type="button"
            onClick={() => setTripType('roundtrip')}
            className={[
              'rounded-full px-4 py-2 text-sm font-extrabold transition-colors',
              tripType === 'roundtrip' ? 'bg-[var(--air-panel)] text-white' : 'text-[var(--air-muted-strong)]',
            ].join(' ')}
          >
            Туда и обратно
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <SelectField label="Пассажиры" value={String(passengers)} onChange={(next) => setPassengers(Number(next))}>
            {[1, 2, 3, 4, 5, 6].map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'пассажир' : count < 5 ? 'пассажира' : 'пассажиров'}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Класс"
            value={cabin}
            onChange={(next) => setCabin(next as 'economy' | 'comfort' | 'business')}
          >
            <option value="economy">Эконом</option>
            <option value="comfort">Комфорт</option>
            <option value="business">Бизнес</option>
          </SelectField>
        </div>
      </div>

      <div
        className={[
          'grid gap-4',
          tripType === 'roundtrip'
            ? 'lg:grid-cols-[1.1fr_auto_1.1fr_0.9fr_0.9fr_auto]'
            : 'lg:grid-cols-[1.1fr_auto_1.1fr_0.9fr_auto]',
        ].join(' ')}
      >
        <CityInput
          label="Откуда"
          placeholder="Москва (SVO)"
          value={from}
          onChange={setFrom}
          type="from"
        />

        <div className="flex items-end justify-center pb-1">
          <button
            type="button"
            onClick={() => {
              const currentFrom = from;
              setFrom(to);
              setTo(currentFrom);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--air-border)] bg-[rgba(255,255,255,0.76)] text-[var(--air-ink)] transition-colors hover:bg-white"
            aria-label="Поменять местами направления"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>

        <CityInput
          label="Куда"
          placeholder="Сочи (AER)"
          value={to}
          onChange={setTo}
          type="to"
        />

        <DatePicker value={date} onChange={setDate} label="Дата вылета" panelTitle="Дата вылета" />

        {tripType === 'roundtrip' && (
          <DatePicker
            value={returnDate}
            onChange={setReturnDate}
            label="Дата обратно"
            panelTitle="Дата обратно"
            minDate={date || undefined}
          />
        )}

        <div className="flex items-end">
          <button type="submit" className="air-primary-button h-[72px] w-full px-6">
            <Search className="h-4 w-4" />
            Найти рейсы
          </button>
        </div>
      </div>
    </form>
  );
}
