/**
 * Base class for all domain events.
 * Domain events represent something meaningful that happened in the domain.
 * They carry no framework dependencies and must be serializable in principle.
 */
export abstract class DomainEvent {
  readonly occurredAt: Date;
  abstract readonly eventName: string;

  protected constructor(occurredAt?: Date) {
    this.occurredAt = occurredAt ?? new Date();
  }
}
