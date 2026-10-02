import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, PhoneCall, ChevronDown, LogIn, User, UserPlus, Globe } from 'lucide-react';
import Button from './Button';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '../../context/LanguageContext';
import { BRAND } from '../../config/brand';
import { studentAuthService } from '../../services/dataService';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const currentStudent = studentAuthService.getCurrentUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside click for "Lainnya" dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Core navigation items displayed on desktop header
  const primaryNavLinks = [
    { name: t('nav.home', 'Beranda'), to: '/' },
    { name: t('nav.about', 'Tentang'), to: '/about' },
    { name: t('nav.programs', 'Program'), to: '/programs' },
    { name: t('nav.classes', 'Jadwal'), to: '/classes' },
    { name: t('nav.opportunities', 'Peluang'), to: '/opportunities' },
    { name: t('nav.journey', 'Alur Belajar'), to: '/journey' },
    { name: t('nav.contact', 'Kontak'), to: '/contact' }
  ];

  // Secondary items accessible via "Lainnya" dropdown on desktop
  const secondaryNavLinks = [
    { name: t('nav.facilities', 'Fasilitas Pelatihan'), to: '/facilities' },
    { name: t('nav.stories', 'Cerita Alumni'), to: '/stories' },
    { name: t('nav.articles', 'Artikel & Edukasi'), to: '/articles' },
    { name: t('nav.faq', 'Tanya Jawab (FAQ)'), to: '/faq' }
  ];

  // Complete list for mobile drawer navigation
  const allNavLinks = [
    { name: t('nav.home', 'Beranda'), to: '/' },
    { name: t('nav.aboutFull', 'Tentang LPK'), to: '/about' },
    { name: t('nav.programsFull', 'Program Pelatihan'), to: '/programs' },
    { name: t('nav.classesFull', 'Jadwal Kelas'), to: '/classes' },
    { name: t('nav.opportunitiesFull', 'Peluang Karier'), to: '/opportunities' },
    { name: t('nav.journey', 'Alur Belajar'), to: '/journey' },
    { name: t('nav.facilitiesFull', 'Fasilitas Kampus'), to: '/facilities' },
    { name: t('nav.storiesFull', 'Cerita & Testimoni Alumni'), to: '/stories' },
    { name: t('nav.articlesFull', 'Artikel & Berita Jepang'), to: '/articles' },
    { name: t('nav.faq', 'Tanya Jawab (FAQ)'), to: '/faq' },
    { name: t('nav.contactFull', 'Hubungi Kami'), to: '/contact' }
  ];

  const isSecondaryActive = secondaryNavLinks.some(link => location.pathname === link.to);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="navbar-inner">
            
            {/* BRAND BLOCK: Strictly horizontal, logo left, name right, ONE LINE, NO Japanese text */}
            <Link to="/" className="navbar-brand" aria-label={BRAND.name}>
              <div className="navbar-logo-wrap">
                <img
                  src={BRAND.logo}
                  alt={BRAND.name}
                  className="navbar-logo-img"
                  width="44"
                  height="44"
                />
              </div>
              <span className="navbar-brand-name">
                {BRAND.name}
              </span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav className="navbar-desktop-nav" aria-label="Navigasi Utama">
              {primaryNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`}
                >
                  {link.name}
                </NavLink>
              ))}

              {/* Secondary Pages Dropdown */}
              <div ref={moreRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`navbar-nav-link ${isSecondaryActive ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                  aria-haspopup="true"
                  aria-expanded={moreDropdownOpen}
                >
                  <span>{t('nav.more', 'Lainnya')}</span>
                  <ChevronDown
                    size={14}
                    style={{
                      transform: moreDropdownOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </button>

                {moreDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      minWidth: '210px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-hover)',
                      padding: '0.4rem',
                      zIndex: 250,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      animation: 'navFadeIn 0.15s ease-out'
                    }}
                  >
                    {secondaryNavLinks.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMoreDropdownOpen(false)}
                        className={({ isActive }) => `navbar-nav-link ${isActive ? 'active' : ''}`}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '0.55rem 0.85rem',
                          textAlign: 'left'
                        }}
                      >
                        {link.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* HEADER UTILITY FEATURES */}
            <div className="navbar-utilities">
              {/* Desktop-only Language Control */}
              <div className="navbar-desktop-utilities">
                <LanguageSwitcher />
              </div>

              {/* Public Student Account Access: [Masuk] [Daftar Sekarang] (Desktop only) */}
              <div className="navbar-desktop-cta" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {currentStudent ? (
                  <Link
                    to="/dashboard"
                    className="navbar-student-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.42rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--surface-muted)',
                      border: '1px solid var(--border-subtle)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    title="Buka Dashboard Siswa"
                  >
                    <User size={15} color="var(--vermilion)" />
                    <span>{currentStudent.name ? currentStudent.name.split(' ')[0] : 'Siswa'} (Dashboard)</span>
                  </Link>
                ) : (
                  <Button to="/login" variant="primary" size="sm" icon={LogIn}>
                    {t('nav.loginRegister', 'Masuk / Daftar')}
                  </Button>
                )}
              </div>

              {/* Mobile Drawer Trigger (Only control on mobile navbar alongside logo & brand) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? t('nav.closeMenu', 'Tutup Menu') : t('nav.openMenu', 'Buka Menu Navigasi')}
                className="mobile-toggle-btn"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
            transition: 'opacity 0.25s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '88%',
              maxWidth: '380px',
              height: '100%',
              backgroundColor: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-drawer)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto'
            }}
          >
            <div>
              {/* Mobile Drawer Header: Strictly horizontal, ONE LINE, NO Japanese text */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <div className="navbar-brand" style={{ gap: '0.65rem' }}>
                  <div className="navbar-logo-wrap" style={{ width: '34px', height: '34px' }}>
                    <img
                      src={BRAND.logo}
                      alt={BRAND.name}
                      className="navbar-logo-img"
                      width="34"
                      height="34"
                    />
                  </div>
                  <span
                    className="navbar-brand-name"
                    style={{
                      fontSize: '0.94rem',
                      fontWeight: 750,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {BRAND.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer'
                  }}
                  aria-label="Tutup Menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Full Navigation Links */}
              <nav aria-label="Navigasi Mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {allNavLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 700 : 500,
                      backgroundColor: isActive ? 'var(--vermilion-subtle)' : 'transparent',
                      color: isActive ? 'var(--vermilion)' : 'var(--text-primary)',
                      transition: 'background-color 0.15s ease'
                    })}
                  >
                    <span>{link.name}</span>
                    <ArrowRight size={13} opacity={0.6} />
                  </NavLink>
                ))}
              </nav>

              {/* Divider between Navigation and Settings */}
              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '1rem 0' }} />

              {/* Bahasa (Language Selection) */}
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <Globe size={14} color="var(--vermilion)" />
                  <span>{t('nav.languageLabel', 'Bahasa')}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                  {[
                    { code: 'ID', label: 'Indonesia' },
                    { code: 'EN', label: 'English' },
                    { code: 'JP', label: '日本語' }
                  ].map((langItem) => {
                    const isSelected = language === langItem.code;
                    return (
                      <button
                        key={langItem.code}
                        type="button"
                        onClick={() => setLanguage(langItem.code)}
                        style={{
                          padding: '0.5rem 0.3rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          border: isSelected ? '1px solid var(--vermilion)' : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'var(--vermilion)' : 'var(--bg-surface-subtle)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {langItem.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Drawer Bottom CTAs: Student Account & WhatsApp */}
            <div
              style={{
                paddingTop: '1.25rem',
                marginTop: '1.25rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
            >
              {currentStudent ? (
                <Button to="/dashboard" variant="primary" size="md" icon={User}>
                  Dashboard Siswa ({currentStudent.name ? currentStudent.name.split(' ')[0] : 'Siswa'})
                </Button>
              ) : (
                <Button to="/login" variant="primary" size="md" icon={LogIn} iconPosition="left">
                  {t('nav.loginRegister', 'Masuk / Daftar')}
                </Button>
              )}
              <Button
                href={BRAND.whatsappUrl}
                variant="ghost"
                size="md"
                icon={PhoneCall}
                iconPosition="left"
              >
                {t('nav.consultWa', 'Konsultasi WhatsApp')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

