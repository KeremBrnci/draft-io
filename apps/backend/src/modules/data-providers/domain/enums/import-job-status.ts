export const ImportJobStatus = {
  PENDING: 'PENDING',
  RUNNING: 'RUNNING',
  COMPLETED: 'COMPLETED',
  PARTIAL: 'PARTIAL',
  FAILED: 'FAILED',
} as const;

export type ImportJobStatus = (typeof ImportJobStatus)[keyof typeof ImportJobStatus];
