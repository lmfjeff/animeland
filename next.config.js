/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/",
        destination: "/anime",
      },
    ]
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
