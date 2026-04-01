"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatThemePosition, getAccount } from "@/lib/marketing/carouselContent";
import {
  PILLAR_LABEL,
  buildInstagramCaption,
} from "@/lib/marketing/formatExport";

type CarouselListItem = {
  id: string;
  forDate: string;
  title: string;
  slideCount: number;
  updatedAt: string;
  instagramPublishStatus: string;
};

type SlideRow = {
  id: string;
  order: number;
  pillar: string;
  headline: string;
  body: string;
  hashtags: string | null;
};

type CarouselDetail = {
  id: string;
  forDate: string;
  title: string;
  emotionalThemeIndex?: number;
  financialThemeIndex?: number;
  nutritionThemeIndex?: number;
  instagramPublishStatus: string;
  imagesGeneratedAt?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  instagramMediaId?: string | null;
  instagramPublishError?: string | null;
  phrasePublishStatus?: string;
  phraseGeneratedAt?: string | null;
  phraseApprovedAt?: string | null;
  phrasePublishedAt?: string | null;
  phraseInstagramMediaId?: string | null;
  phrasePublishError?: string | null;
  slides: SlideRow[];
};

const STATUS_LABEL: Record<string, string> = {
  NOT_GENERATED: "Sin imágenes",
  PENDING_APPROVAL: "Pendiente por publicar",
  APPROVED: "Aprobada",
  PUBLISHED: "Publicada en Instagram",
  PUBLISH_FAILED: "Error al publicar",
};

function statusBadgeClass(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200";
    case "APPROVED":
      return "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200";
    case "PENDING_APPROVAL":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100";
    case "PUBLISH_FAILED":
      return "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-300";
  }
}

function toLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekDateKeys(anchor: Date): string[] {
  const d = new Date(anchor);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  const keys: string[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    keys.push(toLocalYMD(x));
  }
  return keys;
}

const WEEKDAY_ES = ["L", "M", "X", "J", "V", "S", "D"];

export function MarketingCarouselTool() {
  const account = useMemo(() => getAccount(), []);
  const [list, setList] = useState<CarouselListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [detail, setDetail] = useState<CarouselDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [forDate, setForDate] = useState(() => toLocalYMD(new Date()));
  const [activePreview, setActivePreview] = useState<
    "carousel" | "phrase" | null
  >(null);
  const [phraseImageUrl, setPhraseImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [carouselImages, setCarouselImages] = useState<
    { order: number; url: string }[]
  >([]);
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [generatingPhrase, setGeneratingPhrase] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvingPhrase, setApprovingPhrase] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishingPhrase, setPublishingPhrase] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [igBusinessId, setIgBusinessId] = useState("");
  const [igToken, setIgToken] = useState("");
  const [igHasToken, setIgHasToken] = useState(false);
  const [igEnvFallback, setIgEnvFallback] = useState(false);
  const [savingIg, setSavingIg] = useState(false);

  const datesByWeek = useMemo(() => weekDateKeys(new Date()), []);
  const existingDates = useMemo(
    () => new Set(list.map((c) => c.forDate)),
    [list]
  );

  const loadList = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/marketing/carousel?limit=60");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { carousels: CarouselListItem[] };
      setList(json.carousels ?? []);
    } catch {
      setList([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/marketing/carousel/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { carousel: CarouselDetail };
      setDetail(json.carousel);
    } catch {
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const loadInstagramConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/marketing/instagram-config");
      if (!res.ok) return;
      const json = (await res.json()) as {
        businessAccountId: string | null;
        hasAccessToken: boolean;
        envFallback: boolean;
      };
      setIgBusinessId(json.businessAccountId ?? "");
      setIgHasToken(json.hasAccessToken);
      setIgEnvFallback(json.envFallback);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadList();
    void loadInstagramConfig();
  }, [loadList, loadInstagramConfig]);

  async function saveInstagramConfig() {
    setSavingIg(true);
    setMsg(null);
    try {
      const res = await fetch("/api/marketing/instagram-config", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessAccountId: igBusinessId.trim() || null,
          accessToken: igToken.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar");
      setIgToken("");
      await loadInstagramConfig();
      setMsg("Configuración de Instagram guardada.");
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg("Error al guardar la configuración.");
    } finally {
      setSavingIg(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setMsg(null);
    try {
      const res = await fetch("/api/marketing/carousel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ forDate }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { carousel?: CarouselDetail };
      await loadList();
      if (json.carousel?.id) {
        setDetail(json.carousel as CarouselDetail);
        setCarouselImages([]);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerateCarouselAndImages() {
    setGenerating(true);
    setMsg(null);
    try {
      setActivePreview("carousel");
      setPhraseImageUrl(null);
      const res = await fetch("/api/marketing/carousel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ forDate }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json().catch(() => ({}))) as {
        carousel?: CarouselDetail;
      };
      if (!json.carousel?.id) {
        setMsg("No se pudo generar el carrusel.");
        return;
      }
      setDetail(json.carousel);
      setCarouselImages([]);
      await loadList();

      setGeneratingImages(true);
      const gen = await fetch(`/api/marketing/carousel/${json.carousel.id}/images`, {
        method: "POST",
      });
      const imgJson = (await gen.json().catch(() => ({}))) as {
        images?: { order: number; url: string }[];
        error?: string;
      };
      if (!gen.ok) {
        setMsg(imgJson.error ?? "El carrusel se generó pero falló la generación de imágenes.");
        await loadDetail(json.carousel.id);
        await loadList();
        return;
      }
      setCarouselImages((imgJson.images ?? []).sort((a, b) => a.order - b.order));
      await loadDetail(json.carousel.id);
      await loadList();
      setMsg("Carrusel e imágenes listos. Revisa, aprueba y publica.");
      setTimeout(() => setMsg(null), 4000);
    } finally {
      setGenerating(false);
      setGeneratingImages(false);
    }
  }

  async function generateCarouselImagesForPreview() {
    if (!detail) return;
    setGeneratingImages(true);
    setMsg(null);
    try {
      setActivePreview("carousel");
      const gen = await fetch(`/api/marketing/carousel/${detail.id}/images`, {
        method: "POST",
      });
      const json = (await gen.json().catch(() => ({}))) as {
        images?: { order: number; url: string }[];
        error?: string;
      };
      if (!gen.ok) {
        setMsg(json.error ?? "No se pudieron generar las imágenes.");
        return;
      }
      setCarouselImages((json.images ?? []).sort((a, b) => a.order - b.order));
      await loadDetail(detail.id);
      await loadList();
      setMsg("Imágenes del carrusel generadas. Revisa y aprueba para publicar.");
      setTimeout(() => setMsg(null), 4000);
    } finally {
      setGeneratingImages(false);
    }
  }

  async function downloadImages() {
    if (!detail) return;
    setDownloadingImages(true);
    setMsg(null);
    try {
      const gen = await fetch(`/api/marketing/carousel/${detail.id}/images`, {
        method: "POST",
      });
      if (!gen.ok) {
        setMsg("No se pudieron generar las imágenes.");
        return;
      }
      const zip = await fetch(
        `/api/marketing/carousel/${detail.id}/images.zip`,
        { credentials: "include" }
      );
      if (!zip.ok) {
        setMsg("Las imágenes se generaron pero no se pudo descargar el ZIP.");
        await loadDetail(detail.id);
        await loadList();
        return;
      }
      const blob = await zip.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fdbienestar-carrusel-${detail.forDate}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      await loadDetail(detail.id);
      await loadList();
      setMsg("Imágenes generadas y ZIP descargado. Estado: pendiente por publicar.");
      setTimeout(() => setMsg(null), 4000);
    } finally {
      setDownloadingImages(false);
    }
  }

  async function generatePhraseImage() {
    setGeneratingPhrase(true);
    setMsg(null);
    try {
      setActivePreview("phrase");
      setCarouselImages([]);
      setPhraseImageUrl(null);
      let carouselId = detail?.id;
      if (!carouselId) {
        const created = await fetch("/api/marketing/carousel", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ forDate }),
        });
        if (!created.ok) {
          setMsg("No se pudo generar la frase del día (no existe carrusel para esa fecha).");
          return;
        }
        const createdJson = (await created.json().catch(() => ({}))) as {
          carousel?: CarouselDetail;
        };
        if (!createdJson.carousel?.id) {
          setMsg("No se pudo generar la frase del día.");
          return;
        }
        carouselId = createdJson.carousel.id;
        setDetail(createdJson.carousel);
        await loadList();
      }

      const res = await fetch(
        `/api/marketing/carousel/${carouselId}/phrase-image`,
        { method: "POST" }
      );
      if (!res.ok) {
        setMsg("No se pudo generar la imagen de la frase del día.");
        return;
      }
      const img = await fetch(
        `/generated/marketing/${carouselId}/frase-del-dia.png`,
        { credentials: "include" }
      );
      if (!img.ok) {
        setMsg("La imagen se generó pero no se pudo descargar.");
        return;
      }
      const blob = await img.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fdbienestar-frase-del-dia-${forDate}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setPhraseImageUrl(
        `/generated/marketing/${carouselId}/frase-del-dia.png?t=${Date.now()}`
      );
      setMsg(
        "Imagen lista. Revisa, aprueba y publica si la vas a usar como post individual."
      );
      setTimeout(() => setMsg(null), 5000);
      if (carouselId) await loadDetail(carouselId);
      await loadList();
    } finally {
      setGeneratingPhrase(false);
    }
  }

  async function approvePhraseForPublish() {
    if (!detail) return;
    setApprovingPhrase(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/marketing/carousel/${detail.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "approve_phrase" }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        carousel?: CarouselDetail;
      };
      if (!res.ok) {
        setMsg(json.error ?? "No se pudo aprobar la imagen.");
        return;
      }
      if (json.carousel) setDetail(json.carousel);
      await loadList();
      setMsg("Imagen aprobada. Ya puedes publicarla en Instagram.");
      setTimeout(() => setMsg(null), 3500);
    } finally {
      setApprovingPhrase(false);
    }
  }

  async function approveForPublish() {
    if (!detail) return;
    setApproving(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/marketing/carousel/${detail.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        carousel?: CarouselDetail;
      };
      if (!res.ok) {
        setMsg(json.error ?? "No se pudo aprobar.");
        return;
      }
      if (json.carousel) setDetail(json.carousel);
      await loadList();
      setMsg("Carrusel aprobado. Ya puedes publicar en Instagram.");
      setTimeout(() => setMsg(null), 3500);
    } finally {
      setApproving(false);
    }
  }

  async function publishToInstagram() {
    if (!detail) return;
    setPublishing(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/marketing/carousel/${detail.id}/instagram/publish`,
        { method: "POST" }
      );
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setMsg(json.error ?? "Error al publicar.");
        await loadDetail(detail.id);
        await loadList();
        return;
      }
      await loadDetail(detail.id);
      await loadList();
      setMsg("Publicado en Instagram.");
      setTimeout(() => setMsg(null), 3500);
    } finally {
      setPublishing(false);
    }
  }

  async function publishPhraseToInstagram() {
    if (!detail) return;
    setPublishingPhrase(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/marketing/carousel/${detail.id}/instagram/publish-phrase`,
        { method: "POST" }
      );
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg(json.error ?? "Error al publicar la imagen.");
        await loadDetail(detail.id);
        await loadList();
        return;
      }
      await loadDetail(detail.id);
      await loadList();
      setMsg("Imagen publicada en Instagram.");
      setTimeout(() => setMsg(null), 3500);
    } finally {
      setPublishingPhrase(false);
    }
  }

  function copyCaption() {
    if (!detail?.slides) return;
    const text = buildInstagramCaption(detail.slides);
    void navigator.clipboard.writeText(text).then(() => {
      setMsg("Leyenda copiada al portapapeles.");
      setTimeout(() => setMsg(null), 2500);
    });
  }

  const captionPreview = useMemo(() => {
    if (!detail?.slides?.length) return "";
    return buildInstagramCaption(detail.slides);
  }, [detail]);

  async function openDayFromWeek(key: string) {
    setForDate(key);
    const found = list.find((c) => c.forDate === key);
    if (found) await loadDetail(found.id);
  }

  const status = detail?.instagramPublishStatus ?? "NOT_GENERATED";
  const phraseStatus = detail?.phrasePublishStatus ?? "NOT_GENERATED";

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Instagram
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Cuenta visible:{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              @{account.handle.replace(/^@/, "")}
            </span>{" "}
            <span className="text-xs text-zinc-500">
              (<code className="rounded bg-zinc-100 px-1 dark:bg-white/10">NEXT_PUBLIC_INSTAGRAM_HANDLE</code>)
            </span>
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Para publicar desde esta app hace falta el ID de cuenta de Instagram
            (Business/Creator) y un token de acceso de la API de Meta. En
            producción define también{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-white/10">APP_BASE_URL</code>{" "}
            con tu URL HTTPS pública (Instagram debe poder descargar las PNG).
          </p>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Cuenta para publicar (API)
          </div>
          <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Instagram Business Account ID
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black"
            value={igBusinessId}
            onChange={(e) => setIgBusinessId(e.target.value)}
            placeholder="p. ej. 17841400…"
            autoComplete="off"
          />
          <label className="mt-3 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Token de acceso
          </label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black"
            value={igToken}
            onChange={(e) => setIgToken(e.target.value)}
            placeholder={
              igHasToken
                ? "Dejar vacío para no cambiar el guardado"
                : "Pegar token de larga duración"
            }
            autoComplete="off"
          />
          <p className="mt-2 text-[11px] text-zinc-500">
            {igHasToken ? "Hay un token guardado." : "Sin token en la base de datos."}{" "}
            {igEnvFallback
              ? "Además hay credenciales en variables de entorno."
              : null}
          </p>
          <button
            type="button"
            disabled={savingIg}
            onClick={() => void saveInstagramConfig()}
            className="mt-3 w-full rounded-xl border border-black/15 bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 dark:border-white/15 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {savingIg ? "Guardando…" : "Guardar configuración"}
          </button>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Esta semana
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">
            {datesByWeek.map((key, i) => {
              const has = existingDates.has(key);
              const active = forDate === key;
              return (
                <button
                  key={key}
                  type="button"
                  title={key}
                  onClick={() => void openDayFromWeek(key)}
                  className={[
                    "flex flex-col rounded-lg py-2",
                    active
                      ? "bg-emerald-700 text-white"
                      : has
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-white/10 dark:text-zinc-300",
                  ].join(" ")}
                >
                  <span className="text-[10px] font-medium opacity-80">
                    {WEEKDAY_ES[i]}
                  </span>
                  <span className="font-semibold">{key.slice(8)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Fecha del carrusel
          </label>
          <input
            type="date"
            className="mt-2 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-black"
            value={forDate}
            onChange={(e) => setForDate(e.target.value)}
          />
          <button
            type="button"
            disabled={generating}
            onClick={() => void handleGenerateCarouselAndImages()}
            className="mt-3 w-full rounded-xl bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {generating || generatingImages ? "Generando…" : "Generar carrusel"}
          </button>
          <button
            type="button"
            disabled={generatingPhrase}
            onClick={() => void generatePhraseImage()}
            className="mt-2 w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-white/15 dark:bg-black dark:text-zinc-100 dark:hover:bg-white/5"
          >
            {generatingPhrase ? "Generando…" : "Generar frase del día"}
          </button>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Historial
          </div>
          {loadingList ? (
            <p className="mt-2 text-sm text-zinc-500">Cargando…</p>
          ) : list.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">Aún no hay carruseles.</p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
              {list.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => void loadDetail(c.id)}
                    className={`w-full rounded-lg px-2 py-2 text-left hover:bg-zinc-100 dark:hover:bg-white/10 ${detail?.id === c.id ? "bg-zinc-100 dark:bg-white/10" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{c.forDate}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadgeClass(c.instagramPublishStatus)}`}
                      >
                        {STATUS_LABEL[c.instagramPublishStatus] ??
                          c.instagramPublishStatus}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {c.slideCount} diapositivas
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <section className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight">
          Carrusel diario — FD Bienestar
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Siete diapositivas basadas en los módulos de la plataforma, más una
          imagen opcional de <strong>frase del día</strong> que enlaza los tres
          pilares (emocional, financiero y alimentario) del mismo día. Descarga
          las imágenes, revisa, aprueba y publica cuando corresponda.
        </p>

        {msg ? (
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">
            {msg}
          </p>
        ) : null}

        {loadingDetail ? (
          <p className="mt-8 text-sm text-zinc-500">Cargando vista previa…</p>
        ) : !detail ? (
          <p className="mt-8 text-sm text-zinc-500">
            Genera un carrusel o elige una fecha del historial.
          </p>
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {detail.title}
                  </span>
                  {detail.emotionalThemeIndex != null &&
                  detail.financialThemeIndex != null &&
                  detail.nutritionThemeIndex != null ? (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      Módulos: emocional{" "}
                      {formatThemePosition(
                        "emotional",
                        detail.emotionalThemeIndex
                      )}{" "}
                      · financiero{" "}
                      {formatThemePosition(
                        "financial",
                        detail.financialThemeIndex
                      )}{" "}
                      · alimentación{" "}
                      {formatThemePosition(
                        "nutrition",
                        detail.nutritionThemeIndex
                      )}
                    </div>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(status)}`}
                    >
                      {STATUS_LABEL[status] ?? status}
                    </span>
                    {detail.publishedAt ? (
                      <span className="text-xs text-zinc-500">
                        Publicado:{" "}
                        {new Date(detail.publishedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  {detail.instagramPublishError ? (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100">
                      {detail.instagramPublishError}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={downloadingImages}
                    onClick={() => void downloadImages()}
                    className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  >
                    {downloadingImages
                      ? "Generando y descargando…"
                      : "Descargar imágenes"}
                  </button>
                  <button
                    type="button"
                    disabled={approving || status !== "PENDING_APPROVAL"}
                    onClick={() => void approveForPublish()}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-40 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
                  >
                    {approving ? "…" : "Aprobar para Instagram"}
                  </button>
                  <button
                    type="button"
                    disabled={
                      publishing ||
                      status === "PUBLISHED" ||
                      status === "NOT_GENERATED" ||
                      status === "PENDING_APPROVAL" ||
                      (status !== "APPROVED" && status !== "PUBLISH_FAILED")
                    }
                    onClick={() => void publishToInstagram()}
                    className="rounded-xl border border-pink-400 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
                  >
                    {publishing ? "Publicando…" : "Publicar en Instagram"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Imagen individual (post)
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(phraseStatus)}`}
                    >
                      {STATUS_LABEL[phraseStatus] ?? phraseStatus}
                    </span>
                    {detail.phrasePublishedAt ? (
                      <span className="text-xs text-zinc-500">
                        Publicada:{" "}
                        {new Date(detail.phrasePublishedAt).toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                  {detail.phrasePublishError ? (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-100">
                      {detail.phrasePublishError}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={
                      approvingPhrase ||
                      phraseStatus !== "PENDING_APPROVAL"
                    }
                    onClick={() => void approvePhraseForPublish()}
                    className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-40 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
                  >
                    {approvingPhrase ? "…" : "Aprobar imagen"}
                  </button>
                  <button
                    type="button"
                    disabled={
                      publishingPhrase ||
                      phraseStatus === "PUBLISHED" ||
                      phraseStatus === "NOT_GENERATED" ||
                      phraseStatus === "PENDING_APPROVAL" ||
                      (phraseStatus !== "APPROVED" &&
                        phraseStatus !== "PUBLISH_FAILED")
                    }
                    onClick={() => void publishPhraseToInstagram()}
                    className="rounded-xl border border-pink-400 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
                  >
                    {publishingPhrase ? "Publicando…" : "Publicar imagen"}
                  </button>
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                Flujo: genera «Frase del día (PNG)», revisa el preview, aprueba y
                publica como post individual.
              </p>
            </div>

            {activePreview === "carousel" && carouselImages.length ? (
              <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  Imágenes generadas (preview)
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {carouselImages.map((img) => (
                    <a
                      key={img.order}
                      href={img.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group overflow-hidden rounded-xl border border-black/10 bg-white dark:border-white/10 dark:bg-black"
                      title={`Slide ${img.order}`}
                    >
                      <img
                        src={img.url}
                        alt={`Slide ${img.order}`}
                        className="h-auto w-full object-cover transition group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                      <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300">
                        <span className="font-semibold">Slide {img.order}</span>
                        <span className="underline underline-offset-4">
                          Abrir
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {activePreview === "phrase" ? (
              <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-950">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Frase del día (preview)
                  </div>
                  <a
                    className="text-sm font-semibold text-zinc-700 underline underline-offset-4 dark:text-zinc-300"
                    href={phraseImageUrl ?? `/generated/marketing/${detail.id}/frase-del-dia.png`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir
                  </a>
                </div>
                <div className="mt-4 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                  <img
                    src={
                      phraseImageUrl ??
                      `/generated/marketing/${detail.id}/frase-del-dia.png`
                    }
                    alt="Frase del día"
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
