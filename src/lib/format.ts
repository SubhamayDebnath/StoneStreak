/** "1 habit", "3 habits" */
export const plural = (n: number, word: string) =>
  `${n} ${word}${n === 1 ? '' : 's'}`;

/** Readable text for anything thrown */
export const errorMessage = (e: unknown) =>
  e instanceof Error ? e.message : String(e);
