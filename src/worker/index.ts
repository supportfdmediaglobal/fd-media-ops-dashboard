import "dotenv/config";
import { runMonitorOnce } from "@/worker/runOnce";

function parseIntervalSeconds(): number {
  const raw = process.env.MONITOR_INTERVAL_SECONDS ?? "60";
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 10) return 60;
  return Math.floor(n);
}

async function main() {
  const intervalSeconds = parseIntervalSeconds();
  // Run immediately, then on interval.
  await runMonitorOnce();

  setInterval(() => {
    runMonitorOnce().catch((e) => {
      // keep worker alive; logs go to container/stdout
      console.error("monitor run failed", e);
    });
  }, intervalSeconds * 1000);
}

main().catch((e) => {
  console.error("worker failed to start", e);
  process.exitCode = 1;
});

