import { BookOpen, Camera, Filter, Sparkles, LucideIcon } from "lucide-react-native";

export interface OnboardingSlide {
  key: string;
  Icon: LucideIcon;
  title: string;
  description: string;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    key: "welcome",
    Icon: Sparkles,
    title: "A quiet place to remember",
    description:
      "Korasa keeps the questions worth remembering, organized and ready whenever you sit down to study.",
  },
  {
    key: "organize",
    Icon: BookOpen,
    title: "Subjects, then folders",
    description:
      "Group your material into subjects, then split each one into folders — chapters, topics, whatever makes sense to you.",
  },
  {
    key: "capture",
    Icon: Camera,
    title: "Snap a question, add the answer",
    description:
      "Photograph a question from your notes or textbook, write the answer, and reveal it later to test yourself.",
  },
  {
    key: "filter",
    Icon: Filter,
    title: "Study by difficulty",
    description:
      "Filter and search within a folder to focus on the questions that actually need the work.",
  },
];