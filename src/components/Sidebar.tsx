'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const menuItems = [
  { href: '/settings', labelKey: 'sidebar.account_settings_label' },
  { href: '/payment',  labelKey: 'sidebar.account_payments_label' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="h-full w-full bg-cover bg-top text-white p-6" style={{ backgroundImage: "url('/logo_sidebar.png')" }}>
      <h2 className="mt-[30vh] text-m font-semibold uppercase mb-4">{t('sidebar.account_label')}</h2>
      <ul className="space-y-2">
        {menuItems.map(({ href, labelKey }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link href={href} className={`block px-2 py-1 rounded ${isActive ? 'bg-gray-700 font-bold' : 'hover:bg-gray-700'}`}>{t(labelKey)}</Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}