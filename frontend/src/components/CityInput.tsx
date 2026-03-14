import { useEffect, useRef, useState } from 'react';
import { MapPin, PlaneLanding, PlaneTakeoff } from 'lucide-react';
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
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        setSuggestions(cities);
        setOpen(cities.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 220);

    return () => window.clearTimeout(timer);
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

  return (
    <div ref={rootRef} className="relative min-w-0">
      <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">
        {label}
      </label>

      <div className="air-field flex min-h-[72px] items-center gap-3 px-4">
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
            if (suggestions.length > 0) {
              setOpen(true);
            }
          }}
          className="w-full bg-transparent text-[1rem] font-semibold text-[var(--air-ink)] outline-none placeholder:text-[var(--air-muted)]"
        />
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-[calc(100%+10px)] z-50 w-full overflow-hidden rounded-[24px] border border-[var(--air-border-strong)] bg-[rgba(255,255,255,0.98)] shadow-[0_28px_72px_rgba(16,24,38,0.16)]">
          <div className="max-h-72 overflow-y-auto p-2">
            {suggestions.map((city) => (
              <button
                key={city.full}
                type="button"
                onClick={() => {
                  setQuery(city.full);
                  onChange(city.full);
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
          </div>
        </div>
      )}
    </div>
  );
}
