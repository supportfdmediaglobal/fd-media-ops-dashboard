export type MonitoredService = {
  id: string;
  name: string;
  url: string;
  method: "GET" | "HEAD";
  expectedStatus: number;
  timeoutMs: number;
  optionalKeyword?: string;
};

export const DEFAULT_SERVICES: MonitoredService[] = [
  {
    id: "bienestar",
    name: "FD Bienestar",
    url: "https://bienestar.fdmediaglobal.cloud/",
    method: "GET",
    expectedStatus: 200,
    timeoutMs: 10_000,
  },
  {
    id: "aiteacher",
    name: "Virtual Teacher (Login)",
    url: "https://aiteacher.fdmediaglobal.cloud/login",
    method: "GET",
    expectedStatus: 200,
    timeoutMs: 10_000,
  },
];

