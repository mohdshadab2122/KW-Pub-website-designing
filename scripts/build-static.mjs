import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "dist", "client");

const copyIntoOutput = (from, to = from) => {
  const source = path.join(root, from);
  if (!existsSync(source)) return;

  cpSync(source, path.join(outputDir, to), {
    recursive: true,
    force: true,
    filter: (sourcePath) => path.basename(sourcePath) !== ".DS_Store",
  });
};

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

copyIntoOutput("public", ".");
copyIntoOutput("assets", "assets");

for (const file of ["index.html", "styles.css", "script.js", "index.json"]) {
  copyIntoOutput(file);
}

console.log(`Static site copied to ${path.relative(root, outputDir)}`);
