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
    <div className="relative w-full flex-1 h-full min-w-[200px]">
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center h-16 w-full px-5 rounded-[1.25rem] bg-[#090C15]/50 hover:bg-[#090C15]/80 border border-white/5 hover:border-white/10 focus-within:!border-sky/50 focus-within:!bg-[#090C15] transition-all duration-300 cursor-pointer"
      >
        <CalendarIcon className="w-5 h-5 text-[#4E5466] group-hover:text-sky transition-colors flex-shrink-0" />
        
        <div className="flex flex-col flex-1 pl-4 h-full justify-center min-w-0">
          <label className="text-[10px] text-[#4E5466] uppercase tracking-[0.1em] font-bold mb-0.5 group-hover:text-sky transition-colors cursor-pointer select-none text-left">
            Дата вылета
          </label>
          <span className={`text-base font-medium leading-none pb-0.5 truncate text-left ${value ? 'text-white' : 'text-[#4E5466]'}`}>
            {value ? format(new Date(value), 'd MMMM, EEE', { locale: ru }) : 'Выберите дату'}
          </span>
        </div>

        {value && (
          <button
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="p-1.5 ml-2 hover:bg-white/10 rounded-full text-fg-muted hover:text-white transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {popover}
    </div>
  );
};
