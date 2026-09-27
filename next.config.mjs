/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Static export for GitHub Pages (repo subpath). Remove basePath for root/Vercel deploys.
  output: 'export',
  basePath: '/github-diff-preview',
}

export default nextConfig