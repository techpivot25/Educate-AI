import type { LottiePlayer } from 'lottie-web';

export type StudentLottieModule = typeof import('./studentLottieAnimations');

export interface LoadedLottieBundle {
  lottie: LottiePlayer;
  animations: StudentLottieModule;
}

let cachedPromise: Promise<LoadedLottieBundle> | null = null;
let bundleLoaded = false;

export const isLottieBundleReady = (): boolean => bundleLoaded;

export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Schedules a callback during browser idle time so initial paint, hydration,
 * and interactive readiness are never delayed.
 */
export const scheduleIdleTask = (cb: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  if (bundleLoaded) {
    const rafId = window.requestAnimationFrame(cb);
    return () => window.cancelAnimationFrame(rafId);
  }
  const win = window as Window & {
    requestIdleCallback?: (callback: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof win.requestIdleCallback === 'function') {
    const id = win.requestIdleCallback(cb, { timeout: 250 });
    return () => win.cancelIdleCallback?.(id);
  }
  const timer = window.setTimeout(cb, 80);
  return () => window.clearTimeout(timer);
};

/**
 * Dynamically loads lottie_light (SVG-only lightweight player) and animation
 * schemas in a separate code-split chunk once, cached for all icons.
 */
export const loadLottieBundle = (): Promise<LoadedLottieBundle> => {
  if (!cachedPromise) {
    cachedPromise = Promise.all([
      import('lottie-web/build/player/lottie_light'),
      import('./studentLottieAnimations'),
    ]).then(([lottieMod, animMod]) => {
      bundleLoaded = true;
      const player = (lottieMod as unknown as { default?: LottiePlayer }).default || (lottieMod as unknown as LottiePlayer);
      return {
        lottie: player,
        animations: animMod,
      };
    });
  }
  return cachedPromise;
};
