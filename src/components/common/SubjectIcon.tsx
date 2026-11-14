import React, { useId } from 'react';

export type SubjectIconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SubjectIconProps {
  subject: string;
  size?: SubjectIconSize;
  className?: string;
}

const SIZE_CLASSES: Record<SubjectIconSize, string> = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-7 h-7',
  lg: 'w-9 h-9',
  xl: 'w-11 h-11',
};

type SubjectVariant =
  | 'physics'
  | 'chemistry'
  | 'maths'
  | 'biology'
  | 'coding'
  | 'history'
  | 'geography'
  | 'english'
  | 'general';

export const resolveSubjectVariant = (subject: string): SubjectVariant => {
  const norm = (subject || '').toLowerCase();
  if (norm.includes('phys')) return 'physics';
  if (norm.includes('chem')) return 'chemistry';
  if (
    norm.includes('math') ||
    norm.includes('algeb') ||
    norm.includes('geom') ||
    norm.includes('calc') ||
    norm.includes('trig')
  ) {
    return 'maths';
  }
  if (norm.includes('bio') || norm.includes('genet') || norm.includes('botan') || norm.includes('zool')) {
    return 'biology';
  }
  if (norm.includes('comp') || norm.includes('cod') || norm.includes('python') || norm.includes('cs')) {
    return 'coding';
  }
  if (norm.includes('hist') || norm.includes('civic') || norm.includes('social')) {
    return 'history';
  }
  if (norm.includes('geo') || norm.includes('earth')) {
    return 'geography';
  }
  if (norm.includes('eng') || norm.includes('lit') || norm.includes('lang')) {
    return 'english';
  }
  return 'general';
};

export const SubjectIcon: React.FC<SubjectIconProps> = ({
  subject,
  size = 'md',
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');
  const variant = resolveSubjectVariant(subject);
  const sizeClass = SIZE_CLASSES[size];

  if (variant === 'physics') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} shrink-0 ${className}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${uid}-phys-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-phys-core`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="20" fill={`url(#${uid}-phys-glow)`} />
        {/* Faint vertical orbit */}
        <ellipse
          cx="24"
          cy="24"
          rx="7.5"
          ry="18"
          stroke="#C4B5FD"
          strokeWidth="1.6"
          opacity="0.8"
        />
        {/* Tilted solid orbit */}
        <ellipse
          cx="24"
          cy="24"
          rx="18.5"
          ry="7.5"
          transform="rotate(38 24 24)"
          stroke="#8B5CF6"
          strokeWidth="2"
        />
        {/* Tilted dashed orbit */}
        <ellipse
          cx="24"
          cy="24"
          rx="18.5"
          ry="7.5"
          transform="rotate(-38 24 24)"
          stroke="#7C3AED"
          strokeWidth="2"
          strokeDasharray="3.2 2.8"
          strokeLinecap="round"
        />
        {/* Orbiting electrons */}
        <circle cx="24" cy="6.2" r="2" fill="#DDD6FE" stroke="#8B5CF6" strokeWidth="1" />
        <circle cx="34.5" cy="14" r="2.7" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="13.5" cy="33.5" r="2.5" fill="#A78BFA" stroke="#FFFFFF" strokeWidth="0.9" />
        {/* Nucleus */}
        <circle cx="24" cy="24" r="6" fill="#DDD6FE" opacity="0.55" />
        <circle cx="24" cy="24" r="4.4" fill={`url(#${uid}-phys-core)`} />
        <circle cx="22.6" cy="22.5" r="1.2" fill="#FFFFFF" opacity="0.85" />
      </svg>
    );
  }

  if (variant === 'chemistry') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} shrink-0 ${className}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-chem-glass`} x1="24" y1="8" x2="24" y2="41" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id={`${uid}-chem-liquid`} x1="24" y1="24" x2="24" y2="41" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="39" rx="14" ry="3.5" fill="#10B981" opacity="0.16" />
        {/* Flask glass body */}
        <path
          d="M19 8.5H29C29.8 8.5 30.2 9.5 29.5 10.2L28.5 11.2V18.8L37.8 34.4C39.2 36.8 37.5 39.8 34.7 39.8H13.3C10.5 39.8 8.8 36.8 10.2 34.4L19.5 18.8V11.2L18.5 10.2C17.8 9.5 18.2 8.5 19 8.5Z"
          fill={`url(#${uid}-chem-glass)`}
          stroke="#059669"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Emerald liquid */}
        <path
          d="M16.2 26.2C18.5 24.9 21.3 26.8 24.2 26.1C27.1 25.4 29.4 24.7 31.8 26.2L36.5 34.2C37.5 35.9 36.3 38 34.3 38H13.7C11.7 38 10.5 35.9 11.5 34.2L16.2 26.2Z"
          fill={`url(#${uid}-chem-liquid)`}
        />
        {/* Top lip highlight */}
        <path d="M18.8 9.5H29.2" stroke="#10B981" strokeWidth="2.4" strokeLinecap="round" />
        {/* Bubbles */}
        <circle cx="20.5" cy="33.5" r="1.7" fill="#D1FAE5" />
        <circle cx="27.2" cy="30.8" r="1.3" fill="#A7F3D0" />
        <circle cx="24.2" cy="35.3" r="1" fill="#FFFFFF" opacity="0.9" />
        <circle cx="24.8" cy="15.8" r="1.2" fill="#10B981" opacity="0.7" />
        <circle cx="22.3" cy="21" r="0.9" fill="#059669" opacity="0.65" />
      </svg>
    );
  }

  if (variant === 'maths') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} shrink-0 ${className}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-math-fill`} x1="24" y1="14" x2="24" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#FEF3C7" />
          </linearGradient>
        </defs>
        {/* Protractor semi-circle */}
        <path
          d="M6.5 34.5C6.5 24.835 14.335 17 24 17C33.665 17 41.5 24.835 41.5 34.5H6.5Z"
          fill={`url(#${uid}-math-fill)`}
          stroke="#D97706"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Inner cutout semi-arc */}
        <path
          d="M14.5 34.5C14.5 29.253 18.753 25 24 25C29.247 25 33.5 29.253 33.5 34.5"
          stroke="#F59E0B"
          strokeWidth="1.5"
          strokeOpacity="0.65"
        />
        {/* Radial degree tick marks */}
        <line x1="24" y1="17.5" x2="24" y2="21.2" stroke="#D97706" strokeWidth="1.7" strokeLinecap="round" />
        <line x1="15.2" y1="19.6" x2="17" y2="22.6" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="32.8" y1="19.6" x2="31" y2="22.6" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="9.8" y1="26.2" x2="12.8" y2="27.8" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="38.2" y1="26.2" x2="35.2" y2="27.8" stroke="#D97706" strokeWidth="1.6" strokeLinecap="round" />
        {/* Angled measuring needle */}
        <line
          x1="24"
          y1="34.5"
          x2="35.8"
          y2="16.8"
          stroke="#F59E0B"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Pivot */}
        <circle cx="24" cy="34.5" r="3" fill="#B45309" stroke="#FEF3C7" strokeWidth="1" />
      </svg>
    );
  }

  if (variant === 'biology') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} shrink-0 ${className}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${uid}-bio-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-bio-s1`} x1="16" y1="8" x2="32" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#A21CAF" />
          </linearGradient>
          <linearGradient id={`${uid}-bio-s2`} x1="32" y1="8" x2="16" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="24" rx="13" ry="18" fill={`url(#${uid}-bio-glow)`} />
        {/* Base-pair rungs */}
        <line x1="17" y1="11.5" x2="31" y2="11.5" stroke="#FB7185" strokeWidth="2.1" strokeLinecap="round" />
        <line x1="17.5" y1="17.2" x2="30.5" y2="17.2" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
        <line x1="17.5" y1="30.8" x2="30.5" y2="30.8" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" />
        <line x1="17" y1="36.5" x2="31" y2="36.5" stroke="#FB7185" strokeWidth="2.1" strokeLinecap="round" />
        {/* DNA Strand 1 */}
        <path
          d="M16 7.5C16 14.5 32 17.5 32 24C32 30.5 16 33.5 16 40.5"
          stroke={`url(#${uid}-bio-s1)`}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* DNA Strand 2 */}
        <path
          d="M32 7.5C32 14.5 16 17.5 16 24C16 30.5 32 33.5 32 40.5"
          stroke={`url(#${uid}-bio-s2)`}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (variant === 'coding') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} shrink-0 ${className}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-code-bg`} x1="8" y1="10" x2="40" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
        </defs>
        <rect
          x="7.5"
          y="10.5"
          width="33"
          height="27"
          rx="6"
          fill={`url(#${uid}-code-bg)`}
          stroke="#2563EB"
          strokeWidth="2.2"
        />
        <line x1="7.5" y1="17.5" x2="40.5" y2="17.5" stroke="#93C5FD" strokeWidth="1.6" />
        <circle cx="12.5" cy="14" r="1.3" fill="#EF4444" />
        <circle cx="16.5" cy="14" r="1.3" fill="#F59E0B" />
        <circle cx="20.5" cy="14" r="1.3" fill="#10B981" />
        <path d="M18.5 23.5L13.5 27.8L18.5 32" stroke="#2563EB" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M29.5 23.5L34.5 27.8L29.5 32" stroke="#2563EB" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="25.8" y1="22.5" x2="22.2" y2="33" stroke="#0EA5E9" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === 'history') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} shrink-0 ${className}`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-hist-bg`} x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
        </defs>
        <path
          d="M13 10.5H33C35.2 10.5 37 12.3 37 14.5V33.5C37 35.7 35.2 37.5 33 37.5H13C10.8 37.5 9 35.7 9 33.5V14.5C9 12.3 10.8 10.5 13 10.5Z"
          fill={`url(#${uid}-hist-bg)`}
          stroke="#B45309"
          strokeWidth="2.1"
        />
        <line x1="15.5" y1="17.5" x2="30.5" y2="17.5" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <line x1="15.5" y1="23.5" x2="30.5" y2="23.5" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <line x1="15.5" y1="29.5" x2="25.5" y2="29.5" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
        <circle cx="31.5" cy="30.5" r="3" fill="#B45309" />
      </svg>
    );
  }

  if (variant === 'geography') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClass} shrink-0 ${className}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${uid}-geo-sea`} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="24" r="15.5" fill={`url(#${uid}-geo-sea)`} stroke="#0284C7" strokeWidth="2.1" />
        <path
          d="M15.5 16.5C18 15 21 16 21.5 18.8C22 21 19 22 18.5 24.5C18 27 14 27 12.5 24.5C11 22 13 18 15.5 16.5Z"
          fill="#10B981"
          opacity="0.85"
        />
        <path
          d="M27.5 21.5C30 20.5 34.5 22 35 25.5C35.5 29 31.5 32.5 28.5 31C26 29.8 25 22.5 27.5 21.5Z"
          fill="#10B981"
          opacity="0.85"
        />
        <ellipse cx="24" cy="24" rx="7" ry="15.5" stroke="#0284C7" strokeWidth="1.4" strokeOpacity="0.6" />
        <line x1="9" y1="24" x2="39" y2="24" stroke="#0284C7" strokeWidth="1.4" strokeOpacity="0.6" />
      </svg>
    );
  }

  // General / English / General Science — crisp open book matching the attachment's "General" icon
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClass} shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M24 14.5C20 11.8 14.2 11.2 9.5 12.6V35.2C14.2 33.8 20 34.4 24 37.2C28 34.4 33.8 33.8 38.5 35.2V12.6C33.8 11.2 28 11.8 24 14.5Z"
        fill="#E2E8F0"
        stroke="#1E293B"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <line x1="24" y1="14.5" x2="24" y2="37.2" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="13.5" y1="19" x2="19.5" y2="19.8" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="13.5" y1="24" x2="19.5" y2="24.8" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="28.5" y1="19.8" x2="34.5" y2="19" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="28.5" y1="24.8" x2="34.5" y2="24" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
      {variant === 'english' && (
        <path d="M31.5 11.8V21.5L33.5 19.8L35.5 21.5V12.2" fill="#0D9488" />
      )}
    </svg>
  );
};
