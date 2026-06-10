export interface ApiResponse<T> {
  readonly data: T;
  readonly meta?: Record<string, unknown>;
}
