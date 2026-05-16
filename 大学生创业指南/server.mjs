import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 5173);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const target = join(root, safePath === "/" ? "index.html" : safePath);
  if (!target.startsWith(root)) {
    return join(root, "index.html");
  }
  if (existsSync(target) && statSync(target).isDirectory()) {
    return join(target, "index.html");
  }
  return target;
}

const server = createServer((req, res) => {
  const target = resolvePath(req.url || "/");
  if (!existsSync(target)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, {
    "Content-Type": types[extname(target)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(target).pipe(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`大学生创业指南已启动：http://localhost:${port}/`);
});
