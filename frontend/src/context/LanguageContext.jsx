import React, { createContext, useContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'ID', id: 'id', label: 'ID', name: 'Bahasa Indonesia', native: 'Bahasa Indonesia' },
  { code: 'EN', id: 'en', label: 'EN', name: 'English', native: 'English' },
  { code: 'JP', id: 'jp', label: 'JP', name: 'Japanese', native: '日本語' }
];

export const TRANSLATIONS = {
  ID: {
    nav: {
      home: 'Beranda',
      about: 'Tentang',
      aboutFull: 'Tentang LPK',
      programs: 'Program',
      programsFull: 'Program Pelatihan',
      classes: 'Jadwal',
      classesFull: 'Jadwal Kelas',
      opportunities: 'Peluang',
      opportunitiesFull: 'Peluang Karier',
      journey: 'Alur Belajar',
      facilities: 'Fasilitas Pelatihan',
      facilitiesFull: 'Fasilitas Kampus',
      stories: 'Cerita Alumni',
      storiesFull: 'Cerita & Testimoni Alumni',
      articles: 'Artikel & Edukasi',
      articlesFull: 'Artikel & Berita Jepang',
      faq: 'Tanya Jawab (FAQ)',
      contact: 'Kontak',
      contactFull: 'Hubungi Kami',
      more: 'Lainnya',
      loginRegister: 'Masuk / Daftar',
      registerNow: 'Daftar Sekarang',
      registerTraining: 'Daftar Pelatihan Sekarang',
      consultWa: 'Konsultasi WhatsApp',
      languageLabel: 'Bahasa',
      closeMenu: 'Tutup Menu',
      openMenu: 'Buka Menu Navigasi'
    }
  },
  EN: {
    nav: {
      home: 'Home',
      about: 'About',
      aboutFull: 'About School',
      programs: 'Programs',
      programsFull: 'Training Programs',
      classes: 'Schedule',
      classesFull: 'Class Schedule',
      opportunities: 'Careers',
      opportunitiesFull: 'Career Opportunities',
      journey: 'Roadmap',
      facilities: 'Facilities',
      facilitiesFull: 'Campus Facilities',
      stories: 'Alumni Stories',
      storiesFull: 'Alumni Stories & Reviews',
      articles: 'Articles',
      articlesFull: 'Articles & Japan News',
      faq: 'FAQ',
      contact: 'Contact',
      contactFull: 'Contact Us',
      more: 'More',
      loginRegister: 'Login / Register',
      registerNow: 'Register Now',
      registerTraining: 'Enroll In Training Now',
      consultWa: 'WhatsApp Consultation',
      languageLabel: 'Language',
      closeMenu: 'Close Menu',
      openMenu: 'Open Navigation Menu'
    }
  },
  JP: {
    nav: {
      home: 'ホーム',
      about: '当校について',
      aboutFull: 'LPKについて',
      programs: 'プログラム',
      programsFull: '教育・研修プログラム',
      classes: '開講日程',
      classesFull: 'クラス開講スケジュール',
      opportunities: 'キャリア',
      opportunitiesFull: '日本就労・キャリア機会',
      journey: '学習プロセス',
      facilities: '研修施設',
      facilitiesFull: '校舎・実習施設',
      stories: '修了生の声',
      storiesFull: '修了生体験談・声',
      articles: 'コラム・記事',
      articlesFull: '日本情報・教育コラム',
      faq: 'よくある質問',
      contact: 'お問い合わせ',
      contactFull: 'お問い合わせ窓口',
      more: 'その他',
      loginRegister: 'ログイン / 登録',
      registerNow: '今すぐ申込む',
      registerTraining: '研修生募集に申し込む',
      consultWa: 'WhatsAppで相談',
      languageLabel: '言語',
      closeMenu: 'メニューを閉じる',
      openMenu: 'メニューを開く'
    }
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app_language');
        if (saved && ['ID', 'EN', 'JP'].includes(saved.toUpperCase())) {
          return saved.toUpperCase();
        }
      } catch {
        return 'ID';
      }
    }
    return 'ID';
  });

  const setLanguage = (code) => {
    const upper = code.toUpperCase();
    if (['ID', 'EN', 'JP'].includes(upper)) {
      setLanguageState(upper);
      try {
        localStorage.setItem('app_language', upper);
        const mappedLang = upper === 'JP' ? 'ja' : upper.toLowerCase();
        document.documentElement.setAttribute('lang', mappedLang);
      } catch (e) {
        console.error('Failed to save language', e);
      }
    }
  };

  useEffect(() => {
    const mappedLang = language === 'JP' ? 'ja' : language.toLowerCase();
    document.documentElement.setAttribute('lang', mappedLang);
  }, [language]);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  const t = (path, fallback = '') => {
    const keys = path.split('.');
    let current = TRANSLATIONS[language] || TRANSLATIONS.ID;
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to ID
        let idVal = TRANSLATIONS.ID;
        for (const k of keys) {
          if (idVal && idVal[k] !== undefined) {
            idVal = idVal[k];
          } else {
            return fallback || path;
          }
        }
        return idVal;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, currentLang, languages: LANGUAGES, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
