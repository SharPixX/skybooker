import { useEffect, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Loader2, MapPin, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { searchCities } from '../api';
import type { City } from '../types';

interface CityInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (city: string) => void;
  type?: 'from' | 'to';
}

export default function CityInput({
  label,
  placeholder,
  value,
  onChange,
  type = 'from',
}: CityInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasResolvedQuery, setHasResolvedQuery] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const normalizedQuery = query.trim();

    if (normalizedQuery.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      setHasResolvedQuery(false);
      return;
    }

    const currentRequestId = requestRef.current + 1;
    requestRef.current = currentRequestId;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      setLoading(true);
      setHasResolvedQuery(false);

      try {
        const cities = await searchCities(normalizedQuery, controller.signal);

        if (requestRef.current !== currentRequestId) {
          return;
        }

        setSuggestions(cities);
        setOpen(true);
        setHasResolvedQuery(true);
      } catch (unknownError) {
        if (requestRef.current !== currentRequestId) {
          return;
        }

        if (isAxiosError(unknownError) && unknownError.code === 'ERR_CANCELED') {
          return;
        }

        if (unknownError instanceof Error && unknownError.name === 'CanceledError') {
          return;
        }

        setSuggestions([]);
        setOpen(true);
        setHasResolvedQuery(true);
      } finally {
        if (requestRef.current === currentRequestId) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const Icon = type === 'from' ? PlaneTakeoff : PlaneLanding;
  const showDropdown = open && query.trim().length >= 2;
  const showEmptyState = showDropdown && !loading && hasResolvedQuery && suggestions.length === 0;

  return (
    <div ref={rootRef} className="air-input-group relative min-w-0">
      <label className="air-input-label">{label}</label>

      <div className="air-field air-input-surface flex min-h-[72px] items-center gap-3 px-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(255,207,63,0.16)] text-[var(--air-ink)]">
          <Icon className="h-5 w-5" />
        </div>

        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            onChange(nextValue);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setOpen(true);
            }
          }}
          className="w-full bg-transparent text-[1rem] font-semibold text-[var(--air-ink)] outline-none placeholder:text-[var(--air-muted)]"
        />

        {loading && <Loader2 className="h-4 w-4 animate-spin text-[var(--air-muted)]" />}
      </div>

      {showDropdown && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-full overflow-hidden rounded-[24px] border border-[var(--air-border-strong)] bg-[rgba(255,255,255,0.98)] shadow-[0_28px_72px_rgba(16,24,38,0.16)]">
          <div className="max-h-72 overflow-y-auto p-2">
            {suggestions.map((city) => (
              <button
                key={city.full}
                type="button"
                onClick={() => {
                  setQuery(city.full);
                  onChange(city.full);
                  setSuggestions([]);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-3 rounded-[18px] px-3 py-3 text-left transition-colors hover:bg-[rgba(16,24,38,0.05)]"
              >
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(79,130,255,0.1)] text-[var(--air-blue-deep)]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-[var(--air-ink)]">
                    {city.name} ({city.code})
                  </div>
                  <div className="truncate text-xs text-[var(--air-muted)]">{city.airportName}</div>
                </div>
              </button>
            ))}

            {loading && (
              <div className="flex items-center gap-3 rounded-[18px] px-3 py-3 text-sm font-semibold text-[var(--air-muted)]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Ищем аэропорты и города...
              </div>
            )}

            {showEmptyState && (
              <div className="rounded-[18px] px-3 py-3 text-sm text-[var(--air-muted)]">
                Ничего не нашли. Попробуйте ввести город, код аэропорта или название терминала точнее.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
