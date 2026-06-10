'use client';

import type { PlayerBrowserItemDto, PlayerSortFieldDto } from '@draft-io/shared-types';
import {
  formatPositionFilterOption,
  PLAYER_POSITION_FILTER_OPTIONS,
  translateNationality,
} from '@draft-io/shared-utils';
import { useCallback, useEffect, useState } from 'react';

import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { FilterRowSkeleton } from '@/components/admin/admin-skeletons';
import { DataTable, type DataTableColumn } from '@/components/admin/data-table';
import { EntityImage } from '@/components/admin/entity-image';
import { OverallBadge } from '@/components/admin/overall-badge';
import { PlayerPositionsCell } from '@/components/admin/player-positions-cell';
import {
  listLeagues,
  listTeams,
  type LeagueSummaryDto,
  type TeamSummaryDto,
} from '@/lib/api/catalog';
import { browsePlayers } from '@/lib/api/players';
import { formatMarketValue } from '@/lib/format';

const SORTABLE_COLUMNS = new Set<string>(['name', 'age', 'marketValue', 'createdAt', 'updatedAt']);

const PLAYER_COLUMNS: DataTableColumn<PlayerBrowserItemDto>[] = [
  {
    id: 'name',
    header: 'İsim',
    sortable: true,
    cell: (p) => (
      <span className="admin-media-cell">
        <EntityImage src={p.imageUrl} alt={p.displayName} variant="player" />
        <strong>{p.displayName}</strong>
      </span>
    ),
  },
  {
    id: 'overall',
    header: 'Overall',
    align: 'center',
    cell: (p) => <OverallBadge overall={p.overall} />,
  },
  {
    id: 'position',
    header: 'Mevkiler',
    cell: (p) => <PlayerPositionsCell positions={p.positions} />,
  },
  { id: 'age', header: 'Yaş', sortable: true, align: 'center', cell: (p) => p.age ?? '—' },
  {
    id: 'nationality',
    header: 'Uyruk',
    cell: (p) => (
      <span className="admin-media-cell">
        <EntityImage src={p.nationalityFlagUrl} alt={p.nationality} variant="flag" />
        <span>{translateNationality(p.nationality)}</span>
      </span>
    ),
  },
  {
    id: 'club',
    header: 'Kulüp',
    cell: (p) => (
      <span className="admin-media-cell">
        <EntityImage src={p.teamLogoUrl} alt={p.teamName ?? 'Kulüp'} variant="team" />
        <span>{p.teamName ?? '—'}</span>
      </span>
    ),
  },
  {
    id: 'competition',
    header: 'Lig',
    cell: (p) => (
      <span className="admin-media-cell">
        <EntityImage src={p.leagueLogoUrl} alt={p.leagueName ?? 'Lig'} variant="league" />
        <span>{p.leagueName ?? '—'}</span>
      </span>
    ),
  },
  {
    id: 'marketValue',
    header: 'Piyasa değeri',
    sortable: true,
    align: 'right',
    cell: (p) => formatMarketValue(p.marketValue),
  },
];

export default function AdminPlayersPage(): React.ReactElement {
  const [players, setPlayers] = useState<readonly PlayerBrowserItemDto[]>([]);
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
  const [position, setPosition] = useState('');
  const [teamId, setTeamId] = useState('');
  const [leagueId, setLeagueId] = useState('');
  const [sortField, setSortField] = useState<PlayerSortFieldDto>('name');
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
      const result = await browsePlayers({
        ...(name.length > 0 ? { name } : {}),
        ...(teamId.length > 0 ? { teamId } : {}),
        ...(leagueId.length > 0 ? { leagueId } : {}),
        ...(position.length > 0 ? { position } : {}),
        hasMarketValue: true,
        sortField,
        sortDirection,
        page,
        pageSize: 25,
      });
      setPlayers(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Oyuncular yüklenemedi');
    } finally {
      setInitialLoading(false);
      setFetching(false);
    }
  }, [name, position, teamId, leagueId, sortField, sortDirection, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSort = useCallback(
    (field: string) => {
      if (!SORTABLE_COLUMNS.has(field)) {
        return;
      }

      if (sortField === field) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field as PlayerSortFieldDto);
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
        title="Oyuncular"
        description="Yalnızca piyasa değeri olan oyuncular. Eksik veriler için Veri Kalitesi sayfasını kullanın."
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
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
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
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </FilterField>
            <FilterField label="Mevki">
              <select
                className="admin-select"
                value={position}
                onChange={(e) => {
                  setPosition(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">Tüm mevkiler</option>
                {PLAYER_POSITION_FILTER_OPTIONS.map((option) => (
                  <option key={option.code} value={option.code}>
                    {formatPositionFilterOption(option)}
                  </option>
                ))}
              </select>
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
        columns={PLAYER_COLUMNS}
        data={players}
        rowKey={(p) => p.id}
        loading={initialLoading}
        fetching={fetching}
        emptyMessage="Filtrelere uyan oyuncu bulunamadı."
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
