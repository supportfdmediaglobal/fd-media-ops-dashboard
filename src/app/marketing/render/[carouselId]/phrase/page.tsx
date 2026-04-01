import { prisma } from "@/lib/db";
import {
  buildDailyPhraseContent,
  getAccount,
} from "@/lib/marketing/carouselContent";

export const dynamic = "force-dynamic";

function pillarAccent(kind: "emotional" | "financial" | "nutrition") {
  switch (kind) {
    case "emotional":
      return { bg: "#c026d3", soft: "rgba(192,38,211,0.14)" };
    case "financial":
      return { bg: "#059669", soft: "rgba(5,150,105,0.14)" };
    case "nutrition":
      return { bg: "#d97706", soft: "rgba(217,119,6,0.14)" };
  }
}

export default async function RenderPhrasePage({
  params,
}: {
  params: Promise<{ carouselId: string }>;
}) {
  const { carouselId } = await params;
  const carousel = await prisma.marketingCarousel.findUnique({
    where: { id: carouselId },
  });

  if (!carousel) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui, -apple-system, Segoe UI, Arial" }}>
        No encontrado
      </div>
    );
  }

  const account = getAccount();
  const dateKey = carousel.forDate.toISOString().slice(0, 10);
  const phrase = buildDailyPhraseContent(
    dateKey,
    carousel.emotionalThemeIndex,
    carousel.financialThemeIndex,
    carousel.nutritionThemeIndex
  );

  const rows: {
    key: "emotional" | "financial" | "nutrition";
    label: string;
    title: string;
    hook: string;
  }[] = [
    {
      key: "emotional",
      label: phrase.emotional.label,
      title: phrase.emotional.title,
      hook: phrase.emotional.hook,
    },
    {
      key: "financial",
      label: phrase.financial.label,
      title: phrase.financial.title,
      hook: phrase.financial.hook,
    },
    {
      key: "nutrition",
      label: phrase.nutrition.label,
      title: phrase.nutrition.title,
      hook: phrase.nutrition.hook,
    },
  ];

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
            left: -140,
            top: -120,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background: "rgba(192,38,211,0.2)",
            filter: "blur(56px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -120,
            top: 200,
            width: 460,
            height: 460,
            borderRadius: 9999,
            background: "rgba(5,150,105,0.2)",
            filter: "blur(56px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 120,
            bottom: -100,
            width: 440,
            height: 440,
            borderRadius: 9999,
            background: "rgba(217,119,6,0.18)",
            filter: "blur(56px)",
          }}
        />
      </div>

      <div
        style={{
          position: "relative",
          height: "100%",
          padding: "72px 68px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#52525b",
              }}
            >
              Frase del día
            </div>
            <div style={{ marginTop: 10, fontSize: 28, fontWeight: 700 }}>
              FD Bienestar
            </div>
          </div>
          <div style={{ fontSize: 16, color: "#71717a", fontWeight: 600 }}>
            {dateKey}
          </div>
        </div>

        <div
          style={{
            marginTop: 36,
            borderRadius: 32,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "rgba(255,255,255,0.9)",
            padding: "44px 40px",
            boxShadow: "0 14px 34px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
              color: "#18181b",
            }}
          >
            {phrase.integrativeLine}
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minHeight: 0,
          }}
        >
          {rows.map((r) => {
            const a = pillarAccent(r.key);
            return (
              <div
                key={r.key}
                style={{
                  borderRadius: 24,
                  border: "1px solid rgba(0,0,0,0.06)",
                  background: a.soft,
                  padding: "22px 24px",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      background: a.bg,
                      color: "white",
                      padding: "6px 14px",
                      borderRadius: 9999,
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    {r.label}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      lineHeight: 1.25,
                      color: "#18181b",
                    }}
                  >
                    {r.title}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 19,
                    lineHeight: 1.45,
                    color: "#3f3f46",
                  }}
                >
                  {r.hook}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "space-between",
            color: "#71717a",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <div>{account.site}</div>
          <div>{account.handle}</div>
        </div>
      </div>
    </div>
  );
}
