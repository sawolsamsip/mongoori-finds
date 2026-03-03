/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // 내부 IP로 mongoori.com / www.mongoori.com 접속 시 dev에서 허용
  allowedDevOrigins: ['mongoori.com', 'www.mongoori.com'],
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
