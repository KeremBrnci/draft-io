export function jsonStableEqual<T>(left: T, right: T): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function applyIfChanged<T>(
  current: T | null,
  next: T,
  equals: (left: T, right: T) => boolean = jsonStableEqual,
): T {
  if (current !== null && equals(current, next)) {
    return current;
  }

  return next;
}
