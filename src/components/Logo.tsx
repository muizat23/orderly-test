import React from 'react';

export interface LogoProps {
  variant?: 'sidebar' | 'light' | 'mark-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeText?: string;
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
}

export const LogoMark: React.FC<{ size?: number | string; isGlass?: boolean }> = ({
  size = 36,
  isGlass = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 hover:scale-105"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="orderly-logo-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14806f" />
          <stop offset="100%" stopColor="#0a463c" />
        </linearGradient>
        <linearGradient id="orderly-logo-top" x1="17" y1="15" x2="47" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="orderly-logo-left" x1="17" y1="23" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0e8376" />
          <stop offset="100%" stopColor="#0a5c53" />
        </linearGradient>
        <linearGradient id="orderly-logo-right" x1="32" y1="31" x2="47" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#08473f" />
          <stop offset="100%" stopColor="#05302a" />
        </linearGradient>
        <linearGradient id="orderly-logo-amber" x1="26" y1="17" x2="40" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="orderly-logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#021c17" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Squircle Housing */}
      {isGlass ? (
        <>
          <rect width="64" height="64" rx="16" fill="#ffffff" fillOpacity="0.14" />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="15.25"
            stroke="#ffffff"
            strokeOpacity="0.28"
            strokeWidth="1.5"
          />
        </>
      ) : (
        <>
          <rect width="64" height="64" rx="16" fill="url(#orderly-logo-bg)" />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="15.25"
            stroke="#ffffff"
            strokeOpacity="0.18"
            strokeWidth="1.5"
          />
        </>
      )}

      {/* 3D Isometric Fulfillment Prism */}
      <g filter="url(#orderly-logo-shadow)">
        {/* Top Face */}
        <path d="M32 14.5L47 23L32 31.5L17 23L32 14.5Z" fill="url(#orderly-logo-top)" />

        {/* Left Face */}
        <path d="M17 23L32 31.5V48L17 39.5V23Z" fill="url(#orderly-logo-left)" />

        {/* Right Face */}
        <path d="M32 31.5L47 23V39.5L32 48V31.5Z" fill="url(#orderly-logo-right)" />

        {/* Amber Fulfillment Tape / Chevron */}
        <path d="M27.5 17L36.5 22.1L32.5 24.4L23.5 19.3L27.5 17Z" fill="url(#orderly-logo-amber)" />
        <path d="M32.5 24.4L36.5 22.1V35L32.5 37.3V24.4Z" fill="#d97706" />

        {/* Verification Check Badge */}
        <circle cx="32" cy="31.5" r="5" fill="#ffffff" />
        <path
          d="M29.8 31.5L31.3 33L34.5 29.8"
          stroke="#0f6b5c"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showBadge = true,
  badgeText = 'v1.0',
  showTagline = false,
  taglineText = 'Fulfillment OS',
  className = '',
}) => {
  const sizeMap = {
    sm: { mark: 28, text: 'text-lg', badge: 'text-[9px] px-1 py-0.2', gap: 'gap-2' },
    md: { mark: 34, text: 'text-xl', badge: 'text-[10px] px-1.5 py-0.5', gap: 'gap-2.5' },
    lg: { mark: 42, text: 'text-2xl', badge: 'text-[11px] px-2 py-0.5', gap: 'gap-3' },
    xl: { mark: 52, text: 'text-3xl', badge: 'text-xs px-2.5 py-0.5', gap: 'gap-3.5' },
  };

  const currentSize = sizeMap[size];
  const isSidebar = variant === 'sidebar';
  const isMarkOnly = variant === 'mark-only';

  if (isMarkOnly) {
    return (
      <div className={`inline-flex items-center ${className}`} title="Orderly">
        <LogoMark size={currentSize.mark} isGlass={isSidebar} />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center select-none ${currentSize.gap} ${className}`}
      aria-label="Orderly Logo"
    >
      <LogoMark size={currentSize.mark} isGlass={isSidebar} />

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-2">
          <span
            className={`font-bold tracking-tight font-sans ${currentSize.text} ${
              isSidebar ? 'text-white' : 'text-[#14302b]'
            }`}
          >
            Orderly
          </span>

          {showBadge && (
            <span
              className={`rounded font-semibold tracking-wide uppercase transition-colors ${
                currentSize.badge
              } ${
                isSidebar
                  ? 'bg-white/20 text-emerald-100 hover:bg-white/25'
                  : 'bg-[#e4f0ed] text-[#0f6b5c] hover:bg-[#d5e7e3]'
              }`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {showTagline && (
          <span
            className={`text-[10px] font-medium tracking-wider uppercase mt-0.5 ${
              isSidebar ? 'text-emerald-200/80' : 'text-[#6b7f7a]'
            }`}
          >
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
};
