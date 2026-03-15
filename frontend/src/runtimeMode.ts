const PREVIEW_FALLBACK_PORTS = new Set(['4173', '5173']);

export type AppMode = 'demo' | 'live';

function detectAppMode(): AppMode {
  const configuredMode = import.meta.env.VITE_APP_MODE?.trim().toLowerCase();

  if (configuredMode === 'demo') {
    return 'demo';
  }

  if (configuredMode === 'live') {
    return 'live';
  }

  if (
    typeof window !== 'undefined' &&
    !import.meta.env.VITE_API_BASE_URL &&
    PREVIEW_FALLBACK_PORTS.has(window.location.port)
  ) {
    return 'demo';
  }

  return 'live';
}

export const APP_MODE = detectAppMode();
export const IS_DEMO_MODE = APP_MODE === 'demo';
export const APP_MODE_LABEL = IS_DEMO_MODE ? 'Demo mode' : 'Live API';
export const APP_MODE_DESCRIPTION = IS_DEMO_MODE
  ? 'Показаны демонстрационные рейсы, локальный аккаунт и имитация подтверждения брони.'
  : 'Приложение работает с реальным API.';
