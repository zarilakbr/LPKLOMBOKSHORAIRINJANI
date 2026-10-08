import React from 'react';
import { Printer, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  formatJapaneseDate,
  formatJapaneseYearMonth,
  calculateAge,
  transliterateToKatakana,
  getResumePhotoUrl
} from '../../utils/japaneseResumeHelper';

export default function JapaneseResumePrintView({
  dataId = {},
  dataJp = {},
  user = {},
  profilePhoto = '',
  onBack,
  onEdit
}) {
  const handlePrint = () => {
    window.print();
  };

  const rawPhoto =
    profilePhoto ||
    dataJp?.profile_photo ||
    dataId?.profile_photo ||
    user?.avatar ||
    '';

  const photoUrl = getResumePhotoUrl(rawPhoto);

  const registerNo =
    dataJp?.register_no ||
    dataId?.register_no ||
    `REG-${new Date().getFullYear()}-${String(user?.id || 1).padStart(4, '0')}`;

  const createdDate =
    dataJp?.created_date_jp ||
    formatJapaneseDate(new Date().toISOString().slice(0, 10));

  const ageText =
    dataJp?.age_jp ||
    calculateAge(dataId?.dob).textJp ||
    '';

  const eduRows = dataJp?.education || (dataId?.education || []).map((edu) => ({
    period_start_jp: formatJapaneseYearMonth(edu.period_start),
    period_end_jp: formatJapaneseYearMonth(edu.period_end),
    school_name_jp: edu.school_name || '',
    level_jp: edu.level || '',
    major_jp: edu.major || ''
  }));

  const workRows = dataJp?.work_experience || (dataId?.work_experience || []).map((w) => ({
    period_start_jp: formatJapaneseYearMonth(w.period_start),
    period_end_jp: formatJapaneseYearMonth(w.period_end),
    company_name_jp: w.company_name || '',
    job_type_jp: w.job_type || ''
  }));

  const familyRows = dataJp?.family || (dataId?.family || []).map((f) => ({
    relation_jp: f.relation || '',
    name_kana: f.name || '',
    age_jp: f.age ? `${f.age}歳` : '',
    occupation_jp: f.occupation || ''
  }));

  return (
    <div className="resume-print-wrapper" style={{ padding: '1rem', backgroundColor: '#F1F5F9', minHeight: '100vh' }}>
      {/* Non-printed Top Toolbar */}
      <div
        className="no-print"
        style={{
          maxWidth: '210mm',
          margin: '0 auto 1rem auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn btn-outline btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <ArrowLeft size={15} /> Kembali
            </button>
          )}
          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B' }}>
            Pratinjau Dokumen 履歴書 (A4 Portrait)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="btn btn-outline btn-sm"
            >
              Edit Terjemahan
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#1E40AF', borderColor: '#1E40AF', color: '#FFF' }}
          >
            <Printer size={15} /> Cetak / Unduh PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet (Strict A4 Page Dimensions with Japanese Font) */}
      <div
        id="japanese-rirekisho-document"
        className="rirekisho-sheet"
        style={{
          width: '210mm',
          minHeight: '297mm',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          padding: '10mm 12mm',
          boxSizing: 'border-box',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontFamily: "'Noto Sans JP', 'Noto Serif JP', 'Meiryo', 'MS PGothic', sans-serif",
          color: '#000000',
          fontSize: '9pt',
          lineHeight: 1.3
        }}
      >
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div>
            <h1
              style={{
                fontSize: '18pt',
                fontWeight: 800,
                letterSpacing: '0.5em',
                margin: 0,
                color: '#000000',
                borderBottom: '2px solid #000',
                display: 'inline-block',
                paddingBottom: '2px'
              }}
            >
              履 歴 書
            </h1>
            <div style={{ fontSize: '7.5pt', color: '#333333', marginTop: '3px' }}>
              CURRICULUM VITAE / RESUME STANDAR JEPANG
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '8.5pt' }}>
            <div>作成日 (Tanggal Cetak): <strong>{createdDate}</strong> 現在</div>
            <div style={{ fontSize: '8pt', color: '#444' }}>
              登録番号 (No. Reg): <strong>{registerNo}</strong>
            </div>
          </div>
        </div>

        {/* Section 1: Main Biodata Table with Integrated 3x4 Photo at Top-Right */}
        <div style={{ marginBottom: '6px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000',
              fontSize: '7.8pt'
            }}
          >
            <tbody>
              {/* Row 1: Furigana, Gender & Photo Cell (rowSpan=4) */}
              <tr style={{ height: '18px' }}>
                <td style={{ ...cellHeaderStyle, width: '16%' }}>フリガナ (Kana)</td>
                <td style={{ ...cellContentStyle, width: '38%', color: '#111', fontWeight: 600 }}>
                  {dataJp?.name_kana || transliterateToKatakana(dataId?.name || '')}
                </td>
                <td style={{ ...cellHeaderStyle, width: '12%' }}>性別 (Kelamin)</td>
                <td style={{ ...cellContentStyle, width: '10%', textAlign: 'center', fontWeight: 700 }}>
                  {dataJp?.gender_jp || (dataId?.gender === 'Perempuan' ? '女' : '男')}
                </td>
                {/* Integrated 3x4 Photo Cell: Occupies Rows 1-4, perfectly flush at top-right */}
                <td
                  rowSpan={4}
                  style={{
                    width: '30mm',
                    minWidth: '30mm',
                    maxWidth: '30mm',
                    border: '1px solid #000',
                    padding: 0,
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    backgroundColor: '#FAFAFA'
                  }}
                >
                  <div
                    style={{
                      width: '30mm',
                      height: '40mm',
                      margin: '0 auto',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Foto Profil Siswa"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        style={{ width: '30mm', height: '40mm', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.parentElement?.querySelector('.photo-fallback');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="photo-fallback"
                      style={{
                        width: '30mm',
                        height: '40mm',
                        display: photoUrl ? 'none' : 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#F8FAFC',
                        border: '1px dashed #CBD5E1',
                        boxSizing: 'border-box',
                        color: '#64748B',
                        textAlign: 'center',
                        padding: '2px'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '8pt', color: '#1E293B' }}>写 真</div>
                      <div style={{ fontSize: '6.5pt', marginTop: '2px', fontWeight: 600 }}>FOTO 3×4</div>
                      <div style={{ fontSize: '5.5pt', color: '#94A3B8', marginTop: '1px' }}>(30mm × 40mm)</div>
                    </div>
                  </div>
                </td>
              </tr>

              {/* Row 2: Full Name & Birthday */}
              <tr style={{ height: '24px' }}>
                <td style={cellHeaderStyle}>氏 名 (Nama Lengkap)</td>
                <td style={{ ...cellContentStyle, fontSize: '9pt', fontWeight: 800 }}>
                  {dataId?.name || dataJp?.name_kanji || user?.name || ''}
                  <span style={{ fontSize: '7.5pt', fontWeight: 400, marginLeft: '6px', color: '#444' }}>
                    ({dataId?.romaji_name || dataId?.name || user?.name || ''})
                  </span>
                </td>
                <td style={cellHeaderStyle}>生年月日 (Tgl Lahir)</td>
                <td style={{ ...cellContentStyle, fontSize: '7.2pt', textAlign: 'center' }}>
                  {dataJp?.dob_jp || formatJapaneseDate(dataId?.dob)}
                  <div style={{ fontWeight: 700 }}>({ageText || '-'})</div>
                </td>
              </tr>

              {/* Row 3: Birth Place, Height & Weight */}
              <tr style={{ height: '20px' }}>
                <td style={cellHeaderStyle}>出生地 (Tempat Lahir)</td>
                <td style={cellContentStyle}>
                  {dataJp?.pob_jp ? `${dataJp.pob_jp} (${dataId?.pob || ''})` : (dataId?.pob || '-')}
                </td>
                <td style={cellHeaderStyle}>身長 / 体重</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontSize: '7.2pt' }}>
                  {dataId?.height ? `${dataId.height}cm` : '-'} / {dataId?.weight ? `${dataId.weight}kg` : '-'}
                </td>
              </tr>

              {/* Row 4: Blood Type, Religion, Study Duration */}
              <tr style={{ height: '20px' }}>
                <td style={cellHeaderStyle}>血液型 / 宗教</td>
                <td style={cellContentStyle}>
                  <strong>{dataJp?.blood_type_jp || (dataId?.blood_type ? `${dataId.blood_type}型` : 'O型')}</strong> &nbsp;|&nbsp; {dataJp?.religion_jp || (dataId?.religion === 'Islam' ? 'イスラム教' : dataId?.religion || 'イスラム教')}
                </td>
                <td style={cellHeaderStyle}>学習期間</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 600, fontSize: '7.2pt' }}>
                  {dataJp?.study_duration_jp || (dataId?.study_duration_months ? `${dataId.study_duration_months}ヶ月` : '6ヶ月')}
                </td>
              </tr>

              {/* Row 5: Address (spans full width across columns 1-4 and photo column) */}
              <tr style={{ height: '26px' }}>
                <td style={cellHeaderStyle}>現住所 (Alamat Domisili)</td>
                <td colSpan={4} style={{ ...cellContentStyle, fontSize: '7.2pt' }}>
                  <div style={{ color: '#2563EB', fontWeight: 600, fontSize: '6.8pt' }}>
                    {dataJp?.address_kana || transliterateToKatakana(dataId?.address || '')}
                  </div>
                  <div>{dataId?.address || '-'}</div>
                </td>
              </tr>

              {/* Row 6: Personal Status (spans full width across columns 1-4 and photo column) */}
              <tr style={{ height: '22px' }}>
                <td style={cellHeaderStyle}>配偶者・嗜好</td>
                <td colSpan={4} style={{ ...cellContentStyle, fontSize: '7.2pt' }}>
                  <span style={{ marginRight: '8px' }}>
                    <strong>配偶者 (Nikah):</strong> {dataJp?.marital_status_jp || (dataId?.marital_status || '未婚')}
                  </span>
                  <span style={{ marginRight: '8px' }}>
                    <strong>喫煙 (Rokok):</strong> {dataJp?.smoking_jp || (dataId?.smoking || '吸わない')}
                  </span>
                  <span style={{ marginRight: '8px' }}>
                    <strong>飲酒 (Alkohol):</strong> {dataJp?.alcohol_jp || (dataId?.alcohol || '飲まない')}
                  </span>
                  <span style={{ marginRight: '8px' }}>
                    <strong>刺青 (Tato):</strong> {dataJp?.tattoo_jp || (dataId?.tattoo || '無し')}
                  </span>
                  <span style={{ marginRight: '8px' }}>
                    <strong>色覚 (Warna):</strong> {dataJp?.color_blindness_jp || (dataId?.color_blindness || '正常')}
                  </span>
                  <span style={{ marginRight: '8px' }}>
                    <strong>パスポート:</strong> {dataJp?.passport_jp || (dataId?.passport || '無し')}
                  </span>
                  <span>
                    <strong>在日家族:</strong> {dataJp?.japan_family_jp || (dataId?.japan_family || '無し')}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: 学歴・職歴 (Education & Work History) */}
        <div style={{ marginBottom: '6px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000',
              fontSize: '7.8pt'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F0F0F0', borderBottom: '1.5px solid #000', height: '18px' }}>
                <th style={{ ...cellHeaderStyle, width: '12%', textAlign: 'center' }}>年 (Thn)</th>
                <th style={{ ...cellHeaderStyle, width: '8%', textAlign: 'center' }}>月 (Bln)</th>
                <th style={{ ...cellHeaderStyle, textAlign: 'center' }}>
                  学 歴 ・ 職 歴 (Latar Belakang Pendidikan & Pengalaman Kerja)
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Header: 学歴 */}
              <tr style={{ height: '18px', backgroundColor: '#FAFAFA' }}>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 700 }}>-</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 700 }}>-</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 800, letterSpacing: '0.3em' }}>
                  学 歴 (Pendidikan)
                </td>
              </tr>

              {/* Education Rows */}
              {eduRows.length > 0 ? (
                eduRows.map((edu, idx) => {
                  const [sYear, sMonth] = (edu.period_start_jp || '').replace('年', '-').replace('月', '').split('-');
                  const [eYear, eMonth] = (edu.period_end_jp || '').replace('年', '-').replace('月', '').split('-');
                  return (
                    <React.Fragment key={`edu-${idx}`}>
                      <tr style={{ height: '18px' }}>
                        <td style={{ ...cellContentStyle, textAlign: 'center' }}>{sYear || '-'}</td>
                        <td style={{ ...cellContentStyle, textAlign: 'center' }}>{sMonth || '-'}</td>
                        <td style={cellContentStyle}>
                          <strong>{edu.school_name_jp || edu.school_name_id}</strong> 入学 (Masuk Sekolah {edu.level_jp || ''})
                        </td>
                      </tr>
                      <tr style={{ height: '18px' }}>
                        <td style={{ ...cellContentStyle, textAlign: 'center' }}>{eYear || '-'}</td>
                        <td style={{ ...cellContentStyle, textAlign: 'center' }}>{eMonth || '-'}</td>
                        <td style={cellContentStyle}>
                          <strong>{edu.school_name_jp || edu.school_name_id}</strong> 卒業 (Lulus)
                          {edu.major_jp && <span style={{ color: '#444', marginLeft: '6px' }}>[{edu.major_jp}]</span>}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr style={{ height: '20px' }}>
                  <td style={{ ...cellContentStyle, textAlign: 'center' }}>-</td>
                  <td style={{ ...cellContentStyle, textAlign: 'center' }}>-</td>
                  <td style={{ ...cellContentStyle, color: '#666' }}>SMA sederajat di Indonesia 入学・卒業</td>
                </tr>
              )}

              {/* Header: 職歴 */}
              <tr style={{ height: '18px', backgroundColor: '#FAFAFA' }}>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 700 }}>-</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 700 }}>-</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 800, letterSpacing: '0.3em' }}>
                  職 歴 (Pengalaman Kerja)
                </td>
              </tr>

              {/* Work Rows */}
              {workRows.length > 0 ? (
                workRows.map((work, idx) => {
                  const [sYear, sMonth] = (work.period_start_jp || '').replace('年', '-').replace('月', '').split('-');
                  const [eYear, eMonth] = (work.period_end_jp || '').replace('年', '-').replace('月', '').split('-');
                  return (
                    <React.Fragment key={`work-${idx}`}>
                      <tr style={{ height: '18px' }}>
                        <td style={{ ...cellContentStyle, textAlign: 'center' }}>{sYear || '-'}</td>
                        <td style={{ ...cellContentStyle, textAlign: 'center' }}>{sMonth || '-'}</td>
                        <td style={cellContentStyle}>
                          <strong>{work.company_name_jp || work.company_name_id}</strong> 入社 (Masuk Kerja - {work.job_type_jp || '作業員'})
                        </td>
                      </tr>
                      {work.period_end_jp && (
                        <tr style={{ height: '18px' }}>
                          <td style={{ ...cellContentStyle, textAlign: 'center' }}>{eYear || '-'}</td>
                          <td style={{ ...cellContentStyle, textAlign: 'center' }}>{eMonth || '-'}</td>
                          <td style={cellContentStyle}>
                            <strong>{work.company_name_jp || work.company_name_id}</strong> 一身上の都合により退社 (Selesai Kontrak Kerja)
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr style={{ height: '20px' }}>
                  <td style={{ ...cellContentStyle, textAlign: 'center' }}>-</td>
                  <td style={{ ...cellContentStyle, textAlign: 'center' }}>-</td>
                  <td style={{ ...cellContentStyle, textAlign: 'center', color: '#666' }}>なし (Tidak Ada / Belum Pernah Bekerja Formal)</td>
                </tr>
              )}

              {/* End of Career marker */}
              <tr style={{ height: '18px' }}>
                <td style={{ ...cellContentStyle, textAlign: 'center' }}></td>
                <td style={{ ...cellContentStyle, textAlign: 'center' }}></td>
                <td style={{ ...cellContentStyle, textAlign: 'right', fontWeight: 800, paddingRight: '20px' }}>
                  以 上 (Selesai)
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: 家族構成 (Family Members) */}
        <div style={{ marginBottom: '6px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000',
              fontSize: '7.8pt'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F0F0F0', borderBottom: '1.5px solid #000', height: '18px' }}>
                <th style={{ ...cellHeaderStyle, width: '18%' }}>続柄 (Hubungan)</th>
                <th style={{ ...cellHeaderStyle, width: '38%' }}>氏名 (Nama Keluarga)</th>
                <th style={{ ...cellHeaderStyle, width: '14%', textAlign: 'center' }}>年齢 (Umur)</th>
                <th style={{ ...cellHeaderStyle, width: '30%' }}>職業 (Pekerjaan)</th>
              </tr>
            </thead>
            <tbody>
              {familyRows.length > 0 ? (
                familyRows.map((fam, idx) => (
                  <tr key={`fam-${idx}`} style={{ height: '18px' }}>
                    <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 600 }}>{fam.relation_jp}</td>
                    <td style={cellContentStyle}>
                      <strong>{fam.name_kana}</strong> {fam.name_id && <span style={{ color: '#444' }}>({fam.name_id})</span>}
                    </td>
                    <td style={{ ...cellContentStyle, textAlign: 'center' }}>{fam.age_jp || '-'}</td>
                    <td style={cellContentStyle}>{fam.occupation_jp || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr style={{ height: '20px' }}>
                  <td colSpan={4} style={{ ...cellContentStyle, textAlign: 'center', color: '#666' }}>
                    Belum ada susunan keluarga terisi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 4: 5 Pertanyaan Kesehatan & Kepatuhan */}
        <div style={{ marginBottom: '6px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000',
              fontSize: '7.5pt'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F0F0F0', borderBottom: '1.5px solid #000', height: '18px' }}>
                <th style={{ ...cellHeaderStyle, width: '70%', textAlign: 'left', paddingLeft: '8px' }}>
                  自己健康確認・誓約事項 (Kondisi Kesehatan & Pernyataan Komitmen)
                </th>
                <th style={{ ...cellHeaderStyle, width: '30%', textAlign: 'center' }}>
                  回答 (Hasil Jawaban)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: '18px' }}>
                <td style={cellContentStyle}>1. 腰痛など身体の部位に異常はありますか (Ada masalah pada pinggang/organ tubuh lain?)</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 800, color: dataJp?.q_waist_problem_jp === 'はい' ? '#DC2626' : '#16A34A' }}>
                  {dataJp?.q_waist_problem_jp || 'いいえ'}
                </td>
              </tr>
              <tr style={{ height: '18px' }}>
                <td style={cellContentStyle}>2. 既往症・大きな手術歴はありますか (Ada riwayat penyakit serius atau operasi besar?)</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 800, color: dataJp?.q_illness_surgery_jp === 'はい' ? '#DC2626' : '#16A34A' }}>
                  {dataJp?.q_illness_surgery_jp || 'いいえ'}
                </td>
              </tr>
              <tr style={{ height: '18px' }}>
                <td style={cellContentStyle}>3. 家族に結核にかかった人はいますか (Ada anggota keluarga yang pernah menderita TBC?)</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 800, color: dataJp?.q_family_tbc_jp === 'はい' ? '#DC2626' : '#16A34A' }}>
                  {dataJp?.q_family_tbc_jp || 'いいえ'}
                </td>
              </tr>
              <tr style={{ height: '18px' }}>
                <td style={cellContentStyle}>4. 日本の法律および配属先企業の規則を遵守できますか (Sanggup mematuhi hukum & aturan perusahaan Jepang?)</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 800, color: '#16A34A' }}>
                  {dataJp?.q_rules_compliance_jp || 'はい'}
                </td>
              </tr>
              <tr style={{ height: '18px' }}>
                <td style={cellContentStyle}>5. 渡航前までに日本語能力試験N4に合格する自信はありますか (Yakin lulus ujian JLPT N4 sebelum berangkat?)</td>
                <td style={{ ...cellContentStyle, textAlign: 'center', fontWeight: 800, color: '#16A34A' }}>
                  {dataJp?.q_pass_n4_confident_jp || 'はい'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 5: Hobi, Keahlian, Kelebihan, Kekurangan, Target Tabungan */}
        <div style={{ marginBottom: '6px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000',
              fontSize: '7.8pt'
            }}
          >
            <tbody>
              <tr>
                <td style={{ ...cellHeaderStyle, width: '22%' }}>趣味・特技 (Hobi & Keahlian)</td>
                <td style={cellContentStyle}>
                  <div><strong>趣味:</strong> {dataJp?.hobbies_jp || dataId?.hobbies || 'バドミントン、読書'}</div>
                  <div><strong>特技:</strong> {dataJp?.skills_jp || dataId?.skills || '実用日本語コミュニケーション、体力と健康管理'}</div>
                </td>
                <td style={{ ...cellHeaderStyle, width: '18%' }}>目標貯金額 (Target Tabungan)</td>
                <td style={{ ...cellContentStyle, width: '25%', fontWeight: 700, color: '#1E40AF' }}>
                  {dataJp?.savings_target_jp || dataId?.savings_target || '300万円（約3億ルピア）'}
                </td>
              </tr>
              <tr>
                <td style={cellHeaderStyle}>長所 (Kelebihan)</td>
                <td colSpan={3} style={cellContentStyle}>
                  {dataJp?.strengths_jp || dataId?.strengths || '几帳面で何事にも前向きに粘り強く取り組み、時間を厳守して任された職務を最後までやり遂げます。'}
                </td>
              </tr>
              <tr>
                <td style={cellHeaderStyle}>短所 (Kekurangan)</td>
                <td colSpan={3} style={cellContentStyle}>
                  {dataJp?.weaknesses_jp || dataId?.weaknesses || '慎重になりすぎる面がありますが、メモ取りと事前確認を徹底して正確な行動を心がけています。'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 6: 志望動機 (Reason for applying to Japan) */}
        <div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1.5px solid #000',
              fontSize: '7.8pt'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F0F0F0', borderBottom: '1.5px solid #000', height: '18px' }}>
                <th style={{ ...cellHeaderStyle, textAlign: 'left', paddingLeft: '8px' }}>
                  志望理由 (Alasan Ingin Bekerja di Jepang)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...cellContentStyle, padding: '8px 10px', lineHeight: 1.5, textAlign: 'justify' }}>
                  {dataJp?.reason_for_japan_jp ||
                    dataId?.reason_for_japan ||
                    '日本の進んだ技術と規律ある労働倫理を現場で直に学び、専門実務スキルを身につけたいと考えております。また、日本での就労を通じて得た貯蓄と経験で自立し、母国の家族の経済を支えるとともに、将来両国の架け橋として貢献したいという強い熱意から志望いたしました。'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Confirmation & Signature */}
        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '7.5pt' }}>
          <div style={{ maxWidth: '58%', lineHeight: 1.5, paddingTop: '4px' }}>
            <div style={{ fontWeight: 700 }}>
              上記のとおり相違ありません
            </div>
            <div style={{ color: '#334155', fontSize: '7pt' }}>
              (Dengan ini saya menyatakan bahwa seluruh data riwayat di atas adalah benar dan dapat dipertanggungjawabkan).
            </div>
          </div>
          <div style={{ textAlign: 'center', minWidth: '170px' }}>
            <div style={{ fontSize: '7.5pt', fontWeight: 600, color: '#1E293B' }}>
              署名 (Tanda Tangan Siswa)
            </div>
            {/* Space ke bawah untuk tanda tangan fisik / stempel resmi */}
            <div style={{ height: '54px', width: '160px', margin: '0 auto' }}></div>
            <div style={{ borderBottom: '1px solid #000', width: '160px', margin: '0 auto' }}></div>
            <div style={{ fontSize: '7.5pt', marginTop: '4px', fontWeight: 600, color: '#0F172A' }}>
              ( {dataId?.name || user?.name || '................................'} )
            </div>
          </div>
        </div>
      </div>

      {/* Print CSS Stylesheet */}
      <style>{`
        @media print {
          /* 1. Sembunyikan seluruh sidebar, navbar, footer, drawer, dan tombol */
          .admin-sidebar,
          .admin-topbar,
          .student-sidebar,
          .student-topbar,
          .student-header,
          .dashboard-footer,
          .no-print,
          aside,
          header,
          footer,
          nav,
          button,
          .btn {
            display: none !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
          }

          /* 2. Reset html & body: latar putih bersih, tanpa margin liar, tanpa min-height/100vh */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            background-color: #FFFFFF !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* 3. Reset seluruh kontainer layout pembungkus agar bersih dan tidak memicu lembar ke-2 */
          #root,
          .admin-layout,
          .admin-main,
          .admin-scroll-container,
          .admin-content,
          .student-layout,
          .student-main,
          .resume-print-wrapper {
            display: block !important;
            position: static !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #FFFFFF !important;
            background-color: #FFFFFF !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
          }

          /* 4. Format lembar A4 Portrait standar dengan margin 10mm */
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          /* 5. Dokumen Rirekisho terkunci tepat 1 halaman A4 */
          .rirekisho-sheet {
            box-shadow: none !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 190mm !important;
            min-height: 0 !important;
            height: auto !important;
            padding: 0 !important;
            border: none !important;
            background: #FFFFFF !important;
            background-color: #FFFFFF !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* 6. Pastikan tabel, garis hitam, dan warna sel tercetak tajam */
          table {
            border-collapse: collapse !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* 7. Foto 3x4 tercetak dengan rasio tepat */
          img {
            max-width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}

const cellHeaderStyle = {
  border: '1px solid #000',
  backgroundColor: '#F8FAFC',
  fontWeight: 700,
  padding: '3px 6px',
  color: '#0F172A',
  fontSize: '7.5pt'
};

const cellContentStyle = {
  border: '1px solid #000',
  padding: '3px 6px',
  color: '#000000',
  fontSize: '7.8pt'
};
