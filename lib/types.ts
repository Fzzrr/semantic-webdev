// lib/types.ts

export interface Technology {
  uri: string;
  name: string;
  label: string;
  type: string;
  typeLabel: string;
  description?: string;
  website?: string;
  version?: string;
  githubStars?: string;
  databases?: string[];
  compatibleWith?: string[];
  isBuiltOn?: string[];
  usesLanguage?: string[];
  alternatives?: string[];
  isFrameworkOf?: string[];
  isORMFor?: string[];
}

export const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "Framework", label: "Framework" },
  { value: "Library", label: "Library" },
  { value: "ORM", label: "ORM" },
  { value: "Database", label: "Database" },
  { value: "Language", label: "Language" },
  { value: "Runtime", label: "Runtime" },
  { value: "CSSFramework", label: "CSS Framework" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];
