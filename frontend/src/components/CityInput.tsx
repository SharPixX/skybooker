import { useState, useEffect, useRef } from 'react';
import { searchCities } from '../api';
import { City } from '../types';
import { MapPin } from 'lucide-react';

interface CityInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (city: string) => void;
}

export default function CityInput({ label, placeholder, value, onChange }: CityInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        setSuggestions(cities);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex-1">
      <label className="block text-xs text-fg-subtle mb-1 uppercase tracking-wider">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-fg placeholder:text-fg-faint focus:outline-none focus:border-sky focus:ring-1 focus:ring-sky/30 transition-all"
        />
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-dark-700 border border-dark-500 rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((city) => (
            <button
              key={city.full}
              onClick={() => {
                setQuery(city.full);
                onChange(city.full);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-dark-600 transition-colors flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-sky flex-shrink-0" />
              <div>
                <span className="text-fg">{city.name}</span>
                {city.code && (
                  <span className="ml-2 text-xs text-sky font-mono">{city.code}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
