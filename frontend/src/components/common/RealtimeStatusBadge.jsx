import React, { useEffect, useRef } from 'react';
import { useRealtime, ConnectionStatus } from '../../context/RealtimeContext';

// Module-level persistent flag across component unmount/remount in the SPA session
let hasEverConnectedSession = false;

export default function RealtimeStatusBadge({ showLabel = true, className = '' }) {
  const { status, isConnected } = useRealtime();
  const hasConnectedRef = useRef(hasEverConnectedSession);

  // Reset session flag if user is logged out / has no auth token
  if (typeof window !== 'undefined' && !window.localStorage?.getItem('lpk_auth_token')) {
    hasEverConnectedSession = false;
    hasConnectedRef.current = false;
  }

  // Normalize status string to handle any casing variations safely
  const rawStatus = (status || '').toString().trim().toUpperCase();

  // Internal connection is Active if either:
  // 1. isConnected is true
  // 2. status matches ConnectionStatus.CONNECTED (or 'CONNECTED')
  // 3. status matches ConnectionStatus.FALLBACK (or 'FALLBACK')
  const isCurrentlyActive = Boolean(
    isConnected ||
    rawStatus === 'CONNECTED' ||
    rawStatus === 'FALLBACK' ||
    status === ConnectionStatus?.CONNECTED ||
    status === ConnectionStatus?.FALLBACK
  );

  // Synchronously capture connection success so the current render and subsequent renders reflect it
  if (isCurrentlyActive) {
    hasEverConnectedSession = true;
    hasConnectedRef.current = true;
  }

  // Also maintain in useEffect for React lifecycle consistency
  useEffect(() => {
    if (isCurrentlyActive) {
      hasEverConnectedSession = true;
      hasConnectedRef.current = true;
    }
  }, [isCurrentlyActive]);

  const hasEverConnected = hasEverConnectedSession || hasConnectedRef.current;

  // Determine badge visual state & labels strictly per requirements
  let color = 'var(--text-muted, #64748B)';
  let bg = 'rgba(100, 116, 139, 0.1)';
  let border = 'rgba(100, 116, 139, 0.2)';
  let label = 'Disconnected';

  if (isCurrentlyActive) {
    color = '#10B981'; // Emerald Green
    bg = 'rgba(16, 185, 129, 0.1)';
    border = 'rgba(16, 185, 129, 0.25)';
    label = 'Active';
  } else if (rawStatus === 'CONNECTING' || status === ConnectionStatus?.CONNECTING) {
    color = '#F59E0B'; // Amber
    bg = 'rgba(245, 158, 11, 0.1)';
    border = 'rgba(245, 158, 11, 0.25)';
    label = hasEverConnected ? 'Reconnecting' : 'Pending';
  } else if (rawStatus === 'ERROR' || status === ConnectionStatus?.ERROR) {
    color = '#EF4444'; // Red
    bg = 'rgba(239, 68, 68, 0.1)';
    border = 'rgba(239, 68, 68, 0.25)';
    label = 'Disconnected';
  } else {
    // DISCONNECTED or default uninitialized state
    color = 'var(--text-muted, #64748B)';
    bg = 'rgba(100, 116, 139, 0.1)';
    border = 'rgba(100, 116, 139, 0.2)';
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
