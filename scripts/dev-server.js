import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 3000);

dotenv.config({ path: join(projectRoot, ".env.local") });
dotenv.config({ path: join(projectRoot, ".env") });

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function sendJson(response, statusCode, body) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
}

async function readJsonBody(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("Request body is too large.");
  }
  return raw ? JSON.parse(raw) : {};
}

function serveStatic(response, pathname) {
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = normalize(join(projectRoot, relativePath));

  if (!filePath.startsWith(projectRoot) || !existsSync(filePath) || !statSync(filePath).isFile()) {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  response.statusCode = 200;
  response.setHeader("Content-Type", mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream");
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    if (url.pathname === "/api/chat") {
      request.body = await readJsonBody(request);
      response.status = (statusCode) => {
        response.statusCode = statusCode;
        return response;
      };
      response.json = (body) => sendJson(response, response.statusCode || 200, body);

      const { default: chatHandler } = await import("../api/chat.js");
      await chatHandler(request, response);
      return;
    }

    serveStatic(response, decodeURIComponent(url.pathname));
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Local development server error." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Portfolio running at http://127.0.0.1:${port}`);
});
