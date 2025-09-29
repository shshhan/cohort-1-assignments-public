import { config as loadEnv } from "@dotenvx/dotenvx";
import { existsSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const emptyModulePath = path.join(process.cwd(), "src/shims/empty-module.ts");

if (process.env.NODE_ENV !== "development") {
  const envFiles = [".env.production.local", ".env.production"];
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (existsSync(filePath)) {
      loadEnv({ path: filePath, override: true });
    }
  }
}

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      '@react-native-async-storage/async-storage': emptyModulePath,
      'pino-pretty': emptyModulePath,
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': emptyModulePath,
      'pino-pretty': emptyModulePath,
    };
    return config;
  },
};

export default nextConfig;

// Added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`.
// Ensure the dev helper only runs when the dev server boots.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
