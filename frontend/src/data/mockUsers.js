/**
 * Mock Data: System Users with EXACTLY 3 ROLES
 * 1. SISWA
 * 2. PENGAJAR
 * 3. ADMIN
 * LPK Lombok Shorai Rinjani
 */

export const mockUsers = [
  // 1. ADMIN Accounts
  {
    id: 1,
    name: "Dr. Hendra Wijaya",
    email: "admin@lombokshorairinjani.co.id",
    phone: "081234567801",
    role: "ADMIN",
    status: "ACTIVE",
    lastLogin: "2026-10-01 10:45",
    department: "Pimpinan & Administrasi Lembaga"
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "admin.karier@lombokshorairinjani.co.id",
    phone: "081234567802",
    role: "ADMIN",
    status: "ACTIVE",
    lastLogin: "2026-09-30 17:15",
    department: "Divisi Penempatan & Tokutei Ginou"
  },

  // 2. PENGAJAR Accounts
  {
    id: 3,
    name: "Sensei Kenjiro Tanaka, M.Ed.",
    email: "pengajar@lombokshorairinjani.co.id",
    phone: "081234567803",
    role: "PENGAJAR",
    status: "ACTIVE",
    lastLogin: "2026-10-01 08:30",
    department: "Sensei Utama & Kurikulum N4/N3"
  },
  {
    id: 4,
    name: "Sensei Rina Puspita, S.Hum.",
    email: "rina.sensei@lombokshorairinjani.co.id",
    phone: "081234567804",
    role: "PENGAJAR",
    status: "ACTIVE",
    lastLogin: "2026-10-01 11:10",
    department: "Sensei Bahasa Jepang Dasar N5"
  },

  // 3. SISWA Accounts
  {
    id: 101,
    name: "Ahmad Fajar Pratama",
    email: "siswa@lombokshorairinjani.co.id",
    phone: "081234567890",
    role: "SISWA",
    status: "ACTIVE",
    lastLogin: "2026-10-01 14:20",
    department: "Siswa Angkatan 48"
  },
  {
    id: 102,
    name: "Siti Nurhaliza",
    email: "siti.nurhaliza@example.test",
    phone: "082198765432",
    role: "SISWA",
    status: "ACTIVE",
    lastLogin: "2026-09-30 16:45",
    department: "Calon Siswa Tokutei Ginou"
  }
];
