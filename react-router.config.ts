import type { Config } from "@react-router/dev/config";

// Cloudflare Pages serves the client application as static assets.
// Dynamic, persistent operations live in Pages Functions.
export default {
  ssr: false,
} satisfies Config;
