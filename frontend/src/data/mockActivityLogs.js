/**
 * Mock Data: Activity Logs Audit Trail
 * LPK Lombok Shorai Rinjani
 */

export const mockActivityLogs = [
  {
    id: 1,
    user: "Dr. Hendra Wijaya",
    action: "STATUS_CHANGE",
    module: "Registrations",
    description: "Mengubah status pendaftaran REG-2026-004 (Dewi Lestari) menjadi 'REGISTERED'.",
    ipAddress: "192.168.1.10",
    timestamp: "2026-10-01 11:24:10"
  },
  {
    id: 2,
    user: "Anisa Putri",
    action: "CREATE",
    module: "Registrations",
    description: "Menambahkan catatan admisi baru pada data pendaftar REG-2026-002 (Siti Rahmawati).",
    ipAddress: "192.168.1.18",
    timestamp: "2026-10-01 10:45:02"
  },
  {
    id: 3,
    user: "Dr. Hendra Wijaya",
    action: "LOGIN",
    module: "Auth",
    description: "Login berhasil sebagai SUPER_ADMIN dari peramban Chrome Windows.",
    ipAddress: "192.168.1.10",
    timestamp: "2026-10-01 10:30:15"
  },
  {
    id: 4,
    user: "Rina Puspita, S.Hum.",
    action: "UPDATE",
    module: "Programs",
    description: "Memperbarui jadwal dan kurikulum pada program 'Bahasa Jepang Intensif (N4)'.",
    ipAddress: "192.168.1.14",
    timestamp: "2026-09-30 16:20:44"
  },
  {
    id: 5,
    user: "Budi Santoso",
    action: "PUBLISH",
    module: "Articles",
    description: "Mempublikasikan artikel baru 'Panduan Lengkap Visa Tokutei Ginou (SSW) 2026'.",
    ipAddress: "192.168.1.22",
    timestamp: "2026-09-30 15:10:00"
  },
  {
    id: 6,
    user: "Budi Santoso",
    action: "UPDATE",
    module: "Opportunities",
    description: "Memperbarui kuota penempatan sektor 'Operator Industri Manufaktur & Mesin'.",
    ipAddress: "192.168.1.22",
    timestamp: "2026-09-30 14:02:18"
  },
  {
    id: 7,
    user: "Dr. Hendra Wijaya",
    action: "UPDATE",
    module: "Settings",
    description: "Memperbarui nomor hotline WhatsApp resmi pada konfigurasi lembaga.",
    ipAddress: "192.168.1.10",
    timestamp: "2026-09-29 11:40:55"
  },
  {
    id: 8,
    user: "Anisa Putri",
    action: "STATUS_CHANGE",
    module: "Classes",
    description: "Mengubah status batch 'Batch 49 - Dasar N5 Sore' menjadi 'FULL'.",
    ipAddress: "192.168.1.18",
    timestamp: "2026-09-29 09:15:32"
  }
];
