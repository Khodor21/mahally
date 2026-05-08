/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<subdomain>[^.]+)\\.yoursaas\\.com',
          },
        ],
        destination: '/store/:path*',
      },
    ]
  },
}

module.exports = nextConfig
