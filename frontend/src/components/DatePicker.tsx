import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popW = Math.min(600, window.innerWidth - 32);
    let left = rect.left;
    if (left + popW > window.innerWidth - 16) left = window.innerWidth - 16 - popW;
    if (left < 16) left = 16;
    setPos({ top: rect.bottom + 8 + window.scrollY, left });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onUpdate = () => updatePosition();
    window.addEventListener('scroll', onUpdate, true);
    window.addEventListener('resize', onUpdate);
    return () => {
      window.removeEventListener('scroll', onUpdate, true);
      window.removeEventListener('resize', onUpdate);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const renderMonth = (monthDate: Date) => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    return (
      <div className="flex-1 min-w-0">
        <div className="text-center font-semibold mb-3 text-fg-secondary capitalize text-sm">
          {format(monthDate, 'LLLL yyyy', { locale: ru })}
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[11px] font-medium text-fg-subtle py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, monthDate);
            const isSelected = value && isSameDay(day, new Date(value));
            const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <button
                key={idx}
                disabled={!isCurrentMonth || isPast}
                onClick={() => {
                  onChange(format(day, 'yyyy-MM-dd'));
                  setIsOpen(false);
                }}
                className={`
                  h-9 flex items-center justify-center rounded-lg text-sm transition-all
                  ${!isCurrentMonth ? 'invisible' : ''}
                  ${isPast ? 'opacity-25 cursor-not-allowed' : 'hover:bg-dark-600 cursor-pointer'}
                  ${isSelected ? 'bg-sky text-white font-bold hover:bg-sky/90' : 'text-fg-secondary font-medium'}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const popover = isOpen
    ? createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'absolute', top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl shadow-black/60 p-5 w-[min(600px,calc(100vw-32px))] animate-in fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="p-1.5 hover:bg-dark-700 rounded-full transition-colors text-fg-muted hover:text-fg">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-fg-subtle">Выберите дату вылета</span>
            <button onClick={handleNextMonth} className="p-1.5 hover:bg-dark-700 rounded-full transition-colors text-fg-muted hover:text-fg">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-6">
            {renderMonth(currentDate)}
            <div className="w-px bg-dark-600 hidden sm:block" />
            <div className="hidden sm:block flex-1 min-w-0">
              {renderMonth(addMonths(currentDate, 1))}
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="relative w-full">
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-500 rounded-lg text-fg cursor-pointer flex items-center justify-between hover:border-dark-400 transition-all"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
          <span className={value ? 'text-fg' : 'text-fg-muted'}>
            {value ? format(new Date(value), 'd MMMM, EEE', { locale: ru }) : 'Выберите дату'}
          </span>
        </div>
        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="p-1 hover:bg-dark-600 rounded-full text-fg-muted hover:text-fg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {popover}
    </div>
  );
};
