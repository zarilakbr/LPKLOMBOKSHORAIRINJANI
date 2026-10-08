import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { settingsService } from '../../services/dataService';
import { BRAND } from '../../config/brand';

/**
 * FloatingWhatsAppButton
 *
 * Official interactive WhatsApp floating button across public pages.
 * Directly links visitors to the official LPK consultation hotline (+81 80-7507-9228).
 */
export default function FloatingWhatsAppButton() {
  const [whatsappUrl, setWhatsappUrl] = useState(
    BRAND.whatsappUrl ||
    'https://wa.me/818075079228?text=Halo%20Admin%20LPK%20Lombok%20Shorai%20Rinjani,%20saya%20ingin%20berkonsultasi%20mengenai%20program%20pelatihan%20dan%20karier%20ke%20Jepang.'
  );
  const [phoneNumber, setPhoneNumber] = useState(BRAND.whatsapp || '+81 80-7507-9228');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    settingsService.getPublicSettings()
      .then((data) => {
        if (data) {
          if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
          if (data.whatsapp) setPhoneNumber(data.whatsapp);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem'
      }}
    >
      {/* Interactive Tooltip Badge */}
      {isHovered && (
        <div
          style={{
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '0.45rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.78rem',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          Konsultasi WhatsApp ({phoneNumber})
        </div>
      )}

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Hubungi Admin LPK via WhatsApp"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(37, 211, 102, 0.45), 0 2px 6px rgba(0,0,0,0.15)',
          textDecoration: 'none',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          cursor: 'pointer'
        }}
      >
        <MessageCircle size={30} fill="#FFFFFF" color="#25D366" />
      </a>
    </div>
  );
}
