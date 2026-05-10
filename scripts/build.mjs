import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://ccb:ccb@localhost:5432/ccb_network?schema=public",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "build-time-placeholder-change-in-production",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING || "1"
};

function run(cmd, args, { optional = false } = {}) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", env });
  if (result.status !== 0) {
    if (optional && process.env.PRISMA_GENERATE_STRICT !== "1") {
      console.warn(`Optional step skipped: ${cmd} ${args.join(" ")}. Run it again when Prisma engine downloads are available.`);
      return;
    }
    process.exit(result.status ?? 1);
  }
}

run("prisma", ["generate"], { optional: true });
run("next", ["build"]);
