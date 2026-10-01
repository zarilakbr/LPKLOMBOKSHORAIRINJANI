import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import JapaneseAtmosphere from './JapaneseAtmosphere';

export default function PublicLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="public-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Subtle Japanese Visual Atmosphere on inner public pages */}
      {!isHomePage && <JapaneseAtmosphere variant="inner" fixed={true} opacityMultiplier={0.45} />}

      <Navbar />
      <main style={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
