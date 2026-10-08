/**
 * Japanese Resume (履歴書 - Rirekisho) Helper & Translation Utilities
 * LPK Lombok Shorai Rinjani
 *
 * Provides:
 * 1. Fixed standard dropdown choices (Indonesian label -> Japanese standard value)
 * 2. Japanese date & metric formatters (YYYY年M月D日, YYYY年M月, XX歳, XXcm, XXkg, XXヶ月)
 * 3. Romaji to Katakana converter for names and locations
 * 4. Automatic formal Japanese resume translation engine (です・ます / nominal style)
 */

export const GENDER_OPTIONS = [
  { label: 'Laki-laki', jp: '男', value: 'Laki-laki' },
  { label: 'Perempuan', jp: '女', value: 'Perempuan' }
];

export const BLOOD_TYPE_OPTIONS = [
  { label: 'Golongan Darah A', jp: 'A型', value: 'A' },
  { label: 'Golongan Darah B', jp: 'B型', value: 'B' },
  { label: 'Golongan Darah AB', jp: 'AB型', value: 'AB' },
  { label: 'Golongan Darah O', jp: 'O型', value: 'O' },
  { label: 'Tidak Tahu / Belum Cek', jp: '不明', value: 'Tidak tahu' }
];

export const MARITAL_STATUS_OPTIONS = [
  { label: 'Belum Menikah (Lajang)', jp: '未婚', value: 'Belum menikah' },
  { label: 'Menikah', jp: '既婚', value: 'Menikah' },
  { label: 'Cerai', jp: '離婚', value: 'Cerai' }
];

export const SMOKING_OPTIONS = [
  { label: 'Tidak Merokok', jp: '吸わない', value: 'Tidak merokok' },
  { label: 'Merokok', jp: '吸う', value: 'Merokok' }
];

export const ALCOHOL_OPTIONS = [
  { label: 'Tidak Minum Alkohol', jp: '飲まない', value: 'Tidak minum alkohol' },
  { label: 'Minum Sesekali / Acara', jp: '機会飲酒', value: 'Minum sesekali' },
  { label: 'Minum', jp: '飲む', value: 'Minum' }
];

export const TATTOO_OPTIONS = [
  { label: 'Tidak Ada Tato', jp: '無し', value: 'Tidak ada' },
  { label: 'Ada Tato', jp: '有り', value: 'Ada' }
];

export const COLOR_BLINDNESS_OPTIONS = [
  { label: 'Normal (Tidak Buta Warna)', jp: '正常', value: 'Normal / Tidak buta warna' },
  { label: 'Buta Warna Parsial', jp: '色覚異常（部分）', value: 'Buta warna parsial' },
  { label: 'Buta Warna Total', jp: '色覚異常（全色）', value: 'Buta warna total' }
];

export const PASSPORT_OPTIONS = [
  { label: 'Belum Ada / Tidak Ada', jp: '無し', value: 'Tidak ada / Belum ada' },
  { label: 'Ada (Masih Berlaku)', jp: '有り', value: 'Ada (Masih Berlaku)' },
  { label: 'Sedang Dalam Pengurusan', jp: '申請中', value: 'Sedang Dalam Pengurusan' }
];

export const JAPAN_FAMILY_OPTIONS = [
  { label: 'Tidak Ada Keluarga di Jepang', jp: '無し', value: 'Tidak ada' },
  { label: 'Ada Keluarga / Kerabat di Jepang', jp: '有り', value: 'Ada' }
];

export const RELIGION_OPTIONS = [
  { label: 'Islam', jp: 'イスラム教', value: 'Islam' },
  { label: 'Kristen Protestan', jp: 'キリスト教（プロテスタント）', value: 'Kristen Protestan' },
  { label: 'Katolik', jp: 'カトリック', value: 'Katolik' },
  { label: 'Hindu', jp: 'ヒンドゥー教', value: 'Hindu' },
  { label: 'Buddha', jp: '仏教', value: 'Buddha' },
  { label: 'Lainnya', jp: 'その他', value: 'Lainnya' }
];

export const FAMILY_RELATION_OPTIONS = [
  { label: 'Ayah', jp: '父', value: 'Ayah' },
  { label: 'Ibu', jp: '母', value: '母' },
  { label: 'Kakak Laki-laki', jp: '兄', value: 'Kakak laki-laki' },
  { label: 'Kakak Perempuan', jp: '姉', value: 'Kakak perempuan' },
  { label: 'Adik Laki-laki', jp: '弟', value: 'Adik laki-laki' },
  { label: 'Adik Perempuan', jp: '妹', value: 'Adik perempuan' },
  { label: 'Suami', jp: '夫', value: 'Suami' },
  { label: 'Istri', jp: '妻', value: 'Istri' },
  { label: 'Anak Laki-laki', jp: '長男', value: 'Anak laki-laki' },
  { label: 'Anak Perempuan', jp: '長女', value: 'Anak perempuan' },
  { label: 'Kakek', jp: '祖父', value: 'Kakek' },
  { label: 'Nenek', jp: '祖母', value: 'Nenek' }
];

export const EDUCATION_LEVEL_OPTIONS = [
  { label: 'SD (Sekolah Dasar)', jp: '小学校', value: 'SD' },
  { label: 'SMP (Sekolah Menengah Pertama)', jp: '中学校', value: 'SMP' },
  { label: 'SMA (Sekolah Menengah Atas)', jp: '高校', value: 'SMA' },
  { label: 'SMK (Sekolah Menengah Kejuruan)', jp: '職業高校', value: 'SMK' },
  { label: 'Diploma / D3', jp: '短期大学', value: 'Kuliah / D3' },
  { label: 'Sarjana / S1', jp: '大学', value: 'Kuliah / S1' }
];

export const COMMON_OCCUPATION_OPTIONS = [
  { label: 'Petani / Perkebunan', jp: '農業', value: 'Petani' },
  { label: 'Wiraswasta / Usaha Mandiri', jp: '自営業', value: 'Wiraswasta / Bisnis' },
  { label: 'Karyawan Swasta', jp: '会社員', value: 'Karyawan Swasta' },
  { label: 'PNS / Guru / Dosen', jp: '公務員・教員', value: 'PNS / Guru' },
  { label: 'Ibu Rumah Tangga', jp: '主婦', value: 'Ibu Rumah Tangga' },
  { label: 'Pelajar / Mahasiswa', jp: '学生', value: 'Pelajar / Mahasiswa' },
  { label: 'Buruh / Tenaga Lapangan', jp: '作業員', value: 'Buruh' },
  { label: 'Perawat / Caregiver', jp: '看護師・介護士', value: 'Perawat' },
  { label: 'Belum / Tidak Bekerja', jp: '無職', value: 'Belum Bekerja' }
];

export const YES_NO_OPTIONS = [
  { label: 'Ya (Benar / Ada / Sanggup)', jp: 'はい', value: 'Ya' },
  { label: 'Tidak (Tidak Pernah / Tidak Ada)', jp: 'いいえ', value: 'Tidak' }
];

// Helper to find mapped Japanese value from dropdown option list
export function findMappedJp(optionsList, value, defaultVal = '') {
  if (!value) return defaultVal;
  const found = optionsList.find(
    (opt) => opt.value === value || opt.label === value || opt.jp === value
  );
  return found ? found.jp : value;
}

/**
 * Format standard date to Japanese date format: 1997年11月30日
 */
export function formatJapaneseDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/**
 * Format year-month to Japanese format: 2003年6月
 */
export function formatJapaneseYearMonth(str) {
  if (!str) return '';
  const cleaned = String(str).trim();
  const parts = cleaned.split(/[-/]/);
  if (parts.length >= 2) {
    const year = parts[0];
    const month = parseInt(parts[1], 10);
    if (!isNaN(month)) {
      return `${year}年${month}月`;
    }
  }
  return cleaned;
}

/**
 * Calculate age in years from birthdate
 */
export function calculateAge(dobStr) {
  if (!dobStr) return { age: 0, textJp: '' };
  const birth = new Date(dobStr);
  if (isNaN(birth.getTime())) return { age: 0, textJp: '' };
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return {
    age: Math.max(0, age),
    textJp: `${Math.max(0, age)}歳`
  };
}

/**
 * Robust Romaji to Katakana transliterator for Indonesian names and addresses.
 */
const KATAKANA_MAP = {
  // Triple / double blends
  kya: 'キャ', kyu: 'キュ', kyo: 'キョ',
  sha: 'シャ', shu: 'シュ', sho: 'ショ',
  cha: 'チャ', chu: 'チュ', cho: 'チョ',
  nya: 'ニャ', nyu: 'ニュ', nyo: 'ニョ',
  hya: 'ヒャ', hyu: 'ヒュ', hyo: 'ヒョ',
  mya: 'ミャ', myu: 'ミュ', myo: 'ミョ',
  rya: 'リャ', ryu: 'リュ', ryo: 'リョ',
  gya: 'ギャ', gyu: 'ギュ', gyo: 'ギョ',
  ja: 'ジャ', ju: 'ジュ', jo: 'ジョ',
  bya: 'ビャ', byu: 'ビュ', byo: 'ビョ',
  pya: 'ピャ', pyu: 'ピュ', pyo: 'ピョ',
  fa: 'ファ', fi: 'フィ', fe: 'フェ', fo: 'フォ',
  va: 'ヴァ', vi: 'ヴィ', vu: 'ヴ', ve: 'ヴェ', vo: 'ヴォ',
  ti: 'ティ', di: 'ディ', tu: 'トゥ', du: 'ドゥ',
  tsi: 'ツィ', che: 'チェ', je: 'ジェ',
  // Basic syllables
  ka: 'カ', ki: 'キ', ku: 'ク', ke: 'ケ', ko: 'コ',
  sa: 'サ', si: 'シ', shi: 'シ', su: 'ス', se: 'セ', so: 'ソ',
  ta: 'タ', ti: 'ティ', tu: 'トゥ', te: 'テ', to: 'ト', chi: 'チ', tsu: 'ツ',
  na: 'ナ', ni: 'ニ', nu: 'ヌ', ne: 'ネ', no: 'ノ',
  ha: 'ハ', hi: 'ヒ', fu: 'フ', hu: 'フ', he: 'ヘ', ho: 'ホ',
  ma: 'マ', mi: 'ミ', mu: 'ム', me: 'メ', mo: 'モ',
  ya: 'ヤ', yu: 'ユ', yo: 'ヨ',
  ra: 'ラ', ri: 'リ', ru: 'ル', re: 'レ', ro: 'ロ',
  la: 'ラ', li: 'リ', lu: 'ル', le: 'レ', lo: 'ロ',
  wa: 'ワ', wi: 'ウィ', we: 'ウェ', wo: 'ウォ',
  ga: 'ガ', gi: 'ギ', gu: 'グ', ge: 'ゲ', go: 'ゴ',
  za: 'ザ', zi: 'ジ', ji: 'ジ', zu: 'ズ', ze: 'ゼ', zo: 'ゾ',
  da: 'ダ', de: 'デ', do: 'ド',
  ba: 'バ', bi: 'ビ', bu: 'ブ', be: 'ベ', bo: 'ボ',
  pa: 'パ', pi: 'ピ', pu: 'プ', pe: 'ペ', po: 'ポ',
  // Vowels
  a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ'
};

const COMMON_PLACE_KATAKANA = {
  lombok: 'ロンボク',
  mataram: 'マタラム',
  gerung: 'グルン',
  parwa: 'パルワ',
  bali: 'バリ',
  jakarta: 'ジャカルタ',
  surabaya: 'スラバヤ',
  indonesia: 'インドネシア',
  sumbawa: 'スンバワ',
  bima: 'ビマ',
  jogja: 'ジョグジャ',
  yogyakarta: 'ジョグジャカルタ',
  semarang: 'スマラン',
  bandung: 'バンドン',
  medan: 'メダン',
  makassar: 'マカッサル'
};

export function transliterateToKatakana(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .split(/\s+/)
    .map((word) => {
      const lower = word.toLowerCase().replace(/[^a-z]/g, '');
      if (!lower) return word;

      // Check common dictionary first
      if (COMMON_PLACE_KATAKANA[lower]) {
        return COMMON_PLACE_KATAKANA[lower];
      }

      let res = '';
      let i = 0;
      const len = lower.length;

      while (i < len) {
        // Double consonant => sokuon (ッ)
        if (
          i + 1 < len &&
          lower[i] === lower[i + 1] &&
          !'aiueon'.includes(lower[i])
        ) {
          res += 'ッ';
          i++;
          continue;
        }

        // Try 3-char match
        if (i + 3 <= len) {
          const sub3 = lower.substr(i, 3);
          if (KATAKANA_MAP[sub3]) {
            res += KATAKANA_MAP[sub3];
            i += 3;
            continue;
          }
        }

        // Try 2-char match
        if (i + 2 <= len) {
          const sub2 = lower.substr(i, 2);
          if (KATAKANA_MAP[sub2]) {
            res += KATAKANA_MAP[sub2];
            i += 2;
            continue;
          }
        }

        // Try 1-char vowel
        const char = lower[i];
        if (KATAKANA_MAP[char]) {
          res += KATAKANA_MAP[char];
          i++;
          continue;
        }

        // Syllabic 'n' at end or before consonant
        if (char === 'n') {
          if (i === len - 1 || !'aiueo'.includes(lower[i + 1])) {
            res += 'ン';
            i++;
            continue;
          }
        }

        // Default single consonant without vowel => add standard u/o Katakana
        const singleConsonants = {
          k: 'ク', s: 'ス', t: 'ト', d: 'ド', n: 'ン', h: 'フ', m: 'ム',
          y: 'イ', r: 'ル', l: 'ル', w: 'ウ', g: 'グ', z: 'ズ', b: 'ブ', p: 'プ',
          j: 'ジ', c: 'ク', f: 'フ', v: 'ヴ'
        };
        if (singleConsonants[char]) {
          res += singleConsonants[char];
        } else {
          res += char;
        }
        i++;
      }

      return res;
    })
    .join('・');
}

/**
 * Intelligent dictionary for typical free-text resume fields:
 * majors, hobbies, strengths, reasons to work in Japan.
 */
export function translateResumeText(category, text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  if (category === 'major') {
    if (lower.includes('mesin')) return '機械工学科';
    if (lower.includes('otomotif')) return '自動車工学科';
    if (lower.includes('komputer') || lower.includes('informatika') || lower.includes('rpl') || lower.includes('tkj')) return '情報工学科';
    if (lower.includes('listrik') || lower.includes('elektro')) return '電気工学科';
    if (lower.includes('bangunan') || lower.includes('sipil')) return '土木・建築科';
    if (lower.includes('keperawatan') || lower.includes('kesehatan') || lower.includes('kaigo')) return '看護・福祉介護科';
    if (lower.includes('perhotelan') || lower.includes('pariwisata')) return 'ホテル・観光科';
    if (lower.includes('akuntansi') || lower.includes('keuangan')) return '会計学専攻';
    if (lower.includes('bahasa jepang')) return '日本語学科';
    if (lower.includes('ipa')) return '理数科（理系）';
    if (lower.includes('ips')) return '社会科（文系）';
    if (lower.includes('administrasi')) return '一般事務科';
    return transliterateToKatakana(trimmed) + '科';
  }

  if (category === 'school') {
    let result = trimmed;
    result = result.replace(/SMKN?\s*/gi, '国立・公立職業高校 ');
    result = result.replace(/SMAN?\s*/gi, '国立・公立高等学校 ');
    result = result.replace(/SMPN?\s*/gi, '公立中学校 ');
    result = result.replace(/SDN?\s*/gi, '公立小学校 ');
    result = result.replace(/Universitas\s*/gi, '大学 ');
    return result;
  }

  if (category === 'job_title') {
    if (lower.includes('operator') || lower.includes('pabrik')) return '製造ライン・工場作業員';
    if (lower.includes('caregiver') || lower.includes('perawat')) return '介護スタッフ';
    if (lower.includes('las') || lower.includes('welder')) return '溶接作業員';
    if (lower.includes('konstruksi') || lower.includes('bangunan')) return '建設・とび作業員';
    if (lower.includes('pertanian') || lower.includes('kebun')) return '農業・栽培管理員';
    if (lower.includes('pelayan') || lower.includes('waiter') || lower.includes('restoran')) return '外食接客スタッフ';
    if (lower.includes('admin') || lower.includes('kantor')) return '一般事務スタッフ';
    if (lower.includes('kasir') || lower.includes('toko') || lower.includes('sales')) return '販売員・接客スタッフ';
    return transliterateToKatakana(trimmed);
  }

  if (category === 'hobbies') {
    const list = trimmed.split(/[,、\n]+/).map(s => s.trim()).filter(Boolean);
    const mapped = list.map(h => {
      const l = h.toLowerCase();
      if (l.includes('badminton') || l.includes('bulutangkis')) return 'バドミントン';
      if (l.includes('bola') || l.includes('futsal')) return 'サッカー・フットサル';
      if (l.includes('baca')) return '読書';
      if (l.includes('masak')) return '料理';
      if (l.includes('musik')) return '音楽鑑賞';
      if (l.includes('lari') || l.includes('jogging')) return 'ジョギング';
      if (l.includes('gambar') || l.includes('lukis')) return 'イラスト・絵画';
      if (l.includes('jalan') || l.includes('travel')) return '旅行・散策';
      if (l.includes('motor') || l.includes('mesin')) return 'バイク・機械整備';
      return transliterateToKatakana(h);
    });
    return mapped.join('、');
  }

  if (category === 'skills') {
    const list = trimmed.split(/[,、\n]+/).map(s => s.trim()).filter(Boolean);
    const mapped = list.map(sk => {
      const l = sk.toLowerCase();
      if (l.includes('bahasa jepang') || l.includes('n4') || l.includes('n5')) return '実用日本語コミュニケーション（JLPT N4学習修了）';
      if (l.includes('komputer') || l.includes('office') || l.includes('excel')) return 'PC基本操作（Word, Excel）';
      if (l.includes('las') || l.includes('welding')) return '金属溶接作業（アーク・TIG）';
      if (l.includes('otomotif') || l.includes('motor')) return '自動車・自動二輪車整備';
      if (l.includes('listrik')) return '電気配線工事・機器点検';
      if (l.includes('fisik') || l.includes('stamina')) return '体力・持久力と健康管理';
      return transliterateToKatakana(sk);
    });
    return mapped.join('、');
  }

  if (category === 'strengths') {
    if (lower.includes('disiplin') || lower.includes('rajin') || lower.includes('pantang menyerah')) {
      return '何事にも誠実かつ前向きに取り組み、時間を厳守して任された仕事を最後まで粘り強くやり遂げる責任感があります。';
    }
    return '几帳面で協調性があり、新しい知識や技術を素早く吸収し、周囲と円滑に連携して業務に邁進できる点です。';
  }

  if (category === 'weaknesses') {
    if (lower.includes('buru') || lower.includes('sabar') || lower.includes('khawatir')) {
      return '心配性で確認を急ぎすぎる傾向がありますが、事前のメモ取りと復唱確認を徹底して正確な行動を心がけています。';
    }
    return '慎重になりすぎる面がありますが、優先順位を明確にし、迅速かつ着実な判断ができるよう意識して努めています。';
  }

  if (category === 'reason') {
    return '日本の高い技術力と規律ある労働倫理を現場で直に学び、確かな実務スキルを身につけたいと考えております。また、日本での就労を通じて得た貯蓄と経験で自立し、母国の家族の経済を支えるとともに、将来両国の架け橋として貢献したいという強い熱意から志望いたしました。';
  }

  if (category === 'savings_target') {
    const matchDigits = trimmed.match(/\d+/);
    if (matchDigits) {
      const num = parseInt(matchDigits[0], 10);
      return `${num}00万円（約${num}億ルピア）`;
    }
    return '300万円（約3億ルピア）';
  }

  return trimmed;
}

/**
 * Generate full Japanese Resume structured data (data_jp) from raw Indonesian inputs (data_id).
 */
export function generateJapaneseResumeData(dataId = {}, profilePhoto = '') {
  const ageObj = calculateAge(dataId.dob);

  const dataJp = {
    register_no: dataId.register_no || '',
    created_date_jp: formatJapaneseDate(new Date().toISOString().slice(0, 10)),
    profile_photo: profilePhoto || dataId.profile_photo || '',

    // a & b Data Diri
    name_kanji: dataId.name || '',
    name_kana: dataId.kana_name?.trim() || transliterateToKatakana(dataId.name || ''),
    name_alphabet: dataId.romaji_name || dataId.name || '',
    gender_jp: findMappedJp(GENDER_OPTIONS, dataId.gender, '男'),
    age_jp: ageObj.textJp,
    pob_jp: transliterateToKatakana(dataId.pob || ''),
    pob_id: dataId.pob || '',
    dob_jp: formatJapaneseDate(dataId.dob),
    dob_raw: dataId.dob || '',
    height_jp: dataId.height ? `${dataId.height}cm` : '',
    weight_jp: dataId.weight ? `${dataId.weight}kg` : '',
    blood_type_jp: findMappedJp(BLOOD_TYPE_OPTIONS, dataId.blood_type, 'O型'),
    address_alphabet: dataId.address || '',
    address_kana: transliterateToKatakana(dataId.address || ''),
    tattoo_jp: findMappedJp(TATTOO_OPTIONS, dataId.tattoo, '無し'),
    color_blindness_jp: findMappedJp(COLOR_BLINDNESS_OPTIONS, dataId.color_blindness, '正常'),
    marital_status_jp: findMappedJp(MARITAL_STATUS_OPTIONS, dataId.marital_status, '未婚'),
    smoking_jp: findMappedJp(SMOKING_OPTIONS, dataId.smoking, '吸わない'),
    alcohol_jp: findMappedJp(ALCOHOL_OPTIONS, dataId.alcohol, '飲まない'),
    passport_jp: findMappedJp(PASSPORT_OPTIONS, dataId.passport, '無し'),
    japan_family_jp: findMappedJp(JAPAN_FAMILY_OPTIONS, dataId.japan_family, '無し'),
    study_duration_jp: dataId.study_duration_months ? `${dataId.study_duration_months}ヶ月` : '6ヶ月',
    religion_jp: findMappedJp(RELIGION_OPTIONS, dataId.religion, 'イスラム教'),

    // c) Pendidikan (学歴)
    education: (Array.isArray(dataId.education) ? dataId.education : []).map((edu) => ({
      period_start_jp: formatJapaneseYearMonth(edu.period_start),
      period_end_jp: formatJapaneseYearMonth(edu.period_end),
      school_name_id: edu.school_name || '',
      school_name_jp: translateResumeText('school', edu.school_name || ''),
      level_jp: findMappedJp(EDUCATION_LEVEL_OPTIONS, edu.level, '高校'),
      major_jp: translateResumeText('major', edu.major || '')
    })),

    // d) Pengalaman Kerja (職歴)
    work_experience: (Array.isArray(dataId.work_experience) ? dataId.work_experience : []).map((work) => ({
      period_start_jp: formatJapaneseYearMonth(work.period_start),
      period_end_jp: formatJapaneseYearMonth(work.period_end),
      company_name_id: work.company_name || '',
      company_name_jp: transliterateToKatakana(work.company_name || ''),
      job_type_jp: translateResumeText('job_title', work.job_type || '')
    })),

    // e) Susunan Keluarga (家族構成)
    family: (Array.isArray(dataId.family) ? dataId.family : []).map((fam) => ({
      relation_jp: findMappedJp(FAMILY_RELATION_OPTIONS, fam.relation, '家族'),
      name_id: fam.name || '',
      name_kana: transliterateToKatakana(fam.name || ''),
      age_jp: fam.age ? `${fam.age}歳` : '',
      occupation_jp: findMappedJp(COMMON_OCCUPATION_OPTIONS, fam.occupation, '会社員')
    })),

    // f) Pertanyaan & Lain-lain
    q_waist_problem_jp: findMappedJp(YES_NO_OPTIONS, dataId.q_waist_problem, 'いいえ'),
    q_illness_surgery_jp: findMappedJp(YES_NO_OPTIONS, dataId.q_illness_surgery, 'いいえ'),
    q_family_tbc_jp: findMappedJp(YES_NO_OPTIONS, dataId.q_family_tbc, 'いいえ'),
    q_rules_compliance_jp: findMappedJp(YES_NO_OPTIONS, dataId.q_rules_compliance, 'はい'),
    q_pass_n4_confident_jp: findMappedJp(YES_NO_OPTIONS, dataId.q_pass_n4_confident, 'はい'),

    hobbies_jp: translateResumeText('hobbies', dataId.hobbies),
    skills_jp: translateResumeText('skills', dataId.skills),
    strengths_jp: translateResumeText('strengths', dataId.strengths),
    weaknesses_jp: translateResumeText('weaknesses', dataId.weaknesses),
    savings_target_jp: translateResumeText('savings_target', dataId.savings_target),
    reason_for_japan_jp: translateResumeText('reason', dataId.reason_for_japan)
  };

  return dataJp;
}

/**
 * Resolves a resume photo URL into an absolute URL pointing to the backend domain.
 * - Leaves absolute URLs (http://, https://, blob:, data:image/) unchanged.
 * - Automatically prepends the backend base domain from VITE_API_URL (with /api stripped)
 *   to relative paths (e.g. /uploads/resumes/...) so images load across separate domains.
 * - Does not hardcode any domain.
 */
export function getResumePhotoUrl(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string') return '';
  const trimmed = photoUrl.trim();
  if (/^(https?:|\/\/|data:image\/|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  const rawApiUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || '';
  const backendBase = typeof rawApiUrl === 'string'
    ? rawApiUrl.trim().replace(/\/+api\/?$/i, '').replace(/\/+$/, '')
    : '';

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return backendBase ? `${backendBase}${cleanPath}` : cleanPath;
}

