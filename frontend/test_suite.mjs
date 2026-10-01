import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from './src/AppRoutes.jsx';
import { ThemeProvider } from './src/context/ThemeContext.jsx';
import { LanguageProvider } from './src/context/LanguageContext.jsx';

const allRoutes = [
  // Public Routes (18)
  '/',
  '/about',
  '/programs',
  '/programs/bahasa-jepang-dasar-n5',
  '/classes',
  '/opportunities',
  '/opportunities/caregiver-perawat-lansia-kaigo',
  '/journey',
  '/facilities',
  '/stories',
  '/articles',
  '/articles/panduan-lengkap-visa-tokutei-ginou-ssw-2026',
  '/faq',
  '/contact',
  '/login',
  '/register',
  '/apply',
  '/halaman-tidak-ada',

  // Siswa Dashboard Routes (6)
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/registrations',
  '/dashboard/programs',
  '/dashboard/schedule',
  '/dashboard/settings',

  // Pengajar Dashboard Routes (8)
  '/teacher/dashboard',
  '/teacher/classes',
  '/teacher/schedule',
  '/teacher/students',
  '/teacher/materials',
  '/teacher/attendance',
  '/teacher/profile',
  '/teacher/settings',

  // Admin Routes (14)
  '/admin/login',
  '/admin/dashboard',
  '/admin/programs',
  '/admin/classes',
  '/admin/opportunities',
  '/admin/registrations',
  '/admin/testimonials',
  '/admin/articles',
  '/admin/gallery',
  '/admin/facilities',
  '/admin/faqs',
  '/admin/users',
  '/admin/settings',
  '/admin/activity-logs'
];

console.log('--- STARTING COMPLETE ROUTE VERIFICATION (PUBLIC, STUDENT, TEACHER, ADMIN) ---');

let passCount = 0;
for (const route of allRoutes) {
  try {
    if (typeof global.localStorage === 'undefined') {
      let store = {};
      global.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, val) => { store[key] = String(val); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
      };
    }

    if (route.startsWith('/dashboard')) {
      global.localStorage.setItem('lpk_auth_user', JSON.stringify({
        id: 3,
        name: 'Budi Santoso',
        email: 'siswa@lpk-lombokshorairinjani.com',
        role: 'SISWA'
      }));
      global.localStorage.setItem('lpk_student_user', JSON.stringify({
        id: 3,
        name: 'Budi Santoso',
        email: 'siswa@lpk-lombokshorairinjani.com',
        role: 'SISWA'
      }));
    } else if (route.startsWith('/teacher')) {
      global.localStorage.setItem('lpk_auth_user', JSON.stringify({
        id: 2,
        name: 'Kenji Sato, S.Pd',
        email: 'pengajar@lpk-lombokshorairinjani.com',
        role: 'PENGAJAR'
      }));
      global.localStorage.setItem('lpk_teacher_user', JSON.stringify({
        id: 2,
        name: 'Kenji Sato, S.Pd',
        email: 'pengajar@lpk-lombokshorairinjani.com',
        role: 'PENGAJAR'
      }));
    } else if (route.startsWith('/admin') && route !== '/admin/login') {
      global.localStorage.setItem('lpk_auth_user', JSON.stringify({
        id: 1,
        name: 'Administrator',
        email: 'admin@lpk-lombokshorairinjani.com',
        role: 'ADMIN'
      }));
      global.localStorage.setItem('lpk_admin_user', JSON.stringify({
        id: 1,
        name: 'Administrator',
        email: 'admin@lpk-lombokshorairinjani.com',
        role: 'ADMIN'
      }));
    } else {
      global.localStorage.removeItem('lpk_auth_user');
      global.localStorage.removeItem('lpk_student_user');
      global.localStorage.removeItem('lpk_teacher_user');
      global.localStorage.removeItem('lpk_admin_user');
    }

    const html = renderToString(
      React.createElement(
        ThemeProvider,
        null,
        React.createElement(
          LanguageProvider,
          null,
          React.createElement(
            MemoryRouter,
            { initialEntries: [route] },
            React.createElement(AppRoutes, null)
          )
        )
      )
    );

    if (!html || html.length < 50) {
      throw new Error(`Rendered HTML too short (${html.length} chars)`);
    }
    console.log(`[PASS] ${route.padEnd(55)} -> OK (${html.length} chars)`);
    passCount++;
  } catch (err) {
    console.error(`[FAIL] ${route}`, err);
    process.exit(1);
  }
}

console.log(`--- ALL ${passCount} ROUTES (PUBLIC, STUDENT, TEACHER & ADMIN) RENDERED WITH ZERO ERRORS ---`);
