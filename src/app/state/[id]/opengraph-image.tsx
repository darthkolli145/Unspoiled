import { ImageResponse } from "next/og";

import { getBans, getPortfolioSummary } from "@/lib/harvest-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const STATE_NAMES: Record<string, string> = {
  MA: "Massachusetts",
  VT: "Vermont",
  CT: "Connecticut",
  CA: "California",
  RI: "Rhode Island",
};

export default async function StateOpenGraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stateId = id.toUpperCase();
  const stateName = STATE_NAMES[stateId] ?? stateId;
  const summary = getPortfolioSummary();
  const stateSummary = summary.byState.find((s) => s.stateId === stateId);
  const latestBan = getBans()
    .filter((b) => b.stateId === stateId)
    .sort((a, b) => b.year - a.year)[0];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f8f2e0",
          padding: "52px",
          color: "#1f3018",
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.8 }}>Unspoiled State Coverage</div>
        <div style={{ fontSize: 72, fontWeight: 700 }}>{stateName}</div>
        <div style={{ display: "flex", gap: 32, fontSize: 30 }}>
          <div>{`${stateSummary?.generators.toLocaleString() ?? "0"} generators`}</div>
          <div>
            {latestBan
              ? `${latestBan.thresholdTonsPerYear.toLocaleString()} t/yr threshold`
              : "No threshold loaded"}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
