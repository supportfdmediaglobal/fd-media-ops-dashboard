export type SlideExport = {
  order: number;
  pillar: string;
  headline: string;
  body: string;
  hashtags: string | null;
};

export const PILLAR_LABEL: Record<string, string> = {
  COVER: "Portada",
  EMOTIONAL: "Emocional",
  FINANCIAL: "Financiero",
  NUTRITION: "Alimenticio",
  CLOSING: "Cierre",
};

export function formatCarouselTxt(
  slides: SlideExport[],
  forDateLabel: string
): string {
  const header = `FD Bienestar — Carrusel ${forDateLabel}\nGenerado desde FD Ops Dashboard\n${"=".repeat(56)}\n\n`;
  const body = [...slides]
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const tag =
        s.hashtags?.trim() ? `\n${s.hashtags.trim()}` : "";
      const pillar = PILLAR_LABEL[s.pillar] ?? s.pillar;
      return `— Slide ${s.order} · ${pillar} —\n${s.headline}\n\n${s.body}${tag ? `\n${tag}` : ""}`;
    })
    .join("\n\n");
  return header + body;
}

/** Leyenda corta para la publicación del carrusel (primer slide + CTA + hashtags). */
export function buildInstagramCaption(slides: SlideExport[]): string {
  const ordered = [...slides].sort((a, b) => a.order - b.order);
  const cover = ordered.find((s) => s.order === 1);
  const closing = ordered.find((s) => s.pillar === "CLOSING");
  const tags =
    closing?.hashtags?.trim() ||
    cover?.hashtags?.trim() ||
    "";

  const lines: string[] = [];
  if (cover) {
    lines.push(cover.headline);
    lines.push("");
    lines.push(cover.body.split("\n")[0] ?? cover.body);
    lines.push("");
  }
  lines.push(`Desliza para leer emocional, finanzas y alimentación 👆`);
  lines.push("");
  if (tags) lines.push(tags);
  return lines.join("\n").trim();
}

export function formatSingleSlide(s: SlideExport): string {
  const tag = s.hashtags?.trim() ? `\n\n${s.hashtags.trim()}` : "";
  const pillar = PILLAR_LABEL[s.pillar] ?? s.pillar;
  return `— Slide ${s.order} · ${pillar} —\n${s.headline}\n\n${s.body}${tag}`;
}
