import React, { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import {
  loadLottieBundle,
  prefersReducedMotion,
  scheduleIdleTask,
  type StudentLottieModule,
} from '../../utils/lottieLoader';
import type {
  NavLottieName,
  SubjectLottieVariant,
} from '../../utils/studentLottieAnimations';

export type LottiePlayMode = 'always' | 'entrance-and-hover' | 'hover';

interface LottieIconProps {
  kind: 'subject' | 'nav';
  name: SubjectLottieVariant | NavLottieName;
  colorHex?: string;
  sizeClass?: string;
  playMode?: LottiePlayMode;
  speed?: number;
  fallback: React.ReactNode;
  className?: string;
}

export const LottieIcon: React.FC<LottieIconProps> = ({
  kind,
  name,
  colorHex = '#00A896',
  sizeClass = 'w-5 h-5',
  playMode = 'always',
  speed = 1,
  fallback,
  className = '',
}) => {
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const lottieContainerRef = useRef<HTMLSpanElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [lottieReady, setLottieReady] = useState(false);

  // Track viewport visibility so off-screen icons neither mount nor tick
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = wrapperRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { rootMargin: '60px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Lazily mount Lottie during browser idle time once visible
  useEffect(() => {
    if (!isVisible || prefersReducedMotion()) return;

    let cancelled = false;
    let removeListeners: (() => void) | null = null;

    const cancelIdle = scheduleIdleTask(() => {
      if (cancelled) return;
      loadLottieBundle()
        .then(({ lottie, animations }) => {
          if (cancelled || !lottieContainerRef.current) return;

          const container = lottieContainerRef.current;
          container.innerHTML = '';

          const data = resolveAnimationData(animations, kind, name, colorHex);
          const loop = playMode === 'always';

          const anim = lottie.loadAnimation({
            container,
            renderer: 'svg',
            loop,
            autoplay: playMode === 'always' || playMode === 'entrance-and-hover',
            animationData: data,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid meet',
              progressiveLoad: true,
            },
          });

          anim.setSpeed(speed);
          animRef.current = anim;

          const onDomLoaded = () => {
            if (!cancelled) setLottieReady(true);
          };
          const onComplete = () => {
            if (!cancelled && playMode !== 'always') {
              anim.goToAndStop(0, true);
            }
          };

          anim.addEventListener('DOMLoaded', onDomLoaded);
          anim.addEventListener('complete', onComplete);

          // In case DOMLoaded already fired synchronously
          if (container.querySelector('svg')) {
            setLottieReady(true);
          }

          const handleVisibilityChange = () => {
            if (!animRef.current) return;
            if (document.hidden) {
              animRef.current.pause();
            } else if (playMode === 'always') {
              animRef.current.play();
            }
          };
          document.addEventListener('visibilitychange', handleVisibilityChange);

          removeListeners = () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            anim.removeEventListener('DOMLoaded', onDomLoaded);
            anim.removeEventListener('complete', onComplete);
          };
        })
        .catch(() => {
          // Silently retain crisp static SVG fallback if lazy chunk fails
        });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      removeListeners?.();
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
      setLottieReady(false);
    };
  }, [isVisible, kind, name, colorHex, playMode, speed]);

  // Pause continuous loops when scrolled offscreen
  useEffect(() => {
    const anim = animRef.current;
    if (!anim) return;
    if (!isVisible) {
      anim.pause();
    } else if (playMode === 'always' && !document.hidden) {
      anim.play();
    }
  }, [isVisible, playMode]);

  const handleReplay = () => {
    if (playMode === 'always') return;
    const anim = animRef.current;
    if (anim) {
      anim.goToAndPlay(0, true);
    }
  };

  return (
    <span
      ref={wrapperRef}
      onMouseEnter={handleReplay}
      onFocus={handleReplay}
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass} ${className}`}
    >
      {/* Instant static SVG fallback shown with zero delay before Lottie mounts */}
      <span
        className={`inline-flex items-center justify-center w-full h-full transition-opacity duration-150 ${
          lottieReady ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'
        }`}
      >
        {fallback}
      </span>

      {/* Lazy-mounted Lottie SVG canvas */}
      <span
        ref={lottieContainerRef}
        className={`inline-flex items-center justify-center w-full h-full [&>svg]:w-full [&>svg]:h-full transition-opacity duration-150 ${
          lottieReady ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'
        }`}
        aria-hidden="true"
      />
    </span>
  );
};

function resolveAnimationData(
  animations: StudentLottieModule,
  kind: 'subject' | 'nav',
  name: SubjectLottieVariant | NavLottieName,
  colorHex: string
) {
  if (kind === 'subject') {
    return animations.getSubjectLottieData(name as SubjectLottieVariant);
  }
  return animations.getStudentNavLottieData(name as NavLottieName, colorHex);
}
