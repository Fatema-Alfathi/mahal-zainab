import type { NextConfig } from "next";

const repoName = "mahal-zainab";
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPages ? { output: "export" as const, basePath: `/${repoName}` } : {}),
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
