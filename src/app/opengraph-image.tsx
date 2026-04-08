import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "clippt — Clip the good stuff";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#17171C",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "40px" }}>
          <div style={{ display: "flex", gap: "0" }}>
            <div style={{ width: "80px", height: "20px", borderRadius: "10px", background: "#F25C3A" }} />
          </div>
          <div style={{ display: "flex", paddingLeft: "18px" }}>
            <div style={{ width: "62px", height: "20px", borderRadius: "10px", background: "#5B5CF0" }} />
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ width: "80px", height: "20px", borderRadius: "10px", background: "#18B5A0" }} />
          </div>
          <div style={{ display: "flex", paddingLeft: "18px" }}>
            <div style={{ width: "62px", height: "20px", borderRadius: "10px", background: "#F0A030" }} />
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 900,
            color: "#F0F0F2",
            letterSpacing: "-0.02em",
            marginBottom: "16px",
          }}
        >
          clippt
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: 400,
            color: "#9292A0",
          }}
        >
          Clip the good stuff.
        </div>
      </div>
    ),
    { ...size }
  );
}
