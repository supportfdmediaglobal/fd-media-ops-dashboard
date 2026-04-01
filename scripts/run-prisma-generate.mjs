import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const prismaCli = path.join(root, "node_modules", "prisma", "build", "index.js");

function findPortableNode20() {
  const base = path.join(root, ".tools", "node-v20");
  if (!fs.existsSync(base)) return null;
  for (const name of fs.readdirSync(base)) {
    const exe = path.join(base, name, "node.exe");
    if (fs.existsSync(exe)) return exe;
  }
  return null;
}

const major = Number(process.versions.node.split(".")[0]);
const portable = process.platform === "win32" ? findPortableNode20() : null;
const node =
  major >= 24 && portable ? portable : process.execPath;

const result = spawnSync(node, [prismaCli, "generate", ...process.argv.slice(2)], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});
process.exit(result.status ?? 1);
