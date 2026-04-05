import path from "path";

/** URL pública (Instagram Graph, enlaces absolutos a /generated/...). */
export function getBaseUrl() {
  return (
    process.env.APP_BASE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    "http://localhost:3002"
  );
}

export function outputDirForCarousel(carouselId: string) {
  return path.join(process.cwd(), "public", "generated", "marketing", carouselId);
}

export function outputPathForSlide(carouselId: string, order: number) {
  return path.join(outputDirForCarousel(carouselId), `slide-${order}.png`);
}

export function outputPathForPhrase(carouselId: string) {
  return path.join(outputDirForCarousel(carouselId), "frase-del-dia.png");
}

