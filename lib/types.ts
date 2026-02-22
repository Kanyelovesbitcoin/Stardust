/** Structured output from cross-dream pattern analysis */
export interface DreamPatterns {
  recurringPeople: PatternEntry[];
  recurringSettings: PatternEntry[];
  recurringThemes: PatternEntry[];
  emotionalPatterns: PatternEntry[];
}

export interface PatternEntry {
  /** Name of the person, place, theme, or emotional pattern */
  name: string;
  /** Number of dreams this pattern appears in */
  count: number;
  /** What this recurring element means for the dreamer */
  meaning: string;
}
