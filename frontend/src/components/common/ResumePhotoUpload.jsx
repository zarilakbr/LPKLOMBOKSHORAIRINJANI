import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { resumeService } from '../../services/dataService';
import { getResumePhotoUrl } from '../../utils/japaneseResumeHelper';

/**
 * Compresses and resizes an image in the browser:
 * - Uses createImageBitmap with EXIF orientation support (or HTMLImageElement fallback)
 *   so photos taken from smartphones are never rotated.
 * - Scales the image so that the longest side does not exceed maxDimension (default 1200px).
 * - Fills the canvas background with solid white before drawing (so transparent PNGs don't turn black).
 * - Exports as JPEG with quality 0.85 (typical size: 100KB - 400KB, well under 1MB).
 */
async function compressImageInBrowser(file, maxDimension = 1200, quality = 0.85) {
  let source;
  let width;
  let height;

  // 1. Load image source with EXIF orientation awareness
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      source = await window.createImageBitmap(file, { imageOrientation: 'from-image' });
      width = source.width;
      height = source.height;
    } catch {
      source = null;
    }
  }

  if (!source) {
    source = await new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Format foto tidak dapat dibaca atau rusak. Pastikan foto berformat JPG, PNG, atau WEBP.'));
      };
      img.src = objectUrl;
    });
    width = source.naturalWidth || source.width;
    height = source.naturalHeight || source.height;
  }

  if (!width || !height) {
    throw new Error('Dimensi foto tidak valid atau tidak dapat dibaca.');
  }

  // 2. Calculate scaled dimensions keeping aspect ratio (longest dimension <= maxDimension)
  let targetWidth = width;
  let targetHeight = height;
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      targetWidth = maxDimension;
      targetHeight = Math.round((height * maxDimension) / width);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((width * maxDimension) / height);
    }
  }

  // 3. Render onto canvas with white background
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Gagal menginisialisasi canvas grafis peramban.');
  }

  // Solid white fill prevents transparent PNG areas from turning black when converted to JPEG
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);

  // Close ImageBitmap if used to free GPU/memory immediately
  if (source && typeof source.close === 'function') {
    source.close();
  }

  // 4. Export as JPEG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal menghasilkan file kompresi foto.'));
          return;
        }
        const originalName = file.name || 'photo.jpg';
        const cleanName = originalName.replace(/\.[^/.]+$/, '') + '.jpg';
        const compressedFile = new File([blob], cleanName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * ResumePhotoUpload Component
 *
 * Dedicated 3x4 photo uploader for Japanese Resume (履歴書).
 * Allows students to upload an image file directly from their device (no external links required).
 */
export default function ResumePhotoUpload({
  value,
  onChange,
  label = 'Foto Profil Resume (Pasfoto 3x4)',
  helpText = 'Unggah pasfoto formal ukuran 3x4 (latar belakang polos, pakaian formal/jas). Format JPG, PNG, atau WEBP maks 5MB.',
  required = false
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileProcess = async (file) => {
    if (!file) return;

    // Validate type
    const validMimes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const isImageMime = file.type && (validMimes.includes(file.type.toLowerCase()) || file.type.startsWith('image/'));
    const isImageExt = /\.(jpe?g|png|webp)$/i.test(file.name || '');

    if (!isImageMime && !isImageExt) {
      setErrorMsg('File yang dipilih harus berupa gambar berformat JPG, PNG, atau WEBP.');
      return;
    }

    // Validate size (max 10MB raw before client compression, server will receive < 1MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto asli terlalu besar (maksimal 10MB sebelum kompresi).');
      return;
    }

    setErrorMsg(null);
    setUploading(true);

    let fileToUpload = file;
    try {
      // 1. Compress & resize in browser (max 1200px, JPEG 0.85, white bg, EXIF oriented)
      fileToUpload = await compressImageInBrowser(file, 1200, 0.85);

      // Instant local preview from compressed file
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result;
        if (base64Data && !value) {
          onChange(base64Data);
        }
      };
      reader.readAsDataURL(fileToUpload);
    } catch (compressionErr) {
      console.warn('Browser compression failed or image format unreadable:', compressionErr);
      setErrorMsg(
        compressionErr.message ||
        'Format foto tidak dapat dibaca oleh browser. Pastikan file berupa foto JPG, PNG, atau WEBP yang valid.'
      );
      setUploading(false);
      return;
    }

    // 2. Upload to server
    try {
      const res = await resumeService.uploadPhoto(fileToUpload);
      if (res && res.url) {
        onChange(res.url);
      }
    } catch (err) {
      console.error('Backend upload error:', err);
      const status = err.response?.status;
      if (status === 413) {
        setErrorMsg('Ukuran file terlalu besar untuk server (Error 413: Payload Too Large). Sistem telah mengompresi foto, namun server menolak. Silakan gunakan foto lain.');
      } else if (status === 422) {
        const serverMsg =
          err.response?.data?.errors?.photo?.[0] ||
          err.response?.data?.message;
        setErrorMsg(serverMsg || 'Format atau ukuran foto tidak memenuhi validasi server (Error 422).');
      } else {
        setErrorMsg(err.response?.data?.message || 'Gagal mengunggah foto ke server. Periksa koneksi internet Anda.');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {/* Label */}
      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Main Upload Box & Preview */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* 3x4 Aspect Ratio Preview Box */}
        <div
          style={{
            width: '105px',
            height: '140px',
            borderRadius: '6px',
            border: value ? '2px solid #2563EB' : '2px dashed var(--border-subtle)',
            backgroundColor: value ? '#000' : 'var(--bg-surface-subtle)',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: value ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {value ? (
            <img
              src={getResumePhotoUrl(value)}
              alt="Pasfoto 3x4 Siswa"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = `https://ui-avatars.com/api/?name=Foto+3x4&background=2563EB&color=fff`;
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)' }}>
              <ImageIcon size={28} style={{ margin: '0 auto 0.25rem auto', opacity: 0.6 }} />
              <div style={{ fontSize: '0.68rem', fontWeight: 600 }}>Pasfoto 3x4</div>
            </div>
          )}

          {/* Uploading Overlay */}
          {uploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                gap: '0.25rem'
              }}
            >
              <RefreshCw className="spin-slow" size={20} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Mengunggah...</span>
            </div>
          )}
        </div>

        {/* Upload Action Area */}
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
              border: isDragOver ? '2px dashed #2563EB' : '1px dashed var(--border-subtle)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              backgroundColor: isDragOver ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-surface-subtle)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Upload size={22} style={{ margin: '0 auto 0.35rem auto', color: isDragOver ? '#2563EB' : 'var(--text-secondary)' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {value ? 'Klik untuk Ganti Foto' : 'Klik atau Tarik File Foto ke Sini'}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Pilih foto langsung dari memori HP atau komputer
            </div>
          </div>

          {/* Action Buttons if Photo Exists */}
          {value && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#16A34A',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <CheckCircle2 size={13} /> Foto 3x4 Terpasang
              </span>

              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="btn btn-outline btn-xs"
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  color: '#EF4444',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
              >
                <Trash2 size={12} /> Hapus Foto
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                fontSize: '0.78rem',
                color: '#EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontWeight: 600
              }}
            >
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}

          {/* Help Text */}
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {helpText}
          </div>
        </div>
      </div>
    </div>
  );
}
