/**
 * Build versi static export untuk GitHub Pages.
 * - Menyembunyikan route handler /api (Pages hanya statis)
 * - Set env STATIC_EXPORT=1 -> next.config memakai output:"export" + basePath
 * - Hasil di folder out/ (plus .nojekyll)
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";

const REPO = process.env.GH_REPO_NAME || "rizqinastore";
const projectRoot = process.cwd();
const apiDir = path.join(projectRoot, "src", "app", "api");
const apiBackup = path.join(projectRoot, ".api-backup-static-build");

// 1) Pindahkan API routes keluar dari build
if (existsSync(apiDir)) {
  rmSync(apiBackup, { recursive: true, force: true });
  renameSync(apiDir, apiBackup);
  console.log("→ API routes dipindah sementara untuk static export");
}

try {
  // 2) Build static export
  execSync("npx --yes next build", {
    stdio: "inherit",
    env: {
      ...process.env,
      STATIC_EXPORT: "1",
      GH_REPO_NAME: REPO,
      NEXT_TELEMETRY_DISABLED: "1",
    },
  });
} finally {
  // 3) Kembalikan API routes apapun yang terjadi
  if (existsSync(apiBackup)) {
    renameSync(apiBackup, apiDir);
    console.log("→ API routes dikembalikan");
  }
}

// 4) .nojekyll agar file underscore-Next tidak diabaikan Jekyll
const outDir = path.join(projectRoot, "out");
if (!existsSync(outDir)) {
  console.error("✗ folder out/ tidak ditemukan — build export gagal");
  process.exit(1);
}
writeFileSync(path.join(outDir, ".nojekyll"), "");
mkdirSync(outDir, { recursive: true });
console.log("✓ Static export siap di out/ (basePath: /" + REPO + ")");
