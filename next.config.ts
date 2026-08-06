import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["onnxruntime-node", "exceljs", "csv-parser"],
};

export default nextConfig;
