import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://ccb:ccb@localhost:5432/ccb_network?schema=public"
};

const result = spawnSync("prisma", ["generate"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env
});

process.exit(result.status ?? 1);
