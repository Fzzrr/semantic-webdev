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
  { value: "UIComponentLib", label: "UI Component Library" },
  { value: "CSSFramework", label: "CSS Framework" },
  { value: "StateManagement", label: "State Management" },
  { value: "Animation", label: "Animation Library" },
  { value: "ORM", label: "ORM" },
  { value: "Database", label: "Database" },
  { value: "Language", label: "Language" },
  { value: "Runtime", label: "Runtime" },
  { value: "BuildTool", label: "Build Tool" },
  { value: "TestingTool", label: "Testing Tool" },
  { value: "Monorepo", label: "Monorepo Tool" },
  { value: "DeploymentTool", label: "Deployment Tool" },
  { value: "APITool", label: "API Tool" },
  { value: "Linter", label: "Linter / Formatter" },
  { value: "AuthTool", label: "Auth Tool" },
  { value: "PackageManager", label: "Package Manager" },
  { value: "Technology", label: "Technology" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];
