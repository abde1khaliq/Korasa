export interface OnboardingSlide {
  key: string;
  title: string;
  description: string;
}

export const onboardingSlides: OnboardingSlide[] = [
  {
    key: "welcome",
    title: "Create a Subject.",
    description: "Adding subjects like English, Math, Physics, Chemistry.",
  },
  {
    key: "organize",
    title: "Organize with folders",
    description:
      "Create folders within each subject to keep your questions perfectly categorized.",
  },
  {
    key: "capture",
    title: "Snap a question, add the answer",
    description:
      "Take a photo of a question, add it's answer, difficulty, a small note to remember e.g. the steps you took to solve it.",
  },
  {
    key: "test",
    title: "Test yourself, by creating exams.",
    description:
      "Create an Exam, select which subject/folder you want to create the exam for, select the exam type, number of questions, difficulty and GO.",
  },
  {
    key: "filter",
    title: "You're all set!",
    description:
      "Add, filter, search, review your questions and test yourself anytime. Start discovering Korasa's features!",
  },
];
