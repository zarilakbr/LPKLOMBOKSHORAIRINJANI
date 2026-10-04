import React from 'react';
import { Radio, Wifi, WifiOff } from 'lucide-react';
import { useRealtime, ConnectionStatus } from '../../context/RealtimeContext';

export default function RealtimeStatusBadge({ showLabel = true, className = '' }) {
  const { status } = useRealtime();

  let color = 'var(--text-muted, #64748B)';
  let bg = 'rgba(100, 116, 139, 0.1)';
  let border = 'rgba(100, 116, 139, 0.2)';
  let label = 'Realtime terputus';
  let Icon = WifiOff;

  if (status === ConnectionStatus.CONNECTED) {
    color = '#10B981'; // Emerald Green
    bg = 'rgba(16, 185, 129, 0.1)';
    border = 'rgba(16, 185, 129, 0.25)';
    label = 'Realtime aktif';
    Icon = Radio;
  } else if (status === ConnectionStatus.CONNECTING) {
    color = '#F59E0B'; // Amber
    bg = 'rgba(245, 158, 11, 0.1)';
    border = 'rgba(245, 158, 11, 0.25)';
    label = 'Menghubungkan realtime...';
    Icon = Wifi;
  } else if (status === ConnectionStatus.FALLBACK) {
    color = '#3B82F6'; // Blue
    bg = 'rgba(59, 130, 246, 0.1)';
    border = 'rgba(59, 130, 246, 0.25)';
    label = 'Realtime fallback';
    Icon = Radio;
  } else if (status === ConnectionStatus.ERROR) {
    color = '#EF4444'; // Red
    bg = 'rgba(239, 68, 68, 0.1)';
    border = 'rgba(239, 68, 68, 0.25)';
    label = 'Realtime bermasalah';
    Icon = WifiOff;
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        fontSize: '0.72rem',
        fontWeight: 700,
        color: color,
        letterSpacing: '0.02em',
        transition: 'all 0.3s ease'
      }}
      title={`Status Koneksi Realtime: ${label}`}
    >
      <span
        style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          boxShadow: status === ConnectionStatus.CONNECTED ? `0 0 6px ${color}` : 'none',
          animation: status === ConnectionStatus.CONNECTED ? 'pulse 2s infinite' : 'none'
        }}
      />
      {showLabel && <span>{label}</span>}
    </div>
  );
}
