import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Users,
  BookOpen,
  ClipboardCheck,
  User,
  Settings
} from 'lucide-react';
import PublicLayout from './components/common/PublicLayout';
import AuthLayout from './components/common/AuthLayout';
import ScrollToTop from './components/common/ScrollToTop';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProgramsPage from './pages/public/ProgramsPage';
import ProgramDetailPage from './pages/public/ProgramDetailPage';
import ClassesPage from './pages/public/ClassesPage';
import OpportunitiesPage from './pages/public/OpportunitiesPage';
import OpportunityDetailPage from './pages/public/OpportunityDetailPage';
import JourneyPage from './pages/public/JourneyPage';
import FacilitiesPage from './pages/public/FacilitiesPage';
import StoriesPage from './pages/public/StoriesPage';
import ArticlesPage from './pages/public/ArticlesPage';
import ArticleDetailPage from './pages/public/ArticleDetailPage';
import FaqPage from './pages/public/FaqPage';
import ContactPage from './pages/public/ContactPage';
import RegisterPage from './pages/public/RegisterPage';
import StudentLoginPage from './pages/public/StudentLoginPage';
import StudentRegisterPage from './pages/public/StudentRegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Siswa Dashboard Shell & Pages
import StudentLayout from './components/student/StudentLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentRegistrationsPage from './pages/student/StudentRegistrationsPage';
import StudentProgramsPage from './pages/student/StudentProgramsPage';
import StudentSchedulePage from './pages/student/StudentSchedulePage';
import StudentSettingsPage from './pages/student/StudentSettingsPage';
import StudentAttendancePage from './pages/student/StudentAttendancePage';
import StudentPermissionPage from './pages/student/StudentPermissionPage';
import StudentNotificationsPage from './pages/student/StudentNotificationsPage';
import StudentMaterialsPage from './pages/student/StudentMaterialsPage';

// Pengajar Dashboard Shell & Pages
import TeacherLayout from './components/teacher/TeacherLayout';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherClassesPage from './pages/teacher/TeacherClassesPage';
import TeacherSchedulePage from './pages/teacher/TeacherSchedulePage';
import TeacherStudentsPage from './pages/teacher/TeacherStudentsPage';
import TeacherMaterialsPage from './pages/teacher/TeacherMaterialsPage';
import TeacherAttendancePage from './pages/teacher/TeacherAttendancePage';
import TeacherPermissionsPage from './pages/teacher/TeacherPermissionsPage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import TeacherSettingsPage from './pages/teacher/TeacherSettingsPage';
import TeacherModulePlaceholder from './pages/teacher/TeacherModulePlaceholder';

// Admin Layout & Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProgramsPage from './pages/admin/AdminProgramsPage';
import AdminClassesPage from './pages/admin/AdminClassesPage';
import AdminSchedulePage from './pages/admin/AdminSchedulePage';
import AdminMaterialsPage from './pages/admin/AdminMaterialsPage';
import AdminEnrollmentsPage from './pages/admin/AdminEnrollmentsPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import AdminPermissionsPage from './pages/admin/AdminPermissionsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminOpportunitiesPage from './pages/admin/AdminOpportunitiesPage';
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage';
import AdminTestimonialsPage from './pages/admin/AdminTestimonialsPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminFacilitiesPage from './pages/admin/AdminFacilitiesPage';
import AdminFaqPage from './pages/admin/AdminFaqPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminActivityLogsPage from './pages/admin/AdminActivityLogsPage';

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="programs/:slug" element={<ProgramDetailPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="opportunities" element={<OpportunitiesPage />} />
          <Route path="opportunities/:slug" element={<OpportunityDetailPage />} />
          <Route path="journey" element={<JourneyPage />} />
          <Route path="facilities" element={<FacilitiesPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="articles" element={<ArticlesPage />} />
          <Route path="articles/:slug" element={<ArticleDetailPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="apply" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Standalone Authentication Layout Routes - ZERO FOOTER */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<StudentLoginPage />} />
          <Route path="/register" element={<StudentRegisterPage />} />
          <Route path="/admin/login" element={<StudentLoginPage />} />
        </Route>

        {/* 1. Siswa Dashboard Protected Routes */}
        <Route path="/dashboard" element={<StudentLayout />}>
          <Route index element={<StudentDashboardPage />} />
          <Route path="profile" element={<StudentProfilePage />} />
          <Route path="registrations" element={<StudentRegistrationsPage />} />
          <Route path="programs" element={<StudentProgramsPage />} />
          <Route path="schedule" element={<StudentSchedulePage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="permission" element={<StudentPermissionPage />} />
          <Route path="materials" element={<StudentMaterialsPage />} />
          <Route path="notifications" element={<StudentNotificationsPage />} />
          <Route path="settings" element={<StudentSettingsPage />} />
        </Route>

        {/* 2. Pengajar Dashboard Protected Routes */}
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboardPage />} />
          <Route path="classes" element={<TeacherClassesPage />} />
          <Route path="schedule" element={<TeacherSchedulePage />} />
          <Route path="students" element={<TeacherStudentsPage />} />
          <Route path="materials" element={<TeacherMaterialsPage />} />
          <Route path="attendance" element={<TeacherAttendancePage />} />
          <Route path="permissions" element={<TeacherPermissionsPage />} />
          <Route path="profile" element={<TeacherProfilePage />} />
          <Route path="settings" element={<TeacherSettingsPage />} />
        </Route>

        {/* 3. Admin Dashboard Protected Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="programs" element={<AdminProgramsPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
          <Route path="enrollments" element={<AdminEnrollmentsPage />} />
          <Route path="schedules" element={<AdminSchedulePage />} />
          <Route path="materials" element={<AdminMaterialsPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="permissions" element={<AdminPermissionsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="opportunities" element={<AdminOpportunitiesPage />} />
          <Route path="registrations" element={<AdminRegistrationsPage />} />
          <Route path="testimonials" element={<AdminTestimonialsPage />} />
          <Route path="articles" element={<AdminArticlesPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="facilities" element={<AdminFacilitiesPage />} />
          <Route path="faqs" element={<AdminFaqPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="approvals" element={<Navigate to="/admin/users?tab=verification" replace />} />
          <Route path="persetujuan" element={<Navigate to="/admin/users?tab=verification" replace />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="activity-logs" element={<AdminActivityLogsPage />} />
        </Route>
      </Routes>
    </>
  );
}


