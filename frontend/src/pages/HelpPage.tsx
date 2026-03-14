import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LifeBuoy, Plane, ShieldCheck, Ticket, User2 } from 'lucide-react';

const helpTopics = [
  {
    title: 'Покупка и маршрут',
    description: 'Как пройти путь от поиска рейса до подтверждения брони.',
    icon: Plane,
  },
  {
    title: 'Тарифы и правила',
    description: 'Что входит в тариф, как работает обмен и какие условия у багажа.',
    icon: ShieldCheck,
  },
  {
    title: 'Поддержка по поездке',
    description: 'Где искать статус, маршрут и действия после оформления билета.',
    icon: LifeBuoy,
  },
] as const;

const serviceCards = [
  {
    title: 'Перед покупкой',
    description: 'Проверьте условия тарифа, нормы багажа и правила обмена до выбора места.',
    icon: Ticket,
  },
  {
    title: 'После брони',
    description: 'Таймер удержания, подтверждение и изменения по маршруту собраны на странице бронирования.',
    icon: LifeBuoy,
  },
  {
    title: 'Кабинет',
    description: 'В кабинете пассажира доступны последние поездки, билеты и основные настройки аккаунта.',
    icon: User2,
  },
] as const;

const faqItems = [
  {
    question: 'Как проходит бронирование билета?',
    answer:
      'Вы выбираете маршрут на главной, переходите к списку рейсов, затем выбираете место в салоне. После этого создается бронь, а место удерживается 15 минут до подтверждения.',
  },
  {
    question: 'Сколько времени держится бронь?',
    answer:
      'Бронь удерживается 15 минут. Таймер виден на странице бронирования, чтобы было понятно, сколько времени осталось на оплату.',
  },
  {
    question: 'Можно ли отменить бронирование?',
    answer:
      'Да, если бронь еще ожидает оплаты. Для подтвержденных билетов условия обмена и возврата зависят от выбранного тарифа.',
  },
  {
    question: 'Где посмотреть маршрут после покупки?',
    answer:
      'После входа все последние поездки, статусы брони и билет доступны в кабинете пассажира.',
  },
  {
    question: 'Почему выбор места находится после выбора тарифа?',
    answer:
      'Сначала важно увидеть стоимость и условия тарифа. После этого выбор места становится понятным и не перегружает покупку лишними решениями.',
  },
  {
    question: 'Как подтвердить бронирование?',
    answer:
      'После выбора места создается бронь. На странице бронирования можно подтвердить ее, пока действует таймер удержания.',
  },
] as const;

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[24px] border border-[var(--air-border)] bg-[rgba(255,255,255,0.74)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-extrabold text-[var(--air-ink)] md:text-base">{question}</span>
        <ChevronDown className={`h-4 w-4 text-[var(--air-muted)] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 text-sm leading-relaxed text-[var(--air-muted)] md:text-base">{answer}</div>}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="air-page">
      <div className="air-container">
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--air-muted)]">
          <Link to="/" className="font-semibold text-[var(--air-ink)]">
            Главная
          </Link>
          <span>/</span>
          <span>Помощь</span>
        </div>

        <section className="air-dark-card px-5 py-6 md:px-8 md:py-8">
          <div className="air-section-kicker text-[rgba(248,245,238,0.72)] before:bg-[linear-gradient(90deg,var(--air-yellow),transparent)]">
            Помощь
          </div>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold tracking-[-0.05em] md:text-6xl">
            Ответы на вопросы по билетам, тарифам и бронированию
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/72 md:text-base">
            Здесь можно быстро проверить правила тарифа, багаж, бронь и следующий шаг по поездке.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;

            return (
              <div key={topic.title} className="air-link-card px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[rgba(79,130,255,0.1)] text-[var(--air-blue-deep)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">{topic.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-[var(--air-muted)]">{topic.description}</div>
              </div>
            );
          })}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {serviceCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.title} className="air-soft-card p-5 md:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-[rgba(79,130,255,0.1)] text-[var(--air-blue-deep)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-[var(--air-ink)]">{card.title}</div>
                <div className="mt-3 text-sm leading-relaxed text-[var(--air-muted)]">{card.description}</div>
              </div>
            );
          })}
        </section>

        <section className="mt-6 space-y-3">
          {faqItems.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </section>
      </div>
    </div>
  );
}
