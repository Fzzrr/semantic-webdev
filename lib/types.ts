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
  license?: string;
  firstRelease?: string;
  creator?: string;
  npmPackage?: string;
  databases?: string[];
  compatibleWith?: string[];
  isBuiltOn?: string[];
  usesLanguage?: string[];
  alternatives?: string[];
  isFrameworkOf?: string[];
  isORMFor?: string[];
  implementsSpec?: string[];
}

export const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "Framework", label: "Framework" },
  { value: "MobileFramework", label: "Mobile Framework" },
  { value: "DesktopFramework", label: "Desktop Framework" },
  { value: "Library", label: "Library" },
  { value: "UIComponentLib", label: "UI Component Library" },
  { value: "CSSFramework", label: "CSS Framework" },
  { value: "StateManagement", label: "State Management" },
  { value: "Animation", label: "Animation Library" },
  { value: "ValidationLib", label: "Validation Library" },
  { value: "SearchTool", label: "Search Engine" },
  { value: "ORM", label: "ORM" },
  { value: "Database", label: "Database" },
  { value: "Language", label: "Language" },
  { value: "Runtime", label: "Runtime" },
  { value: "PackageManager", label: "Package Manager" },
  { value: "BuildTool", label: "Build Tool" },
  { value: "Monorepo", label: "Monorepo Tool" },
  { value: "TestingTool", label: "Testing Tool" },
  { value: "APITool", label: "API Tool" },
  { value: "Linter", label: "Linter / Formatter" },
  { value: "AuthTool", label: "Auth Tool" },
  { value: "CloudProvider", label: "Cloud Provider" },
  { value: "DeploymentTool", label: "Deployment Tool" },
  { value: "CITool", label: "CI/CD Tool" },
  { value: "VersionControl", label: "Version Control" },
  { value: "ContainerTool", label: "Container Tool" },
  { value: "MonitoringTool", label: "Monitoring Tool" },
  { value: "MessageBroker", label: "Message Broker" },
  { value: "StorageService", label: "Storage Service" },
  { value: "DesignTool", label: "Design Tool" },
  { value: "SemanticWebSpec", label: "Semantic Web Specification" },
  { value: "Triplestore", label: "Triplestore" },
  { value: "Technology", label: "Technology" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];
