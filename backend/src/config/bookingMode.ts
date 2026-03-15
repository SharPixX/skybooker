export type BookingConfirmationMode = 'manual' | 'disabled';

function detectBookingConfirmationMode(): BookingConfirmationMode {
  const configuredMode = process.env.BOOKING_CONFIRMATION_MODE?.trim().toLowerCase();

  if (configuredMode === 'disabled') {
    return 'disabled';
  }

  return 'manual';
}

export const BOOKING_CONFIRMATION_MODE = detectBookingConfirmationMode();
export const IS_MANUAL_CONFIRMATION_ENABLED = BOOKING_CONFIRMATION_MODE === 'manual';

export const BOOKING_CONFIRMATION_DESCRIPTION =
  BOOKING_CONFIRMATION_MODE === 'manual'
    ? 'Manual booking confirmation is enabled for demo and portfolio review purposes.'
    : 'Booking confirmation is disabled until a payment provider is connected.';
