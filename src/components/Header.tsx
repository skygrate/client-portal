'use client';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const languages = [
  { code: 'en', label: 'English', flag: '/flags/en.png' },
  { code: 'pl', label: 'Polski',  flag: '/flags/pl.png' },
];

export default function Header() {
  const { user, signOut } = useAuthenticator();
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user?.signInDetails?.loginId || user.username;
  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <header className="w-full bg-white border-b p-4 shadow-sm">
      <div className="flex items-center">
        <div className="flex items-center ml-auto gap-4">
          <span>{t('header.welcome')}, {displayName}</span>

          {/* Language Selector */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-100">
              <Image src={currentLang.flag} alt={currentLang.label} width={20} height={16} className="object-cover w-5 h-4" />
              <span className="text-sm">{currentLang.code.toUpperCase()}</span>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow z-50">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
                    className={`w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-gray-100 ${i18n.language === lang.code ? 'font-semibold' : ''}`}
                  >
                    <Image src={lang.flag} alt={lang.label} width={20} height={16} className="object-cover w-5 h-4" />
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={signOut} className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300">
            {t('header.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
