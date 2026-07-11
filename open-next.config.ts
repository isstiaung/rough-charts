import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  // npm run build invokes opennextjs-cloudflare build, so OpenNext must not
  // call npm run build itself (infinite recursion) — build Next directly
  buildCommand: "npx next build",
};
