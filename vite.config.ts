/// <reference types="vitest" />
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { installGlobals } from "@remix-run/node";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  plugins: [
    !process.env.VITEST &&
      remix({
        ignoredRouteFiles: ["**/.*"],
      }),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
  },
  test: {
    includeSource: ["app/**/*.ts"],
  },
});
