import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next does not get confused by
  // sibling lockfiles (e.g. per-phase worktrees under .worktrees/).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
