/** Shared helpers for normalising unknown NestJS API payloads in lib/api/*. */

export type UnknownRecord = Record<string, unknown>;

export function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

export function listFromResponse(raw: unknown, keys: string[] = []): unknown[] {
  const record = asRecord(raw);
  const data = asRecord(record.data);

  if (Array.isArray(raw)) return raw;

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key];
    if (Array.isArray(data[key])) return data[key];
  }

  if (Array.isArray(record.data)) return record.data;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(data.items)) return data.items;
  return [];
}

export function textFromValue(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (!value) return fallback;

  const record = asRecord(value);
  const nested =
    record.name ??
    record.title ??
    record.label ??
    record.message ??
    record.text ??
    record.content ??
    record.body ??
    record.fullName ??
    record.displayName;

  return nested !== undefined ? textFromValue(nested, fallback) : fallback;
}

export function numberFromValue(value: unknown, fallback = 0): number {
  return typeof value === "number" ? value : fallback;
}

export function booleanFromValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

export function stringOr(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function nullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function normaliseTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string");
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

export function dateValue(value: unknown): number {
  const time = new Date(textFromValue(value, "")).getTime();
  return Number.isNaN(time) ? 0 : time;
}

/** Coerce an unknown array to object records (filters non-objects). */
export function recordList(value: unknown): UnknownRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is UnknownRecord =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );
}

/** Coerce an unknown value to a finite number, or null when absent/invalid. */
export function nullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** Coerce an unknown array to finite numbers (invalid entries become 0). */
export function numberList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];

  return value.map((item) => {
    if (typeof item === "number" && Number.isFinite(item)) return item;
    if (typeof item === "string") {
      const parsed = Number(item);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  });
}

/** Pick a string enum member when value is in the allowed set. */
export function enumValue<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  const candidate = typeof value === "string" ? value : String(value ?? "");
  return allowed.includes(candidate as T) ? (candidate as T) : fallback;
}
