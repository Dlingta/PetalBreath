/**
 * Gentle mobile haptic feedback engine using the Web Vibration API.
 * Designed for eyes-closed postpartum breathing & pelvic floor guidance,
 * with distinct tactile patterns for contraction, hold, relaxation, and quick pulses.
 */

const HAPTICS_PREF_KEY = 'petalbreath_haptics_enabled_v1';

export function isVibrationSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  );
}

export function loadVibrationPreference(): boolean {
  try {
    const saved = localStorage.getItem(HAPTICS_PREF_KEY);
    if (saved === null) return true;
    return saved === 'true';
  } catch {
    return true;
  }
}

export function saveVibrationPreference(enabled: boolean): void {
  try {
    localStorage.setItem(HAPTICS_PREF_KEY, String(enabled));
  } catch {
    // ignore storage errors
  }
}

function vibrateSafe(pattern: number | number[]): void {
  if (!isVibrationSupported()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // ignore browser restrictions gracefully
  }
}

export const haptics = {
  isSupported: isVibrationSupported,

  /** Subtle tap when user enables vibration toggle */
  toggleConfirm(): void {
    vibrateSafe(40);
  },

  /** Slow contraction (呼气 · 轻提): warm rising double-pulse */
  slowContract(): void {
    vibrateSafe([110, 65, 170]);
  },

  /** Slow hold (稳住 · 保持): tiny reassuring steady tick */
  slowHold(): void {
    vibrateSafe(32);
  },

  /** Slow relaxation (吸气 · 彻底松开): two light fading droplet taps */
  slowRelax(): void {
    vibrateSafe([45, 75, 28]);
  },

  /** Quick pulse contract (轻收): crisp short tap */
  quickContract(): void {
    vibrateSafe(65);
  },

  /** Quick pulse relax (松开): feather-light release tap */
  quickRelax(): void {
    vibrateSafe(24);
  },

  /** Pure relaxation inhale (吸气): gentle swell */
  relaxInhale(): void {
    vibrateSafe(55);
  },

  /** Pure relaxation exhale (呼气): soft settling double-tap */
  relaxExhale(): void {
    vibrateSafe([35, 70, 35]);
  },

  /** Gentle raindrop tap for rest-day exemption */
  restRain(): void {
    vibrateSafe([28, 60, 22]);
  },

  /** Warm completion celebration pattern */
  bloomComplete(): void {
    vibrateSafe([45, 70, 55, 70, 95]);
  },

  /** Cancel any ongoing vibration cleanly */
  cancel(): void {
    vibrateSafe(0);
  },
};
