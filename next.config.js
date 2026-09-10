/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Evita che webpack bundli undici (private fields #) usato da @vercel/blob.
  experimental: {
    serverComponentsExternalPackages: ['@vercel/blob', 'undici'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
