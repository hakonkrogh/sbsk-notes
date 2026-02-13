import type { NextConfig } from "next"

const config: NextConfig = {
  transpilePackages: ["@sbsk-notes/core", "@sbsk-notes/parser"],
}

export default config
