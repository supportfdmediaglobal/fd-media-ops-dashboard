import type { ReactElement } from "react";
import { MarketingPhraseCanvas } from "@/components/marketing/render/MarketingPhraseCanvas";
import {
  MarketingSlideCanvas,
  type MarketingSlideCanvasProps,
} from "@/components/marketing/render/MarketingSlideCanvas";

const shell = (inner: string) =>
  `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=1080"/></head><body style="margin:0;padding:0;">${inner}</body></html>`;

async function toStaticMarkup(element: ReactElement): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");
  return renderToStaticMarkup(element);
}

export async function renderSlideHtml(
  props: MarketingSlideCanvasProps
): Promise<string> {
  const inner = await toStaticMarkup(<MarketingSlideCanvas {...props} />);
  return shell(inner);
}

export async function renderPhraseHtml(props: {
  dateKey: string;
  emotionalThemeIndex: number;
  financialThemeIndex: number;
  nutritionThemeIndex: number;
}): Promise<string> {
  const inner = await toStaticMarkup(<MarketingPhraseCanvas {...props} />);
  return shell(inner);
}
