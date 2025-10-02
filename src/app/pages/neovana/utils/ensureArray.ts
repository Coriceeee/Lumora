// src/app/pages/neovana/utils/ensureArray.ts

export function ensureArray<T>(input: T | T[] | null | undefined): T[] {
  if (Array.isArray(input)) return input;
  if (input == null) return [];
  return [input];
}

export default ensureArray;
