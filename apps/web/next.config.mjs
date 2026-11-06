/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://127.0.0.1:4000/api/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/:path*`
          : 'http://127.0.0.1:4000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
