import React, { useEffect, useRef } from 'react';
import { useRealtime, ConnectionStatus } from '../../context/RealtimeContext';

export default function RealtimeStatusBadge({ showLabel = true, className = '' }) {
  const { status } = useRealtime();
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    if (status === ConnectionStatus.CONNECTED || status === ConnectionStatus.FALLBACK) {
      hasConnectedRef.current = true;
    }
  }, [status]);

  let color = 'var(--text-muted, #64748B)';
  let bg = 'rgba(100, 116, 139, 0.1)';
  let border = 'rgba(100, 116, 139, 0.2)';
  let label = 'Disconnected';

  if (status === ConnectionStatus.CONNECTED) {
    color = '#10B981'; // Emerald Green
    bg = 'rgba(16, 185, 129, 0.1)';
    border = 'rgba(16, 185, 129, 0.25)';
    label = 'Active';
  } else if (status === ConnectionStatus.CONNECTING) {
    color = '#F59E0B'; // Amber
    bg = 'rgba(245, 158, 11, 0.1)';
    border = 'rgba(245, 158, 11, 0.25)';
    label = hasConnectedRef.current ? 'Reconnecting' : 'Pending';
  } else if (status === ConnectionStatus.FALLBACK) {
    color = '#10B981'; // Active via fallback
    bg = 'rgba(16, 185, 129, 0.1)';
    border = 'rgba(16, 185, 129, 0.25)';
    label = 'Active';
  } else if (status === ConnectionStatus.ERROR) {
    color = '#EF4444'; // Red
    bg = 'rgba(239, 68, 68, 0.1)';
    border = 'rgba(239, 68, 68, 0.25)';
    label = 'Disconnected';
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
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
      title={`Status: ${label}`}
    >
      {showLabel && <span>{label}</span>}
    </div>
  );
}
