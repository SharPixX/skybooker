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

  // Fixed dates: Feb 25 – Mar 1, 2026
  function fixedDate(month: number, day: number, hour: number, minute = 0): Date {
    return new Date(Date.UTC(2026, month - 1, day, hour, minute, 0, 0));
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

  const flightData: Array<{ number: string; from: string; to: string; date: Date }> = [];

  // ── 1) Every Russian city → Moscow hub + LED, every day Feb 25–Mar 1 ──
  const moscowHubs = ['SVO', 'DME', 'VKO'];

  for (const code of russianCodes) {
    if (hubs.includes(code)) continue; // hubs will be covered separately

    const idx = russianCodes.indexOf(code);

    for (let day = 25; day <= 28; day++) {
      // Always connect to a Moscow hub (rotate between SVO/DME/VKO per day)
      const mowHub = moscowHubs[(day + idx) % moscowHubs.length];
      const hour = 5 + ((day * 3 + idx * 7) % 17); // 5:00–21:59
      const minute = (idx * 13) % 60;

      // city → Moscow hub
      flightData.push({ number: nextFlightNum(), from: code, to: mowHub, date: fixedDate(2, day, hour, minute) });
      // Moscow hub → city
      flightData.push({ number: nextFlightNum(), from: mowHub, to: code, date: fixedDate(2, day, (hour + 4) % 24, minute) });

      // Every other day, also connect to LED (if city is not in Moscow)
      if (day % 2 === 0) {
        const ledHour = 6 + (idx * 3) % 16;
        flightData.push({ number: nextFlightNum(), from: code, to: 'LED', date: fixedDate(2, day, ledHour, 0) });
        flightData.push({ number: nextFlightNum(), from: 'LED', to: code, date: fixedDate(2, day, (ledHour + 5) % 24, 30) });
      }
    }
    // March 1
    {
      const mowHub = moscowHubs[idx % moscowHubs.length];
      const hour = 6 + (idx * 5) % 16;
      flightData.push({ number: nextFlightNum(), from: code, to: mowHub, date: fixedDate(3, 1, hour, 0) });
      flightData.push({ number: nextFlightNum(), from: mowHub, to: code, date: fixedDate(3, 1, (hour + 5) % 24, 30) });
    }
  }

  // ── 2) Hub-to-hub flights: MOW↔LED every day ──
  for (let day = 25; day <= 28; day++) {
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'LED', date: fixedDate(2, day, 7, 0) });
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'LED', date: fixedDate(2, day, 14, 30) });
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'LED', date: fixedDate(2, day, 21, 0) });
    flightData.push({ number: nextFlightNum(), from: 'LED', to: 'SVO', date: fixedDate(2, day, 8, 0) });
    flightData.push({ number: nextFlightNum(), from: 'LED', to: 'SVO', date: fixedDate(2, day, 15, 30) });
    flightData.push({ number: nextFlightNum(), from: 'LED', to: 'SVO', date: fixedDate(2, day, 22, 0) });
    flightData.push({ number: nextFlightNum(), from: 'DME', to: 'LED', date: fixedDate(2, day, 9, 45) });
    flightData.push({ number: nextFlightNum(), from: 'LED', to: 'DME', date: fixedDate(2, day, 12, 15) });
    flightData.push({ number: nextFlightNum(), from: 'VKO', to: 'LED', date: fixedDate(2, day, 11, 0) });
    flightData.push({ number: nextFlightNum(), from: 'LED', to: 'VKO', date: fixedDate(2, day, 18, 0) });
  }
  // March 1
  flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'LED', date: fixedDate(3, 1, 7, 0) });
  flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'LED', date: fixedDate(3, 1, 14, 0) });
  flightData.push({ number: nextFlightNum(), from: 'LED', to: 'SVO', date: fixedDate(3, 1, 8, 0) });
  flightData.push({ number: nextFlightNum(), from: 'LED', to: 'SVO', date: fixedDate(3, 1, 16, 0) });

  // ── 3) Moscow hubs cross-routes + popular southern routes ──
  for (let day = 25; day <= 28; day++) {
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'AER', date: fixedDate(2, day, 6, 0) });
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'AER', date: fixedDate(2, day, 12, 30) });
    flightData.push({ number: nextFlightNum(), from: 'AER', to: 'SVO', date: fixedDate(2, day, 16, 0) });
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'KRR', date: fixedDate(2, day, 8, 15) });
    flightData.push({ number: nextFlightNum(), from: 'KRR', to: 'SVO', date: fixedDate(2, day, 17, 30) });
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'MRV', date: fixedDate(2, day, 10, 0) });
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'SIP', date: fixedDate(2, day, 13, 45) });
    flightData.push({ number: nextFlightNum(), from: 'SIP', to: 'SVO', date: fixedDate(2, day, 19, 0) });
    flightData.push({ number: nextFlightNum(), from: 'LED', to: 'AER', date: fixedDate(2, day, 9, 0) });
    flightData.push({ number: nextFlightNum(), from: 'AER', to: 'LED', date: fixedDate(2, day, 20, 30) });
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'KGD', date: fixedDate(2, day, 11, 15) });
    flightData.push({ number: nextFlightNum(), from: 'KGD', to: 'SVO', date: fixedDate(2, day, 18, 45) });
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: 'AAQ', date: fixedDate(2, day, 7, 30) });
    flightData.push({ number: nextFlightNum(), from: 'AAQ', to: 'SVO', date: fixedDate(2, day, 15, 0) });
  }

  // ── 4) International from Moscow (Feb 25 – Mar 1) ──
  const intlDests = ['IST', 'AYT', 'DXB', 'AUH', 'BKK', 'HKT', 'MLE', 'PEK', 'HRG', 'SSH',
                     'ALA', 'TSE', 'TAS', 'EVN', 'GYD', 'MSQ', 'FRU', 'DYU'];
  for (let day = 25; day <= 28; day++) {
    for (const dest of intlDests) {
      const hour = 4 + (intlDests.indexOf(dest) * 2) % 20;
      flightData.push({ number: nextFlightNum(), from: 'SVO', to: dest, date: fixedDate(2, day, hour, 0) });
    }
  }
  // March 1 — international
  for (const dest of intlDests) {
    const hour = 5 + (intlDests.indexOf(dest) * 3) % 18;
    flightData.push({ number: nextFlightNum(), from: 'SVO', to: dest, date: fixedDate(3, 1, hour, 0) });
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
      })),
    });
    console.log(`  ✈️  Created ${Math.min(i + BATCH_SIZE, flightData.length)}/${flightData.length} flights...`);
  }

  // Fetch created flights to get their IDs
  const allFlights = await prisma.flight.findMany({
    select: { id: true, flightNumber: true },
  });

  console.log(`✅ Created ${allFlights.length} flights`);

  // ── Seats ──────────────────────────────────────────────────
  const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rows = 5; // 5 rows × 6 seats = 30 seats per flight

  // Create seats in big batches (multiple flights at a time)
  const SEAT_BATCH = 20; // 20 flights × 30 seats = 600 rows per insert
  for (let i = 0; i < allFlights.length; i += SEAT_BATCH) {
    const flightBatch = allFlights.slice(i, i + SEAT_BATCH);
    const allSeats = [];
    for (const flight of flightBatch) {
      for (let row = 1; row <= rows; row++) {
        for (const letter of seatLetters) {
          const seatNumber = `${row}${letter}`;
          const basePrice = flight.flightNumber.startsWith('SU') ? 5500 : 3800;
          const price = basePrice - (row - 1) * 300 + (letter <= 'C' ? 500 : 0);
          allSeats.push({
            flightId: flight.id,
            seatNumber,
            price,
            status: 'AVAILABLE' as const,
          });
        }
      }
    }
    await prisma.seat.createMany({ data: allSeats });
    if ((i + SEAT_BATCH) % 200 === 0 || i + SEAT_BATCH >= allFlights.length) {
      console.log(`  💺 Seats created for ${Math.min(i + SEAT_BATCH, allFlights.length)}/${allFlights.length} flights...`);
    }
  }

  const totalSeats = allFlights.length * seatLetters.length * rows;
  console.log(`✅ Created ${totalSeats} seats (${seatLetters.length * rows} per flight)`);
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
  console.log(`   Date range: 2026-02-25 → 2026-03-01`);
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
