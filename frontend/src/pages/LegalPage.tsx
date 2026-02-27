import { Link } from 'react-router-dom';
import { FileText, Shield, Scale } from 'lucide-react';

const SECTIONS = [
  {
    icon: FileText,
    title: 'Пользовательское соглашение',
    content: `Настоящее Пользовательское соглашение регулирует порядок использования сервиса SkyBooker. Регистрируясь на платформе, вы соглашаетесь с условиями данного соглашения.\n\nСервис предоставляется «как есть». Мы прилагаем все усилия для обеспечения корректной работы, но не гарантируем бесперебойный доступ 24/7. Администрация оставляет за собой право изменять функциональность сервиса без предварительного уведомления.`,
  },
  {
    icon: Shield,
    title: 'Политика конфиденциальности',
    content: `Мы собираем и обрабатываем минимально необходимый объём персональных данных: электронную почту, имя и историю бронирований.\n\nПароли хранятся исключительно в зашифрованном виде (bcrypt). Мы не передаём персональные данные третьим лицам без вашего согласия. Все данные хранятся на защищённых серверах в соответствии с требованиями ФЗ-152 «О персональных данных».`,
  },
  {
    icon: Scale,
    title: 'Условия бронирования',
    content: `При бронировании авиабилета место резервируется на 15 минут. В течение этого времени необходимо подтвердить (оплатить) бронирование. По истечении срока место автоматически возвращается в продажу.\n\nОтмена неподтверждённого бронирования возможна в любой момент. Для возврата средств за оплаченные билеты обратитесь в службу поддержки. Условия возврата зависят от тарифа авиакомпании.`,
  },
];

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-fg-subtle mb-8">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg-muted">Правовая информация</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-fg mb-2">Правовая информация</h1>
      <p className="text-sm text-fg-muted mb-8">Юридические документы и условия использования сервиса</p>

      <div className="space-y-6">
        {SECTIONS.map(({ icon: Icon, title, content }) => (
          <section key={title} className="bg-dark-800 border border-dark-600 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-sky/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-sky" />
              </div>
              <h2 className="text-base font-semibold text-fg">{title}</h2>
            </div>
            <div className="text-sm text-fg-muted leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </section>
        ))}
      </div>

      <p className="text-xs text-fg-faint mt-8 text-center">
        Последнее обновление: 26 февраля 2026 г.
      </p>
    </div>
  );
}
