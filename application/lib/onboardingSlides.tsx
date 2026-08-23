import { ImageSourcePropType } from "react-native";

export interface OnboardingSlide {
  key: string;
  image: ImageSourcePropType;
  title: string;
  description: string;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    key: "welcome",
    image: require("@/assets/images/mockup1.png"),
    title: "Create Subjects.",
    description:
      "Korasa stores school subjects to revise on later using it's features.",
  },
  {
    key: "organize",
    image: require("@/assets/images/mockup2.png"),
    title: "Subjects, then folders",
    description:
      "Categorize your subject using folders.",
  },
  {
    key: "capture",
    image: require("@/assets/images/mockup3.png"),
    title: "Save a question",
    description:
      "Photograph a question from your notes or textbook, write the answer.",
  },
  {
    key: "filter",
    image: require("@/assets/images/icon.png"),
    title: "You're all set!",
    description:
      "Start Exploring Korasa's features now!",
  },
];