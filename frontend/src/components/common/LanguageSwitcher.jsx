import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage, LANGUAGES } from '../../context/LanguageContext';

export default function LanguageSwitcher({ className = '', style = {}, dropUp = false }) {
  const { language, setLanguage, currentLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`lang-switcher-wrap ${className}`} ref={dropdownRef} style={{ position: 'relative', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lang-switcher-btn"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Pilih Bahasa (Saat ini: ${currentLang.name})`}
        title={`Bahasa: ${currentLang.name}`}
      >
        <Globe size={15} strokeWidth={2} className="lang-icon" />
        <span className="lang-code">{currentLang.label}</span>
        <ChevronDown
          size={13}
          strokeWidth={2}
          className={`lang-chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`lang-dropdown-menu ${dropUp ? 'drop-up' : ''}`}
          role="listbox"
        >
          {LANGUAGES.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(item.code)}
                className={`lang-option-btn ${isSelected ? 'active' : ''}`}
              >
                <div className="lang-option-text">
                  <span className="lang-badge">{item.label}</span>
                  <span className="lang-name">{item.native}</span>
                </div>
                {isSelected && <Check size={14} className="lang-check" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
