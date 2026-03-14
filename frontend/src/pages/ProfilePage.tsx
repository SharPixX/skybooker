import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { isAxiosError } from 'axios';
import { Link, Navigate } from 'react-router-dom';
import { Bell, LogOut, Settings, Ticket, User2 } from 'lucide-react';
import { updatePasswordApi, updateProfileApi } from '../api';
import { getRecentBookings, type RecentBookingSummary } from '../recentBookings';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { id: 'overview', label: 'Сводка', icon: Ticket },
  { id: 'bookings', label: 'Бронирования', icon: Bell },
  { id: 'passengers', label: 'Пассажиры', icon: User2 },
  { id: 'settings', label: 'Настройки', icon: Settings },
] as const;

function getStatusLabel(status: RecentBookingSummary['status']) {
  if (status === 'CONFIRMED') {
    return 'Подтверждено';
  }

  if (status === 'PENDING') {
    return 'Ожидает оплаты';
  }

  if (status === 'CANCELLED') {
    return 'Отменено';
  }

  return 'Ошибка оплаты';
}

function getStatusTone(status: RecentBookingSummary['status']) {
  if (status === 'CONFIRMED') {
    return 'bg-[rgba(20,133,111,0.08)] text-[var(--air-emerald)]';
  }

  if (status === 'PENDING') {
    return 'bg-[rgba(255,213,79,0.18)] text-[var(--air-ink)]';
  }

  if (status === 'CANCELLED') {
    return 'bg-[rgba(17,24,39,0.06)] text-[var(--air-muted-strong)]';
  }

  return 'bg-[rgba(213,78,78,0.08)] text-[var(--air-danger)]';
}

export default function ProfilePage() {
  const { user, setUser, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('overview');
  const [profileName, setProfileName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [recentBookings, setRecentBookings] = useState<RecentBookingSummary[]>([]);

  useEffect(() => {
    setProfileName(user?.name || '');
  }, [user?.name]);

  useEffect(() => {
    const syncRecentBookings = () => setRecentBookings(getRecentBookings());

    syncRecentBookings();
    window.addEventListener('storage', syncRecentBookings);

    return () => window.removeEventListener('storage', syncRecentBookings);
  }, []);

  const nextTrip = useMemo(() => {
    const sorted = [...recentBookings].sort(
      (left, right) => new Date(left.departureTime).getTime() - new Date(right.departureTime).getTime(),
    );

    return sorted.find((item) => new Date(item.departureTime).getTime() >= Date.now()) || sorted[0] || null;
  }, [recentBookings]);

  if (loading) {
    return (
      <div className="air-page">
        <div className="air-container">
          <div className="air-surface-card flex items-center justify-center px-5 py-16 text-[var(--air-muted)]">
            Загружаем кабинет пассажира...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage('');

    try {
      const updatedUser = await updateProfileApi(profileName);
      setUser(updatedUser);
      setProfileMessage('Имя пассажира обновлено.');
    } catch (unknownError) {
      if (isAxiosError(unknownError)) {
        setProfileMessage(unknownError.response?.data?.message || 'Не удалось обновить профиль.');
      } else if (unknownError instanceof Error) {
        setProfileMessage(unknownError.message);
      } else {
        setProfileMessage('Не удалось обновить профиль.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordMessage('');

    try {
      await updatePasswordApi(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setPasswordMessage('Пароль обновлен.');
    } catch (unknownError) {
      if (isAxiosError(unknownError)) {
        setPasswordMessage(unknownError.response?.data?.message || 'Не удалось обновить пароль.');
      } else if (unknownError instanceof Error) {
        setPasswordMessage(unknownError.message);
      } else {
        setPasswordMessage('Не удалось обновить пароль.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const confirmedCount = recentBookings.filter((item) => item.status === 'CONFIRMED').length;

  return (
    <div className="air-page">
      <div className="air-container">
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--air-muted)]">
          <Link to="/" className="font-semibold text-[var(--air-ink)]">
            Главная
          </Link>
          <span>/</span>
          <span>Кабинет пассажира</span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.86fr_1.14fr]">
          <aside className="space-y-5">
            <div className="air-dark-card px-5 py-6 md:px-6">
              <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
                Кабинет пассажира
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-[rgba(255,213,79,0.16)] text-2xl font-extrabold text-[var(--air-yellow)]">
                  {user?.name?.slice(0, 1).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">{user?.name}</div>
                  <div className="mt-1 text-sm text-white/64">{user?.email}</div>
                </div>
              </div>

              <div className="air-divider my-5" />

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Статус</div>
                  <div className="mt-2 text-2xl font-extrabold text-white">Активен</div>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/54">Бронирования</div>
                  <div className="mt-2 text-2xl font-extrabold text-white">{confirmedCount}</div>
                </div>
              </div>

              <button type="button" onClick={logout} className="air-tertiary-button mt-5 w-full justify-center">
                <LogOut className="h-4 w-4" />
                Выйти из аккаунта
              </button>
            </div>

            <div className="air-surface-card px-5 py-5">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={[
                        'flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left text-sm font-bold transition-colors',
                        isActive
                          ? 'bg-[rgba(79,130,255,0.12)] text-[var(--air-blue-deep)]'
                          : 'text-[var(--air-ink)] hover:bg-[rgba(17,24,39,0.05)]',
                      ].join(' ')}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="air-surface-card-strong px-5 py-6 md:px-8 md:py-8">
            {activeTab === 'overview' && (
              <div>
                <div className="air-section-kicker">Сводка</div>
                <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-5xl">
                  Все, что важно после покупки
                </h1>

                {nextTrip ? (
                  <div className="mt-8 rounded-[28px] border border-[var(--air-border)] bg-[rgba(17,24,39,0.03)] p-5 md:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="air-quiet-label">Ближайшая поездка</div>
                        <div className="mt-2 text-3xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)]">
                          {nextTrip.route}
                        </div>
                        <div className="mt-3 text-sm text-[var(--air-muted)]">
                          {format(new Date(nextTrip.departureTime), 'd MMMM yyyy, HH:mm', { locale: ru })} • рейс {nextTrip.flightNumber}
                        </div>
                      </div>
                      <div className={`rounded-full px-3 py-1 text-xs font-extrabold ${getStatusTone(nextTrip.status)}`}>
                        {getStatusLabel(nextTrip.status)}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                      <div className="air-data-card">
                        <div className="air-quiet-label">Место</div>
                        <strong>{nextTrip.seatNumber}</strong>
                      </div>
                      <div className="air-data-card">
                        <div className="air-quiet-label">Стоимость</div>
                        <strong>{parseFloat(nextTrip.price).toLocaleString('ru-RU')} ₽</strong>
                      </div>
                      <div className="air-data-card">
                        <div className="air-quiet-label">Действие</div>
                        <Link to={`/booking/${nextTrip.id}`} className="mt-2 inline-flex text-sm font-extrabold text-[var(--air-blue-deep)]">
                          Открыть бронь
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 rounded-[28px] border border-dashed border-[var(--air-border-strong)] bg-[rgba(17,24,39,0.02)] p-6 text-sm leading-relaxed text-[var(--air-muted)]">
                    Пока нет сохраненных поездок. Найдите рейс и оформите первую бронь.
                    <div className="mt-4">
                      <Link to="/#search" className="air-secondary-button">
                        Найти билет
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <div className="air-section-kicker">Бронирования</div>
                <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-5xl">
                  Последние поездки и активные брони
                </h1>

                <div className="mt-6 space-y-4">
                  {recentBookings.length === 0 ? (
                    <div className="rounded-[28px] border border-dashed border-[var(--air-border-strong)] bg-[rgba(17,24,39,0.02)] p-6 text-sm leading-relaxed text-[var(--air-muted)]">
                      Пока нет сохраненных бронирований. Найдите рейс и создайте первую бронь.
                      <div className="mt-4">
                        <Link to="/#search" className="air-secondary-button">
                          Найти рейс
                        </Link>
                      </div>
                    </div>
                  ) : (
                    recentBookings.map((booking) => (
                      <Link key={booking.id} to={`/booking/${booking.id}`} className="air-link-card block px-5 py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="air-quiet-label">{booking.flightNumber}</div>
                            <div className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">
                              {booking.route}
                            </div>
                            <div className="mt-2 text-sm text-[var(--air-muted)]">
                              {format(new Date(booking.departureTime), 'd MMMM yyyy, HH:mm', { locale: ru })} • место {booking.seatNumber}
                            </div>
                          </div>

                          <div className="flex flex-col items-start gap-3 md:items-end">
                            <div className={`rounded-full px-3 py-1 text-xs font-extrabold ${getStatusTone(booking.status)}`}>
                              {getStatusLabel(booking.status)}
                            </div>
                            <div className="text-lg font-extrabold text-[var(--air-ink)]">
                              {parseFloat(booking.price).toLocaleString('ru-RU')} ₽
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'passengers' && (
              <div>
                <div className="air-section-kicker">Пассажиры</div>
                <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)] md:text-5xl">
                  Основные данные владельца кабинета
                </h1>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[28px] border border-[var(--air-border)] bg-[rgba(255,255,255,0.72)] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-[rgba(255,213,79,0.18)] text-xl font-extrabold text-[var(--air-ink)]">
                        {user?.name
                          ?.split(' ')
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join('')
                          .toUpperCase() || 'П'}
                      </div>
                      <div>
                        <div className="text-xl font-extrabold text-[var(--air-ink)]">{user?.name}</div>
                        <div className="mt-1 text-sm text-[var(--air-muted)]">{user?.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-dashed border-[var(--air-border-strong)] bg-[rgba(17,24,39,0.02)] p-5 text-sm leading-relaxed text-[var(--air-muted)]">
                    Эти данные используются для входа в кабинет и быстрого возврата к бронированиям на этом устройстве.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="grid gap-5 xl:grid-cols-2">
                <form onSubmit={saveProfile} className="rounded-[28px] border border-[var(--air-border)] bg-[rgba(255,255,255,0.72)] p-5">
                  <div className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">Профиль пассажира</div>
                  <div className="mt-4">
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">Имя</div>
                    <div className="air-field flex min-h-[60px] items-center px-4">
                      <input
                        type="text"
                        value={profileName}
                        onChange={(event) => setProfileName(event.target.value)}
                        autoComplete="name"
                        className="w-full bg-transparent text-[1rem] font-semibold text-[var(--air-ink)] outline-none"
                      />
                    </div>
                  </div>
                  {profileMessage && (
                    <div className="mt-4 rounded-[20px] bg-[rgba(17,24,39,0.04)] px-4 py-3 text-sm font-semibold text-[var(--air-muted-strong)]">
                      {profileMessage}
                    </div>
                  )}
                  <button type="submit" disabled={savingProfile} className="air-primary-button mt-5 w-full justify-center">
                    {savingProfile ? 'Сохраняем...' : 'Сохранить изменения'}
                  </button>
                </form>

                <form onSubmit={savePassword} className="rounded-[28px] border border-[var(--air-border)] bg-[rgba(255,255,255,0.72)] p-5">
                  <div className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">Безопасность аккаунта</div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">Текущий пароль</div>
                      <div className="air-field flex min-h-[60px] items-center px-4">
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(event) => setOldPassword(event.target.value)}
                          autoComplete="current-password"
                          className="w-full bg-transparent text-[1rem] font-semibold text-[var(--air-ink)] outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">Новый пароль</div>
                      <div className="air-field flex min-h-[60px] items-center px-4">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          autoComplete="new-password"
                          minLength={6}
                          className="w-full bg-transparent text-[1rem] font-semibold text-[var(--air-ink)] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  {passwordMessage && (
                    <div className="mt-4 rounded-[20px] bg-[rgba(17,24,39,0.04)] px-4 py-3 text-sm font-semibold text-[var(--air-muted-strong)]">
                      {passwordMessage}
                    </div>
                  )}
                  <button type="submit" disabled={savingPassword} className="air-primary-button mt-5 w-full justify-center">
                    {savingPassword ? 'Обновляем...' : 'Обновить пароль'}
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
