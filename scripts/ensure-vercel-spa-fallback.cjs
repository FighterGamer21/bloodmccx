const fs = require("node:fs");
const path = require("node:path");

const clientDir = path.join(process.cwd(), "dist", "client");
const shellPath = path.join(clientDir, "_shell.html");
const indexPath = path.join(clientDir, "index.html");
const notFoundPath = path.join(clientDir, "404.html");

if (!fs.existsSync(clientDir)) {
  throw new Error(`Vercel client output was not found: ${clientDir}`);
}

if (!fs.existsSync(indexPath)) {
  if (!fs.existsSync(shellPath)) {
    throw new Error(
      "No index.html or _shell.html was generated in dist/client. Check the TanStack Start SPA build output.",
    );
  }

  fs.copyFileSync(shellPath, indexPath);
  console.log("Created dist/client/index.html from TanStack SPA shell.");
}

if (!fs.existsSync(notFoundPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log("Created dist/client/404.html for static host fallbacks.");
}
