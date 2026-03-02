import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Loader2, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { isAxiosError } from 'axios';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate('/');
    } catch (err) {
      if (isAxiosError(err)) {
        const responseData = err.response?.data;
        if (responseData?.details && responseData.details.length > 0) {
          setError(responseData.details.map((d: { message: string }) => d.message).join(', '));
        } else {
          setError(responseData?.message || 'Что-то пошло не так');
        }
      } else {
        setError('Что-то пошло не так');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue to-sky flex items-center justify-center mx-auto mb-4">
            <Plane className="w-7 h-7 text-white -rotate-45" />
          </div>
          <h1 className="text-2xl font-bold text-fg">
            {isLogin ? 'Вход в аккаунт' : 'Регистрация'}
          </h1>
          <p className="text-sm text-fg-subtle mt-1">
            {isLogin ? 'Войдите, чтобы бронировать авиабилеты' : 'Создайте аккаунт для бронирования'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-dark-800 border border-dark-600 rounded-xl p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-neon-red/10 border border-neon-red/20 rounded-lg text-neon-red text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-xs text-fg-muted mb-1.5">Имя</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иван Иванов"
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-fg placeholder-fg-subtle text-sm focus:outline-none focus:border-sky transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-fg placeholder-fg-subtle text-sm focus:outline-none focus:border-sky transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-fg-muted mb-1.5">Пароль</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-subtle" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? '••••••••' : 'Минимум 6 символов'}
                required
                minLength={isLogin ? 1 : 6}
                className="w-full pl-10 pr-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-fg placeholder-fg-subtle text-sm focus:outline-none focus:border-sky transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neon-blue text-white font-semibold rounded-lg hover:bg-neon-blue/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isLogin ? 'Входим...' : 'Регистрация...'}
              </>
            ) : (
              isLogin ? 'Войти' : 'Зарегистрироваться'
            )}
          </button>

          <div className="text-center text-sm text-fg-subtle">
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="text-sky hover:underline"
            >
              {isLogin ? 'Зарегистрируйтесь' : 'Войдите'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-fg-subtle hover:text-fg-muted transition-colors">
            ← На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
