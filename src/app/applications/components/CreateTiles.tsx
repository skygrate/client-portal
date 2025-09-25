"use client";

import { useTranslation } from 'react-i18next';


type Type = 'STATIC' | 'WORDPRESS';

export function CreateTiles({ onSelect }: { onSelect: (t: Type) => void }) {
  const { t } = useTranslation();
  return (
    <div className="mb-4 grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSelect('STATIC')}
        className="rounded-2xl border p-4 shadow-sm bg-white text-left hover:bg-gray-50"
      >
        <div className="text-lg font-semibold">{t('application_types.static_www')}</div>
        <div className="text-sm text-gray-600">{t('application_types.static_www_description')}</div>
      </button>
      <button
        type="button"
        onClick={() => onSelect('WORDPRESS')}
        className="rounded-2xl border p-4 shadow-sm bg-white text-left hover:bg-gray-50"
      >
        <div className="text-lg font-semibold">{t('application_types.wordpress')}</div>
        <div className="text-sm text-gray-600">{t('application_types.wordpress_description')}</div>
      </button>
    </div>
  );
}

