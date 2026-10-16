export type Timestamp = string & { readonly __brand: "Timestamp" };

export function createTimestamp(isoString: string): Timestamp {
  return isoString as Timestamp;
}

export function timestampFromDate(date: Date): Timestamp {
  return date.toISOString() as Timestamp;
}

export function timestampToDate(timestamp: Timestamp): Date {
  return new Date(timestamp);
}

export function timestampNow(): Timestamp {
  return timestampFromDate(new Date());
}
