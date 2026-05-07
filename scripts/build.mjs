import { spawnSync } from "node:child_process";
const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://ccb:ccb@localhost:5432/ccb_network?schema=public",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "build-time-placeholder-change-in-production",
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000"
};
for (const [cmd, args] of [["prisma", ["generate"]], ["next", ["build"]]]) {
  const result = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
