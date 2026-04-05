import { PILLAR_LABEL } from "@/lib/marketing/formatExport";

function badgeColor(pillar: string) {
  switch (pillar) {
    case "EMOTIONAL":
      return "#c026d3";
    case "FINANCIAL":
      return "#059669";
    case "NUTRITION":
      return "#d97706";
    case "COVER":
      return "#111827";
    case "CLOSING":
      return "#3f3f46";
    default:
      return "#3f3f46";
  }
}

export type MarketingSlideCanvasProps = {
  forDateISO: string;
  slide: {
    pillar: string;
    headline: string;
    body: string;
    hashtags: string | null;
  };
};

/** Vista 1080×1350 para carrusel IG (misma maqueta que /marketing/render/.../[order]). */
export function MarketingSlideCanvas({ forDateISO, slide }: MarketingSlideCanvasProps) {
  const dateLabel = forDateISO.slice(0, 10);

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: "relative",
        overflow: "hidden",
        background: "#fafafa",
        color: "#0a0a0a",
        fontFamily: "system-ui, -apple-system, Segoe UI, Arial",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: -160,
            top: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(16,185,129,0.25)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -160,
            top: 160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(217,70,239,0.18)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 160,
            bottom: -160,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "rgba(245,158,11,0.18)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: 80,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div
            style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            FD Bienestar
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                background: badgeColor(slide.pillar),
                color: "white",
                padding: "10px 16px",
                borderRadius: 9999,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {PILLAR_LABEL[slide.pillar] ?? slide.pillar}
            </div>
            <div style={{ fontSize: 14, color: "#71717a" }}>{dateLabel}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 44,
            borderRadius: 36,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.82)",
            padding: 56,
            boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
            }}
          >
            {slide.headline}
          </div>
          <div
            style={{
              marginTop: 28,
              whiteSpace: "pre-wrap",
              fontSize: 30,
              lineHeight: "44px",
              color: "#27272a",
            }}
          >
            {slide.body}
          </div>
          {slide.hashtags ? (
            <div
              style={{
                marginTop: 34,
                fontSize: 24,
                fontWeight: 800,
                color: "#047857",
              }}
            >
              {slide.hashtags}
            </div>
          ) : null}
        </div>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 40,
            display: "flex",
            justifyContent: "space-between",
            color: "#71717a",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <div>bienestar.fdmediaglobal.cloud</div>
          <div>@fdbienestar</div>
        </div>
      </div>
    </div>
  );
}
