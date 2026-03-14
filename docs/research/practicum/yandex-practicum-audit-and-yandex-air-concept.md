# Аудит Yandex Practicum и новая концепция Yandex Air

Исследование выполнено 14 марта 2026 года с помощью Playwright на основе реальных страниц `practicum.yandex.ru`.

## 1. Исследование

### Изученные экраны

1. Главная: `https://practicum.yandex.ru/`
2. Каталог курсов: `https://practicum.yandex.ru/catalog/`
3. Категория "Программирование": `https://practicum.yandex.ru/catalog/programming/`
4. Лендинг курса "Фронтенд-разработчик": `https://practicum.yandex.ru/frontend-developer/`
5. Экран конверсии после CTA: `https://practicum.yandex.ru/profile/frontend-developer/` -> редирект в Yandex ID

### Скриншоты

- `homepage-full.png`
- `catalog-full.png`
- `catalog-programming-full.png`
- `course-frontend-full.png`
- `cta-auth-screen.png`

### Карта экранов

1. Главная
   Брендовая витрина с категориями, скидкой, карьерными аргументами, отзывами, работодателями и формой вопроса.
2. Каталог
   Поисковый и фильтровый хаб, где пользователь переходит от общего интереса к конкретному курсу.
3. Категория
   Более сфокусированная витрина с боковыми фильтрами и длинным гридом карточек.
4. Лендинг курса
   Отдельная продуктовая посадочная с narrative-структурой, сильным social proof и FAQ.
5. Авторизация
   После главного CTA пользователь попадает не в мягкий lead-flow, а в жёсткий auth gate через Yandex ID.

### Пользовательский путь

1. Пользователь попадает на главную и видит крупный value proposition: образование, которое повышает востребованность.
2. Далее он уходит либо в категории, либо в каталог, либо сразу в продающие промо-блоки.
3. В каталоге начинается сравнительный режим: фильтры, грид, поиск, выбор направления.
4. На лендинге курса включается глубокая продажа через зарплаты, AI-модуль, карьерный сервис, программу и тарифы.
5. Нажатие на главный CTA переводит пользователя в авторизацию, а не в короткую консультационную или заявку-форму.

### Основные UI-паттерны

- Плотный лендинговый сторителлинг с большим количеством секций.
- Постоянное чередование тёмных и светлых подложек, карточек и промо-баннеров.
- Массовое использование карточек с крупными цифрами, короткими доказательствами и CTA.
- Большой каталог с фильтрами слева и сеткой карточек справа.
- Повторяющиеся промо-врезки со скидкой и "бесплатной частью".
- Social proof через отзывы, кейсы, бренды работодателей, рейтинги, статистику.
- CTA-повторы по ходу всей страницы.
- FAQ в формате аккордеона ближе к низу воронки.

### Структура компонентов по страницам

#### Главная

- Header: бренд, блог, B2B, dropdown-навигация, каталог
- Hero: главный заголовок, поиск по навыкам/курсам, promo-card
- Category rail: направления, быстрые входы по сценариям
- Discount promo block
- Free trial block
- Career results block
- AI value block
- Value proposition grid
- Employer trust block
- Community block
- Stories/testimonials carousel
- Question form
- Mega footer

#### Каталог

- Compact header
- Promo ribbon
- Category tabs
- Search
- Sidebar filters
- Course grid
- Support/help cards
- Skills cloud
- Footer

#### Лендинг курса

- Sticky section-nav
- Hero with course premise, start dates and CTA
- Proof bar with ratings and employment metric
- Benefits list
- Salary and demand section
- Free trial teaser
- AI-upskill section
- Learning process section
- Career support section
- Portfolio / skills outcome section
- Trust metrics slider
- Employers strip
- Real projects section
- Faculty / support team
- Program breakdown
- Pricing / tariffs
- FAQ
- Breadcrumbs and footer

## 2. Анализ

### Что работает хорошо

- Очень сильный outcome-first narrative: карьерный результат продаётся лучше самого курса.
- Высокая плотность доказательств: цифры, рейтинги, кейсы, работодатели, исследования, отзывы.
- Хорошая глубина каталога: много способов зайти в выбор курса.
- Категоризация понятна для массовой аудитории.
- Курсовые лендинги хорошо подстраиваются под intent пользователя и продают один конкретный сценарий.
- Повторяющиеся CTA не дают пользователю "потеряться" на длинной странице.

### Что выглядит устаревшим

- Главная перегружена и визуально шумная: много разнородных карточек, промо-баннеров и конкурирующих сообщений.
- Вся система местами ощущается как набор кампаний, а не как единый премиальный продукт.
- Каталог визуально ближе к маркетплейсу карточек, чем к curated learning experience.
- Многие секции выглядят heavy и "лендингово", а не продуктово.
- Слишком много однотипных прямоугольных блоков без ясной иерархии редких, действительно ключевых моментов.
- Переход в auth gate после CTA слишком резкий и эмоционально ломает воронку.

### Что можно усилить

- Снизить визуальный шум и сделать иерархию сообщений более премиальной.
- Перевести experience из "много блоков обо всём" в "один выверенный маршрут к новой карьере".
- Сделать каталог более кураторским: меньше ощущение списка, больше ощущение маршрутов и сценариев.
- Смягчить конверсию: сначала короткий маршрут/консультация, потом уже авторизация.
- Увеличить роль персонализации: маршрут, темп, стартовая точка, career concierge.
- Сделать преподавателей и карьерную команду частью бренда, а не просто supporting section.

### Визуальный стиль

- Основа бренда сильная, но система перегружена акциями и разноформатными блоками.
- Есть узнаваемость Яндекса, но не всегда есть ощущение high-end digital education.
- Визуальный язык больше про "объяснить всё", чем про "вести уверенно".

### UX

- UX информативный, но не всегда спокойный.
- Главная требует большого когнитивного усилия: на одном экране пользователь получает слишком много сигналов.
- В каталоге высокая полезность, но слабее чувство guided choice.
- CTA flow после курса можно сделать заметно мягче.

### Информационная архитектура

- IA покрывает почти все потребности: бренд, каталог, курсы, доверие, карьера, community.
- Но слои конкурируют друг с другом.
- Главной странице не хватает одного доминирующего сценария, вокруг которого подчинены остальные.

### Positioning и value proposition

- Positioning сейчас: практичное онлайн-образование для смены карьеры и роста в digital/IT.
- Самое сильное обещание: не просто учёба, а рост востребованности и ускорение трудоустройства.
- Потенциал усиления: превратить "онлайн-курсы" в "маршрут в новую карьеру с премиальным сопровождением".

### Блоки конверсии

- Хорошо работают: hero promise, free trial, salary proof, employment metrics, employer logos, FAQ, promo discounts.
- Слабое место: финальный шаг в воронке слишком быстро уходит в авторизацию.
- Можно усилить: lead capture через route-planner, diagnostic quiz, concierge-style consultation, прозрачный next step.

## 3. Новая концепция: Yandex Air

### Идея

Образовательный продукт превращается в премиальный бренд-перелёт в новую карьеру. Не "курсы", а выверенный маршрут от текущей точки до нового профессионального статуса.

### Ключевой образ

`Yandex Air` — это бизнес-класс в мире карьерного образования:

- технологично
- уверенно
- минималистично
- с ощущением маршрута, навигации и безупречного сервиса

### Бренд-принципы

- Спокойная уверенность вместо крика и перегруза
- Curated experience вместо "огромной витрины"
- Career concierge вместо безличного каталога
- Премиальная точность вместо лендингового шума
- Journey thinking вместо разрозненных блоков

### Визуальное направление

- Палитра: midnight navy, cloud ivory, warm metal, signal orange
- Типографика: чистый modern sans + редкие serif-акценты для ощущения статуса
- Формы: мягкие радиусы, thin borders, layered glass, route-lines, cockpit panels
- Motion: медленное движение по орбите, runway glows, glide-in transitions, marquee trust-line

## 4. Полная переработка блоков

### 1. Hero

- Цель блока: мгновенно продать идею карьерного перелёта и показать персонализированный маршрут.
- UX-логика: сначала promise, затем быстрый выбор маршрута, потом короткое подтверждение ценности.
- Визуальный стиль: large editorial headline, cockpit summary card, layered gradients, flight-board метафора.
- Micro-interactions: hover на CTA, переключение маршрутов, мягкий glow активного направления.
- Motion-дизайн: медленный drift background, shimmer по route-line, staggered entry для panel cards.

### 2. Навигация

- Цель блока: удерживать ориентацию в длинной landing-page.
- UX-логика: компактный sticky rail с якорями на главные разделы.
- Визуальный стиль: glass cockpit bar, thin border, premium contrast.
- Micro-interactions: active underline, subtle hover lift, CTA capsule.
- Motion-дизайн: sticky nav с blur и мягким opacity shift при скролле.

### 3. Блок курсов

- Цель блока: показать curated learning routes вместо бесконечного списка карточек.
- UX-логика: не больше нескольких hero-tracks, понятные различия по результату, длительности и формату.
- Визуальный стиль: крупные route-cards, статусные метки, tool-badges, глубокие градиенты.
- Micro-interactions: tilt/raise on hover, shine pass по карточке, highlight выбранного маршрута.
- Motion-дизайн: staggered reveal, animated accent line, subtle background orbit.

### 4. Блок карьерных результатов

- Цель блока: объяснить, как обучение превращается в оффер.
- UX-логика: runway timeline от boarding до landing.
- Визуальный стиль: linear path, numbered stages, evidence cards.
- Micro-interactions: progress glow on hover, stage emphasis.
- Motion-дизайн: travelling gradient along the runway.

### 5. Блок преподавателей

- Цель блока: очеловечить бренд и показать силу команды сопровождения.
- UX-логика: не просто "преподаватели", а crew: lead mentor, hiring captain, AI navigator, design director.
- Визуальный стиль: premium portrait cards, editorial captions, service badges.
- Micro-interactions: portrait zoom, info reveal, badge shimmer.
- Motion-дизайн: slow parallax drift on media areas.

### 6. Блок доверия

- Цель блока: подтвердить, что выпускников хотят сильные компании.
- UX-логика: сначала employer-line, затем 2-3 коротких кейса.
- Визуальный стиль: monochrome brand strip, clean case panels, restrained accents.
- Micro-interactions: marquee movement, hover spotlight on case.
- Motion-дизайн: infinite horizontal logo drift.

### 7. CTA блоки

- Цель блока: перевести интерес в действие без жёсткого auth wall.
- UX-логика: сначала "соберите маршрут", потом консультация или next step.
- Визуальный стиль: concierge desk / route planner panel.
- Micro-interactions: chip selection, live summary update, confirmation pulse.
- Motion-дизайн: animated summary refresh and subtle seat-light pulse.

### 8. Футер

- Цель блока: завершить experience ощущением большого бренда, а не техничного подвала.
- UX-логика: короткий recap маршрута, навигация, контакты, правовая зона.
- Визуальный стиль: quiet luxury, large spacing, route coordinates.
- Micro-interactions: link underline reveal, icon drift.
- Motion-дизайн: минимальный ambient glow, без лишней анимации.

## 5. Новая дизайн-система

### Цвета

- `Midnight Ink`: основной фон
- `Runway Navy`: фон секций и панелей
- `Cloud Ivory`: светлые surface-секции
- `Warm Metal`: premium outline / secondary accent
- `Signal Orange`: action accent
- `Altitude Blue`: secondary highlight

### Типографика

- Display: выразительный serif-акцент для hero и ключевых слов
- Body/UI: строгий современный sans для интерфейса, табличных данных, навигации и карточек
- Капсульные подписи: uppercase micro-labels с увеличенным tracking

### Layout

- Один hero canvas с asymmetry и layered cockpit-panels
- Чередование full-bleed секций и curated content containers
- Большие отступы и редкие, но сильные визуальные акценты

### UI-компоненты

- Sticky cockpit nav
- Route selector chips
- Premium CTA buttons
- Track cards
- Outcome timeline cards
- Crew cards
- Trust marquee
- Planner panel
- Data badges

### Motion

- Fade-up on entry
- Orbital ambient drift
- Route shimmer
- Logo marquee
- Gentle hover lift
- CTA pulse

## 6. Решение для этого проекта

В рамках текущего репозитория новая концепция реализуется как премиальный home-screen на `/`, чтобы:

1. сохранить контекст текущего проекта,
2. получить рабочий frontend-концепт,
3. не потерять возможность дальше наращивать остальные маршруты.

Новая домашняя страница должна:

- работать как флагманский marketing landing
- быть визуально целостной
- использовать язык "маршрута в карьеру"
- содержать все ключевые блоки из задания
- стать базой для последующей переработки остальных страниц
