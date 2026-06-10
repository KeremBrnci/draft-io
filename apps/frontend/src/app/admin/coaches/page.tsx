'use client';

import type { CoachBrowserItemDto, CoachSortFieldDto } from '@draft-io/shared-types';
import { translateCoachRole, translateNationality } from '@draft-io/shared-utils';
import { useCallback, useEffect, useState } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { FilterRowSkeleton } from '@/components/admin/admin-skeletons';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { EntityImage } from '@/components/admin/entity-image';
import { listLeagues, listTeams, type LeagueSummaryDto, type TeamSummaryDto } from '@/lib/api/catalog';
import { browseCoaches } from '@/lib/api/coaches';

const SORTABLE_COLUMNS = new Set<string>(['name', 'age', 'appointedDate', 'createdAt', 'updatedAt']);

const COACH_COLUMNS: DataTableColumn<CoachBrowserItemDto>[] = [
  {
    id: 'name',
    header: 'İsim',
    sortable: true,
    cell: (coach) => (
      <span className="admin-media-cell">
        <EntityImage src={coach.imageUrl} alt={coach.displayName} variant="player" />
        <strong>{coach.displayName}</strong>
      </span>
    ),
  },
  {
    id: 'role',
    header: 'Görev',
    cell: (coach) => translateCoachRole(coach.role),
  },
  {
    id: 'age',
    header: 'Yaş',
    sortable: true,
    align: 'center',
    cell: (coach) => coach.age ?? '—',
  },
  {
    id: 'nationality',
    header: 'Uyruk',
    cell: (coach) => (
      <span className="admin-media-cell">
        <EntityImage src={coach.nationalityFlagUrl} alt={coach.nationality} variant="flag" />
        <span>{translateNationality(coach.nationality)}</span>
      </span>
    ),
  },
  {
    id: 'club',
    header: 'Kulüp',
    cell: (coach) => (
      <span className="admin-media-cell">
        <EntityImage src={coach.teamLogoUrl} alt={coach.teamName ?? 'Kulüp'} variant="team" />
        <span>{coach.teamName ?? '—'}</span>
      </span>
    ),
  },
  {
    id: 'competition',
    header: 'Lig',
    cell: (coach) => (
      <span className="admin-media-cell">
        <EntityImage src={coach.leagueLogoUrl} alt={coach.leagueName ?? 'Lig'} variant="league" />
        <span>{coach.leagueName ?? '—'}</span>
      </span>
    ),
  },
  {
    id: 'appointedDate',
    header: 'Göreve başlama',
    sortable: true,
    cell: (coach) => formatDate(coach.appointedDate),
  },
  {
    id: 'contractExpires',
    header: 'Sözleşme bitiş',
    cell: (coach) => formatDate(coach.contractExpires),
  },
];

export default function AdminCoachesPage(): React.ReactElement {
  const [coaches, setCoaches] = useState<readonly CoachBrowserItemDto[]>([]);
  const [teams, setTeams] = useState<readonly TeamSummaryDto[]>([]);
  const [leagues, setLeagues] = useState<readonly LeagueSummaryDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [sortField, setSortField] = useState<CoachSortFieldDto>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    void listLeagues()
      .then((leagueData) => {
        setLeagues(leagueData);
      })
      .catch(() => undefined)
      .finally(() => {
        setCatalogLoading(false);
      });
  }, []);

  useEffect(() => {
    setTeamsLoading(true);
    void listTeams(leagueId.length > 0 ? leagueId : undefined)
      .then((teamData) => {
        setTeams(teamData);
      })
      .catch(() => {
        setTeams([]);
      })
      .finally(() => {
        setTeamsLoading(false);
      });
  }, [leagueId]);

  const load = useCallback(async () => {
    setFetching(true);
    setError('');
    try {
      const result = await browseCoaches({
        ...(name.length > 0 ? { name } : {}),
        ...(teamId.length > 0 ? { teamId } : {}),
        ...(leagueId.length > 0 ? { leagueId } : {}),
        sortField,
        sortDirection,
        page,
        pageSize: 25,
      });
      setCoaches(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Teknik direktörler yüklenemedi');
    } finally {
      setInitialLoading(false);
      setFetching(false);
    }
  }, [name, teamId, leagueId, sortField, sortDirection, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSort = useCallback(
    (field: string) => {
      if (!SORTABLE_COLUMNS.has(field)) {
        return;
      }

      if (sortField === field) {
        setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field as CoachSortFieldDto);
        setSortDirection('asc');
      }
      setPage(1);
    },
    [sortField],
  );

  const handleLeagueChange = useCallback((nextLeagueId: string) => {
    setLeagueId(nextLeagueId);
    setTeamId('');
    setPage(1);
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Teknik Direktörler"
        description="Kulüplerin güncel teknik direktörleri Transfermarkt kadro ekibi sayfalarından içe aktarılır."
      />

      {error ? <div className="admin-alert admin-alert--error">{error}</div> : null}

      {catalogLoading ? (
        <FilterRowSkeleton />
      ) : (
        <div className="admin-card" style={{ marginBottom: '1rem', padding: '0.85rem 1rem' }}>
          <div className="admin-filter-row">
            <FilterField label="Lig">
              <div className="admin-select-with-icon">
                <EntityImage
                  src={leagues.find((league) => league.id === leagueId)?.logoUrl}
                  alt=""
                  variant="league"
                />
                <select
                  className="admin-select"
                  value={leagueId}
                  onChange={(e) => {
                    handleLeagueChange(e.target.value);
                  }}
                >
                  <option value="">Tüm ligler</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>{league.name}</option>
                  ))}
                </select>
              </div>
            </FilterField>
            <FilterField label="Kulüp">
              <div className="admin-select-with-icon">
                <EntityImage
                  src={teams.find((team) => team.id === teamId)?.logoUrl}
                  alt=""
                  variant="team"
                />
                <select
                  className="admin-select"
                  value={teamId}
                  disabled={teamsLoading || (leagueId.length > 0 && teams.length === 0)}
                  onChange={(e) => {
                    setTeamId(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">
                    {teamsLoading
                      ? 'Kulüpler yükleniyor…'
                      : leagueId.length > 0
                        ? 'Tüm kulüpler (lig)'
                        : 'Tüm kulüpler'}
                  </option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </FilterField>
            <FilterField label="İsim" className="admin-filter-row__grow">
              <input
                className="admin-input"
                placeholder="İsim ara…"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setPage(1);
                }}
              />
            </FilterField>
          </div>
        </div>
      )}

      <DataTable
        columns={COACH_COLUMNS}
        data={coaches}
        rowKey={(coach) => coach.id}
        loading={initialLoading}
        fetching={fetching}
        emptyMessage="Filtrelere uyan teknik direktör bulunamadı."
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        skeletonRows={10}
        pagination={{
          page,
          totalPages,
          totalItems,
          fetching,
          onPageChange: setPage,
        }}
      />
    </>
  );
}

function formatDate(value: string | null): string {
  if (value === null) {
    return '—';
  }

  const [year, month, day] = value.split('-');
  if (year === undefined || month === undefined || day === undefined) {
    return value;
  }

  return `${day}.${month}.${year}`;
}

function FilterField({
  label,
  className,
  children,
}: {
  readonly label: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <label className={className}>
      <span className="admin-filter-label">{label}</span>
      {children}
    </label>
  );
}
