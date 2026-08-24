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
    title: "Create a Subject.",
    description:
      "Adding subjects like English, Math, Physics, Chemistry.",
  },
  {
    key: "organize",
    Icon: BookOpen,
    title: "Organize with folders",
    description:
      "Create folders within each subject to keep your questions perfectly categorized.",
  },
  {
    key: "capture",
    Icon: Camera,
    title: "Snap a question, add the answer",
    description:
      "Take a photo of a question, add it's answer, difficulty, a small note to remember e.g. the steps you took to solve it.",
  },
  {
    key: "filter",
    Icon: Filter,
    title: "You're all set!",
    description:
      "Add, filter, search, and review your questions anytime. Start discovering Korasa's features!",
  },
];