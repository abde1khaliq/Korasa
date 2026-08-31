import { JsonLd } from "./JsonLd";

const FAQ_ITEMS = [
  {
    question: "What makes Korasa different from standard flashcard apps?",
    answer:
      "Korasa is designed specifically for full-length problem solving and practice exams. Instead of simple front-and-back flashcards, Korasa stores complete questions, solving approach notes, answers, and difficulty ratings. You can then generate authentic timed exams from your personal collection to test yourself under realistic conditions.",
  },
  {
    question: "How does the question photo capture work?",
    answer:
      "When adding a question on your mobile device or web, you can snap a photo or upload an image of a worksheet, textbook problem, or blackboard note.",
  },
  {
    question: "How does the Exam Generator create custom tests?",
    answer:
      "You choose the scope (an entire subject or a specific topic folder), pick your target difficulty (Easy, Medium, Hard, or mixed), choose between timed simulation and self-paced practice mode, and choose how many questions you want. Korasa instantly pulls from your saved questions to generate a focused exam.",
  },
  {
    question: "Can I organize my questions into subjects and chapter folders?",
    answer:
      "Yes. The core hierarchy is Subject → Folder → Question. For example, create a subject called 'Physics', create folders for 'Kinematics', 'Thermodynamics', and 'Electromagnetism', and organize your questions neatly by chapter or topic.",
  },
  {
    question: "Is Korasa free?",
    answer: "Yes! Korasa is completely free.",
  },
  {
    question: "How does revision help me improve over time?",
    answer:
      "After finishing an exam simulation, you can see your score, review the questions you missed, and re-read the solving approach notes you wrote when you first encountered the problem. This targeted review loop turns past mistakes into lasting comprehension.",
  },
];

export function FaqJsonLd() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={faqSchema} />;
}
