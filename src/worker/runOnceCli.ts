import "dotenv/config";
import { runMonitorOnce } from "@/worker/runOnce";

runMonitorOnce()
  .then(() => {
    console.log("[monitor] runMonitorOnce completed");
    process.exit(0);
  })
  .catch((e) => {
    console.error("[monitor] failed", e);
    process.exit(1);
  });
