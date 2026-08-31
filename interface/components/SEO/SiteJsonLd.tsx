import { SITE_CONFIG } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

export function SiteJsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      logo: {
        "@type": "ImageObject",
        url: SITE_CONFIG.ogImage,
      },
    },
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_CONFIG.name,
    applicationCategory: "EducationalApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: SITE_CONFIG.description,
    featureList: [
      "Subject and topic folder study organization",
      "Camera & photo OCR question capture",
      "Customizable practice exam generation",
      "Approach notes and revision tracking",
      "LaTeX math formula support",
    ],
    author: {
      "@type": "Person",
      name: SITE_CONFIG.author.name,
      url: SITE_CONFIG.author.url,
    },
  };

  return (
    <>
      <JsonLd data={websiteSchema} />
      <JsonLd data={softwareAppSchema} />
    </>
  );
}
