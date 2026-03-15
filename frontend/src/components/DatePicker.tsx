import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  panelTitle?: string;
  minDate?: string;
}

export function DatePicker({
  value,
  onChange,
  label = 'Дата вылета',
  panelTitle = 'Дата вылета',
  minDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(640, window.innerWidth - 32);
    let left = rect.left;

    if (left + width > window.innerWidth - 16) {
      left = window.innerWidth - 16 - width;
    }

    if (left < 16) {
      left = 16;
    }

    setPosition({
      top: rect.bottom + 10 + window.scrollY,
      left,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updatePosition();

    const onWindowChange = () => updatePosition();
    window.addEventListener('scroll', onWindowChange, true);
    window.addEventListener('resize', onWindowChange);

    return () => {
      window.removeEventListener('scroll', onWindowChange, true);
      window.removeEventListener('resize', onWindowChange);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!value) {
      return;
    }

    setCurrentMonth(new Date(value));
  }, [value]);

  const renderMonth = (month: Date) => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const today = new Date(new Date().setHours(0, 0, 0, 0));

    return (
      <div className="min-w-0 flex-1">
        <div className="mb-3 text-center text-sm font-extrabold capitalize text-[var(--air-ink)]">
          {format(month, 'LLLL yyyy', { locale: ru })}
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--air-muted)]"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, month);
            const isSelected = value ? isSameDay(day, new Date(value)) : false;
            const isPast = day < today;
            const minAllowedDate = minDate ? new Date(minDate) : today;
            minAllowedDate.setHours(0, 0, 0, 0);
            const isBeforeMinDate = day < minAllowedDate;
            const isDisabled = !isCurrentMonth || isPast || isBeforeMinDate;

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  onChange(format(day, 'yyyy-MM-dd'));
                  setIsOpen(false);
                }}
                className={[
                  'flex h-10 items-center justify-center rounded-2xl text-sm font-bold transition-colors',
                  !isCurrentMonth ? 'invisible' : '',
                  isDisabled ? 'cursor-not-allowed text-[var(--air-muted)]/40' : 'text-[var(--air-ink)] hover:bg-[rgba(16,24,38,0.06)]',
                  isSelected ? 'bg-[var(--air-yellow)] text-[var(--air-ink)] hover:bg-[var(--air-yellow)]' : '',
                ].join(' ')}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const popup = isOpen
    ? createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'absolute',
            top: position.top,
            left: position.left,
            zIndex: 9999,
          }}
          className="w-[min(640px,calc(100vw-32px))] rounded-[28px] border border-[var(--air-border-strong)] bg-[rgba(255,255,255,0.98)] p-5 shadow-[0_28px_72px_rgba(16,24,38,0.16)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--air-border)] text-[var(--air-ink)] transition-colors hover:bg-[rgba(16,24,38,0.05)]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">
              {panelTitle}
            </div>

            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--air-border)] text-[var(--air-ink)] transition-colors hover:bg-[rgba(16,24,38,0.05)]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row">
            {renderMonth(currentMonth)}
            <div className="hidden w-px bg-[rgba(16,24,38,0.08)] sm:block" />
            <div className="hidden sm:block sm:flex-1">{renderMonth(addMonths(currentMonth, 1))}</div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <div ref={triggerRef} className="air-input-group min-w-0">
        <label className="air-input-label">{label}</label>

        <div
          onClick={() => setIsOpen((current) => !current)}
          className="air-field air-input-surface flex min-h-[72px] cursor-pointer items-center gap-3 px-4"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(79,130,255,0.1)] text-[var(--air-blue-deep)]">
            <CalendarDays className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-[1rem] font-semibold text-[var(--air-ink)]">
              {value ? format(new Date(value), 'd MMMM, EEE', { locale: ru }) : 'Выберите дату'}
            </div>
          </div>

          {value && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChange('');
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--air-muted)] transition-colors hover:bg-[rgba(16,24,38,0.05)] hover:text-[var(--air-ink)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {popup}
    </>
  );
}
