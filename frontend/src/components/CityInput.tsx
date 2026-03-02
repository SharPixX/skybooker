import { useState, useEffect, useRef } from 'react';
import { searchCities } from '../api';
import { City } from '../types';
import { PlaneTakeoff, PlaneLanding, MapPin } from 'lucide-react';

interface CityInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (city: string) => void;
  type?: 'from' | 'to';
}

export default function CityInput({ label, placeholder, value, onChange, type = 'from' }: CityInputProps) {
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
      } catch (err) {
        console.error('[CityInput] search error:', err);
        setSuggestions([]);
      }
    }, 300);
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

  const Icon = type === 'from' ? PlaneTakeoff : PlaneLanding;

  return (
    <div ref={ref} className="relative flex-1 w-full h-full">
      <div className="group relative flex items-center h-16 w-full px-5 rounded-[1.25rem] bg-[#090C15]/50 hover:bg-[#090C15]/80 border border-white/5 hover:border-white/10 focus-within:!border-sky/50 focus-within:!bg-[#090C15] transition-all duration-300">
        <Icon className="w-5 h-5 text-[#4E5466] group-focus-within:text-sky transition-colors flex-shrink-0" />
        <div className="flex flex-col flex-1 pl-4 h-full justify-center">
          <label className="text-[10px] text-[#4E5466] uppercase tracking-[0.1em] font-bold mb-0.5 group-focus-within:text-sky transition-colors cursor-text select-none text-left">
            {label}
          </label>
          <input
            type="text"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              onChange(e.target.value);
            }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            className="w-full bg-transparent text-white text-base font-medium placeholder:text-[#4E5466] focus:outline-none leading-none pb-0.5"
          />
        </div>
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transform origin-top animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 flex flex-col gap-1">
            {suggestions.map((city) => (
              <button
                key={city.full}
                onClick={() => {
                  setQuery(city.full);
                  onChange(city.full);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-all flex items-center gap-4 group/item"
              >
                <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center group-hover/item:bg-sky/20 transition-colors">
                  <MapPin className="w-4 h-4 text-sky/70 group-hover/item:text-sky" />
                </div>
                <div className="flex flex-col">
                  <span className="text-fg font-medium">{city.name}</span>
                  {city.code && (
                    <span className="text-xs text-sky font-mono mt-0.5">{city.code}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
