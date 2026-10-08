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
  city: "Gerung, Lombok Barat, NTB",
  phone: BRAND.phone,
  whatsapp: BRAND.whatsapp,
  whatsappUrl: BRAND.whatsappUrl,
  mapsUrl: BRAND.mapsUrl,
  googleMapsUrl: BRAND.mapsUrl,
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
    secondaryCtaText: "Hubungi LPK"
  },
  stats: []
};
