import type { ReactNode } from 'react';

import { AdminSidebar } from '@/components/admin/admin-sidebar';

import './admin.css';

export default function AdminLayout({
  children,
}: {
  readonly children: ReactNode;
}): React.ReactElement {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-content">{children}</div>
    </div>
  );
}
