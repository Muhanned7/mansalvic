import React from 'react';

/* ==========================================================================
   Duolingo-Style Animated Leaf Character 1: Leo (The IT Staffing Scout)
   ========================================================================== */
export function DuolingoStaffingCharacter() {
  return (
    <div className="duolingo-character-box" title="Leo - IT Staffing Scout">
      <svg viewBox="0 0 100 120" className="duo-character-svg" aria-hidden="true">
        <defs>
          <linearGradient id="duoSkin1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
          <linearGradient id="duoHoodie1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="duoHair1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="50" cy="115" rx="30" ry="4" fill="#059669" opacity="0.25" />

        {/* Body / Hoodie */}
        <path d="M 28 85 Q 50 78 72 85 L 76 110 Q 50 114 24 110 Z" fill="url(#duoHoodie1)" />
        <path d="M 46 86 L 54 86 L 52 108 L 48 108 Z" fill="#38bdf8" />
        
        {/* Head */}
        <circle cx="50" cy="52" r="30" fill="url(#duoSkin1)" />

        {/* Hair */}
        <path d="M 20 48 Q 24 24 50 24 Q 76 24 80 48 Q 66 32 50 34 Q 34 32 20 48 Z" fill="url(#duoHair1)" />
        <path d="M 45 22 Q 52 14 62 20 Q 56 24 45 22 Z" fill="url(#duoHair1)" />

        {/* Cute Ears */}
        <circle cx="21" cy="54" r="5.5" fill="#fca5a5" />
        <circle cx="79" cy="54" r="5.5" fill="#fca5a5" />

        {/* Cheerful Blush */}
        <ellipse cx="33" cy="62" rx="5" ry="3" fill="#f87171" opacity="0.5" />
        <ellipse cx="67" cy="62" rx="5" ry="3" fill="#f87171" opacity="0.5" />

        {/* Smart Round Glasses */}
        <circle cx="38" cy="50" r="11" fill="none" stroke="#0f172a" strokeWidth="2.5" />
        <circle cx="62" cy="50" r="11" fill="none" stroke="#0f172a" strokeWidth="2.5" />
        <line x1="49" y1="50" x2="51" y2="50" stroke="#0f172a" strokeWidth="2.5" />

        {/* Animated Blinking Big Eyes */}
        <g className="duo-eye-blink">
          <ellipse cx="38" cy="50" rx="4" ry="5.5" fill="#0f172a" />
          <circle cx="39.5" cy="48" r="1.8" fill="#ffffff" />
          <ellipse cx="62" cy="50" rx="4" ry="5.5" fill="#0f172a" />
          <circle cx="63.5" cy="48" r="1.8" fill="#ffffff" />
        </g>

        {/* Happy Smile */}
        <path d="M 44 64 Q 50 71 56 64" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" />

        {/* Animated Waving Hand - firmly attached to shoulder */}
        <g className="duo-arm-wave">
          <circle cx="26" cy="84" r="5.5" fill="url(#duoHoodie1)" />
          <path d="M 28 88 L 12 70 Q 14 62 22 66 L 28 80 Z" fill="url(#duoHoodie1)" />
          <circle cx="14" cy="66" r="6.5" fill="url(#duoSkin1)" />
        </g>

        {/* Right Hand Holding Laptop / Tech Badge */}
        <g>
          <path d="M 72 88 L 84 82 L 80 94 Z" fill="url(#duoHoodie1)" />
          <circle cx="84" cy="84" r="6" fill="url(#duoSkin1)" />
          {/* Glowing Laptop */}
          <g className="duo-glow-prop">
            <rect x="74" y="80" width="22" height="15" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" />
            <polygon points="71,95 99,95 96,98 74,98" fill="#64748b" />
            <circle cx="85" cy="87.5" r="2.5" fill="#38bdf8" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ==========================================================================
   Duolingo-Style Animated Leaf Character 2: Maya/Alex (The App Dev Wizard)
   ========================================================================== */
export function DuolingoDevCharacter() {
  return (
    <div className="duolingo-character-box" title="Alex - Custom Software Wizard">
      <svg viewBox="0 0 100 120" className="duo-character-svg-2" aria-hidden="true">
        <defs>
          <linearGradient id="duoSkin2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
          <linearGradient id="duoJacket2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="duoCap2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="50" cy="115" rx="30" ry="4" fill="#059669" opacity="0.25" />

        {/* Body */}
        <path d="M 26 84 Q 50 76 74 84 L 78 110 Q 50 115 22 110 Z" fill="url(#duoJacket2)" />
        {/* Code glyph on chest */}
        <text x="44" y="100" fill="#ffffff" fontSize="10" fontWeight="900" fontFamily="monospace">&lt;/&gt;</text>

        {/* Head */}
        <circle cx="50" cy="50" r="31" fill="url(#duoSkin2)" />

        {/* Backward Developer Cap */}
        <path d="M 20 44 Q 50 20 80 44 L 79 38 Q 50 16 21 38 Z" fill="url(#duoCap2)" />
        <ellipse cx="50" cy="36" rx="28" ry="12" fill="url(#duoCap2)" />
        <rect x="14" y="38" width="16" height="5" rx="2" fill="#0369a1" transform="rotate(-15 14 38)" />

        {/* Cute Ears */}
        <circle cx="19" cy="52" r="5" fill="#facc15" />
        <circle cx="81" cy="52" r="5" fill="#facc15" />

        {/* Big Animated Blinking Eyes */}
        <g className="duo-eye-blink">
          <ellipse cx="38" cy="48" rx="5" ry="7" fill="#0f172a" />
          <circle cx="39.5" cy="46" r="2.2" fill="#ffffff" />
          <ellipse cx="62" cy="48" rx="5" ry="7" fill="#0f172a" />
          <circle cx="63.5" cy="46" r="2.2" fill="#ffffff" />
        </g>

        {/* Cheerful Blush */}
        <ellipse cx="32" cy="58" rx="5" ry="3" fill="#f87171" opacity="0.6" />
        <ellipse cx="68" cy="58" rx="5" ry="3" fill="#f87171" opacity="0.6" />

        {/* Open Excited Smile with Teeth */}
        <path d="M 42 60 Q 50 72 58 60 Z" fill="#991b1b" />
        <path d="M 44 60 Q 50 63 56 60" fill="#ffffff" />

        {/* Glowing Floating Hologram Code Cube */}
        <g className="duo-glow-prop">
          <rect x="70" y="68" width="22" height="22" rx="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="76" y="83" fill="#ffffff" fontSize="12" fontWeight="900">{`{}`}</text>
          {/* Sparkles */}
          <polygon points="94,66 96,62 98,66 102,68 98,70 96,74 94,70 90,68" fill="#fde047" />
        </g>
      </svg>
    </div>
  );
}

/* ==========================================================================
   Duolingo-Style Animated Leaf Character 3: Pip (The 24/7 System Guardian)
   ========================================================================== */
export function DuolingoMaintenanceCharacter() {
  return (
    <div className="duolingo-character-box" title="Pip - 24/7 System Guardian">
      <svg viewBox="0 0 100 120" className="duo-character-svg" aria-hidden="true">
        <defs>
          <linearGradient id="duoSkin3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id="duoArmor3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="duoGold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Shadow */}
        <ellipse cx="50" cy="115" rx="30" ry="4" fill="#059669" opacity="0.25" />

        {/* Body */}
        <path d="M 26 84 Q 50 76 74 84 L 78 110 Q 50 115 22 110 Z" fill="url(#duoArmor3)" />
        {/* Shield emblem on chest */}
        <path d="M 45 92 Q 50 90 55 92 L 55 99 Q 50 104 45 99 Z" fill="#10b981" stroke="#ffffff" strokeWidth="1" />

        {/* Antenna / Beacon on head */}
        <line x1="50" y1="24" x2="50" y2="12" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="10" r="5" fill="#22c55e" className="duo-glow-prop" />

        {/* Head */}
        <circle cx="50" cy="50" r="30" fill="url(#duoSkin3)" />

        {/* Guardian Headset Band */}
        <path d="M 21 44 Q 50 24 79 44" fill="none" stroke="#047857" strokeWidth="4.5" strokeLinecap="round" />
        <rect x="18" y="44" width="6" height="14" rx="3" fill="#047857" />
        <rect x="76" y="44" width="6" height="14" rx="3" fill="#047857" />

        {/* Big Animated Eyes */}
        <g className="duo-eye-blink">
          <ellipse cx="38" cy="48" rx="4.5" ry="6.5" fill="#0f172a" />
          <circle cx="39.5" cy="46" r="2" fill="#ffffff" />
          <ellipse cx="62" cy="48" rx="4.5" ry="6.5" fill="#0f172a" />
          <circle cx="63.5" cy="46" r="2" fill="#ffffff" />
        </g>

        {/* Cheerful Blush */}
        <ellipse cx="32" cy="58" rx="5" ry="3" fill="#34d399" opacity="0.6" />
        <ellipse cx="68" cy="58" rx="5" ry="3" fill="#34d399" opacity="0.6" />

        {/* Confident Friendly Smile */}
        <path d="M 43 62 Q 50 70 57 62" fill="none" stroke="#064e3b" strokeWidth="2.5" strokeLinecap="round" />

        {/* Golden Wrench Tool in Hand */}
        <g className="duo-glow-prop">
          <g transform="translate(74, 66) rotate(-25)">
            <rect x="3" y="10" width="6" height="24" rx="2" fill="url(#duoGold)" stroke="#ca8a04" strokeWidth="1" />
            <path d="M 0 6 Q 6 -2 12 6 L 10 9 Q 6 4 2 9 Z" fill="url(#duoGold)" stroke="#ca8a04" strokeWidth="1" />
          </g>
        </g>
      </svg>
    </div>
  );
}
