/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' }
];
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // {
      //   source: '/:all*(js|css|png|jpg|jpeg|gif|svg|webp|avif|ico|woff|woff2)',
      //   headers: [
      //     { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      //     { key: 'CDN-Cache-Control', value: 'public, max-age=31536000, immutable' },
      //     { key: 'Vercel-CDN-Cache-Control', value: 'public, max-age=31536000, immutable' },
      //   ],
      // },
    ];
  },
  images: {
    formats: ['image/webp'],
    deviceSizes: [360, 414, 768, 1024, 1280],
    imageSizes: [16, 24, 32, 64, 128, 256],
    minimumCacheTTL: 2678400, // 31 天
    remotePatterns: [],
  },
};

export default nextConfig;
