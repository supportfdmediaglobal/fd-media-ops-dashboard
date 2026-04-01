import type { AlertSink } from "@/lib/alerts/types";

export const NoopAlertSink: AlertSink = {
  name: "noop",
  async send() {
    // Intentionally disabled by default.
  },
};

