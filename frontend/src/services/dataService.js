/**
 * Data Service Adapter Layer
 * Abstracted interface decoupling UI components from underlying API.
 * Currently backed by mock datasets for Phase 1 & 2.
 * Ready for seamless transition to Laravel REST API endpoints in Phase 5.
 */

import { mockPrograms } from '../data/mockPrograms';
import { mockClasses } from '../data/mockClasses';
import { mockOpportunities } from '../data/mockOpportunities';
import { mockJourney } from '../data/mockJourney';
import { mockFacilities } from '../data/mockFacilities';
import { mockTestimonials } from '../data/mockTestimonials';
import { mockArticles } from '../data/mockArticles';
import { mockFaqs } from '../data/mockFaqs';
import { mockSiteSettings } from '../data/mockSiteSettings';
import { mockRegistrations } from '../data/mockRegistrations';
import { mockGallery } from '../data/mockGallery';
import { mockUsers } from '../data/mockUsers';
import { mockActivityLogs } from '../data/mockActivityLogs';
import { apiAuth } from './apiClient';

// In-memory clones to allow interactive mock CRUD operations during session
let inMemoryPrograms = [...mockPrograms];
let inMemoryClasses = [...mockClasses];
let inMemoryOpportunities = [...mockOpportunities];
let inMemoryRegistrations = [...mockRegistrations];
let inMemoryTestimonials = [...mockTestimonials];
let inMemoryArticles = [...mockArticles];
let inMemoryGallery = [...mockGallery];
let inMemoryFacilities = [...mockFacilities];
let inMemoryFaqs = [...mockFaqs];
let inMemoryUsers = [...mockUsers];
let inMemoryActivityLogs = [...mockActivityLogs];
let inMemorySettings = { ...mockSiteSettings };

export const programService = {
  async getAll() {
    return Promise.resolve([...inMemoryPrograms]);
  },
  async getBySlug(slug) {
    const item = inMemoryPrograms.find((p) => p.slug === slug);
    return Promise.resolve(item || null);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now(), slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-') };
    inMemoryPrograms = [newItem, ...inMemoryPrograms];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryPrograms = inMemoryPrograms.map((p) => (p.id === id ? { ...p, ...data } : p));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryPrograms = inMemoryPrograms.filter((p) => p.id !== id);
    return Promise.resolve(true);
  }
};

export const classService = {
  async getAll() {
    return Promise.resolve([...inMemoryClasses]);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now() };
    inMemoryClasses = [newItem, ...inMemoryClasses];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryClasses = inMemoryClasses.map((c) => (c.id === id ? { ...c, ...data } : c));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryClasses = inMemoryClasses.filter((c) => c.id !== id);
    return Promise.resolve(true);
  }
};

export const opportunityService = {
  async getAll() {
    return Promise.resolve([...inMemoryOpportunities]);
  },
  async getBySlug(slug) {
    const item = inMemoryOpportunities.find((o) => o.slug === slug);
    return Promise.resolve(item || null);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now(), slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-') };
    inMemoryOpportunities = [newItem, ...inMemoryOpportunities];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryOpportunities = inMemoryOpportunities.map((o) => (o.id === id ? { ...o, ...data } : o));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryOpportunities = inMemoryOpportunities.filter((o) => o.id !== id);
    return Promise.resolve(true);
  }
};

export const registrationService = {
  async getAll() {
    return Promise.resolve([...inMemoryRegistrations]);
  },
  async submit(data) {
    const newReg = {
      ...data,
      id: Date.now(),
      registrationCode: 'REG-2026-' + Math.floor(100 + Math.random() * 900),
      status: 'NEW',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      adminNotes: 'Pendaftaran mandiri via website.'
    };
    inMemoryRegistrations = [newReg, ...inMemoryRegistrations];
    return Promise.resolve({
      success: true,
      message: 'Pendaftaran Anda telah berhasil dicatat. Tim konsultan LPK Lombok Shorai Rinjani akan menghubungi via WhatsApp dalam kurun waktu 1x24 jam kerja.',
      registrationId: newReg.registrationCode
    });
  },
  async updateStatus(id, newStatus) {
    inMemoryRegistrations = inMemoryRegistrations.map((r) => (r.id === id ? { ...r, status: newStatus } : r));
    return Promise.resolve(true);
  },
  async updateNotes(id, notes) {
    inMemoryRegistrations = inMemoryRegistrations.map((r) => (r.id === id ? { ...r, adminNotes: notes } : r));
    return Promise.resolve(true);
  },
  async delete(id) {
    inMemoryRegistrations = inMemoryRegistrations.filter((r) => r.id !== id);
    return Promise.resolve(true);
  }
};

export const testimonialService = {
  async getAll() {
    return Promise.resolve([...inMemoryTestimonials]);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now() };
    inMemoryTestimonials = [newItem, ...inMemoryTestimonials];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryTestimonials = inMemoryTestimonials.map((t) => (t.id === id ? { ...t, ...data } : t));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryTestimonials = inMemoryTestimonials.filter((t) => t.id !== id);
    return Promise.resolve(true);
  }
};

export const articleService = {
  async getAll() {
    return Promise.resolve([...inMemoryArticles]);
  },
  async getBySlug(slug) {
    const item = inMemoryArticles.find((a) => a.slug === slug);
    return Promise.resolve(item || null);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now(), slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-') };
    inMemoryArticles = [newItem, ...inMemoryArticles];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryArticles = inMemoryArticles.map((a) => (a.id === id ? { ...a, ...data } : a));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryArticles = inMemoryArticles.filter((a) => a.id !== id);
    return Promise.resolve(true);
  }
};

export const galleryService = {
  async getAll() {
    return Promise.resolve([...inMemoryGallery]);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now() };
    inMemoryGallery = [newItem, ...inMemoryGallery];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryGallery = inMemoryGallery.map((g) => (g.id === id ? { ...g, ...data } : g));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryGallery = inMemoryGallery.filter((g) => g.id !== id);
    return Promise.resolve(true);
  }
};

export const facilityService = {
  async getAll() {
    return Promise.resolve([...inMemoryFacilities]);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now() };
    inMemoryFacilities = [newItem, ...inMemoryFacilities];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryFacilities = inMemoryFacilities.map((f) => (f.id === id ? { ...f, ...data } : f));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryFacilities = inMemoryFacilities.filter((f) => f.id !== id);
    return Promise.resolve(true);
  }
};

export const faqService = {
  async getAll() {
    return Promise.resolve([...inMemoryFaqs]);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now() };
    inMemoryFaqs = [newItem, ...inMemoryFaqs];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryFaqs = inMemoryFaqs.map((f) => (f.id === id ? { ...f, ...data } : f));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryFaqs = inMemoryFaqs.filter((f) => f.id !== id);
    return Promise.resolve(true);
  }
};

export const userService = {
  async getAll() {
    return Promise.resolve([...inMemoryUsers]);
  },
  async create(data) {
    const newItem = { ...data, id: Date.now(), lastLogin: 'Belum Pernah' };
    inMemoryUsers = [newItem, ...inMemoryUsers];
    return Promise.resolve(newItem);
  },
  async update(id, data) {
    inMemoryUsers = inMemoryUsers.map((u) => (u.id === id ? { ...u, ...data } : u));
    return Promise.resolve(data);
  },
  async delete(id) {
    inMemoryUsers = inMemoryUsers.filter((u) => u.id !== id);
    return Promise.resolve(true);
  }
};

export const activityLogService = {
  async getAll() {
    return Promise.resolve([...inMemoryActivityLogs]);
  }
};

export const journeyService = {
  async getAll() {
    return Promise.resolve(mockJourney);
  }
};

export const settingsService = {
  async getSettings() {
    return Promise.resolve({ ...inMemorySettings });
  },
  async updateSettings(data) {
    inMemorySettings = { ...inMemorySettings, ...data };
    return Promise.resolve({ ...inMemorySettings });
  }
};

export const authService = {
  /**
   * Unified Authentication with Exactly 3 Roles: SISWA, PENGAJAR, ADMIN
   * Authorization Authority: Verified user role from backend/account, NOT frontend selection.
   */
  async login(email, password, intendedRole = 'SISWA', turnstileToken = null) {
    if (!email || !password) {
      return Promise.reject(new Error('Alamat email dan kata sandi wajib diisi.'));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Attempt Laravel Backend Authentication with Turnstile Verification
    try {
      const response = await apiAuth.login(normalizedEmail, password, turnstileToken);
      if (response && response.success && response.data) {
        const { token, user, role, redirectUrl } = response.data;
        const verifiedRole = role || user.role || 'SISWA';

        const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof global !== 'undefined' && global.localStorage ? global.localStorage : null);
        if (storage) {
          storage.setItem('lpk_auth_token', token);
          storage.setItem('lpk_auth_user', JSON.stringify(user));
          if (verifiedRole === 'ADMIN') storage.setItem('lpk_admin_user', JSON.stringify(user));
          else if (verifiedRole === 'PENGAJAR') storage.setItem('lpk_teacher_user', JSON.stringify(user));
          else storage.setItem('lpk_student_user', JSON.stringify(user));
        }

        return {
          success: true,
          token,
          user,
          role: verifiedRole,
          redirectUrl: redirectUrl || this.getDashboardRoute(verifiedRole)
        };
      }
    } catch (apiErr) {
      // If server responded with a validation error (422), unauthorized (401), or forbidden (403), throw server message!
      if (apiErr.response && apiErr.response.data) {
        const errorData = apiErr.response.data;
        const message = errorData.message || (errorData.errors ? Object.values(errorData.errors)[0]?.[0] : null) || 'Login gagal. Periksa kembali email dan kata sandi Anda.';
        return Promise.reject(new Error(message));
      }
      // If network error / backend offline, continue to fallback below
    }

    // 2. Development / Offline Fallback conforming to 3 roles
    let user = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      const validRole = ['SISWA', 'PENGAJAR', 'ADMIN'].includes(intendedRole) ? intendedRole : 'SISWA';
      user = {
        id: Date.now(),
        name: email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        email: normalizedEmail,
        phone: '081234567890',
        role: validRole,
        status: 'ACTIVE',
        lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
        department: validRole === 'ADMIN' ? 'Manajemen Kampus' : validRole === 'PENGAJAR' ? 'Sensei Pengajar' : 'Calon Siswa'
      };
      inMemoryUsers = [...inMemoryUsers, user];
    }

    let redirectUrl = this.getDashboardRoute(user.role);

    const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof global !== 'undefined' && global.localStorage ? global.localStorage : null);

    if (storage) {
      storage.setItem('lpk_auth_user', JSON.stringify(user));
      if (user.role === 'ADMIN') {
        storage.setItem('lpk_admin_user', JSON.stringify(user));
      } else if (user.role === 'PENGAJAR') {
        storage.setItem('lpk_teacher_user', JSON.stringify(user));
      } else {
        storage.setItem('lpk_student_user', JSON.stringify(user));
      }
    }

    return Promise.resolve({
      success: true,
      user,
      role: user.role,
      redirectUrl
    });
  },

  /**
   * Register a new student account via backend or offline fallback.
   */
  async register({ fullName, email, phone, password, programInterest, japanGoal, turnstileToken = null }) {
    if (!fullName || !email || !password) {
      return Promise.reject(new Error('Nama lengkap, email, dan kata sandi wajib diisi.'));
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Attempt Laravel Backend Registration with Turnstile Verification
    try {
      const response = await apiAuth.register({
        name: fullName.trim(),
        email: normalizedEmail,
        password,
        phone: phone || '',
        turnstileToken
      });

      if (response && response.success && response.data) {
        const { token, user, role, redirectUrl } = response.data;
        const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof global !== 'undefined' && global.localStorage ? global.localStorage : null);
        if (storage) {
          storage.setItem('lpk_auth_token', token);
          storage.setItem('lpk_auth_user', JSON.stringify(user));
          storage.setItem('lpk_student_user', JSON.stringify(user));
        }

        return {
          success: true,
          token,
          user,
          role: role || 'SISWA',
          redirectUrl: redirectUrl || '/dashboard'
        };
      }
    } catch (apiErr) {
      if (apiErr.response && apiErr.response.data) {
        const errorData = apiErr.response.data;
        const message = errorData.message || (errorData.errors ? Object.values(errorData.errors)[0]?.[0] : null) || 'Pendaftaran gagal.';
        return Promise.reject(new Error(message));
      }
    }

    // 2. Offline / Mock fallback
    const existing = inMemoryUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return Promise.reject(new Error('Alamat email sudah terdaftar. Silakan masuk menggunakan akun Anda.'));
    }

    const newStudentId = Date.now();
    const newStudent = {
      id: newStudentId,
      name: fullName.trim(),
      email: normalizedEmail,
      phone: phone || '',
      role: 'SISWA',
      status: 'ACTIVE',
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
      department: 'Calon Siswa'
    };

    inMemoryUsers = [...inMemoryUsers, newStudent];

    if (programInterest) {
      const regCode = 'REG-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
      const initialReg = {
        id: Date.now() + 1,
        userId: newStudentId,
        registrationCode: regCode,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone || '',
        dob: '',
        education: 'SMA/SMK',
        city: 'Mataram',
        programInterest: programInterest || 'Bahasa Jepang Dasar (N5)',
        japaneseLevel: 'Belum Pernah Belajar (Nol)',
        japanGoal: japanGoal || 'Persiapan Studi & Kerja ke Jepang',
        status: 'NEW',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        adminNotes: 'Pendaftaran mandiri siswa baru.'
      };
      inMemoryRegistrations = [initialReg, ...inMemoryRegistrations];
    }

    const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof global !== 'undefined' && global.localStorage ? global.localStorage : null);
    if (storage) {
      storage.setItem('lpk_auth_user', JSON.stringify(newStudent));
      storage.setItem('lpk_student_user', JSON.stringify(newStudent));
    }

    return Promise.resolve({ success: true, user: newStudent, redirectUrl: '/dashboard' });
  },

  /**
   * Request Google OAuth URL from Backend.
   * Throws error if backend has not configured Google OAuth.
   */
  async getGoogleOAuthUrl() {
    try {
      const res = await apiAuth.getGoogleOAuthUrl();
      if (res && res.data && res.data.configured && res.data.url) {
        return res.data.url;
      }
      throw new Error('Layanan Google OAuth belum dikonfigurasi di server backend. Silakan gunakan email dan kata sandi.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Layanan Google OAuth belum dikonfigurasi di server backend.';
      throw new Error(msg);
    }
  },

  logout() {
    const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof global !== 'undefined' && global.localStorage ? global.localStorage : null);
    if (storage) {
      storage.removeItem('lpk_auth_token');
      storage.removeItem('lpk_auth_user');
      storage.removeItem('lpk_admin_user');
      storage.removeItem('lpk_teacher_user');
      storage.removeItem('lpk_student_user');
    }
    apiAuth.logout();
    return Promise.resolve(true);
  },

  getCurrentUser() {
    const storage = typeof window !== 'undefined' && window.localStorage ? window.localStorage : (typeof global !== 'undefined' && global.localStorage ? global.localStorage : null);
    if (storage) {
      const stored = storage.getItem('lpk_auth_user') ||
        storage.getItem('lpk_admin_user') ||
        storage.getItem('lpk_teacher_user') ||
        storage.getItem('lpk_student_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  },

  getDashboardRoute(role) {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'PENGAJAR':
        return '/teacher/dashboard';
      case 'SISWA':
      default:
        return '/dashboard';
    }
  }
};

export const studentAuthService = {
  async login(email, password, turnstileToken = null) {
    return authService.login(email, password, 'SISWA', turnstileToken);
  },

  async register(data) {
    return authService.register(data);
  },

  logout() {
    return authService.logout();
  },

  getCurrentUser() {
    return authService.getCurrentUser();
  },

  async getMyRegistrations(userId) {
    const list = inMemoryRegistrations.filter((r) => r.userId === userId);
    return Promise.resolve(list);
  }
};


