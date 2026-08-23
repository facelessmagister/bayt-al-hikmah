/** @type {import('next').NextConfig} */
const nextConfig = {
  // Switched from static export to SSR for auth + API routes
  // Static pages (books, chapters) are still pre-rendered at build time
  output: undefined, // default: SSR with automatic static optimization
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

module.exports = nextConfig;
