import dotenv from 'dotenv';
dotenv.config();

import prisma from './lib/prisma';

/**
 * Seed the database with airports, flights and seats.
 * Run with: npx ts-node src/seed.ts
 */
async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data (order matters due to foreign keys)
  await prisma.outboxEvent.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.flight.deleteMany();
  await prisma.airport.deleteMany();

  // ── ALL Russian airports + international ────────────────────
  const airportsData = [
    // ─── Москва ───
    { code: 'SVO', name: 'Шереметьево',             city: 'Москва',              country: 'Россия' },
    { code: 'DME', name: 'Домодедово',               city: 'Москва',              country: 'Россия' },
    { code: 'VKO', name: 'Внуково',                  city: 'Москва',              country: 'Россия' },
    // ─── Санкт-Петербург ───
    { code: 'LED', name: 'Пулково',                  city: 'Санкт-Петербург',     country: 'Россия' },
    // ─── Юг ───
    { code: 'AER', name: 'Адлер',                    city: 'Сочи',                country: 'Россия' },
    { code: 'KRR', name: 'Пашковский',               city: 'Краснодар',           country: 'Россия' },
    { code: 'ROV', name: 'Платов',                    city: 'Ростов-на-Дону',      country: 'Россия' },
    { code: 'MRV', name: 'Минеральные Воды',          city: 'Минеральные Воды',    country: 'Россия' },
    { code: 'VOG', name: 'Гумрак',                   city: 'Волгоград',           country: 'Россия' },
    { code: 'MCX', name: 'Уйташ',                    city: 'Махачкала',           country: 'Россия' },
    { code: 'OGZ', name: 'Беслан',                   city: 'Владикавказ',         country: 'Россия' },
    { code: 'NAL', name: 'Нальчик',                  city: 'Нальчик',             country: 'Россия' },
    { code: 'STW', name: 'Ставрополь',                city: 'Ставрополь',          country: 'Россия' },
    { code: 'ASF', name: 'Нариманово',                city: 'Астрахань',           country: 'Россия' },
    { code: 'ELT', name: 'Элиста',                   city: 'Элиста',              country: 'Россия' },
    { code: 'GRV', name: 'Грозный-Северный',          city: 'Грозный',             country: 'Россия' },
    // ─── Крым ───
    { code: 'SIP', name: 'Симферополь',               city: 'Симферополь',          country: 'Россия' },
    // ─── Поволжье ───
    { code: 'KZN', name: 'Казань',                    city: 'Казань',              country: 'Россия' },
    { code: 'UFA', name: 'Уфа',                      city: 'Уфа',                country: 'Россия' },
    { code: 'KUF', name: 'Курумоч',                  city: 'Самара',              country: 'Россия' },
    { code: 'GOJ', name: 'Стригино',                  city: 'Нижний Новгород',     country: 'Россия' },
    { code: 'SAR', name: 'Гагарин',                  city: 'Саратов',             country: 'Россия' },
    { code: 'PNZ', name: 'Пенза',                    city: 'Пенза',               country: 'Россия' },
    { code: 'ULV', name: 'Ульяновск Восточный',       city: 'Ульяновск',           country: 'Россия' },
    { code: 'CSY', name: 'Чебоксары',                 city: 'Чебоксары',           country: 'Россия' },
    { code: 'JOK', name: 'Йошкар-Ола',               city: 'Йошкар-Ола',          country: 'Россия' },
    { code: 'REN', name: 'Оренбург (Центральный)',     city: 'Оренбург',            country: 'Россия' },
    // ─── Урал ───
    { code: 'SVX', name: 'Кольцово',                 city: 'Екатеринбург',        country: 'Россия' },
    { code: 'CEK', name: 'Баландино',                city: 'Челябинск',           country: 'Россия' },
    { code: 'PEE', name: 'Большое Савино',            city: 'Пермь',               country: 'Россия' },
    { code: 'MQF', name: 'Магнитогорск',              city: 'Магнитогорск',        country: 'Россия' },
    { code: 'KRO', name: 'Курган',                   city: 'Курган',              country: 'Россия' },
    // ─── Западная Сибирь ───
    { code: 'OVB', name: 'Толмачёво',                city: 'Новосибирск',         country: 'Россия' },
    { code: 'OMS', name: 'Омск-Центральный',          city: 'Омск',                country: 'Россия' },
    { code: 'TJM', name: 'Рощино',                   city: 'Тюмень',              country: 'Россия' },
    { code: 'TOF', name: 'Богашёво',                  city: 'Томск',               country: 'Россия' },
    { code: 'BAX', name: 'Барнаул',                   city: 'Барнаул',             country: 'Россия' },
    { code: 'KEJ', name: 'Кемерово',                  city: 'Кемерово',            country: 'Россия' },
    { code: 'NOZ', name: 'Спиченково',                city: 'Новокузнецк',         country: 'Россия' },
    { code: 'SGC', name: 'Сургут',                    city: 'Сургут',              country: 'Россия' },
    { code: 'NJC', name: 'Нижневартовск',             city: 'Нижневартовск',       country: 'Россия' },
    { code: 'NYA', name: 'Ноябрьск',                  city: 'Ноябрьск',            country: 'Россия' },
    { code: 'NOJ', name: 'Нояр-Ала',                  city: 'Ноябрьск (Нояр)',      country: 'Россия' },
    { code: 'HMA', name: 'Ханты-Мансийск',            city: 'Ханты-Мансийск',      country: 'Россия' },
    { code: 'NYM', name: 'Надым',                     city: 'Надым',               country: 'Россия' },
    { code: 'SLY', name: 'Салехард',                  city: 'Салехард',            country: 'Россия' },
    { code: 'NSK', name: 'Норильск (Алыкель)',         city: 'Норильск',            country: 'Россия' },
    // ─── Восточная Сибирь ───
    { code: 'KJA', name: 'Емельяново',                city: 'Красноярск',          country: 'Россия' },
    { code: 'IKT', name: 'Иркутск',                  city: 'Иркутск',             country: 'Россия' },
    { code: 'UUD', name: 'Байкал',                    city: 'Улан-Удэ',            country: 'Россия' },
    { code: 'HTA', name: 'Чита (Кадала)',              city: 'Чита',                country: 'Россия' },
    { code: 'BTK', name: 'Братск',                    city: 'Братск',              country: 'Россия' },
    { code: 'AAQ', name: 'Витязево',                  city: 'Анапа',               country: 'Россия' },
    { code: 'ABK', name: 'Абакан',                    city: 'Абакан',              country: 'Россия' },
    { code: 'KYZ', name: 'Кызыл',                    city: 'Кызыл',               country: 'Россия' },
    // ─── Дальний Восток ───
    { code: 'VVO', name: 'Кневичи',                  city: 'Владивосток',         country: 'Россия' },
    { code: 'KHV', name: 'Хабаровск-Новый',           city: 'Хабаровск',           country: 'Россия' },
    { code: 'YKS', name: 'Якутск',                   city: 'Якутск',              country: 'Россия' },
    { code: 'PKC', name: 'Елизово',                   city: 'Петропавловск-Камч.',  country: 'Россия' },
    { code: 'UUS', name: 'Хомутово',                  city: 'Южно-Сахалинск',      country: 'Россия' },
    { code: 'GDX', name: 'Сокол',                    city: 'Магадан',             country: 'Россия' },
    { code: 'BQS', name: 'Игнатьево',                city: 'Благовещенск',        country: 'Россия' },
    // ─── Центр / Северо-Запад ───
    { code: 'KGD', name: 'Храброво',                 city: 'Калининград',         country: 'Россия' },
    { code: 'VGD', name: 'Вологда',                   city: 'Вологда',             country: 'Россия' },
    { code: 'ARH', name: 'Талаги',                    city: 'Архангельск',         country: 'Россия' },
    { code: 'MMK', name: 'Мурманск',                  city: 'Мурманск',            country: 'Россия' },
    { code: 'PES', name: 'Бесовец',                   city: 'Петрозаводск',        country: 'Россия' },
    { code: 'VKT', name: 'Воркута',                   city: 'Воркута',             country: 'Россия' },
    { code: 'SCW', name: 'Сыктывкар',                 city: 'Сыктывкар',           country: 'Россия' },
    { code: 'KSZ', name: 'Котлас',                    city: 'Котлас',              country: 'Россия' },
    { code: 'VOZ', name: 'Чертовицкое',               city: 'Воронеж',             country: 'Россия' },
    { code: 'BZK', name: 'Брянск',                    city: 'Брянск',              country: 'Россия' },
    { code: 'LPK', name: 'Липецк',                   city: 'Липецк',              country: 'Россия' },
    { code: 'KLF', name: 'Грабцево',                  city: 'Калуга',              country: 'Россия' },
    { code: 'TBW', name: 'Тамбов (Донское)',           city: 'Тамбов',              country: 'Россия' },
    { code: 'IGT', name: 'Магас',                     city: 'Магас',               country: 'Россия' },
    { code: 'NBC', name: 'Бегишево',                  city: 'Нижнекамск',          country: 'Россия' },
    { code: 'IJK', name: 'Ижевск',                   city: 'Ижевск',              country: 'Россия' },
    { code: 'KVX', name: 'Победилово',                city: 'Киров',               country: 'Россия' },
    // ─── СНГ ───
    { code: 'ALA', name: 'Алматы',                   city: 'Алматы',              country: 'Казахстан' },
    { code: 'TSE', name: 'Нурсултан Назарбаев',       city: 'Астана',              country: 'Казахстан' },
    { code: 'TAS', name: 'Ташкент',                  city: 'Ташкент',             country: 'Узбекистан' },
    { code: 'EVN', name: 'Звартноц',                 city: 'Ереван',              country: 'Армения' },
    { code: 'GYD', name: 'Гейдар Алиев',             city: 'Баку',                country: 'Азербайджан' },
    { code: 'MSQ', name: 'Минск-2',                  city: 'Минск',               country: 'Беларусь' },
    { code: 'FRU', name: 'Манас',                    city: 'Бишкек',              country: 'Киргизия' },
    { code: 'DYU', name: 'Душанбе',                  city: 'Душанбе',             country: 'Таджикистан' },
    // ─── Международные (популярные) ───
    { code: 'IST', name: 'Стамбул',                  city: 'Стамбул',             country: 'Турция' },
    { code: 'AYT', name: 'Анталья',                  city: 'Анталья',             country: 'Турция' },
    { code: 'DXB', name: 'Дубай',                    city: 'Дубай',               country: 'ОАЭ' },
    { code: 'AUH', name: 'Абу-Даби',                 city: 'Абу-Даби',            country: 'ОАЭ' },
    { code: 'BKK', name: 'Суварнабхуми',             city: 'Бангкок',             country: 'Таиланд' },
    { code: 'HKT', name: 'Пхукет',                   city: 'Пхукет',              country: 'Таиланд' },
    { code: 'MLE', name: 'Мале',                     city: 'Мале',                country: 'Мальдивы' },
    { code: 'PEK', name: 'Пекин',                    city: 'Пекин',               country: 'Китай' },
    { code: 'HRG', name: 'Хургада',                  city: 'Хургада',             country: 'Египет' },
    { code: 'SSH', name: 'Шарм-эль-Шейх',            city: 'Шарм-эль-Шейх',       country: 'Египет' },
  ];

  const airports: Record<string, string> = {}; // code -> id

  for (const a of airportsData) {
    const airport = await prisma.airport.create({ data: a });
    airports[a.code] = airport.id;
  }

  console.log(`✅ Created ${airportsData.length} airports`);

  // ── Helpers ────────────────────────────────────────────────

  // Dates: March 3 – March 20, 2026 (future dates)
  function fixedDate(month: number, day: number, hour: number, minute = 0): Date {
    return new Date(Date.UTC(2026, month - 1, day, hour, minute, 0, 0));
  }

  /** Estimate flight duration in minutes based on from/to codes */
  function estimateDuration(from: string, to: string): number {
    const farEast = new Set(['VVO', 'KHV', 'YKS', 'PKC', 'UUS', 'GDX', 'BQS']);
    const siberia = new Set(['OVB', 'OMS', 'TJM', 'TOF', 'BAX', 'KEJ', 'NOZ', 'SGC', 'NJC', 'NYA', 'NOJ', 'HMA', 'NYM', 'SLY', 'NSK', 'KJA', 'IKT', 'UUD', 'HTA', 'BTK', 'ABK', 'KYZ']);
    const ural = new Set(['SVX', 'CEK', 'PEE', 'MQF', 'KRO']);
    const intl = new Set(['IST', 'AYT', 'DXB', 'AUH', 'BKK', 'HKT', 'MLE', 'PEK', 'HRG', 'SSH']);
    const cis = new Set(['ALA', 'TSE', 'TAS', 'EVN', 'GYD', 'MSQ', 'FRU', 'DYU']);

    if (intl.has(from) || intl.has(to)) {
      // International: 3.5h-11h
      if (['BKK', 'HKT', 'MLE', 'PEK'].includes(from) || ['BKK', 'HKT', 'MLE', 'PEK'].includes(to)) return 540 + Math.floor(Math.random() * 120); // 9-11h
      if (['DXB', 'AUH', 'HRG', 'SSH'].includes(from) || ['DXB', 'AUH', 'HRG', 'SSH'].includes(to)) return 300 + Math.floor(Math.random() * 60); // 5-6h
      return 210 + Math.floor(Math.random() * 60); // IST, AYT: 3.5-4.5h
    }
    if (cis.has(from) || cis.has(to)) return 180 + Math.floor(Math.random() * 120); // 3-5h
    if ((farEast.has(from) || farEast.has(to)) && !(farEast.has(from) && farEast.has(to))) return 480 + Math.floor(Math.random() * 120); // 8-10h
    if ((siberia.has(from) || siberia.has(to)) && !(siberia.has(from) && siberia.has(to))) return 240 + Math.floor(Math.random() * 60); // 4-5h
    if ((ural.has(from) || ural.has(to)) && !(ural.has(from) && ural.has(to))) return 150 + Math.floor(Math.random() * 60); // 2.5-3.5h
    // Short domestic
    return 90 + Math.floor(Math.random() * 90); // 1.5-3h
  }

  // All Russian airport codes (to ensure every city has flights)
  const russianCodes = airportsData
    .filter((a) => a.country === 'Россия')
    .map((a) => a.code);

  // Major hubs that connect to smaller cities
  const hubs = ['SVO', 'DME', 'VKO', 'LED'];

  // Airline prefixes
  const airlines = ['SU', 'S7', 'DP', 'UT', 'N4', 'WZ', 'IO', '5N', 'YC', 'FV'];

  // Build flight list algorithmically
  let flightCounter = 1000;
  function nextFlightNum(): string {
    const airline = airlines[flightCounter % airlines.length];
    const num = flightCounter++;
    return `${airline}-${num}`;
  }

  const flightData: Array<{ number: string; from: string; to: string; date: Date; arrivalDate: Date }> = [];

  // Helper to push flight with auto-calculated arrival
  function addFlight(number: string, from: string, to: string, date: Date) {
    const durationMs = estimateDuration(from, to) * 60 * 1000;
    const arrivalDate = new Date(date.getTime() + durationMs);
    flightData.push({ number, from, to, date, arrivalDate });
  }

  // ── 1) Every Russian city → Moscow hub + LED, Mar 3–14 ──
  const moscowHubs = ['SVO', 'DME', 'VKO'];

  for (const code of russianCodes) {
    if (hubs.includes(code)) continue;

    const idx = russianCodes.indexOf(code);

    for (let day = 3; day <= 14; day++) {
      const mowHub = moscowHubs[(day + idx) % moscowHubs.length];
      const hour = 5 + ((day * 3 + idx * 7) % 17);
      const minute = (idx * 13) % 60;

      addFlight(nextFlightNum(), code, mowHub, fixedDate(3, day, hour, minute));
      addFlight(nextFlightNum(), mowHub, code, fixedDate(3, day, (hour + 4) % 24, minute));

      if (day % 2 === 0) {
        const ledHour = 6 + (idx * 3) % 16;
        addFlight(nextFlightNum(), code, 'LED', fixedDate(3, day, ledHour, 0));
        addFlight(nextFlightNum(), 'LED', code, fixedDate(3, day, (ledHour + 5) % 24, 30));
      }
    }
    // Mar 15-20
    for (let day = 15; day <= 20; day++) {
      const mowHub = moscowHubs[idx % moscowHubs.length];
      const hour = 6 + (idx * 5 + day) % 16;
      addFlight(nextFlightNum(), code, mowHub, fixedDate(3, day, hour, 0));
      addFlight(nextFlightNum(), mowHub, code, fixedDate(3, day, (hour + 5) % 24, 30));
    }
  }

  // ── 2) Hub-to-hub flights: MOW↔LED every day ──
  for (let day = 3; day <= 20; day++) {
    addFlight(nextFlightNum(), 'SVO', 'LED', fixedDate(3, day, 7, 0));
    addFlight(nextFlightNum(), 'SVO', 'LED', fixedDate(3, day, 14, 30));
    addFlight(nextFlightNum(), 'SVO', 'LED', fixedDate(3, day, 21, 0));
    addFlight(nextFlightNum(), 'LED', 'SVO', fixedDate(3, day, 8, 0));
    addFlight(nextFlightNum(), 'LED', 'SVO', fixedDate(3, day, 15, 30));
    addFlight(nextFlightNum(), 'LED', 'SVO', fixedDate(3, day, 22, 0));
    addFlight(nextFlightNum(), 'DME', 'LED', fixedDate(3, day, 9, 45));
    addFlight(nextFlightNum(), 'LED', 'DME', fixedDate(3, day, 12, 15));
    addFlight(nextFlightNum(), 'VKO', 'LED', fixedDate(3, day, 11, 0));
    addFlight(nextFlightNum(), 'LED', 'VKO', fixedDate(3, day, 18, 0));
  }

  // ── 3) Moscow hubs cross-routes + popular southern routes (Mar 3-14) ──
  for (let day = 3; day <= 14; day++) {
    addFlight(nextFlightNum(), 'SVO', 'AER', fixedDate(3, day, 6, 0));
    addFlight(nextFlightNum(), 'SVO', 'AER', fixedDate(3, day, 12, 30));
    addFlight(nextFlightNum(), 'AER', 'SVO', fixedDate(3, day, 16, 0));
    addFlight(nextFlightNum(), 'SVO', 'KRR', fixedDate(3, day, 8, 15));
    addFlight(nextFlightNum(), 'KRR', 'SVO', fixedDate(3, day, 17, 30));
    addFlight(nextFlightNum(), 'SVO', 'MRV', fixedDate(3, day, 10, 0));
    addFlight(nextFlightNum(), 'SVO', 'SIP', fixedDate(3, day, 13, 45));
    addFlight(nextFlightNum(), 'SIP', 'SVO', fixedDate(3, day, 19, 0));
    addFlight(nextFlightNum(), 'LED', 'AER', fixedDate(3, day, 9, 0));
    addFlight(nextFlightNum(), 'AER', 'LED', fixedDate(3, day, 20, 30));
    addFlight(nextFlightNum(), 'SVO', 'KGD', fixedDate(3, day, 11, 15));
    addFlight(nextFlightNum(), 'KGD', 'SVO', fixedDate(3, day, 18, 45));
    addFlight(nextFlightNum(), 'SVO', 'AAQ', fixedDate(3, day, 7, 30));
    addFlight(nextFlightNum(), 'AAQ', 'SVO', fixedDate(3, day, 15, 0));
  }

  // ── 4) International from Moscow (Mar 3-20) ──
  const intlDests = ['IST', 'AYT', 'DXB', 'AUH', 'BKK', 'HKT', 'MLE', 'PEK', 'HRG', 'SSH',
                     'ALA', 'TSE', 'TAS', 'EVN', 'GYD', 'MSQ', 'FRU', 'DYU'];
  for (let day = 3; day <= 20; day++) {
    for (const dest of intlDests) {
      const hour = 4 + (intlDests.indexOf(dest) * 2) % 20;
      addFlight(nextFlightNum(), 'SVO', dest, fixedDate(3, day, hour, 0));
      // Return flights every other day
      if (day % 2 === 0) {
        addFlight(nextFlightNum(), dest, 'SVO', fixedDate(3, day, (hour + 8) % 24, 30));
      }
    }
  }

  console.log(`📊 Total flights to create: ${flightData.length}`);

  // ── Create flights using createMany in batches ──
  const BATCH_SIZE = 50;

  for (let i = 0; i < flightData.length; i += BATCH_SIZE) {
    const batch = flightData.slice(i, i + BATCH_SIZE);
    await prisma.flight.createMany({
      data: batch.map((f) => ({
        flightNumber: f.number,
        departureAirportId: airports[f.from],
        destinationAirportId: airports[f.to],
        departureTime: f.date,
        arrivalTime: f.arrivalDate,
      })),
    });
    console.log(`  ✈️  Created ${Math.min(i + BATCH_SIZE, flightData.length)}/${flightData.length} flights...`);
  }

  // Fetch created flights to get their IDs
  const allFlights = await prisma.flight.findMany({
    select: { id: true, flightNumber: true },
  });

  console.log(`✅ Created ${allFlights.length} flights`);

  // ── Seats — Boeing layouts ──────────────────────────────────

  // Boeing 737-800: Business (rows 1-4, 2+2: A,C,D,F) + Economy (rows 5-30, 3+3: A,B,C,D,E,F)
  // Boeing 777-300: Business (rows 1-5, 2+2+2: A,C,D,G,H,K) + Economy (rows 6-45, 3+4+3: A,B,C,D,E,F,G,H,J,K)

  interface SeatDef {
    seatNumber: string;
    class: string;
    row: number;
    letter: string;
    price: number;
  }

  function generateBoeing737Seats(flightNumber: string): SeatDef[] {
    const seats: SeatDef[] = [];
    const isSU = flightNumber.startsWith('SU');

    // Business class: rows 1-4, seats A,C,D,F (no middle B,E — wider spacing)
    for (let row = 1; row <= 4; row++) {
      for (const letter of ['A', 'C', 'D', 'F']) {
        const basePrice = isSU ? 18000 : 14000;
        const price = basePrice - (row - 1) * 500 + (letter <= 'C' ? 200 : 0);
        seats.push({
          seatNumber: `${row}${letter}`,
          class: 'business',
          row,
          letter,
          price,
        });
      }
    }

    // Economy class: rows 5-30, seats A,B,C,D,E,F (3+3)
    for (let row = 5; row <= 30; row++) {
      for (const letter of ['A', 'B', 'C', 'D', 'E', 'F']) {
        const basePrice = isSU ? 5500 : 3800;
        // Window seats (A,F) cost more, exit rows (12, 25) cost more
        const windowBonus = (letter === 'A' || letter === 'F') ? 400 : 0;
        const exitBonus = (row === 12 || row === 25) ? 800 : 0;
        const rowDiscount = Math.floor((row - 5) / 5) * 200; // further back = cheaper
        const price = basePrice + windowBonus + exitBonus - rowDiscount;
        seats.push({
          seatNumber: `${row}${letter}`,
          class: 'economy',
          row,
          letter,
          price,
        });
      }
    }

    return seats; // 16 business + 156 economy = 172 total
  }

  function generateBoeing777Seats(flightNumber: string): SeatDef[] {
    const seats: SeatDef[] = [];

    // Business class: rows 1-5, seats A,C,D,G,H,K (2+2+2, wide aisles)
    for (let row = 1; row <= 5; row++) {
      for (const letter of ['A', 'C', 'D', 'G', 'H', 'K']) {
        const basePrice = 35000;
        const price = basePrice - (row - 1) * 1000 + (letter === 'A' || letter === 'K' ? 500 : 0);
        seats.push({
          seatNumber: `${row}${letter}`,
          class: 'business',
          row,
          letter,
          price,
        });
      }
    }

    // Economy class: rows 6-45, seats A,B,C,D,E,F,G,H,J,K (3+4+3, no letter I)
    for (let row = 6; row <= 45; row++) {
      for (const letter of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K']) {
        const basePrice = 12000;
        const windowBonus = (letter === 'A' || letter === 'K') ? 600 : 0;
        const exitBonus = (row === 20 || row === 35) ? 1200 : 0;
        const rowDiscount = Math.floor((row - 6) / 8) * 400;
        const price = basePrice + windowBonus + exitBonus - rowDiscount;
        seats.push({
          seatNumber: `${row}${letter}`,
          class: 'economy',
          row,
          letter,
          price,
        });
      }
    }

    return seats; // 30 business + 400 economy = 430 total
  }

  // Determine aircraft type: international = 777, domestic = 737
  const internationalCodes = new Set(['IST', 'AYT', 'DXB', 'AUH', 'BKK', 'HKT', 'MLE', 'PEK', 'HRG', 'SSH',
    'ALA', 'TSE', 'TAS', 'EVN', 'GYD', 'MSQ', 'FRU', 'DYU']);

  // Update aircraft type for international flights
  const flightNumberToType: Record<string, string> = {};
  for (const f of flightData) {
    const isIntl = internationalCodes.has(f.from) || internationalCodes.has(f.to);
    flightNumberToType[f.number] = isIntl ? 'Boeing 777-300' : 'Boeing 737-800';
  }

  // Update flights with aircraft type
  for (const flight of allFlights) {
    const type = flightNumberToType[flight.flightNumber];
    if (type && type !== 'Boeing 737-800') {
      await prisma.flight.update({
        where: { id: flight.id },
        data: { aircraftType: type },
      });
    }
  }

  // Create seats in batches
  let totalSeats = 0;
  const SEAT_BATCH = 10; // flights per batch
  for (let i = 0; i < allFlights.length; i += SEAT_BATCH) {
    const flightBatch = allFlights.slice(i, i + SEAT_BATCH);
    const allSeats: Array<{
      flightId: string;
      seatNumber: string;
      class: string;
      row: number;
      letter: string;
      price: number;
      status: 'AVAILABLE';
    }> = [];

    for (const flight of flightBatch) {
      const type = flightNumberToType[flight.flightNumber] || 'Boeing 737-800';
      const seatDefs = type === 'Boeing 777-300'
        ? generateBoeing777Seats(flight.flightNumber)
        : generateBoeing737Seats(flight.flightNumber);

      for (const s of seatDefs) {
        allSeats.push({
          flightId: flight.id,
          seatNumber: s.seatNumber,
          class: s.class,
          row: s.row,
          letter: s.letter,
          price: s.price,
          status: 'AVAILABLE' as const,
        });
      }
      totalSeats += seatDefs.length;
    }

    await prisma.seat.createMany({ data: allSeats });
    if ((i + SEAT_BATCH) % 100 === 0 || i + SEAT_BATCH >= allFlights.length) {
      console.log(`  💺 Seats created for ${Math.min(i + SEAT_BATCH, allFlights.length)}/${allFlights.length} flights...`);
    }
  }

  console.log(`✅ Created ${totalSeats} seats`);
  console.log(`   Boeing 737-800: 172 seats (16 business + 156 economy)`);
  console.log(`   Boeing 777-300: 430 seats (30 business + 400 economy)`);
  console.log('');

  // Coverage verification
  const coveredFrom = new Set(flightData.map((f) => f.from));
  const coveredTo = new Set(flightData.map((f) => f.to));
  const allRussian = new Set(russianCodes);
  const missingFrom = [...allRussian].filter((c) => !coveredFrom.has(c));
  const missingTo = [...allRussian].filter((c) => !coveredTo.has(c));

  console.log(`📊 Stats:`);
  console.log(`   Airports: ${airportsData.length}`);
  console.log(`   Russian airports: ${russianCodes.length}`);
  console.log(`   Flights: ${allFlights.length}`);
  console.log(`   Seats: ${totalSeats}`);
  console.log(`   Date range: 2026-03-03 → 2026-03-20`);
  if (missingFrom.length > 0) console.log(`   ⚠️  No outgoing flights: ${missingFrom.join(', ')}`);
  if (missingTo.length > 0) console.log(`   ⚠️  No incoming flights: ${missingTo.join(', ')}`);
  if (missingFrom.length === 0 && missingTo.length === 0) {
    console.log(`   ✅ Every Russian city has incoming AND outgoing flights!`);
  }
  console.log('');
  console.log('🎉 Seed complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
