import { LucideIcon } from "lucide-react-native";
import {
  Sparkles,
  Zap,
  BookOpen,
  Camera,
  Layers,
  Palette,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Award,
} from "lucide-react-native";

export type FeatureBadgeType = "new" | "improved" | "fix" | "highlight";

export interface ChangelogFeature {
  /** Short title of the feature or fix */
  title: string;
  /** Detailed description of what's new or changed */
  description: string;
  /** Optional icon name or component */
  icon?: string | LucideIcon;
  /** Optional badge label (e.g., "NEW", "IMPROVED", "FIX") */
  badge?: string;
  /** Badge color variant */
  badgeType?: FeatureBadgeType;
}

export interface ChangelogRelease {
  /**
   * Unique identifier for this update.
   * IMPORTANT: When you publish a new update with `bunx eas update`,
   * change this ID (e.g., 'v1.0.1', 'ota-2026-08-30-1') so the app knows
   * to show the modal to users who receive the update.
   */
  id: string;
  /** Version or update name shown to the user (e.g., "Version 1.0.1" or "Update 1.0.1") */
  version: string;
  /** Human-readable release date or badge (e.g., "Exams", "Aug 30, 2026") */
  date: string;
  /** Headline title for this release (e.g., "Exams are here!", "What's New in Korasa") */
  title: string;
  /** Optional short summary or welcome message */
  subtitle?: string;
  /** Optional list of features and improvements in this release */
  features?: ChangelogFeature[];
}

export const CHANGELOG: ChangelogRelease[] = [
    {
    id: "v1.1.0",
    version: "v1.1.0",
    date: "Calendar",
    title: "Calendar feature has come to life!",
    subtitle: "Schedule your lessons or lectures to get notified by Korasa to never miss them.",
  },
  {
    id: "v1.0.0",
    version: "v1.0.0",
    date: "Exams",
    title: "Exams are here!",
    subtitle: "Use your saved questions to create exams and start testing yourself.",
  },
];


export function getLatestRelease(): ChangelogRelease {
  return CHANGELOG[0];
}

export function getAllReleases(): ChangelogRelease[] {
  return CHANGELOG;
}

export function getReleaseById(id: string): ChangelogRelease | undefined {
  return CHANGELOG.find((release) => release.id === id);
}

export const ICON_MAP: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  zap: Zap,
  book: BookOpen,
  camera: Camera,
  layers: Layers,
  palette: Palette,
  check: CheckCircle2,
  clock: Clock,
  help: HelpCircle,
  file: FileText,
  sliders: Sliders,
  shield: ShieldCheck,
  refresh: RefreshCw,
  award: Award,
};
