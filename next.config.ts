import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["onnxruntime-node", "xlsx", "csv-parser"],
};

export default nextConfig;
