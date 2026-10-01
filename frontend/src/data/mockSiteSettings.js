/**
 * Mock Data: Site Settings & Institution Identity
 * LPK Lombok Shorai Rinjani
 */

import { BRAND } from '../config/brand';

export const mockSiteSettings = {
  institutionName: BRAND.name,
  shortName: BRAND.shortName,
  japaneseName: BRAND.japaneseName,
  logo: BRAND.logo,
  legalAccreditation: BRAND.legalAccreditation,
  address: BRAND.address,
  city: "Mataram, Nusa Tenggara Barat",
  phone: BRAND.phone,
  whatsapp: BRAND.whatsapp,
  whatsappUrl: BRAND.whatsappUrl,
  email: BRAND.email,
  operatingHours: BRAND.operatingHours,
  socialMedia: BRAND.socialMedia,
  hero: {
    kanjiStamp: "将来への架け橋",
    badgeText: "LEMBAGA RESMI PELATIHAN BAHASA & KARIER JEPANG",
    titlePrimary: "Mulai Langkahmu",
    titleHighlight: "Menuju Jepang.",
    description: "Belajar Bahasa Jepang dengan kurikulum terarah, pendampingan sensei berpengalaman, dan pembekalan terpadu untuk membangun langkah karier impianmu di Negeri Sakura bersama LPK Lombok Shorai Rinjani.",
    primaryCtaText: "Jelajahi Program",
    secondaryCtaText: "Konsultasi Gratis via WhatsApp"
  },
  stats: [
    { value: "1.250+", label: "Alumni Terbina", sublabel: "Sejak Tahun 2020" },
    { value: "98.2%", label: "Tingkat Kelulusan", sublabel: "Ujian JFT-Basic & N4" },
    { value: "45+", label: "Mitra Perusahaan", sublabel: "Di Berbagai Prefektur Jepang" },
    { value: "100%", label: "Sensei Bersertifikat", sublabel: "N1/N2 & Native Speaker" }
  ]
};
