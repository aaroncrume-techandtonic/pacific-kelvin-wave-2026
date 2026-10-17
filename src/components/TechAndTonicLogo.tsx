import React from 'react';

interface TechAndTonicLogoProps {
  className?: string;
  variant?: 'full' | 'mark-only' | 'horizontal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  lightText?: boolean;
}

export const TechAndTonicLogo: React.FC<TechAndTonicLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  lightText = true,
}) => {
  // Height and dimensions depending on size
  const iconSizes = {
    sm: { w: 28, h: 28 },
    md: { w: 38, h: 38 },
    lg: { w: 52, h: 52 },
    xl: { w: 72, h: 72 },
  };

  const { w, h } = iconSizes[size];

  // Colors accurately sampled from user image:
  // Atom & "Tech &": Slate/Charcoal #4a5568 / #334155
  // Plant & "Tonic": Organic Sage Green #659b73
  const atomColor = lightText ? '#cbd5e1' : '#334155';
  const leafColor = '#659b73';
  const techColor = lightText ? '#e2e8f0' : '#2d3748';
  const tonicColor = '#659b73';

  const Mark = (
    <svg
      width={w}
      height={h}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
    >
      {/* Central Atom Nucleus */}
      <circle cx="56" cy="62" r="11" fill={atomColor} />

      {/* 3 Electron Orbital Ellipses */}
      {/* Orbit 1: Tilted -30 deg */}
      <ellipse
        cx="56"
        cy="62"
        rx="36"
        ry="17"
        transform="rotate(-30 56 62)"
        stroke={atomColor}
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* Orbit 2: Tilted 30 deg */}
      <ellipse
        cx="56"
        cy="62"
        rx="36"
        ry="17"
        transform="rotate(30 56 62)"
        stroke={atomColor}
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* Orbit 3: Vertical-ish (90 deg) */}
      <ellipse
        cx="56"
        cy="62"
        rx="36"
        ry="17"
        transform="rotate(90 56 62)"
        stroke={atomColor}
        strokeWidth="3.6"
        strokeLinecap="round"
      />

      {/* Electron Spheres on the Orbits */}
      <circle cx="58" cy="24" r="5" fill={atomColor} />
      <circle cx="28" cy="78" r="4.8" fill={atomColor} />
      <circle cx="86" cy="48" r="4.8" fill={atomColor} />

      {/* Organic Botanical Tonic Branch emerging from upper right of the atom */}
      {/* Curved main stem */}
      <path
        d="M 72 44 Q 84 32 94 15"
        stroke={leafColor}
        strokeWidth="3.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Leaf 1: Leftward leaf */}
      <path
        d="M 80 34 C 74 27 75 18 84 18 C 88 23 86 31 80 34 Z"
        fill={leafColor}
      />

      {/* Leaf 2: Rightward leaf */}
      <path
        d="M 86 32 C 95 33 103 27 104 18 C 96 17 89 24 86 32 Z"
        fill={leafColor}
      />

      {/* Leaf 3: Top terminal leaf */}
      <path
        d="M 94 15 C 93 7 98 2 104 3 C 106 10 102 16 94 15 Z"
        fill={leafColor}
      />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{Mark}</div>;
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {Mark}
        <div className="flex items-center gap-1.5 font-sans tracking-tight font-medium">
          <span style={{ color: techColor }} className="font-semibold">
            Tech &amp;
          </span>
          <span style={{ color: tonicColor }} className="font-bold">
            Tonic
          </span>
        </div>
      </div>
    );
  }

  // Full stacked / lockup variant
  return (
    <div className={`inline-flex flex-col items-center text-center ${className}`}>
      {Mark}
      <div className="mt-1 flex items-center gap-1.5 font-sans tracking-tight">
        <span
          style={{ color: techColor }}
          className={`font-semibold ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg'}`}
        >
          Tech &amp;
        </span>
        <span
          style={{ color: tonicColor }}
          className={`font-bold ${size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg'}`}
        >
          Tonic
        </span>
      </div>
    </div>
  );
};
