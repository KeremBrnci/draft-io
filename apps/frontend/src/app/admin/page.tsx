'use client';

import type { AdminDashboardMetricsDto } from '@draft-io/shared-types';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { StatCardsSkeleton } from '@/components/admin/admin-skeletons';
import { getDashboardMetrics } from '@/lib/api/dashboard';

const QUICK_LINKS = [
  {
    href: '/admin/players',
    title: 'Oyuncular',
    description: 'Piyasa değeri olan oyuncuları filtreleyerek inceleyin.',
  },
  {
    href: '/admin/data-quality',
    title: 'Veri Kalitesi',
    description: 'Eksik verileri ve dağılımları gözden geçirin.',
  },
] as const;

export default function AdminDashboardPage(): React.ReactElement {
  const [metrics, setMetrics] = useState<AdminDashboardMetricsDto | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Metrikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <AdminPageHeader
        title="Panel"
        description="İçe aktarılan futbol verisine genel bakış ve yönetim araçlarına hızlı erişim."
      />

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

      <section className="admin-section">
        <h2 className="admin-section-title">Hızlı erişim</h2>
        <div className="admin-quick-links">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="admin-quick-link">
              <div className="admin-quick-link__title">{link.title}</div>
              <div className="admin-quick-link__desc">{link.description}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <div className="admin-dashboard-toolbar">
          <h2 className="admin-section-title" style={{ marginBottom: 0 }}>
            Veritabanı metrikleri
          </h2>
          <button type="button" className="admin-btn admin-btn--sm" disabled={loading} onClick={() => { void load(); }}>
            Yenile
          </button>
        </div>

        {loading && metrics === null ? (
          <div style={{ marginTop: '0.75rem' }}>
            <StatCardsSkeleton count={5} />
          </div>
        ) : (
          <div className="admin-card-grid" style={{ marginTop: '0.75rem' }}>
            <StatCard label="Oyuncular" value={metrics?.totalPlayers} />
            <StatCard label="Kulüpler" value={metrics?.totalClubs} />
            <StatCard label="Ligler" value={metrics?.totalCompetitions} />
            <StatCard label="Bugün içe aktarılan" value={metrics?.importedToday} accent />
            <StatCard
              label="Başarısız içe aktarım"
              value={metrics?.failedImports}
              warn={metrics?.failedImports !== undefined && metrics.failedImports > 0}
            />
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  accent = false,
  warn = false,
}: {
  readonly label: string;
  readonly value: number | undefined;
  readonly accent?: boolean;
  readonly warn?: boolean;
}): React.ReactElement {
  const borderColor = warn ? 'var(--danger)' : accent ? 'var(--accent)' : 'var(--border)';

  return (
    <div className="admin-card admin-stat-card" style={{ borderTopColor: borderColor }}>
      <div className="admin-stat-card__label">{label}</div>
      <div className="admin-stat-card__value">
        {value === undefined ? '—' : value.toLocaleString('tr-TR')}
      </div>
    </div>
  );
}
