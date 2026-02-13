import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["esm"],
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  splitting: false,
  dts: false,
  banner: {
    // Required for ESM compatibility with some packages
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});
