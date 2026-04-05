/** Clave estable para URLs y API (minúsculas, guiones, sin espacios). */
export function slugifyServiceKey(input: string): string {
  const s = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return s || "servicio";
}
