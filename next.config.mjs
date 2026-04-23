/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      }
    ],
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/account',
        permanent: true,
      },
      {
        source: '/dashboard/:path*',
        destination: '/account/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
