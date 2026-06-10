import type { DraftBoardStateDto, DraftSlotStateDto } from '@draft-io/shared-types';

import { FootballCard } from '@/components/cards/football-card';

import { DraftEmptyCard } from './draft-empty-card';
import { mapCardTypeToVariant } from './map-card-type-to-variant';

interface DraftPitchBoardProps {
  readonly board: DraftBoardStateDto;
  readonly activeSlotIndex: number | null;
  readonly onSelectSlot: (slotIndex: number) => void;
}

export function DraftPitchBoard({
  board,
  activeSlotIndex,
  onSelectSlot,
}: DraftPitchBoardProps): React.ReactElement {
  return (
    <div className="draft-pitch-board" aria-label={`${board.formation.code} dizilişi`}>
      <div className="draft-pitch-board__grass" />
      <div className="draft-pitch-board__line draft-pitch-board__line--half" />
      <div className="draft-pitch-board__line draft-pitch-board__line--box" />
      <div className="draft-pitch-board__formation-tag">{board.formation.code}</div>

      {board.slots.map((slot) => {
        const isSelectionLocked = activeSlotIndex !== null;
        const isLockedSlot =
          isSelectionLocked && activeSlotIndex !== slot.slotIndex && slot.card === null;

        return (
          <DraftPitchSlot
            key={slot.slotIndex}
            slot={slot}
            isActive={activeSlotIndex === slot.slotIndex}
            isNext={board.nextSlotIndex === slot.slotIndex}
            locked={isLockedSlot}
            onSelect={() => {
              if (slot.card !== null || isLockedSlot) {
                return;
              }
              onSelectSlot(slot.slotIndex);
            }}
          />
        );
      })}
    </div>
  );
}

function DraftPitchSlot({
  slot,
  isActive,
  isNext,
  locked,
  onSelect,
}: {
  readonly slot: DraftSlotStateDto;
  readonly isActive: boolean;
  readonly isNext: boolean;
  readonly locked: boolean;
  readonly onSelect: () => void;
}): React.ReactElement {
  const style = {
    left: `${slot.pitchX}%`,
    top: `${slot.pitchY}%`,
  };

  return (
    <div
      className={`draft-pitch-slot${isActive ? ' draft-pitch-slot--active' : ''}${isNext ? ' draft-pitch-slot--next' : ''}`}
      style={style}
    >
      {slot.card === null ? (
        locked ? (
          <DraftEmptyCard label={slot.label} active={isActive || isNext} locked />
        ) : (
          <DraftEmptyCard label={slot.label} active={isActive || isNext} onClick={onSelect} />
        )
      ) : (
        <FootballCard
          face={{
            displayName: slot.card.displayName,
            imageUrl: slot.card.imageUrl,
            rating: slot.card.rating,
            subtitle: slot.card.subtitle,
            nationalityFlagUrl: slot.card.nationalityFlagUrl,
            ...(slot.card.nationalityLabel !== undefined
              ? { nationalityLabel: slot.card.nationalityLabel }
              : {}),
            leagueName: slot.card.leagueName,
            leagueLogoUrl: slot.card.leagueLogoUrl,
          }}
          variant={mapCardTypeToVariant(slot.card.cardTypeCode)}
          size="md"
          className="draft-pitch-slot__card fc-card--pitch"
        />
      )}
    </div>
  );
}
