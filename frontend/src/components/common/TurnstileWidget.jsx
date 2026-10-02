import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * Cloudflare Turnstile Human Verification Widget
 *
 * Provides client-side bot detection. The generated token must be verified
 * server-side in Laravel to complete authentication or submission.
 *
 * In development or when VITE_CLOUDFLARE_TURNSTILE_SITE_KEY is unset,
 * Cloudflare's official always-pass test key '1x00000000000000000000AA' is utilized.
 */
export default function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  theme = 'light',
  size = 'normal',
  style = {}
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [status, setStatus] = useState('loading'); // 'loading', 'ready', 'verified', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Official Cloudflare Turnstile Test Site Key (Always Passes)
  const defaultTestSiteKey = '1x00000000000000000000AA';
  const siteKey =
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY) ||
    defaultTestSiteKey;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      // Remove existing widget if already rendered
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore cleanup error
        }
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          size: size,
          callback: (token) => {
            if (isMounted) {
              setStatus('verified');
              if (onVerify) onVerify(token);
            }
          },
          'error-callback': (err) => {
            if (isMounted) {
              setStatus('error');
              setErrorMessage('Verifikasi Turnstile gagal dimuat.');
              if (onError) onError(err);
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              setStatus('ready');
              if (onExpire) onExpire();
            }
          }
        });
        setStatus('ready');
      } catch (err) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Gagal menginisialisasi verifikasi.');
        }
      }
    };

    // Check if Cloudflare Turnstile script is already present
    const existingScript = document.getElementById('cloudflare-turnstile-script');

    if (window.turnstile) {
      renderWidget();
    } else if (existingScript) {
      existingScript.addEventListener('load', renderWidget);
    } else {
      const script = document.createElement('script');
      script.id = 'cloudflare-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      script.onerror = () => {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Gagal memuat Cloudflare Turnstile.');
        }
      };
      document.body.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore cleanup error
        }
      }
    };
  }, [siteKey, size]);

  const handleRetry = () => {
    setStatus('loading');
    setErrorMessage('');
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div
      style={{
        margin: '0.85rem 0',
        padding: '0.65rem 0.85rem',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: 'var(--surface-muted, #F8FAFC)',
        border: '1px solid var(--border-subtle, #E2E8F0)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '68px',
        ...style
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
        <ShieldCheck size={14} color="var(--emerald, #10B981)" />
        <span>Verifikasi Keamanan (Cloudflare Turnstile)</span>
      </div>

      <div ref={containerRef} style={{ minHeight: '48px', display: 'flex', justifyContent: 'center' }} />

      {status === 'loading' && (
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <RefreshCw size={12} className="spin" />
          <span>Menghubungkan ke Cloudflare Turnstile...</span>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
          <div style={{ fontSize: '0.76rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center' }}>
            <AlertCircle size={13} />
            <span>{errorMessage || 'Verifikasi keamanan tidak dapat dimuat.'}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            style={{
              marginTop: '0.35rem',
              fontSize: '0.72rem',
              color: 'var(--vermilion)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Muat Ulang Verifikasi
          </button>
        </div>
      )}
    </div>
  );
}
