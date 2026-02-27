import { Link } from 'react-router-dom';
import { HelpCircle, Clock, CreditCard, XCircle, Mail, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FaqItem {
  q: string;
  a: string;
}

const FAQ: FaqItem[] = [
  {
    q: 'Как забронировать билет?',
    a: 'Выберите направление и дату на главной странице, найдите подходящий рейс, выберите место и подтвердите бронирование. У вас будет 15 минут на оплату.',
  },
  {
    q: 'Сколько времени действует бронь?',
    a: 'После выбора места у вас есть 15 минут на подтверждение (оплату). Если время истечёт, место автоматически вернётся в продажу.',
  },
  {
    q: 'Можно ли отменить бронирование?',
    a: 'Да, вы можете отменить неподтверждённое бронирование в любой момент. Для подтверждённых бронирований свяжитесь со службой поддержки.',
  },
  {
    q: 'Как выбрать место в самолёте?',
    a: 'На странице рейса нажмите "Выбрать место". Вы увидите схему салона, где зелёным отмечены доступные места. Нажмите на нужное место для бронирования.',
  },
  {
    q: 'Какие способы оплаты доступны?',
    a: 'На данный момент сервис работает в тестовом режиме. Полноценная интеграция с платёжными системами будет добавлена в ближайшее время.',
  },
  {
    q: 'Почему я не могу отменить чужое бронирование?',
    a: 'В целях безопасности каждое бронирование привязано к учётной записи пользователя. Управлять можно только своими бронированиями.',
  },
];

function FaqAccordion({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-dark-600 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-dark-800/50 transition-colors"
      >
        <span className="text-sm text-fg font-medium pr-4">{item.q}</span>
        <ChevronDown className={`w-4 h-4 text-fg-subtle flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-fg-muted leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-subtle mb-8">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg-muted">Помощь</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2">Центр помощи</h1>
      <p className="text-sm text-fg-muted mb-8">Ответы на частые вопросы и полезная информация</p>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { icon: HelpCircle, label: 'Бронирование', color: 'text-sky' },
          { icon: Clock, label: 'Сроки', color: 'text-neon-purple' },
          { icon: CreditCard, label: 'Оплата', color: 'text-neon-green' },
          { icon: XCircle, label: 'Отмена', color: 'text-red-400' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className="bg-dark-800 border border-dark-600 rounded-xl p-4 text-center">
            <Icon className={`w-5 h-5 ${color} mx-auto mb-2`} />
            <p className="text-xs text-fg-secondary font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h2 className="text-lg font-semibold text-fg mb-4">Часто задаваемые вопросы</h2>
      <div className="space-y-2 mb-10">
        {FAQ.map((item, i) => (
          <FaqAccordion key={i} item={item} />
        ))}
      </div>

      {/* Contact */}
      <div className="p-6 bg-dark-800 border border-dark-600 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky/10 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-sky" />
          </div>
          <div>
            <p className="text-sm text-fg font-medium">Не нашли ответ?</p>
            <p className="text-xs text-fg-subtle mt-0.5">Напишите в поддержку: support@skybooker.ru</p>
          </div>
        </div>
      </div>
    </div>
  );
}
