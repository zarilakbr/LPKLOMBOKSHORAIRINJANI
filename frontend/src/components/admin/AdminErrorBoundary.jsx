import React from 'react';
import { AlertTriangle, RotateCcw, LayoutDashboard } from 'lucide-react';

export class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AdminErrorBoundary caught an unhandled render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoDashboard = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/admin/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md, 12px)',
            border: '1px solid var(--border-subtle, #E2E8F0)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            margin: '1.5rem'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--vermilion, #C53030)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <AlertTriangle size={28} />
          </div>

          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-on-light, #0F172A)',
              marginBottom: '0.5rem'
            }}
          >
            Halaman tidak dapat dimuat
          </h2>

          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-on-light-muted, #64748B)',
              maxWidth: '480px',
              lineHeight: 1.5,
              marginBottom: '1.75rem'
            }}
          >
            Terjadi kesalahan saat memproses data pada tampilan ini. Menu navigasi dan sistem lainnya tetap berjalan normal.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={this.handleReset}
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={15} />
              <span>Coba Lagi</span>
            </button>

            <button
              type="button"
              onClick={this.handleGoDashboard}
              className="btn btn-primary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer'
              }}
            >
              <LayoutDashboard size={15} />
              <span>Dashboard Admin</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
