import type { DraftBoardStateDto, DraftSlotStateDto } from '@draft-io/shared-types';
import { memo, useCallback } from 'react';

import { DraftEmptyCard } from './draft-empty-card';
import { mapCardTypeToVariant } from './map-card-type-to-variant';
import { mapDraftCardFace } from './map-draft-card-face';

import { FootballCard } from '@/components/cards/football-card';
import { formatCardNameCompactLabel } from '@/components/cards/format-card-name';



interface DraftPitchBoardProps {
  readonly board: DraftBoardStateDto;
  readonly activeSlotIndex: number | null;
  readonly onSelectSlot: (slotIndex: number) => void;
}

export const DraftPitchBoard = memo(function DraftPitchBoard({
  board,
  activeSlotIndex,
  onSelectSlot,
}: DraftPitchBoardProps): React.ReactElement {
  const isSelectionLocked = activeSlotIndex !== null;

  return (
    <div className="draft-pitch-board" aria-label={`${board.formation.code} dizilişi`}>
      <div className="draft-pitch-board__grass" />
      <div className="draft-pitch-board__line draft-pitch-board__line--half" />
      <div className="draft-pitch-board__line draft-pitch-board__line--box" />
      <div className="draft-pitch-board__formation-tag">{board.formation.code}</div>

      {board.slots.map((slot) => (
        <DraftPitchSlot
          key={slot.slotIndex}
          slot={slot}
          isActive={activeSlotIndex === slot.slotIndex}
          isNext={board.nextSlotIndex === slot.slotIndex}
          locked={isSelectionLocked && activeSlotIndex !== slot.slotIndex && slot.card === null}
          onSelectSlot={onSelectSlot}
        />
      ))}
    </div>
  );
});

const DraftPitchSlot = memo(function DraftPitchSlot({
  slot,
  isActive,
  isNext,
  locked,
  onSelectSlot,
}: {
  readonly slot: DraftSlotStateDto;
  readonly isActive: boolean;
  readonly isNext: boolean;
  readonly locked: boolean;
  readonly onSelectSlot: (slotIndex: number) => void;
}): React.ReactElement {
  const handleSelect = useCallback(() => {
    if (slot.card !== null || locked) {
      return;
    }
    onSelectSlot(slot.slotIndex);
  }, [locked, onSelectSlot, slot.card, slot.slotIndex]);

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
          <DraftEmptyCard label={slot.label} active={isActive || isNext} onClick={handleSelect} />
        )
      ) : (
        <div className="draft-pitch-slot__filled">
          <FootballCard
            face={mapDraftCardFace(slot.card)}
            variant={mapCardTypeToVariant(slot.card.cardTypeCode)}
            size="md"
            visual="interactive"
            className="draft-pitch-slot__card"
          />
          <span className="draft-pitch-slot__label" title={slot.card.displayName}>
            {formatCardNameCompactLabel(slot.card.displayName)}
          </span>
        </div>
      )}
    </div>
  );
});
