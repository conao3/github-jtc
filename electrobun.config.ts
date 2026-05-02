import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "JTC GitHub",
    identifier: "jp.co.jtc.github-portal",
    version: "0.1.0",
    description: "A JTC-style GitHub frontend prototype.",
  },
  build: {
    bun: {
      entrypoint: "src/bun/index.ts",
    },
    copy: {
      "dist/web": "views/web",
    },
    linux: {
      bundleCEF: false,
    },
    mac: {
      bundleCEF: false,
    },
    win: {
      bundleCEF: false,
    },
  },
} satisfies ElectrobunConfig;
