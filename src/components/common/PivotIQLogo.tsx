import React from 'react';

interface PivotIQLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
  textClassName?: string;
  subtitle?: string;
}

/**
 * PivotIQ Brand Logo
 * Updated to use the requested brand colors:
 * - Teal / Emerald: #00A896
 * - Deep Navy / Midnight Blue: #0D1B3E
 * Clean geometric interconnected "P-Q" pivot node emblem without orange.
 */
export const PivotIQLogo: React.FC<PivotIQLogoProps> = ({
  className = '',
  size = 36,
  variant = 'auto',
  showText = false,
  textClassName = '',
  subtitle,
}) => {
  const numericSize = typeof size === 'number' ? size : parseInt(size.toString(), 10) || 36;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={numericSize}
        height={numericSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md select-none transition-transform hover:scale-105"
      >
        <defs>
          {/* Main Brand Gradient - Deep Navy #0D1B3E to Teal #00A896 */}
          <linearGradient id="pivot_iq_grad_main" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0D1B3E" />
            <stop offset="50%" stopColor="#0E4461" />
            <stop offset="100%" stopColor="#00A896" />
          </linearGradient>

          {/* Accent Ribbon Gradient - Teal to Cyan */}
          <linearGradient id="pivot_iq_grad_accent" x1="90" y1="15" x2="10" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#02C39A" />
            <stop offset="50%" stopColor="#00A896" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>

          {/* Ambient Glow */}
          <radialGradient id="pivot_iq_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00A896" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0D1B3E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0D1B3E" stopOpacity="0" />
          </radialGradient>

          {/* Filter */}
          <filter id="pivot_iq_shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#00A896" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Hexagonal Shield Container with #0D1B3E base and #00A896 border */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="#0D1B3E"
          stroke="#00A896"
          strokeWidth="2.5"
        />

        {/* Ambient Radial Core */}
        <circle cx="50" cy="50" r="32" fill="url(#pivot_iq_glow)" opacity="0.45" />

        {/* Pivot Loop 1: Left Loop (P-arm pivot) */}
        <path
          d="M 32 30 
             C 44 20, 68 20, 72 36 
             C 75 48, 62 56, 50 56
             C 38 56, 25 64, 28 76
             C 31 88, 55 88, 68 76"
          stroke="#00A896"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pivot_iq_shadow)"
        />

        {/* Pivot Loop 2: Overlapping Inverse Helix */}
        <path
          d="M 68 30
             C 56 20, 32 22, 28 36
             C 25 48, 38 54, 50 54
             C 62 54, 75 62, 72 74
             C 68 86, 46 86, 32 76"
          stroke="url(#pivot_iq_grad_accent)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Pivot Node (Synaptic intelligence nucleus) */}
        <circle cx="50" cy="55" r="5.5" fill="#FFFFFF" />
        <circle cx="50" cy="55" r="3" fill="#00A896" />

        {/* Top-Right IQ Spark */}
        <path
          d="M 72 26 L 74 30 L 78 32 L 74 34 L 72 38 L 70 34 L 66 32 L 70 30 Z"
          fill="#02C39A"
          opacity="0.95"
        />
      </svg>

      {showText && (
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-semibold tracking-tight text-lg ${
                textClassName ||
                (variant === 'light'
                  ? 'text-white'
                  : variant === 'dark'
                  ? 'text-[#0D1B3E]'
                  : 'text-[#0D1B3E] dark:text-white')
              }`}
            >
              Pivot<span className="text-[#00A896]">IQ</span>
            </span>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-none">
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PivotIQLogo;
