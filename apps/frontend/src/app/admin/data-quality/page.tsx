'use client';

import type { DataQualityIssueDto, DataQualitySummaryDto } from '@draft-io/shared-types';
import { translateNationality } from '@draft-io/shared-utils';
import { useCallback, useEffect, useState } from 'react';

import {
  DataTableSkeleton,
  SectionTitleSkeleton,
  StatCardsSkeleton,
} from '@/components/admin/admin-skeletons';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { getDataQualitySummary, listDataQualityIssues } from '@/lib/api/data-quality';

const ISSUE_LABELS_TR: Readonly<Record<string, string>> = {
  MISSING_MARKET_VALUE: 'Piyasa değeri eksik',
  MISSING_POSITION: 'Mevki eksik',
  MISSING_AGE: 'Yaş eksik',
  MISSING_IMAGE: 'Fotoğraf eksik',
  MISSING_CLUB: 'Kulüp eksik',
  MISSING_COMPETITION: 'Lig eksik',
  DUPLICATE_PROVIDER_EXTERNAL_ID: 'Yinelenen harici kimlik',
  INVALID_MARKET_VALUE: 'Geçersiz piyasa değeri',
};

function formatIssueCodes(codes: readonly string[]): string {
  return codes.map((code) => ISSUE_LABELS_TR[code] ?? code).join(', ');
}

export default function DataQualityPage(): React.ReactElement {
  const [summary, setSummary] = useState<DataQualitySummaryDto | null>(null);
  const [issues, setIssues] = useState<readonly DataQualityIssueDto[]>([]);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const [summaryData, issuesData] = await Promise.all([
        getDataQualitySummary(),
        listDataQualityIssues({ page: 1, pageSize: 50 }),
      ]);
      setSummary(summaryData);
      setIssues(issuesData.data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri kalitesi yüklenemedi');
    } finally {
      setInitialLoading(false);
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const issueColumns: DataTableColumn<DataQualityIssueDto>[] = [
    { id: 'player', header: 'Oyuncu', cell: (i) => <strong>{i.displayName}</strong> },
    { id: 'issues', header: 'Sorunlar', cell: (i) => formatIssueCodes(i.issueCodes) },
  ];

  return (
    <>
      <AdminPageHeader
        title="Veri Kalitesi"
        description="Genel reyting veya kart üretiminden önce içe aktarılan veriyi inceleyin."
      />

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

      {initialLoading && summary === null ? (
        <>
          <StatCardsSkeleton count={9} />
          <section className="admin-section">
            <SectionTitleSkeleton />
            <DataTableSkeleton columns={2} rows={6} />
          </section>
          <section className="admin-section">
            <SectionTitleSkeleton />
            <DataTableSkeleton columns={2} rows={8} />
          </section>
          <section className="admin-section">
            <SectionTitleSkeleton />
            <DataTableSkeleton columns={2} rows={5} />
          </section>
        </>
      ) : summary ? (
        <>
          <div className="admin-card-grid">
            <Stat label="Toplam oyuncu" value={summary.totalPlayers} />
            <Stat label="Toplam kulüp" value={summary.totalClubs} />
            <Stat label="Lig sayısı" value={summary.totalCompetitions} />
            <Stat label="Piyasa değeri olan" value={summary.playersWithMarketValue} />
            <Stat label="Piyasa değeri olmayan" value={summary.playersWithoutMarketValue} />
            <Stat label="Fotoğrafı olan" value={summary.playersWithImage} />
            <Stat label="Fotoğrafı olmayan" value={summary.playersWithoutImage} />
            <Stat label="Mevkisi olan" value={summary.playersWithPosition} />
            <Stat label="Yaşı olan" value={summary.playersWithAge} />
          </div>

          <div className="admin-section">
            <h2 className="admin-section-title">Lige göre oyuncular</h2>
            <BreakdownTable
              rows={summary.playersByCompetition.map((r) => [r.leagueName, String(r.count)])}
            />
          </div>

          <div className="admin-section">
            <h2 className="admin-section-title">Uyruğa göre oyuncular</h2>
            <BreakdownTable
              rows={summary.playersByNationality.map((r) => [
                translateNationality(r.nationality),
                String(r.count),
              ])}
            />
          </div>

          <div className="admin-section">
            <h2 className="admin-section-title">Mevkiye göre oyuncular</h2>
            <BreakdownTable
              rows={summary.playersByPosition.map((r) => [r.position, String(r.count)])}
            />
          </div>

          <div className="admin-section">
            <h2 className="admin-section-title">Piyasa değeri dağılımı</h2>
            <BreakdownTable
              rows={summary.marketValueDistribution.map((r) => [r.bucket, String(r.count)])}
            />
          </div>

          <div className="admin-section">
            <h2 className="admin-section-title">Yaş dağılımı</h2>
            <BreakdownTable rows={summary.ageDistribution.map((r) => [r.bucket, String(r.count)])} />
          </div>
        </>
      ) : null}

      <div className="admin-section">
        <h2 className="admin-section-title">İşaretlenen sorunlar</h2>
        <DataTable
          columns={issueColumns}
          data={issues}
          rowKey={(i) => i.playerId}
          loading={initialLoading}
          fetching={fetching}
          skeletonRows={8}
          emptyMessage="Veri kalitesi sorunu bulunamadı."
        />
      </div>
    </>
  );
}

function Stat({ label, value }: { readonly label: string; readonly value: number }): React.ReactElement {
  return (
    <div className="admin-card admin-stat-card">
      <div className="admin-stat-card__label">{label}</div>
      <div className="admin-stat-card__value">{value.toLocaleString('tr-TR')}</div>
    </div>
  );
}

function BreakdownTable({ rows }: { readonly rows: readonly (readonly string[])[] }): React.ReactElement {
  const columns: DataTableColumn<{ key: string; label: string; count: string }>[] = [
    { id: 'label', header: 'Etiket', cell: (r) => r.label },
    { id: 'count', header: 'Adet', align: 'right', cell: (r) => r.count },
  ];

  const data = rows.map(([label, count]) => ({
    key: label ?? '',
    label: label ?? '—',
    count: count ?? '0',
  }));

  return (
    <DataTable
      columns={columns}
      data={data}
      rowKey={(r) => r.key}
      emptyMessage="Veri yok."
    />
  );
}
