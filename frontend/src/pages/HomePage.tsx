import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRightLeft, ChevronRight, Shield, Clock, Headphones } from 'lucide-react';
import CityInput from '../components/CityInput';
import { DatePicker } from '../components/DatePicker';

const POPULAR_ROUTES = [
  { from: 'Москва (SVO)', to: 'Санкт-Петербург (LED)', image: '/cities/spb.jpg', label: 'Санкт-Петербург', price: 'от 3 800 ₽' },
  { from: 'Москва (SVO)', to: 'Сочи (AER)', image: '/cities/sochi.jpg', label: 'Сочи', price: 'от 3 800 ₽' },
  { from: 'Москва (VKO)', to: 'Новосибирск (OVB)', image: '/cities/novosibirsk.jpg', label: 'Новосибирск', price: 'от 2 300 ₽' },
  { from: 'Санкт-Петербург (LED)', to: 'Казань (KZN)', image: '/cities/kazan.jpg', label: 'Казань', price: 'от 2 300 ₽' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (date) params.set('date', date);
    navigate(`/flights?${params.toString()}`);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handlePopular = (route: typeof POPULAR_ROUTES[0]) => {
    const params = new URLSearchParams();
    params.set('from', route.from);
    params.set('to', route.to);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/5 via-transparent to-transparent" />
        <div className="absolute top-10 left-1/3 w-[600px] h-[600px] bg-sky/3 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-neon-purple/3 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 pt-14 md:pt-20 pb-28 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-bold mb-4 leading-tight">
            <span className="text-fg">Найдите лучшие цены</span>
            <br />
            <span className="bg-gradient-to-r from-sky to-neon-blue bg-clip-text text-transparent">
              на авиабилеты
            </span>
          </h1>

          <p className="text-sm md:text-base text-fg-muted max-w-lg mx-auto mb-10">
            Сравнивайте предложения и бронируйте билеты на удобные даты
          </p>

          {/* Search form */}
          <div className="relative z-10 bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-2xl p-4 md:p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col md:flex-row gap-3 items-end">
              <CityInput label="Откуда" placeholder="Город вылета" value={from} onChange={setFrom} />

              <button
                onClick={handleSwap}
                className="p-3 bg-dark-700 border border-dark-500 rounded-lg hover:border-sky hover:bg-dark-600 transition-all group self-end"
                title="Поменять местами"
              >
                <ArrowRightLeft className="w-4 h-4 text-fg-muted group-hover:text-sky transition-colors" />
              </button>

              <CityInput label="Куда" placeholder="Город прибытия" value={to} onChange={setTo} />

              <div className="flex-1 min-w-[250px]">
                <label className="block text-xs text-fg-subtle mb-1.5 uppercase tracking-wider font-medium">Дата</label>
                <DatePicker value={date} onChange={setDate} />
              </div>

              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-neon-blue text-white font-semibold rounded-lg hover:bg-neon-blue/90 hover:shadow-lg hover:shadow-neon-blue/20 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Найти
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popular destinations */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 pb-16 w-full">
        <h2 className="text-base font-semibold text-fg mb-4">Популярные направления</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {POPULAR_ROUTES.map((route, i) => (
            <button
              key={i}
              onClick={() => handlePopular(route)}
              className="group relative rounded-xl overflow-hidden text-left aspect-[4/3] hover:-translate-y-0.5 transition-all"
            >
              <img
                src={route.image}
                alt={route.label}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="relative h-full flex flex-col justify-end p-4">
                <p className="text-sm text-white font-semibold drop-shadow-lg">{route.label}</p>
                <div className="flex items-center gap-1 text-[11px] text-white/70 mt-0.5">
                  <span>{route.from.split(' (')[0]}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{route.to.split(' (')[0]}</span>
                </div>
                <p className="text-xs text-sky font-semibold mt-1.5 drop-shadow-lg">{route.price}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div className="border-t border-dark-700 bg-dark-800/30">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-neon-blue/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-neon-blue" />
              </div>
              <div>
                <h3 className="text-sm text-fg font-medium mb-0.5">Безопасная оплата</h3>
                <p className="text-xs text-fg-subtle leading-relaxed">Ваши платёжные данные защищены шифрованием</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-neon-purple" />
              </div>
              <div>
                <h3 className="text-sm text-fg font-medium mb-0.5">Мгновенное бронирование</h3>
                <p className="text-xs text-fg-subtle leading-relaxed">Электронный билет на почту сразу после оплаты</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-4 h-4 text-neon-green" />
              </div>
              <div>
                <h3 className="text-sm text-fg font-medium mb-0.5">Поддержка 24/7</h3>
                <p className="text-xs text-fg-subtle leading-relaxed">Всегда на связи — поможем с любым вопросом</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
