import type { MonitoredService } from "@/lib/services";
import type { CheckResult } from "@/lib/monitorTypes";

export async function runHttpCheck(
  service: MonitoredService
): Promise<CheckResult> {
  const controller = new AbortController();
  const start = Date.now();
  const timeout = setTimeout(() => controller.abort(), service.timeoutMs);

  try {
    const res = await fetch(service.url, {
      method: service.method,
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });

    const latencyMs = Date.now() - start;
    const statusCode = res.status;
    const okStatus = statusCode === service.expectedStatus;

    if (!service.optionalKeyword) {
      return { ok: okStatus, statusCode, latencyMs, error: null };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/") && !contentType.includes("json")) {
      return {
        ok: false,
        statusCode,
        latencyMs,
        error: "Keyword check requires text response",
      };
    }

    const body = await res.text();
    const hasKeyword = body.includes(service.optionalKeyword);
    return {
      ok: okStatus && hasKeyword,
      statusCode,
      latencyMs,
      error: hasKeyword ? null : "Keyword not found",
    };
  } catch (e) {
    const latencyMs = Date.now() - start;
    const message =
      e instanceof Error ? e.message : "Unknown error while fetching";
    return {
      ok: false,
      statusCode: null,
      latencyMs,
      error: message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

