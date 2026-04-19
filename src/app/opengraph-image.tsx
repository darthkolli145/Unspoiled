import { ImageResponse } from "next/og";

import { getPortfolioSummary } from "@/lib/harvest-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const summary = getPortfolioSummary();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdfbf3",
          padding: "52px",
          color: "#1f3018",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.75 }}>Unspoiled</div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
          Food-waste routing and compliance intelligence
        </div>
        <div style={{ display: "flex", gap: 32, fontSize: 30 }}>
          <div>{`${summary.totalGenerators.toLocaleString()} generators`}</div>
          <div>{`${summary.coveredByBan.toLocaleString()} covered by ban`}</div>
        </div>
      </div>
    ),
    size,
  );
}
