import React, { useState } from 'react';
import { ChevronDown, CircleHelp } from 'lucide-react';

export default function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;

        return (
          <div
            key={item.id || idx}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid',
              borderColor: isOpen ? 'var(--vermilion-border)' : 'var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              boxShadow: isOpen ? 'var(--shadow-subtle)' : 'none'
            }}
          >
            <button
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 1.5rem',
                textAlign: 'left',
                backgroundColor: isOpen ? 'var(--vermilion-subtle)' : 'transparent',
                transition: 'background-color 0.2s ease',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <CircleHelp
                  size={20}
                  color={isOpen ? 'var(--vermilion)' : 'var(--text-secondary)'}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: isOpen ? 'var(--vermilion)' : 'var(--text-primary)',
                    lineHeight: 1.4
                  }}
                >
                  {item.question}
                </span>
              </div>

              <div
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s ease',
                  color: isOpen ? 'var(--vermilion)' : 'var(--text-secondary)',
                  flexShrink: 0
                }}
              >
                <ChevronDown size={18} />
              </div>
            </button>

            {isOpen && (
              <div
                style={{
                  padding: '1.25rem 1.5rem 1.5rem 3.5rem',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid var(--vermilion-border)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
