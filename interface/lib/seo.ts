import type { Metadata } from "next";

export const SITE_CONFIG = {
  name: "Korasa",
  title: "Korasa | Study in Your Way",
  tagline: "Study in Your Way",
  description:
    "Organize your studies, capture questions with photo OCR, and generate authentic practice exams tailored to your learning goals.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://korasa.study",
  ogImage: "https://ik.imagekit.io/cin2tn3bj/korasa_logo.png?updatedAt=1787320657608",
  author: {
    name: "Ahmed Abdelkhaliq",
    url: "https://korasa.study",
  },
  keywords: [
    "Korasa",
    "study app",
    "practice exams",
    "exam generator",
    "study notes",
    "question bank",
    "active recall",
    "flashcards alternative",
    "study organizer",
    "problem solving notes",
    "revision tool",
    "math problem solver",
    "student productivity",
  ],
  links: {
    support: "mailto:support@korasa.study",
    github: "https://github.com/abde1khaliq/Korasa",
  },
} as const;

export interface MetadataOptions {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function constructMetadata({
  title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.ogImage,
  path = "",
  noIndex = false,
  keywords = [...SITE_CONFIG.keywords],
}: MetadataOptions = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.title;

  const canonicalUrl = `${SITE_CONFIG.url}${path}`;

  return {
    title: fullTitle,
    description,
    keywords,
    authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.author.url }],
    creator: SITE_CONFIG.author.name,
    publisher: SITE_CONFIG.name,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@korasastudy",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
