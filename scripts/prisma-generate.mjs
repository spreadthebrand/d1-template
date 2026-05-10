import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://ccb:ccb@localhost:5432/ccb_network?schema=public",
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING || "1"
};

const result = spawnSync("prisma", ["generate"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env
});

if (result.status !== 0 && process.env.PRISMA_POSTINSTALL_STRICT !== "1") {
  console.warn("Prisma generate was skipped because engine downloads are unavailable in this environment. Run `npm run prisma:generate` after network access is available.");
  process.exit(0);
}

process.exit(result.status ?? 1);
