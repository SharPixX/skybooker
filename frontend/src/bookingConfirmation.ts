import type { BookingConfirmationMode } from './types';

export function canConfirmBookings(mode: BookingConfirmationMode) {
  return mode !== 'disabled';
}

export function getBookingConfirmationLabel(mode: BookingConfirmationMode) {
  if (mode === 'demo') {
    return 'Демо-подтверждение';
  }

  if (mode === 'manual') {
    return 'Ручное подтверждение';
  }

  return 'Подтверждение отключено';
}

export function getBookingConfirmationDescription(mode: BookingConfirmationMode) {
  if (mode === 'demo') {
    return 'В демо-режиме подтверждение брони имитируется локально, без платежного шлюза.';
  }

  if (mode === 'manual') {
    return 'В live-сборке платежный шлюз не подключен: бронь подтверждается вручную только для демонстрации сценария.';
  }

  return 'В этой live-сборке подтверждение брони отключено, пока не подключен платежный шлюз.';
}
