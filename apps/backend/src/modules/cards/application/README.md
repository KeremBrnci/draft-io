# Cards Application Layer

Use cases (future — not implemented in architecture sprint):

- `CreateCardUseCase` — manual admin card creation
- `ListCardsByPlayerUseCase` — editions for one identity
- `UpdateCardOverallUseCase` — manual override
- `DeactivateCardUseCase` — remove from draft pools

Import use cases must **not** live here. `data-providers` updates `Player` only.
