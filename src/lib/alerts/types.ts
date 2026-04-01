export type AlertEvent =
  | {
      type: "incident_opened";
      serviceKey: string;
      serviceName: string;
      url: string;
      startedAt: string;
      lastError?: string | null;
    }
  | {
      type: "incident_resolved";
      serviceKey: string;
      serviceName: string;
      url: string;
      startedAt: string;
      resolvedAt: string;
      durationMs: number;
    }
  | {
      type: "latency_high";
      serviceKey: string;
      serviceName: string;
      url: string;
      checkedAt: string;
      latencyMs: number;
      thresholdMs: number;
    };

export type AlertSink = {
  name: string;
  send: (event: AlertEvent) => Promise<void>;
};

