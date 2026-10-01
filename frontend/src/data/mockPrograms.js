/**
 * Mock Data: Programs
 * LPK Lombok Shorai Rinjani
 * Conforms to Master PRD specifications
 */

export const mockPrograms = [
  {
    id: 1,
    title: "Bahasa Jepang Dasar (N5)",
    slug: "bahasa-jepang-dasar-n5",
    category: "Dasar & Pondasi",
    level: "N5 Beginner",
    shortDescription: "Pondasi menyeluruh penguasaan Hiragana, Katakana, 100 Kanji dasar, dan pola kalimat percakapan sehari-hari.",
    fullDescription: "Program ini dirancang khusus bagi calon peserta didik yang memulai perjalanan bahasa Jepang dari nol. Dengan kurikulum terstruktur dan bimbingan sensei bersertifikat N1/N2, peserta akan menguasai huruf dasar (Hiragana & Katakana), 100 Kanji esensial, 800 kosakata utama, serta tata bahasa standar untuk lulus ujian JLPT N5 atau JFT-Basic A1.",
    duration: "3 Bulan (120 Jam Pembelajaran)",
    schedule: "Senin - Kamis (08.30 - 12.00 WIB atau 13.30 - 17.00 WIB)",
    targetAudience: "Pemula tanpa pengalaman sebelumnya, calon pemagang kerja, siswa SMA/SMK, dan umum.",
    image: "https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=1200&q=80",
    curriculum: [
      { module: "Modul 1", title: "Aksara Hiragana & Katakana", desc: "Penulisan, pengucapan murni, dan intonasi khas Jepang." },
      { module: "Modul 2", title: "Tata Bahasa Dasar & Partikel (Joshi)", desc: "Struktur kalimat SOP (Subjek-Objek-Predikat) dan penggunaan partikel wa, ga, o, ni, de." },
      { module: "Modul 3", title: "100 Kanji Esensial N5", desc: "Radikal, urutan goresan, Onyomi, dan Kunyomi terapan." },
      { module: "Modul 4", title: "Choukai & Percakapan Praktis (Kaiwa)", desc: "Latihan pendengaran dan dialog perkenalan diri, belanja, dan instruksi harian." }
    ],
    status: "ACTIVE",
    order: 1,
    priceEstimate: "Rp 3.500.000",
    badge: "Kelas Populer"
  },
  {
    id: 2,
    title: "Bahasa Jepang Intensif (N4)",
    slug: "bahasa-jepang-intensif-n4",
    category: "Intensif Lanjutan",
    level: "N4 Intermediate",
    shortDescription: "Penguasaan 300 Kanji, tata bahasa kompleks, dan kelancaran komunikasi standar kerja di Jepang.",
    fullDescription: "Program intensif percepatan yang menargetkan pencapaian level N4 dan JFT-Basic A2. Tingkat ini merupakan syarat kelayakan mutlak untuk pendaftaran visa Tokutei Ginou (Specified Skilled Worker) dan Magang (Ginou Jisshuusei). Dilengkapi dengan drilling soal ujian berkala dan simulasi wawancara.",
    duration: "3.5 Bulan (160 Jam Pembelajaran)",
    schedule: "Senin - Jumat (08.00 - 13.00 WIB)",
    targetAudience: "Lulusan N5, calon peserta program SSW/TG ke Jepang, dan tenaga kesehatan/teknik.",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    curriculum: [
      { module: "Modul 1", title: "Pola Kalimat Majemuk N4", desc: "Bentuk pengandaian (tara, ba, to), bentuk pasif (ukemi), dan bentuk kausatif (shieki)." },
      { module: "Modul 2", title: "300 Kanji Lanjutan & Idiom", desc: "Kombinasi Kanji majemuk dan pembacaan teks fungsional." },
      { module: "Modul 3", title: "Bahasa Bisnis & Sopan Santun (Keigo Dasar)", desc: "Teineigo, Sonkeigo, dan Kenjougo dalam interaksi formal." },
      { module: "Modul 4", title: "Drilling Ujian JFT-Basic & JLPT", desc: "Simulasi komputer berbasis CBT dan analisis kelemahan per siswa." }
    ],
    status: "ACTIVE",
    order: 2,
    priceEstimate: "Rp 4.200.000",
    badge: "Syarat Kerja SSW"
  },
  {
    id: 3,
    title: "Persiapan Kerja Tokutei Ginou (SSW)",
    slug: "persiapan-kerja-tokutei-ginou-ssw",
    category: "Karier & Sertifikasi",
    level: "N4 / JFT-Basic + Ujian Skill",
    shortDescription: "Pelatihan bahasa terpadu dengan persiapan ujian kompetensi teknis sektor Kaigo, Manufaktur, dan Pengolahan Makanan.",
    fullDescription: "Program komprehensif jalur karier mandiri ke Jepang melalui visa Tokutei Ginou (SSW 1). Mempersiapkan siswa melewati ujian keahlian teknis (Senmon Skill Exam) serta ujian bahasa Jepang, dilanjutkan dengan pendampingan pembuatan resume (Rirekisho) dan simulasi wawancara kerja dengan perusahaan Jepang.",
    duration: "4 Bulan (200 Jam Pembelajaran)",
    schedule: "Senin - Jumat (08.30 - 15.00 WIB)",
    targetAudience: "Usia 18-35 tahun, lulusan SMK/Diploma/S1 yang memiliki komitmen kuat bekerja legal di Jepang.",
    image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
    curriculum: [
      { module: "Modul 1", title: "Bahasa Jepang Spesifik Bidang Kerja", desc: "Kosakata teknis Kaigo (perawat lansia), manufaktur otomotif, atau pengolahan pangan." },
      { module: "Modul 2", title: "Persiapan Ujian Skill Sektor Resmi", desc: "Kajian modul resmi Prometric dan latihan soal teknis keahlian." },
      { module: "Modul 3", title: "Pembuatan Dokumen Rirekisho & Shokumukeirekisho", desc: "Menulis riwayat hidup standar korporasi Jepang dan penyusunan alasan motivasi." },
      { module: "Modul 4", title: "Simulasi Wawancara (Mensaetsu Mockup)", desc: "Pelatihan bahasa tubuh (Ojigi), etiket ruang wawancara, dan tanya jawab tajam." }
    ],
    status: "ACTIVE",
    order: 3,
    priceEstimate: "Rp 5.500.000",
    badge: "Jalur Karier Resmi"
  },
  {
    id: 4,
    title: "Persiapan JLPT N3 & Percakapan Kerja",
    slug: "persiapan-jlpt-n3-percakapan-kerja",
    category: "Tingkat Menengah",
    level: "N3 Upper-Intermediate",
    shortDescription: "Strategi komprehensif menembus level N3 untuk jenjang karier staf kantor dan insinyur di Jepang.",
    fullDescription: "Ditujukan bagi peserta yang ingin bekerja di level profesional (Engineering, IT, Hospitality, dan Staf Kantor). Program ini fokus pada pemahaman bacaan artikel berita, nuansa kalimat alami, 650 Kanji, dan kemampuan berdiskusi secara mendalam.",
    duration: "4 Bulan (150 Jam Pembelajaran)",
    schedule: "Selasa & Kamis (18.30 - 21.00 WIB) + Sabtu (09.00 - 14.00 WIB)",
    targetAudience: "Lulusan N4 yang membidik karier keinsinyuran (Gijinkoku), universitas di Jepang, atau promosi kerja.",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    curriculum: [
      { module: "Modul 1", title: "Pemahaman Dokou & Nuansa Gramatika N3", desc: "Pembedaan ekspresi yang mirip dan ungkapan situasional." },
      { module: "Modul 2", title: "Dokkai Cepat & Analisis Teks Berita", desc: "Teknik skimming, scanning bacaan panjang, dan pemahaman opini penulis." },
      { module: "Modul 3", title: "Business Kaiwa & Email Keigo", desc: "Menulis email bisnis formal dan melakukan panggilan telepon profesional." }
    ],
    status: "ACTIVE",
    order: 4,
    priceEstimate: "Rp 4.800.000",
    badge: "Tingkat Profesional"
  },
  {
    id: 5,
    title: "Kelas Percakapan Praktis (Business & Daily Kaiwa)",
    slug: "kelas-percakapan-praktis-kaiwa",
    category: "Keterampilan Komunikasi",
    level: "Semua Tingkat (Placement Test)",
    shortDescription: "Fokus 100% pada kefasihan berbicara, intonasi asli, dan keberanian berkomunikasi dengan penutur asli (Native Sensei).",
    fullDescription: "Mengatasi ketakutan umum pembelajar bahasa Jepang: mengerti tata bahasa namun ragu ketika berbicara. Menggunakan metode roleplay situasional interaktif di bawah bimbingan Sensei penutur asli Jepang.",
    duration: "2 Bulan (48 Jam Pembelajaran)",
    schedule: "Senin & Rabu (19.00 - 21.00 WIB)",
    targetAudience: "Peserta yang ingin mengasah kelancaran berbicara, mempersiapkan wawancara, atau berbisnis dengan mitra Jepang.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    curriculum: [
      { module: "Modul 1", title: "Aizuchi & Reaksi Alami Orang Jepang", desc: "Merespon obrolan dengan cara yang hangat dan sopan." },
      { module: "Modul 2", title: "Debat & Presentasi Sederhana", desc: "Menyampaikan sudut pandang, argumen persetujuan, dan penolakan halus." },
      { module: "Modul 3", title: "Roleplay Situasional Kerja", desc: "Pelaporan kerja (Hou-Ren-So), menghadapi komplain, dan ramah tamah." }
    ],
    status: "ACTIVE",
    order: 5,
    priceEstimate: "Rp 2.800.000",
    badge: "Native Speaker"
  },
  {
    id: 6,
    title: "Program Khusus Budaya Kerja & Kedisiplinan (Horenso)",
    slug: "program-khusus-budaya-kerja-horenso",
    category: "Pemberkasan & Mentalitas",
    level: "Pembekalan Wajib",
    shortDescription: "Pembentukan karakter, kedisiplinan kerja 5S, etos Kaizen, dan kesiapan mental beradaptasi hidup di Jepang.",
    fullDescription: "Pendidikan di LPK Lombok Shorai Rinjani bukan hanya soal bahasa, tetapi juga adaptasi budaya. Siswa dilatih memahami ritme kerja industri Jepang, prinsip Houkoku-Renraku-Soudan (Hou-Ren-So), pemilahan sampah, tata krama tempat tinggal (Apato), dan tata cara hidup bermasyarakat di Jepang.",
    duration: "1 Bulan (40 Jam Pembelajaran)",
    schedule: "Jumat & Sabtu (08.30 - 13.30 WIB)",
    targetAudience: "Seluruh calon peserta yang akan berangkat ke Jepang dalam kurun waktu 1-3 bulan ke depan.",
    image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1200&q=80",
    curriculum: [
      { module: "Modul 1", title: "Prinsip 5S & Kaizen dalam Industri", desc: "Seiri, Seiton, Seiso, Seiketsu, Shitsuke dalam lingkungan kerja nyata." },
      { module: "Modul 2", title: "Sistem Komunikasi Hou-Ren-So", desc: "Kapan dan bagaimana melapor, berkoordinasi, serta berkonsultasi kepada atasan." },
      { module: "Modul 3", title: "Manajemen Kehidupan & Hukum di Jepang", desc: "Perbankan, asuransi, aturan apartemen, dan keselamatan darurat gempa bumi." }
    ],
    status: "ACTIVE",
    order: 6,
    priceEstimate: "Rp 1.950.000",
    badge: "Wajib Keberangkatan"
  }
];
