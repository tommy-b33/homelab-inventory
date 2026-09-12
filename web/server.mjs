import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serializePartsCsv, validateParts } from "./partsCsv.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataRoot = path.resolve(process.env.DATA_ROOT || path.join(__dirname, ".."));
const distDir = path.resolve(process.env.DIST_DIR || path.join(__dirname, "dist"));
const port = Number(process.env.PORT || 8788);

const inventoryDir = path.join(dataRoot, "inventory");
const buildsDir = path.join(dataRoot, "builds");
const archiveDir = path.join(dataRoot, "archive");
const partsCsvPath = path.join(inventoryDir, "parts.csv");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json; charset=utf-8",
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function sendFile(res, filePath, contentType, cache = "no-store") {
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": cache,
  });
  fs.createReadStream(filePath).pipe(res);
}

function safeJoin(root, rel) {
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root)) return null;
  return file;
}

function listBuilds() {
  return fs
    .readdirSync(buildsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .filter((d) => fs.existsSync(path.join(buildsDir, d.name, "BUILD.md")))
    .map((d) => {
      const id = d.name;
      const metaPath = path.join(buildsDir, id, "meta.json");
      let meta = { name: id };
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
}

function isStaticAsset(urlPath) {
  return path.extname(urlPath) !== "" && !urlPath.endsWith(".md");
}

async function handleApi(req, res, url) {
  if (url.pathname === "/api/parts") {
    if (req.method !== "POST") {
      res.writeHead(405, { Allow: "POST" });
      res.end();
      return true;
    }
    try {
      const raw = await readBody(req);
      const parsed = JSON.parse(raw || "{}");
      const validated = validateParts(parsed.parts);
      if (!validated.ok) {
        sendJson(res, 400, { error: validated.error });
        return true;
      }
      fs.mkdirSync(inventoryDir, { recursive: true });
      fs.writeFileSync(partsCsvPath, serializePartsCsv(validated.parts), "utf8");
      sendJson(res, 200, { ok: true, count: validated.parts.length });
    } catch (err) {
      sendJson(res, 500, {
        error: err instanceof Error ? err.message : "Failed to save parts",
      });
    }
    return true;
  }

  if (url.pathname === "/data/parts.csv") {
    if (!fs.existsSync(partsCsvPath)) {
      sendJson(res, 404, { error: "parts.csv not found" });
      return true;
    }
    sendFile(res, partsCsvPath, "text/csv; charset=utf-8");
    return true;
  }

  if (url.pathname === "/data/builds.json") {
    try {
      sendJson(res, 200, listBuilds());
    } catch (err) {
      sendJson(res, 500, {
        error: err instanceof Error ? err.message : "Failed to list builds",
      });
    }
    return true;
  }

  if (url.pathname.startsWith("/data/builds/")) {
    const rel = decodeURIComponent(url.pathname.slice("/data/builds/".length));
    const file = safeJoin(buildsDir, rel);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return true;
    }
    sendFile(res, file, "text/markdown; charset=utf-8");
    return true;
  }

  if (url.pathname.startsWith("/data/archive/")) {
    const rel = decodeURIComponent(url.pathname.slice("/data/archive/".length));
    const file = safeJoin(archiveDir, rel);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return true;
    }
    sendFile(res, file, "text/markdown; charset=utf-8");
    return true;
  }

  return false;
}

function serveStatic(res, urlPath) {
  const rel = urlPath === "/" ? "/index.html" : urlPath;
  const file = safeJoin(distDir, decodeURIComponent(rel));
  if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
    const ext = path.extname(file).toLowerCase();
    sendFile(res, file, MIME[ext] || "application/octet-stream", ext === ".html" ? "no-store" : "public, max-age=86400");
    return true;
  }
  return false;
}

function serveSpa(res) {
  const index = path.join(distDir, "index.html");
  if (!fs.existsSync(index)) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Missing web/dist — run npm run build");
    return;
  }
  sendFile(res, index, "text/html; charset=utf-8");
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
    if (await handleApi(req, res, url)) return;

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }

    if (serveStatic(res, url.pathname)) return;

    // SPA routes (/builds/..., /archive/..., /inventory) — no file extension
    if (!isStaticAsset(url.pathname)) {
      serveSpa(res);
      return;
    }

    res.writeHead(404);
    res.end("Not found");
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end("Internal Server Error");
    }
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`homelab-inventory listening on http://0.0.0.0:${port}`);
  console.log(`DATA_ROOT=${dataRoot}`);
  console.log(`DIST_DIR=${distDir}`);
});
