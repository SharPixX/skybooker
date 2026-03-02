import { useState } from 'react';
import { updateProfileApi, updatePasswordApi } from '../api';
import { useAuth, User as UserType } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
  User,
  Ticket,
  Settings,
  Shield,
  MapPin,
  Clock,
  LogOut,
  Plane,
  Heart,
  Briefcase,
  Plus
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Сводка', icon: User },
  { id: 'bookings', label: 'Мои перелеты', icon: Ticket },
  { id: 'passengers', label: 'Пассажиры', icon: Heart },
  { id: 'settings', label: 'Настройки', icon: Settings },
];

export default function ProfilePage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#090C15] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#090C15] flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 py-8 gap-8">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="bg-[#11141D] rounded-2xl border border-white/5 p-4 sticky top-24">
          <div className="flex items-center gap-4 p-2 mb-6 border-b border-white/5 pb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-blue to-sky flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(0,195,255,0.3)]">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-fg font-semibold truncate leading-tight">{user?.name}</h2>
              <div className="flex items-center gap-1.5 text-xs text-sky font-medium mt-1">
                <Shield className="w-3.5 h-3.5" />
                Lidar Club: Серебро
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                    isActive
                      ? 'bg-sky/10 text-sky border border-sky/20 shadow-[inset_0_0_10px_rgba(0,195,255,0.1)]'
                      : 'text-fg-subtle hover:text-fg hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky' : 'text-fg-muted'}`} />
                  {tab.label}
                </button>
              );
            })}
            
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 mt-4 text-neon-red/80 hover:text-neon-red hover:bg-neon-red/10 rounded-xl transition-all text-sm font-medium border border-transparent"
            >
              <LogOut className="w-4 h-4" />
              Выйти из аккаунта
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        <div className="bg-[#11141D] rounded-[2rem] border border-white/5 p-6 md:p-8 min-h-full shadow-lg">
          {activeTab === 'dashboard' && <DashboardTab user={user} />}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'passengers' && <PassengersTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function DashboardTab({ user }: { user: UserType | null }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div>
        <h1 className="text-2xl font-bold text-fg tracking-tight">Добро пожаловать, {user?.name}!</h1>
        <p className="text-fg-subtle mt-1 text-sm">Ваша персональная сводка полетов.</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#090C15] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-neon-blue/10 flex items-center justify-center">
            <Plane className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <div className="text-2xl font-bold text-fg">12</div>
            <div className="text-xs text-fg-muted font-medium uppercase tracking-wider">Перелетов</div>
          </div>
        </div>
        <div className="bg-[#090C15] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-sky" />
          </div>
          <div>
            <div className="text-2xl font-bold text-fg">8</div>
            <div className="text-xs text-fg-muted font-medium uppercase tracking-wider">Стран</div>
          </div>
        </div>
        <div className="bg-[#090C15] p-5 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-fg">48<span className="text-sm font-normal text-fg-muted">ч</span></div>
            <div className="text-xs text-fg-muted font-medium uppercase tracking-wider">В воздухе</div>
          </div>
        </div>
      </div>

      {/* Next Flight Widget */}
      <div>
        <h2 className="text-lg font-bold text-fg mb-4">Ближайший рейс</h2>
        
        {/* Boarding Pass Mock */}
        <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#1A1F2E] to-[#0A0D14] border border-white/10 group">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-sky/0 via-sky/10 to-neon-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%]"></div>
          
          <div className="absolute top-0 right-0 p-4">
            <div className="px-3 py-1 bg-sky/20 border border-sky/30 rounded-full text-xs font-semibold text-sky inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,195,255,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-sky animate-pulse"></span>
              Завтра
            </div>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
            {/* Route */}
            <div className="flex-1">
              <div className="flex items-center justify-between text-fg mb-2">
                <div className="text-3xl font-bold tracking-tighter">MOW</div>
                <div className="flex-1 mx-4 relative flex items-center justify-center text-fg-muted">
                   <div className="absolute w-full border-t border-dashed border-white/20"></div>
                   <Plane className="w-5 h-5 relative z-10 text-sky bg-[#1A1F2E] px-1" />
                </div>
                <div className="text-3xl font-bold tracking-tighter">DXB</div>
              </div>
              <div className="flex justify-between text-xs text-fg-muted font-medium uppercase tracking-wider font-mono">
                <span>Москва (SVO)</span>
                <span>Дубай (DXB)</span>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full md:w-px h-px md:h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

            {/* Specs */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-fg-muted text-xs mb-1">Дата и время</div>
                <div className="font-semibold text-fg">14 Мар, 10:20</div>
              </div>
              <div>
                <div className="text-fg-muted text-xs mb-1">Гейт</div>
                <div className="font-semibold text-fg">A12</div>
              </div>
              <div>
                <div className="text-fg-muted text-xs mb-1">Место</div>
                <div className="font-semibold text-sky">14B</div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-[#090C15]/50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs text-fg-subtle">
              <Briefcase className="w-4 h-4" /> Ручная кладь 10 кг + Багаж 23 кг
            </div>
            <Link to="/bookings/active" className="text-sm font-semibold text-white bg-sky border border-sky/50 rounded-lg px-4 py-2 hover:bg-sky/90 hover:shadow-[0_0_15px_rgba(0,195,255,0.3)] transition-all">
              Посадочный талон
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingsTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold text-fg tracking-tight">Мои перелеты</h1>
        <div className="flex bg-[#090C15] p-1 rounded-lg border border-white/5">
          <button className="px-3 py-1.5 rounded-md bg-white/10 text-fg text-sm font-medium shadow-sm">Предстоящие</button>
          <button className="px-3 py-1.5 rounded-md text-fg-subtle hover:text-fg text-sm font-medium transition-colors">Прошедшие</button>
        </div>
      </div>

      <div className="text-center py-16 bg-[#090C15] rounded-3xl border border-white/5">
        <Plane className="w-12 h-12 text-fg-muted mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-fg mb-2">У вас нет других предстоящих рейсов</h3>
        <p className="text-sm text-fg-muted max-w-sm mx-auto mb-6">
          Кроме ближайшего рейса в Дубай, других запланированных билетов не найдено. Самое время спланировать новое путешествие!
        </p>
        <Link to="/" className="inline-flex items-center justify-center bg-white/10 text-fg hover:bg-white/20 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm border border-white/5 hover:border-white/10">
          Найти авиабилеты
        </Link>
      </div>
    </div>
  );
}

function PassengersTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">Пассажиры</h1>
          <p className="text-fg-subtle mt-1 text-sm">Сохраненные данные для быстрого бронирования.</p>
        </div>
        <button className="flex items-center gap-1.5 text-sm bg-sky/10 text-sky border border-sky/20 px-3 py-2 rounded-lg hover:bg-sky/20 transition-colors font-medium">
          <Plus className="w-4 h-4" /> Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Placeholder saved passenger */}
        <div className="bg-[#090C15] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group cursor-pointer relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-fg font-medium">
                ИИ
              </div>
              <div>
                <div className="font-semibold text-fg group-hover:text-white transition-colors">Иван Иванов</div>
                <div className="text-xs text-fg-muted font-mono mt-0.5">Взрослый</div>
              </div>
            </div>
            <button className="text-fg-subtle hover:text-sky transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-sm text-fg-subtle">
             <div className="flex justify-between border-b border-white/5 pb-1"><span>Документ:</span> <span className="text-fg font-medium">Загран (75 12****89)</span></div>
             <div className="flex justify-between"><span>Рождение:</span> <span className="text-fg font-medium">12 Апр 1990</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfileApi(name);
      setUser(updatedUser);
      setProfileMsg({ text: 'Имя успешно обновлено.', type: 'success' });
    } catch (err: unknown) {
      // @ts-expect-error
      setProfileMsg({ text: err.response?.data?.message || 'Ошибка обновления', type: 'error' });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePasswordApi(oldPassword, newPassword);
      setPasswordMsg({ text: 'Пароль успешно изменён.', type: 'success' });
      setOldPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      // @ts-expect-error
      setPasswordMsg({ text: err.response?.data?.message || 'Ошибка обновления пароля', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">Настройки</h1>
          <p className="text-fg-subtle mt-1 text-sm">Управление вашим профилем и безопасностью.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-[#090C15] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-sky" />
            Личные данные
          </h2>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-subtle mb-1.5">Полное имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-fg focus:outline-none focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-subtle mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                disabled
                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-fg-muted cursor-not-allowed opacity-70"
                title="Смена email пока недоступна"
              />
            </div>
            {profileMsg.text && (
              <div className={`p-3 rounded-xl text-sm ${profileMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {profileMsg.text}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-sky hover:bg-sky-hover text-white py-2.5 rounded-xl font-semibold transition-colors mt-2"
            >
              Сохранить изменения
            </button>
          </form>
        </div>

        {/* Security / Password */}
        <div className="bg-[#090C15] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            Безопасность
          </h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-fg-subtle mb-1.5">Текущий пароль</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-fg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-fg-subtle mb-1.5">Новый пароль</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-fg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                required
                minLength={6}
                title="Минимум 6 символов, должна быть цифра и буква"
              />
              <p className="text-xs text-fg-muted mt-1.5">Минимум 6 символов. Должен содержать хотя бы одну букву и цифру.</p>
            </div>
            {passwordMsg.text && (
              <div className={`p-3 rounded-xl text-sm ${passwordMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {passwordMsg.text}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-white/10 hover:bg-white/20 text-fg py-2.5 rounded-xl font-semibold transition-colors mt-2"
            >
              Обновить пароль
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

