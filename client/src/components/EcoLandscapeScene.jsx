import React from 'react';

export default function EcoLandscapeScene({ mode = 'light' }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 60%, #d1fae5 100%)',
    }}>
      <style>{`
        @keyframes spinTurbine1 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinTurbine2 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinTurbine3 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spinTurbine4 {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes floatCloud1 {
          0% { transform: translateX(0px); }
          50% { transform: translateX(80px); }
          100% { transform: translateX(0px); }
        }
        @keyframes floatCloud2 {
          0% { transform: translateX(0px); }
          50% { transform: translateX(-60px); }
          100% { transform: translateX(0px); }
        }
        @keyframes pulseSun {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
        @keyframes riverWaveFlow1 {
          0% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(-40px) translateY(3px); }
          100% { transform: translateX(0px) translateY(0px); }
        }
        @keyframes riverWaveFlow2 {
          0% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(40px) translateY(-3px); }
          100% { transform: translateX(0px) translateY(0px); }
        }
        @keyframes riverStreamFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -240; }
        }
        @keyframes waterShimmer {
          0%, 100% { opacity: 0.35; transform: scaleX(1); }
          50% { opacity: 0.75; transform: scaleX(1.08); }
        }
        @keyframes personArmWave1 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes personArmWave2 {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(-8deg); }
        }
        @keyframes personIdleBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes bikeRoll {
          0% { transform: translateX(0px); }
          50% { transform: translateX(35px); }
          100% { transform: translateX(0px); }
        }
        .bg-turbine-blades-1 {
          transform-origin: 180px 130px;
          animation: spinTurbine1 7s linear infinite;
        }
        .bg-turbine-blades-2 {
          transform-origin: 420px 110px;
          animation: spinTurbine2 5s linear infinite;
        }
        .bg-turbine-blades-3 {
          transform-origin: 700px 145px;
          animation: spinTurbine3 6.5s linear infinite;
        }
        .bg-turbine-blades-4 {
          transform-origin: 950px 125px;
          animation: spinTurbine4 4.8s linear infinite;
        }
        .bg-cloud-1 { animation: floatCloud1 30s ease-in-out infinite; }
        .bg-cloud-2 { animation: floatCloud2 24s ease-in-out infinite; }
        .bg-cloud-3 { animation: floatCloud1 36s ease-in-out infinite; }
        .bg-sun-pulse { animation: pulseSun 4s ease-in-out infinite; }
        
        .animated-river-flow1 {
          animation: riverWaveFlow1 12s ease-in-out infinite;
        }
        .animated-river-flow2 {
          animation: riverWaveFlow2 16s ease-in-out infinite;
        }
        .animated-river-ripples {
          stroke-dasharray: 40 24;
          animation: riverStreamFlow 8s linear infinite;
        }
        .animated-river-ripples-fast {
          stroke-dasharray: 30 18;
          animation: riverStreamFlow 5s linear infinite;
        }
        .river-shimmer-pulse {
          animation: waterShimmer 4s ease-in-out infinite;
          transform-origin: center;
        }

        .bg-person-wave-1 {
          transform-origin: 7px 16px;
          animation: personArmWave1 2.4s ease-in-out infinite;
        }
        .bg-person-wave-2 {
          transform-origin: 7px 15px;
          animation: personArmWave2 2.6s ease-in-out infinite;
        }
        .bg-person-bob {
          animation: personIdleBob 3s ease-in-out infinite;
        }
        .bg-bike-move {
          animation: bikeRoll 10s ease-in-out infinite;
        }
        @keyframes runnerJog {
          0% { transform: translateX(0px); }
          50% { transform: translateX(30px); }
          100% { transform: translateX(0px); }
        }
        @keyframes dogWag {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(25deg); }
        }
        .bg-runner-move {
          animation: runnerJog 6s ease-in-out infinite;
        }
        .bg-dog-wag {
          transform-origin: 3px 6px;
          animation: dogWag 0.6s ease-in-out infinite;
        }
      `}</style>

      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bgSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="60%" stopColor="#e0f7fa" />
            <stop offset="100%" stopColor="#d1fae5" />
          </linearGradient>
          <linearGradient id="bgHill1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="bgHill2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="bgHill3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#166534" />
          </linearGradient>
          <linearGradient id="bgSolar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="bgWaterDeep" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#0ea5e9" stopOpacity="0.9" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="bgWaterSurface" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.75" />
          </linearGradient>
          <linearGradient id="bgCity" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Sky background */}
        <rect x="0" y="0" width="1440" height="900" fill="url(#bgSkyGrad)" />

        {/* Sun */}
        <g className="bg-sun-pulse">
          <circle cx="1100" cy="130" r="70" fill="#fef08a" opacity="0.9" />
          <circle cx="1100" cy="130" r="90" fill="#fef08a" opacity="0.25" />
          {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((angle, i) => (
            <line
              key={i}
              x1={1100 + Math.cos((angle * Math.PI) / 180) * 96}
              y1={130 + Math.sin((angle * Math.PI) / 180) * 96}
              x2={1100 + Math.cos((angle * Math.PI) / 180) * 116}
              y2={130 + Math.sin((angle * Math.PI) / 180) * 116}
              stroke="#fde68a"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.8"
            />
          ))}
        </g>

        {/* Clouds */}
        <g className="bg-cloud-1" fill="#ffffff" opacity="0.8">
          <ellipse cx="200" cy="110" rx="90" ry="36" />
          <ellipse cx="240" cy="95" rx="60" ry="28" />
          <ellipse cx="160" cy="100" rx="50" ry="22" />
        </g>
        <g className="bg-cloud-2" fill="#ffffff" opacity="0.7">
          <ellipse cx="600" cy="80" rx="100" ry="38" />
          <ellipse cx="650" cy="65" rx="65" ry="28" />
          <ellipse cx="560" cy="72" rx="55" ry="22" />
        </g>
        <g className="bg-cloud-3" fill="#ffffff" opacity="0.6">
          <ellipse cx="900" cy="60" rx="80" ry="30" />
          <ellipse cx="940" cy="48" rx="55" ry="24" />
          <ellipse cx="865" cy="54" rx="46" ry="20" />
        </g>

        {/* City silhouette background */}
        <g fill="url(#bgCity)">
          <rect x="950" y="420" width="60" height="220" rx="4" />
          <rect x="1015" y="370" width="75" height="270" rx="4" />
          <rect x="1095" y="440" width="55" height="200" rx="4" />
          <rect x="1155" y="400" width="65" height="240" rx="4" />
          <rect x="1220" y="450" width="50" height="190" rx="4" />
          <rect x="1275" y="410" width="80" height="230" rx="4" />
          <rect x="1360" y="460" width="80" height="180" rx="4" />
          {/* Windows */}
          {[450, 480, 510, 540, 570, 600].map((y, i) => (
            <g key={i} fill="#bae6fd" opacity="0.5">
              <rect x="1025" y={y} width="12" height="12" />
              <rect x="1045" y={y} width="12" height="12" />
              <rect x="1165" y={y} width="10" height="10" />
              <rect x="1182" y={y} width="10" height="10" />
            </g>
          ))}
        </g>

        {/* Far Background Hill */}
        <path
          d="M -50 620 Q 200 480 500 560 Q 800 640 1100 510 Q 1300 440 1490 540 L 1490 900 L -50 900 Z"
          fill="url(#bgHill1)"
          opacity="0.6"
        />

        {/* Mid Background Hill */}
        <path
          d="M -50 680 Q 300 570 650 640 Q 1000 710 1300 610 Q 1400 570 1490 620 L 1490 900 L -50 900 Z"
          fill="url(#bgHill2)"
          opacity="0.75"
        />

        {/* Foreground Hill */}
        <path
          d="M -50 760 Q 350 680 720 740 Q 1050 800 1490 720 L 1490 900 L -50 900 Z"
          fill="url(#bgHill3)"
        />

        {/* Trees scattered on hills */}
        {[
          { x: 80, y: 710, r: 28 }, { x: 130, y: 730, r: 22 },
          { x: 320, y: 720, r: 25 }, { x: 360, y: 730, r: 20 },
          { x: 820, y: 730, r: 26 }, { x: 870, y: 715, r: 30 },
          { x: 1180, y: 720, r: 22 }, { x: 1220, y: 705, r: 28 },
          { x: 1380, y: 730, r: 24 },
        ].map((t, i) => (
          <g key={i}>
            <rect x={t.x - 4} y={t.y} width="8" height="40" fill="#78350f" opacity="0.8" />
            <circle cx={t.x} cy={t.y - 8} r={t.r} fill="#16a34a" opacity="0.85" />
          </g>
        ))}

        {/* WIND TURBINE 1 */}
        <g>
          <polygon points="177,700 183,700 181,130 179,130" fill="#f1f5f9" opacity="0.9" />
          <circle cx="180" cy="130" r="7" fill="#e2e8f0" />
          <g className="bg-turbine-blades-1">
            <path d="M 180 130 L 175 30 Q 180 22 185 30 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 180 130 L 265 175 Q 270 180 262 185 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 180 130 L 95 175 Q 90 180 98 185 Z" fill="#ffffff" opacity="0.95" />
          </g>
        </g>

        {/* WIND TURBINE 2 */}
        <g>
          <polygon points="417,680 423,680 421,110 419,110" fill="#f1f5f9" opacity="0.9" />
          <circle cx="420" cy="110" r="7" fill="#e2e8f0" />
          <g className="bg-turbine-blades-2">
            <path d="M 420 110 L 415 20 Q 420 12 425 20 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 420 110 L 506 156 Q 511 161 503 166 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 420 110 L 334 156 Q 329 161 337 166 Z" fill="#ffffff" opacity="0.95" />
          </g>
        </g>

        {/* WIND TURBINE 3 */}
        <g>
          <polygon points="697,690 703,690 701,145 699,145" fill="#f1f5f9" opacity="0.9" />
          <circle cx="700" cy="145" r="7" fill="#e2e8f0" />
          <g className="bg-turbine-blades-3">
            <path d="M 700 145 L 695 50 Q 700 42 705 50 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 700 145 L 785 192 Q 790 197 782 202 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 700 145 L 615 192 Q 610 197 618 202 Z" fill="#ffffff" opacity="0.95" />
          </g>
        </g>

        {/* WIND TURBINE 4 */}
        <g>
          <polygon points="947,675 953,675 951,125 949,125" fill="#f1f5f9" opacity="0.9" />
          <circle cx="950" cy="125" r="6.5" fill="#e2e8f0" />
          <g className="bg-turbine-blades-4">
            <path d="M 950 125 L 945 38 Q 950 30 955 38 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 950 125 L 1028 168 Q 1033 173 1025 178 Z" fill="#ffffff" opacity="0.95" />
            <path d="M 950 125 L 872 168 Q 867 173 875 178 Z" fill="#ffffff" opacity="0.95" />
          </g>
        </g>

        {/* Solar Panel Arrays */}
        {[
          { tx: 180, ty: 760 },
          { tx: 310, ty: 775 },
          { tx: 500, ty: 768 },
          { tx: 630, ty: 780 },
          { tx: 1050, ty: 765 },
          { tx: 1180, ty: 778 },
        ].map((p, i) => (
          <g key={i} transform={`translate(${p.tx}, ${p.ty})`}>
            <rect x="0" y="28" width="7" height="25" fill="#475569" opacity="0.8" />
            <rect x="63" y="28" width="7" height="25" fill="#475569" opacity="0.8" />
            <polygon points="0,28 70,28 85,0 -15,0" fill="url(#bgSolar)" stroke="#e2e8f0" strokeWidth="1.5" opacity="0.9" />
            <line x1="23" y1="0" x2="23" y2="28" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.7" />
            <line x1="46" y1="0" x2="46" y2="28" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.7" />
            <line x1="-8" y1="14" x2="78" y2="14" stroke="#7dd3fc" strokeWidth="1.2" opacity="0.7" />
          </g>
        ))}

        {/* ==========================================================================
            ANIMATED PEOPLE IN THE BACKGROUND ECOSYSTEM
            ========================================================================== */}
        {/* Person 1: Solar Field Technician with Hardhat & Tablet (Near Solar Array) */}
        <g className="bg-person-bob" transform="translate(390, 755)">
          {/* Shadow */}
          <ellipse cx="12" cy="40" rx="8" ry="2" fill="#14532d" opacity="0.3" />
          {/* Legs */}
          <line x1="9" y1="28" x2="9" y2="39" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          <line x1="15" y1="28" x2="16" y2="39" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
          {/* Torso & Vest */}
          <rect x="6" y="14" width="12" height="15" rx="3" fill="#0284c7" />
          <rect x="8" y="14" width="8" height="15" fill="#f59e0b" />
          {/* Head & Hardhat */}
          <circle cx="12" cy="8" r="5" fill="#fed7aa" />
          <path d="M 6 7 Q 12 2 18 7 L 19 8 L 5 8 Z" fill="#eab308" />
          {/* Animated Waving Arm - securely anchored to shoulder */}
          <circle cx="7" cy="16" r="2" fill="#0284c7" />
          <g className="bg-person-wave-1">
            <line x1="7" y1="16" x2="1" y2="8" stroke="#0284c7" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="1" cy="7.5" r="1.8" fill="#fed7aa" />
          </g>
          {/* Right Arm holding clipboard */}
          <line x1="18" y1="16" x2="22" y2="23" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="20" y="21" width="5" height="7" rx="1" fill="#f8fafc" stroke="#475569" strokeWidth="0.8" />
        </g>

        {/* Person 2: Eco Cyclist on Hill Path */}
        <g className="bg-bike-move" transform="translate(580, 680)">
          {/* Bike Wheels */}
          <circle cx="6" cy="22" r="7" fill="none" stroke="#334155" strokeWidth="1.8" />
          <circle cx="28" cy="22" r="7" fill="none" stroke="#334155" strokeWidth="1.8" />
          {/* Bike Frame */}
          <polyline points="6,22 17,22 24,14 13,14 6,22" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="17" y1="22" x2="28" y2="22" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="22" x2="23" y2="12" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="12" x2="26" y2="12" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cyclist Body */}
          <circle cx="16" cy="4" r="4.5" fill="#fcd34d" />
          {/* Helmet */}
          <path d="M 12 3 Q 16 -1 22 2 Z" fill="#0284c7" />
          <polyline points="16,8 19,16 13,20 17,24" fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <line x1="17" y1="11" x2="23" y2="13" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Person 3 & 4: People at Riverbank Park (One standing waving, one sitting with laptop) */}
        <g transform="translate(830, 770)">
          {/* Person 3 (Standing & Waving by River) */}
          <g className="bg-person-bob">
            <ellipse cx="10" cy="38" rx="6" ry="2" fill="#14532d" opacity="0.3" />
            {/* Legs */}
            <line x1="8" y1="26" x2="8" y2="37" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="13" y1="26" x2="13" y2="37" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
            {/* Torso */}
            <rect x="6" y="13" width="10" height="14" rx="2.5" fill="#ea580c" />
            {/* Head */}
            <circle cx="11" cy="7" r="4.8" fill="#fed7aa" />
            <circle cx="11" cy="5" r="4.5" fill="#78350f" />
            {/* Waving Arm - securely anchored to shoulder */}
            <circle cx="7" cy="15" r="1.8" fill="#ea580c" />
            <g className="bg-person-wave-2">
              <line x1="7" y1="15" x2="1" y2="7" stroke="#ea580c" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="1" cy="6.5" r="1.8" fill="#fed7aa" />
            </g>
          </g>

          {/* Person 4 (Sitting on Grass with Laptop) */}
          <g transform="translate(24, 14)">
            <ellipse cx="8" cy="22" rx="9" ry="2.5" fill="#14532d" opacity="0.35" />
            {/* Legs bent on ground */}
            <path d="M 3 16 Q 8 20 15 20" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            {/* Torso */}
            <rect x="2" y="6" width="9" height="11" rx="2" fill="#059669" />
            {/* Head */}
            <circle cx="6.5" cy="2" r="4" fill="#fde047" />
            {/* Laptop on lap */}
            <polygon points="10,14 18,14 16,19 8,19" fill="#94a3b8" />
            <line x1="13" y1="14" x2="14" y2="9" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>

        {/* Person 5: Wind Turbine Technician giving thumbs up (Near Turbine 1) */}
        <g className="bg-person-bob" transform="translate(215, 688)">
          <ellipse cx="8" cy="36" rx="6" ry="2" fill="#14532d" opacity="0.3" />
          <line x1="6" y1="24" x2="6" y2="35" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="11" y1="24" x2="11" y2="35" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" />
          {/* Overalls */}
          <rect x="4" y="11" width="9" height="14" rx="2" fill="#0d9488" />
          <circle cx="8.5" cy="6" r="4.5" fill="#fed7aa" />
          {/* Safety helmet */}
          <path d="M 3 5 Q 8.5 0 14 5 Z" fill="#ffffff" />
          {/* Thumbs up arm */}
          <line x1="13" y1="14" x2="18" y2="10" stroke="#0d9488" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="18" cy="9" r="1.6" fill="#fed7aa" />
        </g>

        {/* Person 6: Hill Jogger / Runner on Upper Trail */}
        <g className="bg-runner-move" transform="translate(460, 630)">
          <ellipse cx="10" cy="30" rx="6" ry="2" fill="#14532d" opacity="0.3" />
          {/* Running Legs */}
          <line x1="10" y1="18" x2="4" y2="28" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="10" y1="18" x2="16" y2="25" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Torso */}
          <rect x="7" y="9" width="7" height="11" rx="2" fill="#dc2626" />
          {/* Head & Athletic Headband */}
          <circle cx="10.5" cy="5" r="3.8" fill="#fed7aa" />
          <line x1="7" y1="4" x2="14" y2="4" stroke="#ffffff" strokeWidth="1.2" />
          {/* Running Arms */}
          <line x1="9" y1="11" x2="15" y2="14" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="9" y1="11" x2="3" y2="13" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* Person 7 & Dog: Dog Walker along Riverbank Trail */}
        <g className="bg-person-bob" transform="translate(1020, 790)">
          <ellipse cx="10" cy="38" rx="6" ry="2" fill="#14532d" opacity="0.3" />
          <line x1="8" y1="25" x2="8" y2="37" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="13" y1="25" x2="13" y2="37" stroke="#1e293b" strokeWidth="2.6" strokeLinecap="round" />
          <rect x="6" y="12" width="10" height="14" rx="2.5" fill="#7c3aed" />
          <circle cx="11" cy="6" r="4.5" fill="#fed7aa" />
          <circle cx="11" cy="4" r="4" fill="#334155" />
          {/* Leash line */}
          <path d="M 14 18 Q 22 24 28 29" fill="none" stroke="#64748b" strokeWidth="1.2" strokeDasharray="3 1.5" />
          {/* Cute Animated Dog */}
          <g transform="translate(28, 24)">
            <ellipse cx="8" cy="11" rx="5" ry="1.5" fill="#14532d" opacity="0.3" />
            {/* Dog body */}
            <rect x="2" y="4" width="11" height="6" rx="3" fill="#d97706" />
            <circle cx="13" cy="4" r="3.5" fill="#d97706" />
            <circle cx="14" cy="5" r="1.5" fill="#78350f" />
            {/* Legs */}
            <line x1="4" y1="9" x2="4" y2="12" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="9" x2="10" y2="12" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
            {/* Animated Wagging Tail */}
            <line x1="2" y1="5" x2="-2" y2="1" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" className="bg-dog-wag" />
          </g>
        </g>

        {/* Person 8 & 9: Outdoor Tech Collaboration Duo under the Trees */}
        <g transform="translate(680, 715)">
          {/* Park Table / Bench */}
          <ellipse cx="26" cy="30" rx="28" ry="4" fill="#14532d" opacity="0.3" />
          <rect x="14" y="18" width="24" height="4" rx="1.5" fill="#78350f" opacity="0.9" />
          <line x1="18" y1="22" x2="18" y2="29" stroke="#78350f" strokeWidth="2" />
          <line x1="34" y1="22" x2="34" y2="29" stroke="#78350f" strokeWidth="2" />
          {/* Small laptop on table */}
          <rect x="23" y="15" width="6" height="4" rx="0.5" fill="#cbd5e1" />
          
          {/* Person 8: Left Colleague */}
          <g className="bg-person-bob">
            <circle cx="8" cy="8" r="4.2" fill="#fed7aa" />
            <circle cx="8" cy="6" r="3.8" fill="#1e293b" />
            <rect x="4" y="13" width="9" height="11" rx="2" fill="#0284c7" />
            <path d="M 5 23 L 13 23 L 13 29" fill="none" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="10" y1="16" x2="17" y2="18" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Person 9: Right Colleague */}
          <g className="bg-person-bob" transform="translate(42, 0)">
            <circle cx="4" cy="8" r="4.2" fill="#fed7aa" />
            <circle cx="4" cy="6" r="4" fill="#b45309" />
            <rect x="0" y="13" width="9" height="11" rx="2" fill="#059669" />
            <path d="M 7 23 L -1 23 L -1 29" fill="none" stroke="#1e293b" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="2" y1="16" x2="-4" y2="18" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>

        {/* ==========================================================================
            ANIMATED MOVING RIVER & FLOWING WATER SYSTEM
            ========================================================================== */}
        {/* Layer 1: Deep River Base */}
        <path
          d="M -50 820 Q 300 790 700 830 Q 1100 870 1500 815 L 1500 900 L -50 900 Z"
          fill="url(#bgWaterDeep)"
        />

        {/* Layer 2: Moving River Flow Wave 1 */}
        <g className="animated-river-flow1">
          <path
            d="M -80 835 Q 260 805 680 840 Q 1120 875 1520 825 L 1520 900 L -80 900 Z"
            fill="url(#bgWaterSurface)"
            opacity="0.85"
          />
        </g>

        {/* Layer 3: Moving River Flow Wave 2 */}
        <g className="animated-river-flow2">
          <path
            d="M -60 850 Q 360 820 760 855 Q 1160 890 1520 845 L 1520 900 L -60 900 Z"
            fill="#38bdf8"
            opacity="0.45"
          />
        </g>

        {/* Layer 4: Flowing Current Streams & Ripples (Moving dashoffset) */}
        <g className="animated-river-ripples" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.65">
          <line x1="-40" y1="835" x2="1480" y2="835" />
          <line x1="60" y1="855" x2="1400" y2="855" strokeWidth="2" opacity="0.5" />
          <line x1="-20" y1="875" x2="1460" y2="875" strokeWidth="3" opacity="0.7" />
        </g>

        {/* Fast Shimmering Current Lines */}
        <g className="animated-river-ripples-fast" stroke="#e0f2fe" strokeWidth="2" strokeLinecap="round" opacity="0.75">
          <line x1="200" y1="845" x2="900" y2="845" />
          <line x1="550" y1="865" x2="1350" y2="865" />
          <line x1="100" y1="885" x2="800" y2="885" strokeWidth="2.5" />
        </g>

        {/* Shimmering Sun Highlights on Water Surface */}
        <g className="river-shimmer-pulse" fill="#ffffff" opacity="0.6">
          <ellipse cx="420" cy="845" rx="35" ry="3" />
          <ellipse cx="780" cy="860" rx="45" ry="3.5" />
          <ellipse cx="1120" cy="850" rx="40" ry="3" />
          <ellipse cx="250" cy="875" rx="50" ry="4" />
          <ellipse cx="960" cy="880" rx="60" ry="4" />
        </g>
      </svg>
    </div>
  );
}
