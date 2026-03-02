import { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRightLeft, ChevronRight, Shield, Clock, Headphones } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CityInput from '../components/CityInput';
import { DatePicker } from '../components/DatePicker';
import LidarPlaneModel from '../components/LidarPlaneModel';

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

        <div className="relative max-w-5xl mx-auto px-4 -mt-10 pb-0 text-center flex flex-col items-center">
          
          <div className="w-full h-[300px] sm:h-[400px] relative -mb-20 pointer-events-none">
            <Canvas camera={{ position: [15, 8, -15], fov: 60 }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
              <ambientLight intensity={0.5} />
              <Suspense fallback={null}>
                <LidarPlaneModel />
              </Suspense>
              <OrbitControls 
                enablePan={false} 
                enableZoom={false}
                enableRotate={false}
                autoRotate={true}
                autoRotateSpeed={2.0}
                maxPolarAngle={Math.PI / 1.5}
                minPolarAngle={Math.PI / 4}
              />
            </Canvas>
          </div>

          {/* Search form */}
          <div className="relative z-20 w-full max-w-5xl mx-auto -mt-6 md:-mt-8">
            <div className="relative bg-[#11141D]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 shadow-2xl md:mx-0 mx-4">
              
              <div className="flex flex-col lg:flex-row w-full gap-2 relative">
                
                {/* Route Wrapper (From -> To) */}
                <div className="flex flex-col sm:flex-row flex-[2] relative gap-2">
                  <CityInput label="Откуда" placeholder="Город вылета" value={from} onChange={setFrom} type="from" />

                  {/* Swap Button - Desktop Center */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center bg-[#11141D] rounded-full p-1">
                    <button
                      onClick={handleSwap}
                      className="flex items-center justify-center w-10 h-10 bg-[#090C15] hover:bg-[#1A1D23] border border-white/5 rounded-full transition-all duration-300 focus:outline-none"
                      title="Поменять местами"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-[#4E5466] hover:text-white transition-colors" />
                    </button>
                  </div>

                  {/* Swap Button - Mobile Interlaid */}
                  <div className="flex sm:hidden items-center justify-center -my-3 relative z-10 bg-[#11141D] rounded-full p-1 self-center">
                    <button
                      onClick={handleSwap}
                      className="flex items-center justify-center w-10 h-10 bg-[#090C15] border border-white/5 rounded-full focus:outline-none active:scale-95 transition-transform"
                    >
                      <ArrowRightLeft className="w-4 h-4 text-[#4E5466] rotate-90" />
                    </button>
                  </div>

                  <CityInput label="Куда" placeholder="Город прибытия" value={to} onChange={setTo} type="to" />
                </div>

                {/* Date Wrapper */}
                <div className="flex-[1] min-w-[200px]">
                  <DatePicker value={date} onChange={setDate} />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSearch}
                  className="group flex items-center justify-center h-16 w-full lg:w-48 bg-[#4B8EE9] hover:bg-[#3D7BD4] text-white font-bold rounded-[1.25rem] transition-all duration-300 flex-shrink-0"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 flex-shrink-0" />
                    <span className="text-[15px] tracking-wide uppercase leading-none mt-0.5">Найти</span>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popular destinations */}
      <div className="max-w-5xl mx-auto px-4 mt-8 pb-16 w-full">
        <h2 className="text-[1.25rem] font-semibold text-white mb-6 tracking-wide">Популярные направления</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_ROUTES.map((route, i) => (
            <button
              key={i}
              onClick={() => handlePopular(route)}
              className="group relative rounded-[1.5rem] overflow-hidden text-left h-56 lg:h-64 border border-white/5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(80,178,255,0.15)] hover:border-white/10 hover:-translate-y-1 block"
            >
              <img
                src={route.image}
                alt={route.label}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090C15] via-[#090C15]/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              
              <div className="relative h-full flex flex-col justify-end p-4 sm:p-5">
                <div className="flex flex-col gap-2">
                  <div className="flex-1 w-full">
                    {/* Разрешаем перенос текста на 2 строки, если не влезает */}
                    <p className="text-base sm:text-[1.1rem] md:text-lg text-white font-semibold leading-tight line-clamp-2 md:line-clamp-none w-full">
                      {route.label}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 text-[0.7rem] sm:text-[0.75rem] text-[#A0A5B5] mt-1.5 font-medium">
                      <span>{route.from.split(' (')[0]}</span>
                      <ChevronRight className="w-3 h-3 text-[#4E5466]" />
                      <span>{route.to.split(' (')[0]}</span>
                    </div>
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex px-2 sm:px-2.5 py-1 sm:py-1.5 bg-[#50B2FF]/15 text-[#50B2FF] text-[0.7rem] sm:text-[0.8rem] md:text-sm font-bold rounded-lg border border-[#50B2FF]/20 backdrop-blur-sm shadow-sm whitespace-nowrap">
                      {route.price}
                    </span>
                  </div>
                </div>
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
                <p className="text-xs text-fg-subtle leading-relaxed">Ваши платёжные данные надежно защищены современным алгоритмом шифрования</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-neon-purple/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-neon-purple" />
              </div>
              <div>
                <h3 className="text-sm text-fg font-medium mb-0.5">Мгновенная выписка</h3>
                <p className="text-xs text-fg-subtle leading-relaxed">Электронный билет будет отправлен на вашу почту сразу же после оплаты</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-neon-green/10 flex items-center justify-center flex-shrink-0">
                <Headphones className="w-4 h-4 text-neon-green" />
              </div>
              <div>
                <h3 className="text-sm text-fg font-medium mb-0.5">Поддержка 24/7</h3>
                <p className="text-xs text-fg-subtle leading-relaxed">Мы всегда на связи и готовы помочь с любым вопросом в любое время суток</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
