import type { InjectionToken, Provider, Type } from '@nestjs/common';

/**
 * Wires a framework-agnostic use case class into the NestJS DI container.
 * Use cases must be plain classes with constructor injection — no @Injectable.
 */
export function provideUseCase<T>(UseCase: Type<T>, inject: InjectionToken[] = []): Provider {
  return {
    provide: UseCase,
    useFactory: (...deps: unknown[]) => {
       
      return new UseCase(...deps);
    },
    inject,
  };
}
