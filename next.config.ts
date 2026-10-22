import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully client-side app: build plain static files into out/, no server
  output: "export",
};

export default nextConfig;
