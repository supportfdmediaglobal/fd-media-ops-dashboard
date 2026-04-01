import { getBaseUrl } from "@/lib/marketing/imageGen";
import { buildInstagramCaption } from "@/lib/marketing/formatExport";
import type { MarketingSlide } from "@prisma/client";

const GRAPH = "https://graph.facebook.com/v21.0";

function assertPublicHttpsBase(base: string) {
  const u = base.replace(/\/+$/, "");
  if (u.startsWith("http://localhost") || u.startsWith("http://127.")) {
    throw new Error(
      "Instagram no puede descargar imágenes desde localhost. Configura APP_BASE_URL con una URL HTTPS pública (p. ej. tu dominio o un túnel tipo ngrok) y vuelve a generar las imágenes."
    );
  }
  if (!u.startsWith("https://")) {
    throw new Error(
      "La publicación en Instagram requiere URLs HTTPS. Define APP_BASE_URL con https://..."
    );
  }
}

async function graphPost(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params);
  const res = await fetch(`${GRAPH}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as {
    id?: string;
    error?: { message?: string };
  };
  if (!res.ok || json.error) {
    throw new Error(
      json.error?.message ?? `Graph API error (${res.status})`
    );
  }
  return json;
}

async function graphGet(path: string, params: Record<string, string>) {
  const u = new URL(`${GRAPH}${path}`);
  for (const [k, v] of Object.entries(params)) {
    u.searchParams.set(k, v);
  }
  const res = await fetch(u.toString());
  const json = (await res.json()) as {
    status_code?: string;
    error?: { message?: string };
  };
  if (!res.ok || json.error) {
    throw new Error(
      json.error?.message ?? `Graph API error (${res.status})`
    );
  }
  return json;
}

async function waitContainerReady(
  containerId: string,
  accessToken: string,
  label: string
) {
  for (let i = 0; i < 45; i++) {
    const j = await graphGet(`/${containerId}`, {
      fields: "status_code",
      access_token: accessToken,
    });
    const code = j.status_code;
    if (code === "FINISHED") return;
    if (code === "ERROR" || code === "EXPIRED") {
      throw new Error(
        `Contenedor ${label} no listo (status: ${code ?? "desconocido"})`
      );
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Tiempo de espera agotado (${label})`);
}

/**
 * Publica un carrusel en Instagram (Graph API).
 * Las imágenes deben ser accesibles por URL HTTPS pública.
 */
export async function publishInstagramCarousel(opts: {
  igUserId: string;
  accessToken: string;
  carouselId: string;
  slides: MarketingSlide[];
}): Promise<{ mediaId: string }> {
  const base = getBaseUrl().replace(/\/+$/, "");
  assertPublicHttpsBase(base);

  const ordered = [...opts.slides].sort((a, b) => a.order - b.order);
  const caption = buildInstagramCaption(
    ordered.map((s) => ({
      order: s.order,
      pillar: s.pillar,
      headline: s.headline,
      body: s.body,
      hashtags: s.hashtags,
    }))
  );

  const childIds: string[] = [];
  for (const s of ordered) {
    const imageUrl = `${base}/generated/marketing/${opts.carouselId}/slide-${s.order}.png`;
    const created = await graphPost(`/${opts.igUserId}/media`, {
      image_url: imageUrl,
      is_carousel_item: "true",
      access_token: opts.accessToken,
    });
    if (!created.id) throw new Error("Respuesta sin id de contenedor hijo");
    await waitContainerReady(created.id, opts.accessToken, `slide ${s.order}`);
    childIds.push(created.id);
  }

  const carouselContainer = await graphPost(`/${opts.igUserId}/media`, {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption,
    access_token: opts.accessToken,
  });
  if (!carouselContainer.id) throw new Error("Sin id de carrusel");
  await waitContainerReady(
    carouselContainer.id,
    opts.accessToken,
    "carrusel"
  );

  const published = await graphPost(`/${opts.igUserId}/media_publish`, {
    creation_id: carouselContainer.id,
    access_token: opts.accessToken,
  });
  if (!published.id) throw new Error("Publicación sin id de media");
  return { mediaId: published.id };
}

/**
 * Publica una imagen individual en Instagram (Graph API).
 * Requiere que la imagen sea accesible por URL HTTPS pública.
 */
export async function publishInstagramImage(opts: {
  igUserId: string;
  accessToken: string;
  imageUrl: string;
  caption?: string;
}): Promise<{ mediaId: string }> {
  const base = getBaseUrl().replace(/\/+$/, "");
  assertPublicHttpsBase(base);

  const created = await graphPost(`/${opts.igUserId}/media`, {
    image_url: opts.imageUrl,
    caption: (opts.caption ?? "").trim(),
    access_token: opts.accessToken,
  });
  if (!created.id) throw new Error("Respuesta sin id de contenedor");
  await waitContainerReady(created.id, opts.accessToken, "imagen");

  const published = await graphPost(`/${opts.igUserId}/media_publish`, {
    creation_id: created.id,
    access_token: opts.accessToken,
  });
  if (!published.id) throw new Error("Publicación sin id de media");
  return { mediaId: published.id };
}
