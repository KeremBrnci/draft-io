# Player Positions Migration Plan

**Status:** Proposed — do not run automatically.

## Goal

Replace denormalized columns on `players`:

- `primary_position`
- `secondary_positions` (text array)

With normalized table `player_positions`.

## Target schema

```sql
CREATE TABLE player_positions (
  id UUID PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  position_code VARCHAR(10) NOT NULL,
  is_primary BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, position_code)
);

CREATE INDEX player_positions_player_id_idx ON player_positions (player_id);
CREATE INDEX player_positions_position_code_idx ON player_positions (position_code);
CREATE INDEX player_positions_is_primary_idx ON player_positions (is_primary);

-- Exactly one primary position per player
CREATE UNIQUE INDEX player_positions_one_primary_per_player
  ON player_positions (player_id)
  WHERE is_primary = true;
```

## Migration steps

1. Deploy schema with `player_positions` table **without** dropping legacy columns (optional dual-write phase).
2. Backfill:

```sql
INSERT INTO player_positions (id, player_id, position_code, is_primary, created_at)
SELECT gen_random_uuid(), id, primary_position, true, created_at
FROM players
WHERE primary_position IS NOT NULL
  AND primary_position NOT IN ('', 'UNK', 'UNKNOWN');

INSERT INTO player_positions (id, player_id, position_code, is_primary, created_at)
SELECT gen_random_uuid(), p.id, unnest(p.secondary_positions), false, p.created_at
FROM players p
WHERE cardinality(p.secondary_positions) > 0
ON CONFLICT (player_id, position_code) DO NOTHING;
```

3. Verify counts:

```sql
-- Every player should have exactly one primary row after backfill
SELECT player_id, COUNT(*) FILTER (WHERE is_primary) AS primary_count
FROM player_positions
GROUP BY player_id
HAVING COUNT(*) FILTER (WHERE is_primary) <> 1;
```

4. Deploy application code that reads/writes `player_positions` only.
5. Drop legacy columns:

```sql
ALTER TABLE players DROP COLUMN primary_position;
ALTER TABLE players DROP COLUMN secondary_positions;
```

## Rollback

Keep legacy columns until step 5 passes production validation. Rollback = redeploy previous app + ignore `player_positions`.

## Risks

- Players with invalid `primary_position` need manual cleanup before backfill.
- Duplicate secondary codes in array are deduplicated by `ON CONFLICT`.
- Partial unique index requires PostgreSQL (supported by Neon/local Postgres).
