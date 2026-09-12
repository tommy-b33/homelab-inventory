import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serializePartsCsv, validateParts } from "./partsCsv.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inventoryDir = path.join(rootDir, "inventory");
const buildsDir = path.join(rootDir, "builds");
const archiveDir = path.join(rootDir, "archive");
const partsCsvPath = path.join(inventoryDir, "parts.csv");

function readRequestBody(req: { on: (event: string, cb: (chunk?: Buffer) => void) => void }): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function dataServerPlugin(): Plugin {
  const attach = (middlewares: {
    use: (path: string, handler: (req: any, res: any, next: () => void) => void) => void;
  }) => {
    middlewares.use("/api/parts", async (req, res, next) => {
      if (req.method !== "POST") {
        next();
        return;
      }
      try {
        const raw = await readRequestBody(req);
        const parsed = JSON.parse(raw || "{}") as { parts?: unknown };
        const validated = validateParts(parsed.parts);
        if (!validated.ok) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: validated.error }));
          return;
        }
        const csv = serializePartsCsv(validated.parts);
        fs.writeFileSync(partsCsvPath, csv, "utf8");
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify({ ok: true, count: validated.parts.length }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error: err instanceof Error ? err.message : "Failed to save parts",
          }),
        );
      }
    });

    middlewares.use("/data/parts.csv", (_req, res) => {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      fs.createReadStream(partsCsvPath).pipe(res);
    });

    middlewares.use("/data/builds.json", (_req, res) => {
      const builds = fs
        .readdirSync(buildsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
        .filter((d) => fs.existsSync(path.join(buildsDir, d.name, "BUILD.md")))
        .map((d) => {
          const id = d.name;
          const metaPath = path.join(buildsDir, id, "meta.json");
          let meta: Record<string, string> = { name: id };
          if (fs.existsSync(metaPath)) {
            try {
              meta = { name: id, ...JSON.parse(fs.readFileSync(metaPath, "utf8")) };
            } catch {
              /* ignore bad meta */
            }
          }
          return { id, ...meta };
        })
        .sort((a, b) => String(a.name ?? a.id).localeCompare(String(b.name ?? b.id)));
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify(builds));
    });

    middlewares.use("/data/builds/", (req, res, next) => {
      const url = req.url ?? "";
      const rel = decodeURIComponent(url.replace(/^\/+/, ""));
      const file = path.normalize(path.join(buildsDir, rel));
      if (!file.startsWith(buildsDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        next();
        return;
      }
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      fs.createReadStream(file).pipe(res);
    });

    middlewares.use("/data/archive/", (req, res, next) => {
      const url = req.url ?? "";
      const rel = decodeURIComponent(url.replace(/^\/+/, ""));
      const file = path.normalize(path.join(archiveDir, rel));
      if (!file.startsWith(archiveDir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        next();
        return;
      }
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      fs.createReadStream(file).pipe(res);
    });
  };

  return {
    name: "homelab-data-server",
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
    closeBundle() {
      const outData = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist/data");
      fs.mkdirSync(path.join(outData, "builds"), { recursive: true });
      fs.copyFileSync(path.join(inventoryDir, "parts.csv"), path.join(outData, "parts.csv"));
      const dirs = fs
        .readdirSync(buildsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
        .filter((d) => fs.existsSync(path.join(buildsDir, d.name, "BUILD.md")));
      const builds = dirs.map((d) => {
        const id = d.name;
        const metaPath = path.join(buildsDir, id, "meta.json");
        let meta: Record<string, string> = { name: id };
        if (fs.existsSync(metaPath)) {
          try {
            meta = { name: id, ...JSON.parse(fs.readFileSync(metaPath, "utf8")) };
          } catch {
            /* ignore */
          }
        }
        return { id, ...meta };
      });
      fs.writeFileSync(path.join(outData, "builds.json"), JSON.stringify(builds));
      for (const b of builds) {
        const src = path.join(buildsDir, b.id);
        const dest = path.join(outData, "builds", b.id);
        fs.mkdirSync(dest, { recursive: true });
        for (const f of fs.readdirSync(src)) {
          if (f.endsWith(".md") || f === "meta.json") {
            fs.copyFileSync(path.join(src, f), path.join(dest, f));
          }
        }
      }
      if (fs.existsSync(archiveDir)) {
        const archiveOut = path.join(outData, "archive");
        fs.mkdirSync(archiveOut, { recursive: true });
        for (const f of fs.readdirSync(archiveDir)) {
          if (f.endsWith(".md")) {
            fs.copyFileSync(path.join(archiveDir, f), path.join(archiveOut, f));
          }
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), dataServerPlugin()],
  server: {
    port: 5173,
    fs: { allow: [rootDir] },
  },
});
