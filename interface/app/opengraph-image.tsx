import { ImageResponse } from "next/og";

export const alt = "Korasa | Study in Your Way";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf9f6",
          padding: "60px 80px",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <img
            src="https://ik.imagekit.io/cin2tn3bj/korasa_logo.png?updatedAt=1787320657608"
            alt="Korasa Logo"
            width={80}
            height={80}
            style={{ borderRadius: 18 }}
          />
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#1c1917",
              letterSpacing: "-0.02em",
            }}
          >
            Korasa
          </div>
        </div>

        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#292524",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "18px",
            maxWidth: 960,
            letterSpacing: "-0.01em",
          }}
        >
          Study in Your Way
        </div>

        <div
          style={{
            fontSize: 24,
            color: "#78716c",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: 860,
          }}
        >
          Organize your study notes, capture questions with OCR, and generate authentic practice exams.
        </div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            padding: "10px 24px",
            borderRadius: 9999,
            backgroundColor: "#c27803",
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          korasa.study
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
