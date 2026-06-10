import type { DomainEvent } from './domain-event';

/**
 * Port for publishing and subscribing to domain events within the monolith.
 * Implementations may use in-process dispatch initially; external brokers are out of scope.
 */
export interface EventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe<T extends DomainEvent>(
    eventName: T['eventName'],
    handler: (event: T) => Promise<void>,
  ): void;
}

export const EVENT_BUS = Symbol('EVENT_BUS');
