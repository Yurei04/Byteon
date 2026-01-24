/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    inlineCss: true, 
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: 'https',
        hostname: 'qplfokkxzudeaeyrzvhs.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ]
  }
};

export default nextConfig;