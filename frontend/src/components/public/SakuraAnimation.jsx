import React, { useMemo } from 'react';
import '../../styles/sakura.css';

// Pre-calculated static configuration for 22 particles to ensure consistent, zero-overhead render
const SAKURA_PARTICLES = [
  { id: 1, left: '4%', size: 14, duration: 8.5, delay: 0.2, drift: 45, rot: 380, opacity: 0.7, swayDur: 3.2, color: 'rgba(255, 192, 203, 0.85)' },
  { id: 2, left: '9%', size: 18, duration: 11.2, delay: 3.4, drift: -35, rot: -420, opacity: 0.65, swayDur: 4.1, color: 'rgba(254, 205, 211, 0.8)' },
  { id: 3, left: '15%', size: 12, duration: 9.8, delay: 1.1, drift: 55, rot: 340, opacity: 0.75, swayDur: 3.5, color: 'rgba(255, 182, 193, 0.9)' },
  { id: 4, left: '21%', size: 20, duration: 13.0, delay: 5.2, drift: -50, rot: -360, opacity: 0.6, swayDur: 4.5, color: 'rgba(253, 164, 175, 0.75)' },
  { id: 5, left: '27%', size: 16, duration: 10.4, delay: 2.3, drift: 40, rot: 400, opacity: 0.7, swayDur: 3.8, color: 'rgba(255, 192, 203, 0.85)' },
  { id: 6, left: '33%', size: 13, duration: 8.8, delay: 4.1, drift: -30, rot: -320, opacity: 0.8, swayDur: 3.1, color: 'rgba(254, 205, 211, 0.85)' },
  { id: 7, left: '39%', size: 17, duration: 12.1, delay: 0.8, drift: 50, rot: 450, opacity: 0.65, swayDur: 4.2, color: 'rgba(255, 182, 193, 0.8)' },
  { id: 8, left: '46%', size: 15, duration: 9.4, delay: 3.0, drift: -40, rot: -380, opacity: 0.75, swayDur: 3.6, color: 'rgba(253, 164, 175, 0.8)' },
  { id: 9, left: '52%', size: 19, duration: 11.8, delay: 1.6, drift: 45, rot: 360, opacity: 0.7, swayDur: 4.0, color: 'rgba(255, 192, 203, 0.85)' },
  { id: 10, left: '58%', size: 12, duration: 8.2, delay: 4.8, drift: -45, rot: -400, opacity: 0.8, swayDur: 3.0, color: 'rgba(254, 205, 211, 0.9)' },
  { id: 11, left: '64%', size: 16, duration: 10.9, delay: 2.0, drift: 35, rot: 350, opacity: 0.65, swayDur: 3.7, color: 'rgba(255, 182, 193, 0.85)' },
  { id: 12, left: '70%', size: 21, duration: 13.5, delay: 0.4, drift: -55, rot: -440, opacity: 0.6, swayDur: 4.6, color: 'rgba(253, 164, 175, 0.75)' },
  { id: 13, left: '76%', size: 14, duration: 9.1, delay: 3.7, drift: 40, rot: 390, opacity: 0.75, swayDur: 3.3, color: 'rgba(255, 192, 203, 0.85)' },
  { id: 14, left: '81%', size: 18, duration: 11.5, delay: 1.9, drift: -35, rot: -370, opacity: 0.7, swayDur: 4.3, color: 'rgba(254, 205, 211, 0.8)' },
  { id: 15, left: '87%', size: 13, duration: 8.6, delay: 5.5, drift: 50, rot: 420, opacity: 0.8, swayDur: 3.2, color: 'rgba(255, 182, 193, 0.9)' },
  { id: 16, left: '93%', size: 17, duration: 12.4, delay: 2.7, drift: -45, rot: -350, opacity: 0.65, swayDur: 4.1, color: 'rgba(253, 164, 175, 0.8)' },
  { id: 17, left: '6%', size: 15, duration: 10.1, delay: 6.0, drift: 35, rot: 370, opacity: 0.7, swayDur: 3.9, color: 'rgba(255, 192, 203, 0.8)' },
  { id: 18, left: '24%', size: 19, duration: 12.8, delay: 4.4, drift: -40, rot: -410, opacity: 0.65, swayDur: 4.4, color: 'rgba(254, 205, 211, 0.75)' },
  { id: 19, left: '42%', size: 14, duration: 9.6, delay: 6.2, drift: 45, rot: 360, opacity: 0.75, swayDur: 3.4, color: 'rgba(255, 182, 193, 0.85)' },
  { id: 20, left: '61%', size: 16, duration: 10.7, delay: 5.0, drift: -50, rot: -390, opacity: 0.7, swayDur: 3.7, color: 'rgba(253, 164, 175, 0.8)' },
  { id: 21, left: '79%', size: 13, duration: 8.9, delay: 6.8, drift: 30, rot: 340, opacity: 0.8, swayDur: 3.1, color: 'rgba(255, 192, 203, 0.85)' },
  { id: 22, left: '96%', size: 18, duration: 11.9, delay: 3.9, drift: -40, rot: -430, opacity: 0.65, swayDur: 4.2, color: 'rgba(254, 205, 211, 0.8)' }
];

const PRESET_COUNTS = {
  hero: 22,
  auth: 10,
  student: 7,
  teacher: 6,
  admin: 4,
  subtle: 5,
  inner: 5
};

export default function SakuraAnimation({ variant = 'hero', count, opacityMultiplier = 1 }) {
  const particleCount = typeof count === 'number' ? count : (PRESET_COUNTS[variant] || 8);
  const activeParticles = useMemo(() => SAKURA_PARTICLES.slice(0, particleCount), [particleCount]);

  return (
    <div className="sakura-container" aria-hidden="true">
      {activeParticles.map((p) => {
        const finalOpacity = Math.min(1, Math.max(0.1, p.opacity * opacityMultiplier));
        return (
          <div
            key={p.id}
            className="sakura-petal"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size * 1.25}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              '--drift-x': `${p.drift}px`,
              '--rot': `${p.rot}deg`,
              '--petal-opacity': finalOpacity
            }}
          >
            <span
              className="sakura-sway-inner"
              style={{
                animationDuration: `${p.swayDur}s`,
                color: p.color
              }}
            >
              {/* Natural Sakura Petal SVG Contour */}
              <svg
                viewBox="0 0 24 30"
                width="100%"
                height="100%"
                fill="currentColor"
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))'
                }}
              >
                <path d="M12 1 C16 6 23 10 21 19 C19 25 14 27 12 24 C10 27 5 25 3 19 C1 10 8 6 12 1 Z" />
              </svg>
            </span>
          </div>
        );
      })}
    </div>
  );
}
