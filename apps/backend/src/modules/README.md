# Backend Feature Modules

Each module is a bounded context following Clean Architecture layers.

## Module Template

```
{module}/
├── application/
│   ├── commands/       # Write operation inputs
│   ├── queries/        # Read operation inputs
│   └── use-cases/      # Application services (one execute() per class)
├── domain/
│   ├── entities/       # Aggregate roots with business invariants
│   ├── value-objects/  # Immutable, validated value types
│   ├── errors/         # Domain-specific errors (no HTTP status)
│   └── repositories/   # Port interfaces (contracts)
├── infrastructure/
│   ├── mappers/        # Domain ↔ persistence mapping
│   └── persistence/    # Repository implementations (Prisma)
├── presentation/
│   ├── controllers/    # HTTP controllers
│   └── dto/            # Request/response DTOs with validation
└── {module}.module.ts  # NestJS DI wiring
```

## Reference Implementation

See `players/` for a complete example demonstrating all layers.

## Placeholder Modules

| Module       | Future Responsibility                   |
| ------------ | --------------------------------------- |
| `auth`       | Authentication and authorization        |
| `users`      | User accounts and profiles              |
| `formations` | Tactical formation definitions          |
| `lobbies`    | Lobby management and matchmaking        |
| `draft`      | Draft room logic and pick order         |
| `matches`    | Match scheduling and results            |
| `simulation` | Match engine and chemistry calculations |

When implementing a new module, copy the `players/` structure and replace domain concepts.
