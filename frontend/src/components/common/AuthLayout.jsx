import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * Standalone Authentication Layout for /login and /register
 * CRITICAL RULE: NO FOOTER WHATSOEVER.
 * Displays clean header navbar + centered full-viewport auth card.
 */
export default function AuthLayout() {
  return (
    <div
      className="auth-layout"
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundColor: 'var(--bg-canvas)'
      }}
    >
      {/* Official Clean Navbar (Header) */}
      <Navbar />

      {/* Main Authentication Viewport Content - Centered, NO FOOTER */}
      <main
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1,
          width: '100%',
          minHeight: 'calc(100vh - var(--header-height, 76px))',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        <Outlet />
      </main>

      {/* ABSOLUTELY NO FOOTER ON AUTH PAGES */}
    </div>
  );
}
