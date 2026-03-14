import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck, Ticket, User2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const accountBenefits = [
  'Храните билеты, статусы удержания и историю перелетов в одном месте.',
  'Продолжайте бронирование с того экрана, на котором остановились.',
  'Быстрее проходите путь от поиска до подтверждения маршрута.',
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [isLogin]);

  const redirectTo = (location.state as { from?: string } | null)?.from || '/profile';
  const isBookingRedirect = redirectTo.includes('/booking') || redirectTo.includes('/flights');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }

      navigate(redirectTo);
    } catch (unknownError) {
      if (isAxiosError(unknownError)) {
        const details = unknownError.response?.data?.details as { message: string }[] | undefined;
        if (details?.length) {
          setError(details.map((item) => item.message).join(', '));
        } else {
          setError(unknownError.response?.data?.message || 'Не удалось завершить вход.');
        }
      } else if (unknownError instanceof Error) {
        setError(unknownError.message);
      } else {
        setError('Не удалось завершить вход.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="air-page">
      <div className="air-container">
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--air-muted)]">
          <Link to="/" className="font-semibold text-[var(--air-ink)]">
            Главная
          </Link>
          <span>/</span>
          <span>{isLogin ? 'Вход' : 'Регистрация'}</span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="air-dark-card px-5 py-6 md:px-8 md:py-8">
            <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
              Кабинет пассажира
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] md:text-5xl">
              {isBookingRedirect ? 'Войдите, чтобы продолжить бронирование' : 'Вход в кабинет пассажира'}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/72 md:text-base">
              {isBookingRedirect
                ? 'После входа можно вернуться к выбранному рейсу, подтвердить бронь и сохранить поездку.'
                : 'В кабинете доступны билеты, статусы бронирования, последние маршруты и данные пассажира.'}
            </p>

            <div className="mt-8 grid gap-4">
              {accountBenefits.map((benefit) => (
                <div key={benefit} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm font-semibold leading-relaxed text-white/86">
                  {benefit}
                </div>
              ))}
            </div>
          </section>

          <section className="air-surface-card-strong px-5 py-6 md:px-8 md:py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="air-quiet-label">{isLogin ? 'Вход в аккаунт' : 'Создание аккаунта'}</div>
                <div className="mt-2 text-3xl font-extrabold tracking-[-0.05em] text-[var(--air-ink)]">
                  {isLogin ? (isBookingRedirect ? 'Продолжить покупку' : 'Открыть кабинет') : 'Создать кабинет пассажира'}
                </div>
              </div>
              <button type="button" onClick={() => setIsLogin((current) => !current)} className="air-secondary-button">
                {isLogin ? 'Нужен новый аккаунт' : 'Уже есть аккаунт'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <label className="block">
                  <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">
                    Имя пассажира
                  </div>
                  <div className="air-field flex min-h-[64px] items-center gap-3 px-4">
                    <User2 className="h-5 w-5 text-[var(--air-blue-deep)]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Иван Петров"
                      autoComplete="name"
                      required={!isLogin}
                      className="w-full bg-transparent text-[1rem] font-semibold text-[var(--air-ink)] outline-none placeholder:text-[var(--air-muted)]"
                    />
                  </div>
                </label>
              )}

              <label className="block">
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">Email</div>
                <div className="air-field flex min-h-[64px] items-center gap-3 px-4">
                  <Mail className="h-5 w-5 text-[var(--air-blue-deep)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="user@example.com"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent text-[1rem] font-semibold text-[var(--air-ink)] outline-none placeholder:text-[var(--air-muted)]"
                  />
                </div>
              </label>

              <label className="block">
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[var(--air-muted)]">Пароль</div>
                <div className="air-field flex min-h-[64px] items-center gap-3 px-4">
                  <Lock className="h-5 w-5 text-[var(--air-blue-deep)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={isLogin ? 'Введите пароль' : 'Минимум 6 символов'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    minLength={isLogin ? 1 : 6}
                    className="w-full bg-transparent text-[1rem] font-semibold text-[var(--air-ink)] outline-none placeholder:text-[var(--air-muted)]"
                  />
                </div>
              </label>

              {error && (
                <div className="rounded-[22px] border border-[rgba(213,78,78,0.22)] bg-[rgba(213,78,78,0.08)] px-4 py-3 text-sm font-semibold text-[var(--air-danger)]">
                  {error}
                </div>
              )}

              <div className="rounded-[24px] bg-[rgba(17,24,39,0.04)] px-4 py-4 text-sm leading-relaxed text-[var(--air-muted)]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--air-emerald)]" />
                  <div>Доступ к бронированиям защищен. Данные используются только для кабинета пассажира и уведомлений по поездке.</div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="air-primary-button w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? (
                  'Подтверждаем...'
                ) : isLogin ? (
                  isBookingRedirect ? 'Войти и продолжить' : 'Войти в кабинет'
                ) : (
                  'Создать аккаунт'
                )}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>

              <div className="rounded-[24px] border border-[var(--air-border)] bg-[rgba(255,255,255,0.6)] px-4 py-4 text-sm text-[var(--air-muted)]">
                <div className="flex items-start gap-3">
                  <Ticket className="mt-0.5 h-4 w-4 text-[var(--air-blue-deep)]" />
                  <div>После входа можно вернуться к брони, проверить статус и перейти к последним поездкам.</div>
                </div>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
