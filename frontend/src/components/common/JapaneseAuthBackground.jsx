import React from 'react';

/**
 * JapaneseAuthBackground
 * Ultra-lightweight, 100% vector SVG Japanese landscape background for Login & Register.
 * 
 * Features:
 * - Pure vector graphics (NO raster JPG/PNG/WebP, NO base64, NO external network requests).
 * - Instant rendering with 0ms image decode delay.
 * - Symmetrical clear center area (low detail) for maximum authentication card readability.
 * - Traditional Japanese elements on left & right: Pagoda, Mount Fuji, Sun/Moon, Torii gate, Sakura branch.
 * - Dynamic theme switching (Light Mode & Dark Mode) via CSS variables.
 * - Respects prefers-reduced-motion for subtle petal drifting.
 * - Screen-reader safe with aria-hidden="true".
 */
export default function JapaneseAuthBackground() {
  return (
    <div
      className="japanese-auth-bg-container"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none'
      }}
    >
      <style>{`
        /* CSS Variables for Japanese Vector Art Palette */
        :root {
          --auth-sky-top: #F9F5EE;
          --auth-sky-mid: #FBF7F2;
          --auth-sky-bot: #EBF2F8;
          --auth-water-top: #E5EEF6;
          --auth-water-bot: #F8F4EE;
          --auth-sun: #F7B5A6;
          --auth-sun-halo: rgba(247, 181, 166, 0.28);
          --auth-cloud: rgba(255, 255, 255, 0.65);
          --auth-fuji-body: #B9CAD8;
          --auth-fuji-snow: #FFFFFF;
          --auth-fuji-shade: #D6E3EE;
          --auth-ridge: #9FB3C3;
          --auth-hill: #3E4856;
          --auth-torii: #C53030;
          --auth-torii-beam: #A82424;
          --auth-pagoda: #2B3545;
          --auth-pagoda-accent: #C53030;
          --auth-pagoda-roof: #1E2837;
          --auth-branch: #42352B;
          --auth-sakura-petal: #F8BBD0;
          --auth-sakura-light: #FDE8ED;
          --auth-sakura-core: #C53030;
          --auth-ripple: rgba(71, 85, 105, 0.18);
        }

        /* Subtle Petal Drift Animations */
        @keyframes petalFloat1 {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0.8; }
          50% { transform: translate(45px, 90px) rotate(180deg); opacity: 0.95; }
          100% { transform: translate(80px, 190px) rotate(360deg); opacity: 0.3; }
        }

        @keyframes petalFloat2 {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 0.7; }
          50% { transform: translate(-35px, 80px) rotate(-160deg); opacity: 0.9; }
          100% { transform: translate(-70px, 175px) rotate(-320deg); opacity: 0.25; }
        }

        .auth-petal-1 {
          animation: petalFloat1 11s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .auth-petal-2 {
          animation: petalFloat2 13s cubic-bezier(0.4, 0, 0.2, 1) infinite 2s;
        }

        .auth-petal-3 {
          animation: petalFloat1 15s cubic-bezier(0.4, 0, 0.2, 1) infinite 4s;
        }

        /* Respect Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .auth-petal-1, .auth-petal-2, .auth-petal-3 {
            animation: none !important;
          }
        }

        /* Mobile specific adjustments: Keep center completely calm and prevent edge clutter */
        @media (max-width: 640px) {
          .auth-svg-mobile-hidden {
            display: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        <defs>
          {/* Vertical Sky Gradient */}
          <linearGradient id="authSkyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--auth-sky-top)" />
            <stop offset="42%" stopColor="var(--auth-sky-mid)" />
            <stop offset="70%" stopColor="var(--auth-sky-bot)" />
            <stop offset="71%" stopColor="var(--auth-water-top)" />
            <stop offset="100%" stopColor="var(--auth-water-bot)" />
          </linearGradient>

          {/* Mount Fuji Body Gradient */}
          <linearGradient id="authFujiGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--auth-fuji-shade)" />
            <stop offset="45%" stopColor="var(--auth-fuji-body)" />
            <stop offset="100%" stopColor="var(--auth-ridge)" />
          </linearGradient>

          {/* Sun / Moon Radiant Gradient */}
          <radialGradient id="authSunHaloGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--auth-sun)" stopOpacity="0.95" />
            <stop offset="70%" stopColor="var(--auth-sun)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--auth-sun-halo)" stopOpacity="0" />
          </radialGradient>

          {/* Sakura Blossom Petal Radial Gradient */}
          <radialGradient id="authPetalGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="var(--auth-sakura-light)" />
            <stop offset="75%" stopColor="var(--auth-sakura-petal)" />
            <stop offset="100%" stopColor="var(--auth-sakura-core)" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        {/* 1. SKY & WATER CANVAS (Seamless Full Viewport) */}
        <rect width="1600" height="900" fill="url(#authSkyGradient)" />

        {/* 2. SUN / MOON CELESTIAL BODY (Upper Right Background: x ~1360, y ~260) */}
        <g id="auth-celestial">
          {/* Subtle Outer Halo */}
          <circle cx="1360" cy="260" r="115" fill="url(#authSunHaloGrad)" />
          {/* Main Disc */}
          <circle cx="1360" cy="260" r="76" fill="var(--auth-sun)" opacity="0.9" />
        </g>

        {/* 3. MINIMALIST JAPANESE CLOUDS (Horizontal Kumogata Bands) */}
        <g id="auth-clouds" fill="var(--auth-cloud)">
          {/* Upper Right clouds behind Fuji */}
          <path d="M 1210 165 h 190 a 14 14 0 0 1 0 28 h -190 a 14 14 0 0 1 0 -28 Z" opacity="0.8" />
          <path d="M 1320 215 h 150 a 11 11 0 0 1 0 22 h -150 a 11 11 0 0 1 0 -22 Z" opacity="0.65" />
          {/* Left clouds above pagoda */}
          <path d="M 150 145 h 160 a 12 12 0 0 1 0 24 h -160 a 12 12 0 0 1 0 -24 Z" opacity="0.75" />
          <path d="M 60 195 h 130 a 10 10 0 0 1 0 20 h -130 a 10 10 0 0 1 0 -20 Z" opacity="0.55" className="auth-svg-mobile-hidden" />
        </g>

        {/* 4. DISTANT MOUNTAIN SILHOUETTE (Right / Mid-Right Background) */}
        <g id="auth-distant-mountains">
          <path
            d="M 980 640 Q 1120 540 1260 575 T 1600 550 L 1600 645 L 980 645 Z"
            fill="var(--auth-ridge)"
            opacity="0.35"
          />
          <path
            d="M 1060 640 Q 1200 580 1370 595 T 1600 605 L 1600 645 L 1060 645 Z"
            fill="var(--auth-ridge)"
            opacity="0.5"
          />
        </g>

        {/* 5. MOUNT FUJI (Right Side: x: 1210 to 1600, y: 320 to 645) */}
        <g id="auth-mount-fuji">
          {/* Main Cone Slope */}
          <path
            d="M 1210 640 Q 1315 540 1370 330 L 1420 330 Q 1475 540 1590 640 Z"
            fill="url(#authFujiGrad)"
          />

          {/* Fuji Iconic Scalloped Snowcap */}
          <path
            d="M 1370 330 L 1420 330 Q 1440 375 1450 405 Q 1435 395 1422 418 Q 1408 392 1395 422 Q 1382 396 1370 416 Q 1358 390 1342 405 Q 1352 375 1370 330 Z"
            fill="var(--auth-fuji-snow)"
          />

          {/* Snowcap Shading Accent */}
          <path
            d="M 1395 330 L 1420 330 Q 1440 375 1450 405 Q 1435 395 1422 418 Q 1408 392 1395 422 Z"
            fill="var(--auth-fuji-shade)"
            opacity="0.55"
          />
        </g>

        {/* 6. WATER HORIZON & REFINED WATER RIPPLES (y: 638 to 900) */}
        <g id="auth-water-ripples" stroke="var(--auth-ripple)" strokeWidth="1.5" strokeLinecap="round">
          {/* Center area water is calm & clean with wide spaced micro-ripples */}
          <line x1="580" y1="670" x2="680" y2="670" opacity="0.3" />
          <line x1="920" y1="680" x2="1030" y2="680" opacity="0.3" />
          <line x1="720" y1="710" x2="880" y2="710" opacity="0.25" />

          {/* Right lake ripples under Torii */}
          <line x1="1260" y1="685" x2="1470" y2="685" strokeDasharray="30 12" />
          <line x1="1310" y1="715" x2="1440" y2="715" strokeDasharray="20 8" />
          <line x1="1280" y1="740" x2="1490" y2="740" strokeDasharray="40 16" />

          {/* Left lake ripples under Pagoda */}
          <line x1="180" y1="685" x2="350" y2="685" strokeDasharray="25 10" />
          <line x1="220" y1="720" x2="390" y2="720" strokeDasharray="35 15" />
        </g>

        {/* 7. TRADITIONAL TORII GATE (Right Lake: x: 1315 to 1425, y: 595 to 725) */}
        <g id="auth-torii-gate">
          {/* Water reflection of Torii Gate (Subtle) */}
          <g opacity="0.2" transform="translate(0, 1430) scale(1, -1)">
            <rect x="1335" y="700" width="8" height="40" fill="var(--auth-torii)" />
            <rect x="1395" y="700" width="8" height="40" fill="var(--auth-torii)" />
          </g>

          {/* Base foundation stones (Kamebara) */}
          <ellipse cx="1339" cy="714" rx="8" ry="3.5" fill="var(--auth-pagoda-roof)" />
          <ellipse cx="1399" cy="714" rx="8" ry="3.5" fill="var(--auth-pagoda-roof)" />

          {/* Upright Pillars (Hashira) */}
          <rect x="1335" y="625" width="8" height="88" rx="2" fill="var(--auth-torii)" />
          <rect x="1395" y="625" width="8" height="88" rx="2" fill="var(--auth-torii)" />

          {/* Secondary Tie-Beam (Nuki) */}
          <rect x="1323" y="642" width="92" height="7" rx="1.5" fill="var(--auth-torii-beam)" />

          {/* Central Strut (Gakuzuka) */}
          <rect x="1366" y="627" width="6" height="15" fill="var(--auth-torii-beam)" />

          {/* Main Curved Lintel (Kasagi & Shimaki) */}
          <path
            d="M 1312 623 Q 1369 628 1426 623 L 1429 631 Q 1369 635 1309 631 Z"
            fill="var(--auth-torii)"
          />
          {/* Black top roof plate of Torii */}
          <path
            d="M 1310 623 Q 1369 627 1428 623 L 1430 620 Q 1369 624 1308 620 Z"
            fill="var(--auth-pagoda-roof)"
          />
        </g>

        {/* 8. PAGODA HILL & EMBANKMENT (Lower Left: x: 0 to 320, y: 640 to 820) */}
        <g id="auth-pagoda-hill">
          <path
            d="M 0 640 Q 120 635 240 660 T 360 740 L 360 900 L 0 900 Z"
            fill="var(--auth-hill)"
            opacity="0.9"
          />
        </g>

        {/* 9. JAPANESE 3-TIERED PAGODA (Left Side: x: 50 to 210, y: 260 to 660) */}
        <g id="auth-pagoda">
          {/* Spire (Sorin) on top */}
          <line x1="120" y1="260" x2="120" y2="335" stroke="var(--auth-pagoda)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="120" cy="260" r="4.5" fill="var(--auth-pagoda-accent)" />
          {/* Nine rings (Kururin) on Sorin */}
          <ellipse cx="120" cy="275" rx="5" ry="2" fill="var(--auth-pagoda)" />
          <ellipse cx="120" cy="283" rx="6" ry="2" fill="var(--auth-pagoda)" />
          <ellipse cx="120" cy="291" rx="7" ry="2.2" fill="var(--auth-pagoda)" />
          <ellipse cx="120" cy="299" rx="8" ry="2.2" fill="var(--auth-pagoda)" />
          <ellipse cx="120" cy="307" rx="8.5" ry="2.2" fill="var(--auth-pagoda)" />

          {/* Tier 1 (Top Level) */}
          {/* Eaves Roof */}
          <path
            d="M 75 352 Q 120 342 165 352 L 157 362 Q 120 354 83 362 Z"
            fill="var(--auth-pagoda-roof)"
          />
          {/* Vermilion sub-eave accent */}
          <rect x="92" y="362" width="56" height="3" fill="var(--auth-pagoda-accent)" />
          {/* Tier 1 Walls & Pillars */}
          <rect x="96" y="365" width="48" height="42" fill="var(--auth-pagoda)" />
          <rect x="110" y="375" width="20" height="32" fill="var(--auth-pagoda-roof)" />

          {/* Tier 2 (Middle Level) */}
          {/* Eaves Roof */}
          <path
            d="M 60 417 Q 120 405 180 417 L 171 429 Q 120 419 69 429 Z"
            fill="var(--auth-pagoda-roof)"
          />
          <rect x="80" y="429" width="80" height="3.5" fill="var(--auth-pagoda-accent)" />
          {/* Tier 2 Walls & Balcony */}
          <rect x="86" y="432.5" width="68" height="50" fill="var(--auth-pagoda)" />
          <rect x="105" y="445" width="30" height="37.5" fill="var(--auth-pagoda-roof)" />

          {/* Tier 3 (Base Level) */}
          {/* Eaves Roof */}
          <path
            d="M 42 495 Q 120 480 198 495 L 188 509 Q 120 497 52 509 Z"
            fill="var(--auth-pagoda-roof)"
          />
          <rect x="68" y="509" width="104" height="4" fill="var(--auth-pagoda-accent)" />
          {/* Tier 3 Main Hall Walls */}
          <rect x="74" y="513" width="92" height="72" fill="var(--auth-pagoda)" />
          <rect x="96" y="530" width="48" height="55" fill="var(--auth-pagoda-roof)" />
          {/* Stone Base Plinth */}
          <rect x="65" y="585" width="110" height="15" rx="2" fill="var(--auth-pagoda-roof)" />
        </g>

        {/* 10. SAKURA BRANCH (Top Left Corner: Natural curved vector branch) */}
        <g id="auth-sakura-tree">
          {/* Main Natural Branch */}
          <path
            d="M 0 55 Q 90 85 180 65 T 320 85 T 440 60"
            fill="none"
            stroke="var(--auth-branch)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Sub-branch 1 */}
          <path
            d="M 140 72 Q 200 120 270 115"
            fill="none"
            stroke="var(--auth-branch)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          {/* Sub-branch 2 */}
          <path
            d="M 260 76 Q 310 125 380 135"
            fill="none"
            stroke="var(--auth-branch)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Small twig */}
          <path
            d="M 60 62 Q 100 110 140 120"
            fill="none"
            stroke="var(--auth-branch)"
            strokeWidth="3"
            strokeLinecap="round"
            className="auth-svg-mobile-hidden"
          />

          {/* Blossom Flower Clusters */}
          {/* Flower 1 (x: 180, y: 65) */}
          <g transform="translate(180, 65)">
            <circle cx="-8" cy="-5" r="7.5" fill="url(#authPetalGrad)" />
            <circle cx="8" cy="-5" r="7.5" fill="url(#authPetalGrad)" />
            <circle cx="-7" cy="8" r="7.5" fill="url(#authPetalGrad)" />
            <circle cx="7" cy="8" r="7.5" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="-10" r="7.5" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="0" r="3" fill="var(--auth-sakura-core)" />
          </g>

          {/* Flower 2 (x: 270, y: 115) */}
          <g transform="translate(270, 115)">
            <circle cx="-8" cy="-5" r="7" fill="url(#authPetalGrad)" />
            <circle cx="8" cy="-5" r="7" fill="url(#authPetalGrad)" />
            <circle cx="-7" cy="8" r="7" fill="url(#authPetalGrad)" />
            <circle cx="7" cy="8" r="7" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="-9" r="7" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="0" r="2.8" fill="var(--auth-sakura-core)" />
          </g>

          {/* Flower 3 (x: 320, y: 85) */}
          <g transform="translate(320, 85)">
            <circle cx="-9" cy="-5" r="8" fill="url(#authPetalGrad)" />
            <circle cx="9" cy="-5" r="8" fill="url(#authPetalGrad)" />
            <circle cx="-7" cy="9" r="8" fill="url(#authPetalGrad)" />
            <circle cx="7" cy="9" r="8" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="-11" r="8" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="0" r="3.2" fill="var(--auth-sakura-core)" />
          </g>

          {/* Flower 4 (x: 420, y: 65) */}
          <g transform="translate(420, 65)">
            <circle cx="-7" cy="-4" r="6.5" fill="url(#authPetalGrad)" />
            <circle cx="7" cy="-4" r="6.5" fill="url(#authPetalGrad)" />
            <circle cx="-6" cy="7" r="6.5" fill="url(#authPetalGrad)" />
            <circle cx="6" cy="7" r="6.5" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="-8" r="6.5" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="0" r="2.5" fill="var(--auth-sakura-core)" />
          </g>

          {/* Flower 5 (x: 120, y: 90) */}
          <g transform="translate(120, 90)">
            <circle cx="-8" cy="-5" r="7" fill="url(#authPetalGrad)" />
            <circle cx="8" cy="-5" r="7" fill="url(#authPetalGrad)" />
            <circle cx="-7" cy="7" r="7" fill="url(#authPetalGrad)" />
            <circle cx="7" cy="7" r="7" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="-9" r="7" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="0" r="2.8" fill="var(--auth-sakura-core)" />
          </g>

          {/* Flower 6 (x: 375, y: 135) - Hidden on Mobile */}
          <g transform="translate(375, 135)" className="auth-svg-mobile-hidden">
            <circle cx="-7" cy="-4" r="6" fill="url(#authPetalGrad)" />
            <circle cx="7" cy="-4" r="6" fill="url(#authPetalGrad)" />
            <circle cx="-5" cy="6" r="6" fill="url(#authPetalGrad)" />
            <circle cx="5" cy="6" r="6" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="-7" r="6" fill="url(#authPetalGrad)" />
            <circle cx="0" cy="0" r="2.2" fill="var(--auth-sakura-core)" />
          </g>

          {/* Blossom Buds */}
          <ellipse cx="220" cy="55" rx="4" ry="7" transform="rotate(30, 220, 55)" fill="var(--auth-sakura-petal)" />
          <ellipse cx="445" cy="58" rx="3.5" ry="6" transform="rotate(-25, 445, 58)" fill="var(--auth-sakura-petal)" />
        </g>

        {/* 11. FLOATING SAKURA PETALS (Delicate Gentle Drifting) */}
        <g id="auth-floating-petals">
          {/* Petal 1 */}
          <path
            className="auth-petal-1"
            d="M 240 180 Q 248 170 256 180 Q 256 195 240 200 Q 236 188 240 180 Z"
            fill="var(--auth-sakura-petal)"
            opacity="0.85"
          />

          {/* Petal 2 */}
          <path
            className="auth-petal-2"
            d="M 330 220 Q 338 210 346 220 Q 346 235 330 240 Q 326 228 330 220 Z"
            fill="var(--auth-sakura-light)"
            opacity="0.75"
          />

          {/* Petal 3 */}
          <path
            className="auth-petal-3"
            d="M 190 280 Q 198 272 206 280 Q 206 292 190 296 Q 186 286 190 280 Z"
            fill="var(--auth-sakura-petal)"
            opacity="0.7"
          />

          {/* Petal 4 (Right side soft petal) */}
          <path
            className="auth-petal-2"
            d="M 1240 220 Q 1248 212 1256 220 Q 1256 232 1240 236 Q 1236 226 1240 220 Z"
            fill="var(--auth-sakura-light)"
            opacity="0.65"
          />
        </g>
      </svg>
    </div>
  );
}
