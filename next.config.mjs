/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560],
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
