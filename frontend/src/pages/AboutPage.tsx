import { Link } from 'react-router-dom';
import { Building2, Users, Globe, Plane } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-subtle mb-8">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg-muted">О компании</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-fg mb-6">О компании</h1>

      <div className="space-y-6 text-sm text-fg-muted leading-relaxed">
        <p>
          <span className="text-fg font-medium">SkyBooker</span> — современный сервис бронирования авиабилетов,
          разработанный с фокусом на скорость, удобство и безопасность. Мы помогаем путешественникам
          находить лучшие предложения и бронировать билеты за считанные секунды.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <Building2 className="w-5 h-5 text-sky mb-3" />
            <p className="text-fg font-medium text-sm mb-1">Основан в 2026</p>
            <p className="text-xs text-fg-subtle">Молодая и амбициозная команда</p>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <Users className="w-5 h-5 text-neon-purple mb-3" />
            <p className="text-fg font-medium text-sm mb-1">10 000+ клиентов</p>
            <p className="text-xs text-fg-subtle">Доверяют нам свои путешествия</p>
          </div>
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-5">
            <Globe className="w-5 h-5 text-neon-green mb-3" />
            <p className="text-fg font-medium text-sm mb-1">97 аэропортов</p>
            <p className="text-xs text-fg-subtle">По всей России и СНГ</p>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-fg pt-2">Наша миссия</h2>
        <p>
          Сделать авиаперелёты доступными для каждого. Мы верим, что поиск и покупка билетов
          должны быть такими же простыми, как отправка сообщения — без скрытых комиссий,
          сложных интерфейсов и долгих ожиданий.
        </p>

        <h2 className="text-lg font-semibold text-fg pt-2">Технологии</h2>
        <p>
          Платформа построена на современном стеке: React, Node.js, PostgreSQL.
          Мы используем пессимистичные блокировки на уровне базы данных для предотвращения
          двойных бронирований и JWT-аутентификацию для защиты ваших данных.
        </p>
      </div>

      <div className="mt-10 p-6 bg-dark-800 border border-dark-600 rounded-xl">
        <div className="flex items-center gap-3">
          <Plane className="w-5 h-5 text-sky -rotate-45" />
          <div>
            <p className="text-sm text-fg font-medium">Хотите сотрудничать?</p>
            <p className="text-xs text-fg-subtle mt-0.5">Напишите нам: hello@skybooker.ru</p>
          </div>
        </div>
      </div>
    </div>
  );
}
