import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f6",
    theme_color: "#c27803",
    icons: [
      {
        src: "https://ik.imagekit.io/cin2tn3bj/korasa_logo.png?updatedAt=1787320657608",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "https://ik.imagekit.io/cin2tn3bj/korasa_logo.png?updatedAt=1787320657608",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
