/**
 * API-layer operation result for frontend/backend HTTP contracts.
 *
 * For domain and application layers, use `@draft-io/backend` common/domain/result.ts
 * via the Result pattern documented in docs/standards/result-pattern.md.
 */
export type ApiOperationResult<T, E = string> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

