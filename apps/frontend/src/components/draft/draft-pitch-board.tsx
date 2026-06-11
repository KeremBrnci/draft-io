import type { DraftBoardStateDto, DraftSlotStateDto } from '@draft-io/shared-types';
import { canSwapDraftSlots } from '@draft-io/shared-utils';
import { memo, useCallback, useMemo, useState } from 'react';

import { DraftEmptyCard } from './draft-empty-card';
import { DraftPlayerChemistryBadge } from './draft-player-chemistry-badge';
import { mapCardTypeToVariant } from './map-card-type-to-variant';
import { mapDraftCardFace } from './map-draft-card-face';

import { FootballCard } from '@/components/cards/football-card';
import { mapDraftPitchDisplayX, mapDraftPitchDisplayY } from '@/lib/map-pitch-display-percent';

interface DraftPitchBoardProps {
  readonly board: DraftBoardStateDto;
  readonly activeSlotIndex: number | null;
  readonly onSelectSlot: (slotIndex: number) => void;
  readonly reorderable?: boolean;
  readonly swappingSlotIndex?: number | null;
  readonly onSwapSlots?: (fromSlotIndex: number, toSlotIndex: number) => void;
}

export const DraftPitchBoard = memo(function DraftPitchBoard({
  board,
  activeSlotIndex,
  onSelectSlot,
  reorderable = false,
  swappingSlotIndex = null,
  onSwapSlots,
}: DraftPitchBoardProps): React.ReactElement {
  const isSelectionLocked = activeSlotIndex !== null;
  const [dragSourceSlotIndex, setDragSourceSlotIndex] = useState<number | null>(null);

  const slotByIndex = useMemo(
    () => new Map(board.slots.map((slot) => [slot.slotIndex, slot])),
    [board.slots],
  );

  const resolveSwapTarget = useCallback(
    (sourceSlotIndex: number, targetSlotIndex: number): boolean => {
      if (sourceSlotIndex === targetSlotIndex) {
        return false;
      }

      const sourceSlot = slotByIndex.get(sourceSlotIndex);
      const targetSlot = slotByIndex.get(targetSlotIndex);
      if (
        sourceSlot?.card === null ||
        sourceSlot?.card === undefined ||
        targetSlot?.card === null ||
        targetSlot?.card === undefined
      ) {
        return false;
      }

      return canSwapDraftSlots({
        sourceCardPositions: sourceSlot.card.playablePositionCodes,
        targetCardPositions: targetSlot.card.playablePositionCodes,
        sourceSlot: {
          label: sourceSlot.label,
          allowedPositions: sourceSlot.allowedPositions,
        },
        targetSlot: {
          label: targetSlot.label,
          allowedPositions: targetSlot.allowedPositions,
        },
      });
    },
    [slotByIndex],
  );

  const handleDragStart = useCallback((slotIndex: number) => {
    setDragSourceSlotIndex(slotIndex);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragSourceSlotIndex(null);
  }, []);

  const handleDrop = useCallback(
    (targetSlotIndex: number) => {
      if (dragSourceSlotIndex === null || onSwapSlots === undefined) {
        return;
      }

      if (resolveSwapTarget(dragSourceSlotIndex, targetSlotIndex)) {
        onSwapSlots(dragSourceSlotIndex, targetSlotIndex);
      }

      setDragSourceSlotIndex(null);
    },
    [dragSourceSlotIndex, onSwapSlots, resolveSwapTarget],
  );

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
          locked={isSelectionLocked && activeSlotIndex !== slot.slotIndex && slot.card === null}
          reorderable={reorderable}
          isDragging={dragSourceSlotIndex === slot.slotIndex}
          isSwapTarget={
            dragSourceSlotIndex !== null &&
            dragSourceSlotIndex !== slot.slotIndex &&
            resolveSwapTarget(dragSourceSlotIndex, slot.slotIndex)
          }
          isSwapping={swappingSlotIndex === slot.slotIndex}
          onSelectSlot={onSelectSlot}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
});

const DraftPitchSlot = memo(function DraftPitchSlot({
  slot,
  isActive,
  locked,
  reorderable,
  isDragging,
  isSwapTarget,
  isSwapping,
  onSelectSlot,
  onDragStart,
  onDragEnd,
  onDrop,
}: {
  readonly slot: DraftSlotStateDto;
  readonly isActive: boolean;
  readonly locked: boolean;
  readonly reorderable: boolean;
  readonly isDragging: boolean;
  readonly isSwapTarget: boolean;
  readonly isSwapping: boolean;
  readonly onSelectSlot: (slotIndex: number) => void;
  readonly onDragStart: (slotIndex: number) => void;
  readonly onDragEnd: () => void;
  readonly onDrop: (slotIndex: number) => void;
}): React.ReactElement {
  const handleSelect = useCallback(() => {
    if (slot.card !== null || locked) {
      return;
    }
    onSelectSlot(slot.slotIndex);
  }, [locked, onSelectSlot, slot.card, slot.slotIndex]);

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!reorderable || slot.card === null) {
        event.preventDefault();
        return;
      }

      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(slot.slotIndex));
      onDragStart(slot.slotIndex);
    },
    [onDragStart, reorderable, slot.card, slot.slotIndex],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!isSwapTarget) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    [isSwapTarget],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      onDrop(slot.slotIndex);
    },
    [onDrop, slot.slotIndex],
  );

  const style = {
    left: `${mapDraftPitchDisplayX(slot.pitchX)}%`,
    top: `${mapDraftPitchDisplayY(slot.pitchY)}%`,
  };

  const slotClassName = [
    'draft-pitch-slot',
    isActive ? 'draft-pitch-slot--active' : '',
    isDragging ? 'draft-pitch-slot--dragging' : '',
    isSwapTarget ? 'draft-pitch-slot--swap-target' : '',
    isSwapping ? 'draft-pitch-slot--swapping' : '',
    reorderable && slot.card !== null ? 'draft-pitch-slot--reorderable' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={slotClassName} style={style} onDragOver={handleDragOver} onDrop={handleDrop}>
      {slot.card === null ? (
        locked ? (
          <DraftEmptyCard label={slot.label} active={isActive} locked />
        ) : (
          <DraftEmptyCard label={slot.label} active={isActive} onClick={handleSelect} />
        )
      ) : (
        <div
          className="draft-pitch-slot__filled"
          draggable={reorderable}
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
        >
          <DraftPlayerChemistryBadge
            chemistry={slot.playerChemistry}
            sources={slot.playerChemistrySources}
            className="draft-pitch-slot__chem"
          />
          <FootballCard
            face={mapDraftCardFace(slot.card)}
            variant={mapCardTypeToVariant(slot.card.cardTypeCode)}
            size="md"
            visual="interactive"
            className="draft-pitch-slot__card fc-card--pitch"
          />
        </div>
      )}
    </div>
  );
});
