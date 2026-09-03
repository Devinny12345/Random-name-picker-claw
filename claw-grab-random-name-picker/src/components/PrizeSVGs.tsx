import React from 'react';

// Brand palette: Midnight #01173B, Nexgen Navy #0A568C, Orbit Green #8CB23E, Cyan #009CFF

export const Prize1stSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    {/* Shadow */}
    <ellipse cx="100" cy="128" rx="58" ry="8" fill="#01173B" opacity="0.12" />
    {/* Laptop base */}
    <rect x="28" y="88" width="144" height="10" rx="3" fill="#01173B" />
    <rect x="32" y="90" width="136" height="6" rx="2" fill="#0A568C" />
    {/* Laptop screen */}
    <rect x="38" y="18" width="124" height="72" rx="8" fill="#01173B" stroke="#8CB23E" strokeWidth="3" />
    <rect x="44" y="24" width="112" height="56" rx="5" fill="white" />
    {/* Screen content - Nexgen swoosh + text */}
    <rect x="52" y="32" width="96" height="10" rx="3" fill="#0A568C" />
    <rect x="52" y="46" width="70" height="4" rx="2" fill="#009CFF" opacity="0.9" />
    <rect x="52" y="53" width="96" height="3" rx="1.5" fill="#e2e8f0" />
    <rect x="52" y="58" width="84" height="3" rx="1.5" fill="#e2e8f0" />
    <rect x="52" y="63" width="96" height="3" rx="1.5" fill="#e2e8f0" />
    {/* Keyboard */}
    <g opacity="0.9">
      <rect x="48" y="94" width="18" height="5" rx="1" fill="white" opacity="0.9" />
      <rect x="68" y="94" width="18" height="5" rx="1" fill="white" opacity="0.9" />
      <rect x="88" y="94" width="18" height="5" rx="1" fill="white" opacity="0.9" />
      <rect x="108" y="94" width="18" height="5" rx="1" fill="white" opacity="0.9" />
      <rect x="128" y="94" width="18" height="5" rx="1" fill="white" opacity="0.9" />
    </g>
    {/* Mouse */}
    <ellipse cx="162" cy="106" rx="14" ry="10" fill="white" stroke="#01173B" strokeWidth="2" />
    <path d="M162 96 v12" stroke="#01173B" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
    <circle cx="162" cy="100" r="1.5" fill="#009CFF" />
    {/* Mouse pad */}
    <rect x="148" y="112" width="28" height="8" rx="3" fill="#8CB23E" opacity="0.9" />
    {/* Wifi badge for free internet */}
    <g>
      <circle cx="168" cy="28" r="18" fill="#009CFF" stroke="white" strokeWidth="2" />
      <path d="M158 30 q10 -10 20 0" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M161 33 q7 -7 14 0" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="168" cy="36" r="2" fill="white" />
    </g>
    {/* 1st badge */}
    <g>
      <rect x="44" y="12" width="42" height="16" rx="8" fill="#f59e0b" stroke="white" strokeWidth="2" />
      <text x="65" y="23" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="system-ui">1ST</text>
    </g>
  </svg>
);

export const Prize2ndSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <ellipse cx="100" cy="128" rx="52" ry="8" fill="#01173B" opacity="0.12" />
    {/* Tablet */}
    <rect x="48" y="14" width="104" height="96" rx="14" fill="#01173B" stroke="#94a3b8" strokeWidth="3" />
    <rect x="54" y="22" width="92" height="78" rx="8" fill="white" />
    {/* Screen */}
    <rect x="60" y="30" width="80" height="46" rx="4" fill="#0A568C" />
    <rect x="64" y="36" width="72" height="6" rx="2" fill="white" opacity="0.95" />
    <rect x="64" y="46" width="58" height="3" rx="1.5" fill="white" opacity="0.7" />
    <rect x="64" y="51" width="72" height="3" rx="1.5" fill="white" opacity="0.7" />
    <rect x="64" y="56" width="62" height="3" rx="1.5" fill="white" opacity="0.7" />
    {/* Play triangle for TV */}
    <circle cx="100" cy="68" r="8" fill="white" opacity="0.95" />
    <path d="M97 64 l7 4 -7 4 z" fill="#0A568C" />
    {/* Home button */}
    <circle cx="100" cy="108" r="6" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
    <circle cx="100" cy="108" r="2.5" fill="#94a3b8" />
    {/* TV badge */}
    <g>
      <rect x="124" y="78" width="44" height="28" rx="6" fill="#009CFF" stroke="white" strokeWidth="2" />
      <rect x="129" y="84" width="34" height="16" rx="2" fill="white" />
      <path d="M140 87 l8 5 -8 5 z" fill="#009CFF" />
      <rect x="142" y="102" width="8" height="3" rx="1" fill="white" opacity="0.9" />
    </g>
    {/* 2nd badge */}
    <g>
      <rect x="52" y="8" width="42" height="16" rx="8" fill="#94a3b8" stroke="white" strokeWidth="2" />
      <text x="73" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="system-ui">2ND</text>
    </g>
  </svg>
);

export const Prize3rdSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 200 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <ellipse cx="100" cy="128" rx="52" ry="8" fill="#01173B" opacity="0.12" />
    {/* Backpack */}
    <rect x="56" y="20" width="72" height="82" rx="16" fill="#8CB23E" stroke="#01173B" strokeWidth="3" />
    <rect x="62" y="28" width="60" height="30" rx="8" fill="white" />
    <rect x="68" y="36" width="48" height="6" rx="2" fill="#0A568C" />
    <rect x="68" y="46" width="36" height="3" rx="1.5" fill="#e2e8f0" />
    {/* Backpack straps */}
    <path d="M68 20 q-6 -10 6 -12" stroke="#01173B" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M116 20 q6 -10 -6 -12" stroke="#01173B" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Front pocket */}
    <rect x="68" y="64" width="48" height="22" rx="6" fill="#01173B" />
    <rect x="74" y="70" width="36" height="4" rx="2" fill="#009CFF" />
    <rect x="84" y="76" width="16" height="6" rx="2" fill="white" opacity="0.9" />
    {/* Zipper */}
    <line x1="92" y1="28" x2="92" y2="58" stroke="#01173B" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
    {/* Earphones case / earbuds */}
    <g>
      <rect x="128" y="42" width="46" height="34" rx="12" fill="white" stroke="#01173B" strokeWidth="2.5" />
      <rect x="134" y="48" width="34" height="10" rx="5" fill="#01173B" />
      <circle cx="140" cy="62" r="6" fill="#0A568C" stroke="white" strokeWidth="1.5" />
      <circle cx="162" cy="62" r="6" fill="#0A568C" stroke="white" strokeWidth="1.5" />
      <circle cx="140" cy="62" r="2.5" fill="white" opacity="0.9" />
      <circle cx="162" cy="62" r="2.5" fill="white" opacity="0.9" />
      <rect x="144" y="60" width="14" height="4" rx="2" fill="#e2e8f0" />
    </g>
    {/* School supplies peeking from backpack */}
    <g>
      <rect x="70" y="14" width="6" height="16" rx="2" fill="#f59e0b" stroke="white" strokeWidth="1" transform="rotate(-12 70 14)" />
      <rect x="100" y="12" width="6" height="16" rx="2" fill="#009CFF" stroke="white" strokeWidth="1" transform="rotate(12 100 12)" />
      <rect x="84" y="10" width="10" height="12" rx="2" fill="white" stroke="#01173B" strokeWidth="1.5" />
      <line x1="87" y1="14" x2="91" y2="14" stroke="#e2e8f0" strokeWidth="1" />
      <line x1="87" y1="17" x2="91" y2="17" stroke="#e2e8f0" strokeWidth="1" />
    </g>
    {/* Pencil */}
    <rect x="136" y="84" width="30" height="8" rx="2" fill="#f59e0b" stroke="#01173B" strokeWidth="1.5" transform="rotate(-18 136 84)" />
    <polygon points="164,82 170,86 164,90" fill="#01173B" />
    {/* 3rd badge */}
    <g>
      <rect x="58" y="8" width="42" height="16" rx="8" fill="#d97706" stroke="white" strokeWidth="2" />
      <text x="79" y="19" textAnchor="middle" fontSize="9" fontWeight="900" fill="white" fontFamily="system-ui">3RD</text>
    </g>
  </svg>
);

export const PrizeSVG: React.FC<{ prizeId: string; className?: string }> = ({ prizeId, className }) => {
  if (prizeId === '1st') return <Prize1stSVG className={className} />;
  if (prizeId === '2nd') return <Prize2ndSVG className={className} />;
  return <Prize3rdSVG className={className} />;
};
