# Formations

## Purpose

Formations define the tactical layout of a team's starting eleven. Each formation specifies 11 slots, and each slot defines which positions a player may occupy.

Formations constrain team building and influence chemistry and simulation outcomes.

## Rules

### Formation Structure

- Every formation has exactly **11 slots**.
- Each slot has a label (e.g., "LB", "CM") and a list of **allowed positions**.
- Slots allow flexibility — e.g., a wide slot may accept both `LW` and `LM`.

### Supported Formations (Foundation)

| Code      | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `4-4-2`   | Four defenders, four midfielders, two strikers                    |
| `4-3-3`   | Four defenders, three midfielders, three forwards                 |
| `4-2-3-1` | Four defenders, two CDMs, three attacking mids, one striker       |
| `3-5-2`   | Three centre-backs, five midfielders, two strikers                |
| `5-3-2`   | Five defenders (with wing-backs), three midfielders, two strikers |

### Data Source

- Formations are **predefined domain templates** — not stored in the database.
- Served via in-memory repository.
- Immutable during a match; changeable between matches.

### Slot Assignment (Future)

- A player assigned to a slot must have a position matching one of the slot's allowed positions.
- Out-of-position assignments may incur penalties (not yet implemented).

## Future Considerations

- **Custom formations** — User-defined tactical layouts
- **Formation familiarity** — Teams perform better in practiced formations
- **In-match formation changes** — Substitutions that shift formation mid-game
- **Defensive/offensive mentality** — Modifier on top of base formation
- **Formation-specific chemistry** — Bonuses for ideal player types per slot
- **Visual formation editor** — Frontend drag-and-drop lineup builder

## Open Questions

1. Should formations be user-customizable or limited to predefined templates?
2. How strict should out-of-position penalties be?
3. Should formation choice be locked at draft time or changeable before each match?
4. Do wing-back slots (LWB/RWB) in 5-3-2 behave differently from full-back slots?
5. Should formations affect simulation physics or only chemistry/overall?
