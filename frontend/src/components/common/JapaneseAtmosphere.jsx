import React from 'react';
import SakuraAnimation from '../public/SakuraAnimation';

/**
 * Reusable Global Japanese Atmosphere Background System
 * Provides unified Japanese visual atmosphere with dark/light mode adaptability,
 * calibrated readability overlays, and non-blocking decorative sakura particles.
 */

const THEME_PRESETS = {
  hero: {
    bgImage: '/assets/backgrounds/japanese-illustration.png',
    bgPosition: 'center 35%',
    darkOverlay: 'linear-gradient(180deg, rgba(8, 12, 22, 0.5) 0%, rgba(8, 12, 22, 0.6) 55%, rgba(8, 12, 22, 0.78) 100%)',
    lightOverlay: 'linear-gradient(180deg, rgba(253, 250, 245, 0.1) 0%, rgba(250, 246, 239, 0.2) 55%, rgba(247, 242, 233, 0.3) 100%)',
    sakuraCount: 16,
    sakuraOpacity: 0.85
  },
  auth: {
    bgImage: '/assets/backgrounds/japanese-illustration.png',
    bgPosition: 'center center',
    darkOverlay: 'linear-gradient(180deg, rgba(8, 12, 22, 0.7) 0%, rgba(8, 12, 22, 0.8) 50%, rgba(8, 12, 22, 0.9) 100%)',
    lightOverlay: 'linear-gradient(180deg, rgba(253, 250, 245, 0.2) 0%, rgba(250, 246, 239, 0.3) 50%, rgba(247, 242, 233, 0.4) 100%)',
    sakuraCount: 10,
    sakuraOpacity: 0.75
  },
  student: {
    bgImage: '/assets/backgrounds/japanese-illustration.png',
    bgPosition: 'center top',
    darkOverlay: 'linear-gradient(180deg, rgba(10, 14, 23, 0.82) 0%, rgba(10, 14, 23, 0.88) 50%, rgba(8, 11, 18, 0.94) 100%)',
    lightOverlay: 'linear-gradient(180deg, rgba(252, 249, 244, 0.78) 0%, rgba(250, 246, 240, 0.84) 50%, rgba(246, 241, 234, 0.9) 100%)',
    sakuraCount: 5,
    sakuraOpacity: 0.4
  },
  teacher: {
    bgImage: '/assets/backgrounds/japanese-illustration.png',
    bgPosition: 'center top',
    darkOverlay: 'linear-gradient(180deg, rgba(12, 16, 24, 0.82) 0%, rgba(10, 14, 20, 0.88) 50%, rgba(7, 10, 15, 0.94) 100%)',
    lightOverlay: 'linear-gradient(180deg, rgba(252, 249, 244, 0.78) 0%, rgba(250, 246, 240, 0.84) 50%, rgba(246, 241, 234, 0.9) 100%)',
    sakuraCount: 5,
    sakuraOpacity: 0.4
  },
  admin: {
    bgImage: '/assets/backgrounds/japanese-illustration.png',
    bgPosition: 'center top',
    darkOverlay: 'linear-gradient(180deg, rgba(10, 13, 18, 0.85) 0%, rgba(8, 10, 15, 0.9) 50%, rgba(5, 7, 10, 0.95) 100%)',
    lightOverlay: 'linear-gradient(180deg, rgba(248, 250, 252, 0.82) 0%, rgba(241, 245, 249, 0.86) 50%, rgba(226, 232, 240, 0.9) 100%)',
    sakuraCount: 4,
    sakuraOpacity: 0.35
  },
  inner: {
    bgImage: '/assets/backgrounds/japanese-illustration.png',
    bgPosition: 'center 30%',
    darkOverlay: 'linear-gradient(180deg, rgba(10, 14, 23, 0.65) 0%, rgba(10, 14, 23, 0.78) 50%, rgba(8, 11, 18, 0.88) 100%)',
    lightOverlay: 'linear-gradient(180deg, rgba(252, 249, 244, 0.35) 0%, rgba(250, 246, 240, 0.45) 50%, rgba(246, 241, 234, 0.55) 100%)',
    sakuraCount: 8,
    sakuraOpacity: 0.55
  }
};

export default function JapaneseAtmosphere({
  variant = 'inner',
  showSakura = true,
  fixed = false,
  customOverlay,
  opacityMultiplier
}) {
  const preset = THEME_PRESETS[variant] || THEME_PRESETS.inner;
  const overlayGradient = customOverlay || preset.lightOverlay;
  const finalSakuraOpacity = typeof opacityMultiplier === 'number' ? opacityMultiplier : preset.sakuraOpacity;

  return (
    <div
      className="japanese-atmosphere-system"
      style={{
        position: fixed ? 'fixed' : 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none'
      }}
      aria-hidden="true"
    >
      {/* 1. Cinematic Japanese Atmosphere Photography */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url('${preset.bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: preset.bgPosition,
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          transform: 'scale(1.02)'
        }}
      />

      {/* 2. Theme-Calibrated Readability Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: overlayGradient,
          zIndex: 1,
          transition: 'background 0.3s ease'
        }}
      />

      {/* 3. Reusable Falling Sakura Atmosphere Particles */}
      {showSakura && (
        <SakuraAnimation
          count={preset.sakuraCount}
          opacityMultiplier={finalSakuraOpacity}
        />
      )}
    </div>
  );
}
