/**
 * Data Service API Adapter Layer
 * LPK Lombok Shorai Rinjani
 *
 * Fully API-driven adapter connecting UI components directly to Laravel backend REST APIs.
 * Eliminates all insecure offline auth fallbacks and in-memory mock mutations in production.
 */

import apiClient, { apiAuth } from './apiClient';
import { mockJourney } from '../data/mockJourney';

/**
 * 1. PROGRAM SERVICE
 * Public: GET /api/programs, GET /api/programs/{slug}
 * Admin: GET/POST/PUT/DELETE /api/admin/programs
 */
export const programService = {
  async getAll(params = {}) {
    const user = authService.getCurrentUser();
    const endpoint = user?.role === 'ADMIN' ? '/admin/programs' : '/programs';
    const res = await apiClient.get(endpoint, { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getBySlug(slug) {
    const res = await apiClient.get(`/programs/${slug}`);
    return res.data?.data || null;
  },

  async create(data) {
    const payload = {
      title: data.title,
      category: data.category,
      level: data.level,
      short_description: data.shortDescription || data.short_description || '',
      full_description: data.fullDescription || data.full_description || '',
      duration: data.duration,
      schedule: data.schedule,
      price_estimate: data.priceEstimate || data.price_estimate || '',
      curriculum: data.curriculum || [],
      status: data.status || 'ACTIVE',
      order: data.order || 0
    };
    const res = await apiClient.post('/admin/programs', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      title: data.title,
      category: data.category,
      level: data.level,
      short_description: data.shortDescription || data.short_description || '',
      full_description: data.fullDescription || data.full_description || '',
      duration: data.duration,
      schedule: data.schedule,
      price_estimate: data.priceEstimate || data.price_estimate || '',
      curriculum: data.curriculum || [],
      status: data.status || 'ACTIVE',
      order: data.order || 0
    };
    const res = await apiClient.put(`/admin/programs/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/programs/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 2. ADMIN CLASS SERVICE
 * Explicit Admin endpoints: /api/admin/classes
 */
export const adminClassService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/classes', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getById(id) {
    const res = await apiClient.get(`/admin/classes/${id}`);
    return res.data?.data || null;
  },

  async create(data) {
    const payload = {
      class_name: data.className || data.class_name,
      program_id: data.programId || data.program_id || null,
      teacher_id: data.teacherId || data.teacher_id || null,
      instructor: data.instructor || null,
      level: data.level || null,
      schedule: data.schedule,
      start_date: data.startDate || data.start_date || new Date().toISOString().slice(0, 10),
      end_date: data.endDate || data.end_date || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      capacity: parseInt(data.capacity, 10) || 20,
      current_students: parseInt(data.currentStudents ?? data.current_students ?? 0, 10) || 0,
      location: data.location || 'Ruang Kelas LPK',
      status: data.status || 'OPEN',
      description: data.description || null
    };
    const res = await apiClient.post('/admin/classes', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      class_name: data.className || data.class_name,
      program_id: data.programId || data.program_id || null,
      teacher_id: data.teacherId || data.teacher_id || null,
      instructor: data.instructor || null,
      level: data.level || null,
      schedule: data.schedule,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      capacity: parseInt(data.capacity, 10) || 20,
      current_students: parseInt(data.currentStudents ?? data.current_students ?? 0, 10) || 0,
      location: data.location,
      status: data.status || 'OPEN',
      description: data.description || null
    };
    const res = await apiClient.put(`/admin/classes/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/classes/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 2B. TEACHER CLASS SERVICE
 * Explicit Teacher endpoints: /api/teacher/classes
 * Note: teacher_id is NEVER sent; backend Sanctum sets teacher_id = auth()->id()
 */
export const teacherClassService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/teacher/classes', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getById(id) {
    const res = await apiClient.get(`/teacher/classes/${id}`);
    return res.data?.data || null;
  },

  async create(data) {
    const payload = {
      class_name: data.className || data.class_name,
      program_id: data.programId || data.program_id || null,
      level: data.level || null,
      schedule: data.schedule,
      start_date: data.startDate || data.start_date || new Date().toISOString().slice(0, 10),
      end_date: data.endDate || data.end_date || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      capacity: parseInt(data.capacity, 10) || 20,
      location: data.location || 'Ruang Kelas LPK',
      status: data.status || 'OPEN',
      description: data.description || null
    };
    const res = await apiClient.post('/teacher/classes', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      class_name: data.className || data.class_name,
      program_id: data.programId || data.program_id || null,
      level: data.level || null,
      schedule: data.schedule,
      start_date: data.startDate || data.start_date,
      end_date: data.endDate || data.end_date,
      capacity: parseInt(data.capacity, 10) || 20,
      location: data.location,
      status: data.status || 'OPEN',
      description: data.description || null
    };
    const res = await apiClient.put(`/teacher/classes/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/teacher/classes/${id}`);
    return res.data?.success ?? true;
  },

  async getStudents(classId) {
    const res = await apiClient.get(`/teacher/classes/${classId}/students`);
    return res.data?.data || [];
  },

  async getAttendance(classId, params = {}) {
    const res = await apiClient.get(`/teacher/classes/${classId}/attendance`, { params });
    return res.data?.data || [];
  },

  async getSessions(classId) {
    const res = await apiClient.get('/teacher/schedule', { params: { class_id: classId, sessions: 1 } });
    return res.data?.data || [];
  },

  async createSession(data) {
    const res = await apiClient.post('/teacher/schedule', data);
    return res.data?.data;
  },

  async getMaterials(classId) {
    const res = await apiClient.get('/teacher/materials', { params: { class_id: classId } });
    return res.data?.data || [];
  }
};

/**
 * Legacy/Public CLASS SERVICE
 * Backwards compatibility helper for existing pages
 */
export const classService = {
  async getAll(params = {}) {
    const user = authService.getCurrentUser();
    if (user?.role === 'ADMIN') {
      return adminClassService.getAll(params);
    }
    if (user?.role === 'PENGAJAR') {
      return teacherClassService.getAll(params);
    }
    const res = await apiClient.get('/classes', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getById(id) {
    const user = authService.getCurrentUser();
    if (user?.role === 'ADMIN') return adminClassService.getById(id);
    if (user?.role === 'PENGAJAR') return teacherClassService.getById(id);
    const res = await apiClient.get(`/classes/${id}`);
    return res.data?.data || null;
  },

  async create(data) {
    const user = authService.getCurrentUser();
    if (user?.role === 'PENGAJAR') return teacherClassService.create(data);
    return adminClassService.create(data);
  },

  async update(id, data) {
    const user = authService.getCurrentUser();
    if (user?.role === 'PENGAJAR') return teacherClassService.update(id, data);
    return adminClassService.update(id, data);
  },

  async delete(id) {
    const user = authService.getCurrentUser();
    if (user?.role === 'PENGAJAR') return teacherClassService.delete(id);
    return adminClassService.delete(id);
  }
};

/**
 * 3. OPPORTUNITY SERVICE
 * Public: GET /api/opportunities, GET /api/opportunities/{slug}
 * Admin: GET/POST/PUT/DELETE /api/admin/opportunities
 */
export const opportunityService = {
  async getAll(params = {}) {
    const user = authService.getCurrentUser();
    const endpoint = user?.role === 'ADMIN' ? '/admin/opportunities' : '/opportunities';
    const res = await apiClient.get(endpoint, { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getBySlug(slug) {
    const res = await apiClient.get(`/opportunities/${slug}`);
    return res.data?.data || null;
  },

  async create(data) {
    const payload = {
      title: data.title,
      company_name: data.company || data.company_name || null,
      location: data.location,
      sector: data.sector,
      visa_type: data.visaType || data.visa_type || null,
      salary_range: data.salaryRange || data.salary_range || null,
      language_req: data.languageReq || data.language_req || 'JLPT N4 / JFT-Basic A2',
      age_req: data.ageReq || data.age_req || null,
      description: data.description || data.title || '',
      requirements: Array.isArray(data.requirements) ? data.requirements : (data.requirements ? [data.requirements] : []),
      benefits: Array.isArray(data.benefits) ? data.benefits : (data.benefits ? [data.benefits] : []),
      deadline: data.deadline || null,
      status: data.status || 'OPEN'
    };
    const res = await apiClient.post('/admin/opportunities', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      title: data.title,
      company_name: data.company || data.company_name || null,
      location: data.location,
      sector: data.sector,
      visa_type: data.visaType || data.visa_type || null,
      salary_range: data.salaryRange || data.salary_range || null,
      language_req: data.languageReq || data.language_req || 'JLPT N4 / JFT-Basic A2',
      age_req: data.ageReq || data.age_req || null,
      description: data.description || data.title || '',
      requirements: Array.isArray(data.requirements) ? data.requirements : (data.requirements ? [data.requirements] : []),
      benefits: Array.isArray(data.benefits) ? data.benefits : (data.benefits ? [data.benefits] : []),
      deadline: data.deadline || null,
      status: data.status || 'OPEN'
    };
    const res = await apiClient.put(`/admin/opportunities/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/opportunities/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 4. REGISTRATION SERVICE
 * Public: POST /api/registrations
 * Admin: GET /api/admin/registrations, PUT /api/admin/registrations/{id}, DELETE /api/admin/registrations/{id}
 */
export const registrationService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/registrations', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async submit(data) {
    const payload = {
      full_name: data.fullName || data.full_name,
      email: data.email,
      phone: data.phone,
      dob: data.dob,
      education: data.education,
      city: data.city,
      program_interest: data.programInterest || data.program_interest,
      japanese_level: data.japaneseLevel || data.japanese_level,
      japan_goal: data.japanGoal || data.japan_goal,
      message: data.message || '',
      turnstile_token: data.turnstileToken || data.turnstile_token || null
    };
    const res = await apiClient.post('/registrations', payload);
    return {
      success: true,
      message: res.data?.message || 'Pendaftaran Anda berhasil dikirim ke server.',
      registrationId: res.data?.data?.registrationCode || res.data?.data?.registration_code || res.data?.data?.id
    };
  },

  async updateStatus(id, newStatus, adminNotes = null) {
    const payload = { status: newStatus };
    if (adminNotes !== null && adminNotes !== undefined) {
      payload.admin_notes = adminNotes;
    }
    const res = await apiClient.put(`/admin/registrations/${id}`, payload);
    return res.data?.data;
  },

  async updateNotes(id, adminNotes) {
    const res = await apiClient.put(`/admin/registrations/${id}`, { admin_notes: adminNotes });
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/registrations/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 5. TESTIMONIAL SERVICE
 * Public: GET /api/testimonials
 * Admin: GET/POST/PUT/DELETE /api/admin/testimonials
 */
export const testimonialService = {
  async getAll(params = {}) {
    const user = authService.getCurrentUser();
    const endpoint = user?.role === 'ADMIN' ? '/admin/testimonials' : '/testimonials';
    const res = await apiClient.get(endpoint, { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async create(data) {
    const rawYear = data.year ? String(data.year).trim() : '2026';
    const yearMatch = rawYear.match(/\d{4}/);
    const sanitizedYear = (yearMatch ? yearMatch[0] : rawYear).slice(0, 10);
    const payload = {
      name: data.name,
      avatar: data.avatar || null,
      program: data.program || 'Persiapan Kerja Tokutei Ginou (SSW)',
      placement: data.placement || data.workLocation || 'Tokyo, Jepang',
      quote: data.quote,
      year: sanitizedYear || '2026',
      badge: data.badge || null,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.post('/admin/testimonials', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const rawYear = data.year ? String(data.year).trim() : '2026';
    const yearMatch = rawYear.match(/\d{4}/);
    const sanitizedYear = (yearMatch ? yearMatch[0] : rawYear).slice(0, 10);
    const payload = {
      name: data.name,
      avatar: data.avatar || null,
      program: data.program || 'Persiapan Kerja Tokutei Ginou (SSW)',
      placement: data.placement || data.workLocation || 'Tokyo, Jepang',
      quote: data.quote,
      year: sanitizedYear || '2026',
      badge: data.badge || null,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.put(`/admin/testimonials/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/testimonials/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 6. ARTICLE SERVICE
 * Public: GET /api/articles, GET /api/articles/{slug}
 * Admin: GET/POST/PUT/DELETE /api/admin/articles
 */
export const articleService = {
  async getAll(params = {}) {
    const user = authService.getCurrentUser();
    const endpoint = user?.role === 'ADMIN' ? '/admin/articles' : '/articles';
    const res = await apiClient.get(endpoint, { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getBySlug(slug) {
    const res = await apiClient.get(`/articles/${slug}`);
    return res.data?.data || null;
  },

  async create(data) {
    const tagsArray = Array.isArray(data.tags)
      ? data.tags
      : (typeof data.tags === 'string' ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []);
    const payload = {
      title: data.title,
      excerpt: data.excerpt || '',
      content: data.content || '',
      author: data.author || 'Admin',
      category: data.category || 'Persiapan Kerja',
      tags: tagsArray,
      read_time: data.readTime || data.read_time || '5 Menit',
      status: data.status || 'PUBLISHED'
    };
    const res = await apiClient.post('/admin/articles', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const tagsArray = Array.isArray(data.tags)
      ? data.tags
      : (typeof data.tags === 'string' ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : []);
    const payload = {
      title: data.title,
      excerpt: data.excerpt || '',
      content: data.content || '',
      author: data.author || 'Admin',
      category: data.category || 'Persiapan Kerja',
      tags: tagsArray,
      read_time: data.readTime || data.read_time || '5 Menit',
      status: data.status || 'PUBLISHED'
    };
    const res = await apiClient.put(`/admin/articles/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/articles/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 7. GALLERY SERVICE
 * Public: GET /api/gallery
 * Admin: GET/POST/PUT/DELETE /api/admin/gallery
 */
export const galleryService = {
  async getAll(params = {}) {
    const user = authService.getCurrentUser();
    const endpoint = user?.role === 'ADMIN' ? '/admin/gallery' : '/gallery';
    const res = await apiClient.get(endpoint, { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async create(data) {
    const payload = {
      title: data.title,
      category: data.category || 'Classroom',
      image: data.image || data.imageUrl || data.image_url || '/assets/brand/logo.png',
      description: data.description || '',
      order: parseInt(data.order ?? data.sort_order ?? 0, 10) || 0,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.post('/admin/gallery', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      title: data.title,
      category: data.category || 'Classroom',
      image: data.image || data.imageUrl || data.image_url || '/assets/brand/logo.png',
      description: data.description || '',
      order: parseInt(data.order ?? data.sort_order ?? 0, 10) || 0,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.put(`/admin/gallery/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/gallery/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 8. FACILITY SERVICE
 * Public: GET /api/facilities
 * Admin: GET/POST/PUT/DELETE /api/admin/facilities
 */
export const facilityService = {
  async getAll(params = {}) {
    const user = authService.getCurrentUser();
    const endpoint = user?.role === 'ADMIN' ? '/admin/facilities' : '/facilities';
    const res = await apiClient.get(endpoint, { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async create(data) {
    const payload = {
      name: data.name,
      category: data.category,
      description: data.description,
      image: data.image || '/assets/brand/logo.png',
      order: data.order || 0,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.post('/admin/facilities', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      name: data.name,
      category: data.category,
      description: data.description,
      image: data.image || '/assets/brand/logo.png',
      order: data.order || 0,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.put(`/admin/facilities/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/facilities/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 9. FAQ SERVICE
 * Public: GET /api/faqs
 * Admin: GET/POST/PUT/DELETE /api/admin/faqs
 */
export const faqService = {
  async getAll(params = {}) {
    const user = authService.getCurrentUser();
    const endpoint = user?.role === 'ADMIN' ? '/admin/faqs' : '/faqs';
    const res = await apiClient.get(endpoint, { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async create(data) {
    const payload = {
      question: data.question,
      answer: data.answer,
      category: data.category,
      order: data.order || 0,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.post('/admin/faqs', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      question: data.question,
      answer: data.answer,
      category: data.category,
      order: data.order || 0,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.put(`/admin/faqs/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/faqs/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 10. USER SERVICE (Admin Only)
 * Admin: GET/POST/PUT/DELETE /api/admin/users
 */
export const userService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/users', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async create(data) {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password || 'Password123!',
      role: data.role,
      department: data.department || null,
      status: data.status || 'ACTIVE'
    };
    const res = await apiClient.post('/admin/users', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      name: data.name,
      email: data.email,
      role: data.role,
      department: data.department || null,
      status: data.status || 'ACTIVE'
    };
    if (data.password) {
      payload.password = data.password;
    }
    const res = await apiClient.put(`/admin/users/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/users/${id}`);
    return res.data?.success ?? true;
  },

  async approve(id) {
    const res = await apiClient.post(`/admin/users/${id}/approve`);
    return res.data?.data;
  },

  async reject(id, reason) {
    const res = await apiClient.post(`/admin/users/${id}/reject`, { rejection_reason: reason });
    return res.data?.data;
  }
};

/**
 * 10b. ENROLLMENT SERVICE (Admin Only)
 * Admin: GET/POST/PUT/DELETE /api/admin/enrollments
 */
export const enrollmentService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/enrollments', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getById(id) {
    const res = await apiClient.get(`/admin/enrollments/${id}`);
    return res.data?.data || null;
  },

  async create(data) {
    const payload = {
      user_id: Number(data.userId || data.user_id),
      class_id: Number(data.classId || data.class_id),
      status: data.status || 'ACTIVE',
      enrolled_at: data.enrolledAt || data.enrolled_at || new Date().toISOString().slice(0, 10),
      notes: data.notes || null,
    };
    const res = await apiClient.post('/admin/enrollments', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {};
    if (data.classId || data.class_id) payload.class_id = Number(data.classId || data.class_id);
    if (data.status) payload.status = data.status;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.endedAt || data.ended_at) payload.ended_at = data.endedAt || data.ended_at;
    const res = await apiClient.put(`/admin/enrollments/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/enrollments/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 10c. ATTENDANCE SERVICE (Admin Only)
 * Admin: GET/POST/PUT/DELETE /api/admin/attendance
 */
export const attendanceService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/attendance', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getById(id) {
    const res = await apiClient.get(`/admin/attendance/${id}`);
    return res.data?.data || null;
  },

  async create(data) {
    const payload = {
      user_id: Number(data.userId || data.user_id),
      class_id: Number(data.classId || data.class_id),
      attendance_date: data.attendanceDate || data.attendance_date,
      status: data.status,
      notes: data.notes || null,
    };
    const res = await apiClient.post('/admin/attendance', payload);
    return res.data?.data;
  },

  async update(id, data) {
    const payload = {
      status: data.status,
      notes: data.notes || null,
    };
    if (data.attendanceDate || data.attendance_date) {
      payload.attendance_date = data.attendanceDate || data.attendance_date;
    }
    const res = await apiClient.put(`/admin/attendance/${id}`, payload);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/attendance/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 10d. PERMISSION SERVICE (Admin Only)
 * Admin: GET/PATCH/POST /api/admin/permissions
 */
export const permissionService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/permissions', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async getById(id) {
    const res = await apiClient.get(`/admin/permissions/${id}`);
    return res.data?.data || null;
  },

  async review(id, data) {
    const res = await apiClient.patch(`/admin/permissions/${id}/review`, data);
    return res.data?.data;
  },

  async approve(id, notes = '') {
    const res = await apiClient.post(`/admin/permissions/${id}/approve`, { review_notes: notes });
    return res.data?.data;
  },

  async reject(id, reason) {
    const res = await apiClient.post(`/admin/permissions/${id}/reject`, { review_notes: reason });
    return res.data?.data;
  },

  async downloadAttachment(permissionId, attachmentId) {
    const res = await apiClient.get(`/admin/permissions/${permissionId}/attachments/${attachmentId}/download`, {
      responseType: 'blob'
    });
    return res.data;
  }
};

/**
 * 10e. ADMIN NOTIFICATION SERVICE (Admin Only)
 * Admin: GET/POST/DELETE /api/admin/notifications
 */
export const adminNotificationService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/notifications', { params: { per_page: 100, scope: 'all', ...params } });
    return res.data?.data || [];
  },

  async create(data) {
    const res = await apiClient.post('/admin/notifications', data);
    return res.data?.data;
  },

  async markAsRead(id) {
    const res = await apiClient.post(`/admin/notifications/${id}/read`);
    return res.data?.data;
  },

  async markAllAsRead() {
    const res = await apiClient.post('/admin/notifications/read-all');
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/notifications/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 10f. MATERIAL SERVICE (Admin & LMS)
 * Admin: GET/POST/PUT/DELETE /api/admin/materials
 */
export const materialService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/materials', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async create(formData) {
    const res = await apiClient.post('/admin/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data;
  },

  async update(id, formData) {
    const res = await apiClient.post(`/admin/materials/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/materials/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 10g. SCHEDULE SERVICE (Admin & LMS)
 * Admin: GET/POST/PATCH/DELETE /api/admin/schedules
 */
export const scheduleService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/schedules', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  },

  async create(data) {
    const res = await apiClient.post('/admin/schedules', data);
    return res.data?.data;
  },

  async update(id, data) {
    const res = await apiClient.patch(`/admin/schedules/${id}`, data);
    return res.data?.data;
  },

  async delete(id) {
    const res = await apiClient.delete(`/admin/schedules/${id}`);
    return res.data?.success ?? true;
  }
};

/**
 * 11. ACTIVITY LOG SERVICE (Admin Only)
 * Admin: GET /api/admin/activity-logs
 */
export const activityLogService = {
  async getAll(params = {}) {
    const res = await apiClient.get('/admin/activity-logs', { params: { per_page: 100, ...params } });
    return res.data?.data || [];
  }
};

/**
 * 12. JOURNEY SERVICE (Static Educational Content)
 * Note: Educational roadmap stages; documented GAP as no separate dynamic database table is required.
 */
export const journeyService = {
  async getAll() {
    return Promise.resolve(mockJourney);
  }
};

/**
 * 13. SETTINGS SERVICE (Admin Only)
 * Admin: GET /api/admin/settings, PUT /api/admin/settings
 */
export const settingsService = {
  async getSettings() {
    const res = await apiClient.get('/admin/settings');
    return res.data?.data || {};
  },

  async updateSettings(data) {
    const res = await apiClient.put('/admin/settings', data);
    return res.data?.data || {};
  }
};

/**
 * 14. AUTH SERVICE
 * Strictly API-driven authentication with exactly 3 roles: SISWA, PENGAJAR, ADMIN.
 * Insecure offline / mock login fallback completely removed.
 */
export const authService = {
  async login(email, password, intendedRole = 'SISWA', turnstileToken = null) {
    if (!email || !password) {
      return Promise.reject(new Error('Alamat email dan kata sandi wajib diisi.'));
    }

    const normalizedEmail = email.toLowerCase().trim();

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
      return Promise.reject(new Error('Respons autentikasi dari server tidak valid. Silakan coba lagi.'));
    } catch (apiErr) {
      if (apiErr.response && apiErr.response.data) {
        const errorData = apiErr.response.data;
        const message = errorData.message || (errorData.errors ? Object.values(errorData.errors)[0]?.[0] : null) || 'Login gagal. Periksa kembali email dan kata sandi Anda.';
        return Promise.reject(new Error(message));
      }
      console.error('[auth.login] No response from backend:', apiErr?.code, apiErr?.message, apiErr?.config?.baseURL);
      return Promise.reject(new Error('Server tidak dapat dihubungi. Silakan periksa koneksi internet atau server backend.'));
    }
  },

  async register({ fullName, email, phone, password, role = 'SISWA', turnstileToken = null }) {
    if (!fullName || !email || !password) {
      return Promise.reject(new Error('Nama lengkap, email, dan kata sandi wajib diisi.'));
    }

    const normalizedEmail = email.toLowerCase().trim();

    try {
      const response = await apiAuth.register({
        name: fullName.trim(),
        email: normalizedEmail,
        password,
        phone: phone || '',
        role: role || 'SISWA',
        turnstileToken
      });

      if (response && response.success) {
        const resData = response.data || {};
        return {
          success: true,
          message: response.message || 'Pendaftaran akun berhasil. Akun Anda sedang menunggu persetujuan Administrator.',
          user: resData.user,
          role: resData.role || role || 'SISWA',
          requiresApproval: true
        };
      }
      return Promise.reject(new Error('Respons pendaftaran dari server tidak valid. Silakan coba lagi.'));
    } catch (apiErr) {
      if (apiErr.response && apiErr.response.data) {
        const errorData = apiErr.response.data;
        const message = errorData.message || (errorData.errors ? Object.values(errorData.errors)[0]?.[0] : null) || 'Pendaftaran gagal.';
        return Promise.reject(new Error(message));
      }
      console.error('[auth.register] No response from backend:', apiErr?.code, apiErr?.message, apiErr?.config?.baseURL);
      return Promise.reject(new Error('Server tidak dapat dihubungi. Silakan periksa koneksi internet atau server backend.'));
    }
  },

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

/**
 * 15. STUDENT AUTH SERVICE
 */
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

  async getMyRegistrations() {
    try {
      const res = await apiClient.get('/student/registrations');
      return res.data?.data || [];
    } catch (err) {
      return [];
    }
  }
};
