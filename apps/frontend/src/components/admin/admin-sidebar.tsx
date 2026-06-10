'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Panel', exact: true },
  { href: '/admin/players', label: 'Oyuncular', exact: false },
  { href: '/admin/coaches', label: 'Teknik Direktörler', exact: false },
  { href: '/admin/cards', label: 'Kart Şablonu', exact: false },
  { href: '/admin/data-quality', label: 'Veri Kalitesi', exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-title">draft.io</div>
        <div className="admin-sidebar__brand-sub">Yönetim Paneli</div>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-sidebar__link${isActive(pathname, item.href, item.exact) ? ' admin-sidebar__link--active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <Link
          href="/"
          className="admin-sidebar__link"
          style={{ padding: '0.4rem 0', fontSize: '0.75rem' }}
        >
          ← Back to home
        </Link>
      </div>
    </aside>
  );
}
