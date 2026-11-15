import React, { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import {
  loadLottieBundle,
  prefersReducedMotion,
  scheduleIdleTask,
} from '../../utils/lottieLoader';

const LIVE_CHATBOT_JSON_URL = '/assets/aistudio/Live_chatbot_e6648724.json';
const FALLBACK_AGENT_PNG = '/assets/aistudio/agent_bd6c778d.png';

let cachedChatbotJsonPromise: Promise<Record<string, unknown>> | null = null;

const loadChatbotAnimationData = (): Promise<Record<string, unknown>> => {
  if (!cachedChatbotJsonPromise) {
    cachedChatbotJsonPromise = fetch(LIVE_CHATBOT_JSON_URL).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load chatbot animation (${res.status})`);
      }
      return res.json() as Promise<Record<string, unknown>>;
    });
  }
  return cachedChatbotJsonPromise;
};

interface LiveChatbotLottieProps {
  className?: string;
}

export const LiveChatbotLottie: React.FC<LiveChatbotLottieProps> = ({
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [lottieReady, setLottieReady] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let removeListeners: (() => void) | null = null;

    const cancelIdle = scheduleIdleTask(() => {
      if (cancelled) return;
      Promise.all([loadLottieBundle(), loadChatbotAnimationData()])
        .then(([{ lottie }, animationData]) => {
          if (cancelled || !containerRef.current) return;

          const container = containerRef.current;
          container.innerHTML = '';

          const anim = lottie.loadAnimation({
            container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid meet',
              progressiveLoad: true,
            },
          });

          animRef.current = anim;

          const onDomLoaded = () => {
            if (!cancelled) setLottieReady(true);
          };

          anim.addEventListener('DOMLoaded', onDomLoaded);
          if (container.querySelector('svg')) {
            setLottieReady(true);
          }

          const handleVisibilityChange = () => {
            if (!animRef.current) return;
            if (document.hidden) {
              animRef.current.pause();
            } else {
              animRef.current.play();
            }
          };
          document.addEventListener('visibilitychange', handleVisibilityChange);

          removeListeners = () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            anim.removeEventListener('DOMLoaded', onDomLoaded);
          };
        })
        .catch(() => {
          // Retain fallback image cleanly if fetch fails
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
  }, []);

  return (
    <span className={`relative inline-flex items-center justify-center w-full h-full ${className}`}>
      <img
        src={FALLBACK_AGENT_PNG}
        alt="AI Assistant"
        decoding="async"
        className={`w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_10px_20px_rgba(14,165,233,0.28)] transition-opacity duration-200 ${
          lottieReady ? 'opacity-0 absolute inset-0' : 'opacity-100'
        }`}
      />
      <span
        ref={containerRef}
        aria-hidden="true"
        className={`inline-flex items-center justify-center w-full h-full [&>svg]:w-full [&>svg]:h-full pointer-events-none select-none drop-shadow-[0_8px_16px_rgba(14,165,233,0.22)] transition-opacity duration-200 ${
          lottieReady ? 'opacity-100' : 'opacity-0 absolute inset-0'
        }`}
      />
    </span>
  );
};
