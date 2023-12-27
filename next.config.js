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
}

module.exports = nextConfig
