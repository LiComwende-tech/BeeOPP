import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}
