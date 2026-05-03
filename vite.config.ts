import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

const publicBasePath = process.env.VITE_PUBLIC_BASE_PATH?.trim();

export default defineConfig({
  base: publicBasePath !== undefined && publicBasePath.length > 0 ? publicBasePath : "./",
  plugins: [react(), tailwindcss()],
  build: {
    target: "esnext",
    outDir: "dist/web",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("react-aria-components")) {
            return "aria-vendor";
          }

          if (id.includes("react-router-dom") || id.includes("/react/") || id.includes("/react-dom/")) {
            return "react-vendor";
          }

          return undefined;
        },
      },
    },
  },
  lint: {
    ignorePatterns: [".direnv/**", "node_modules/**", "dist/**", "build/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: [".direnv/**", "node_modules/**", "dist/**", "build/**"],
    printWidth: 110,
  },
});
