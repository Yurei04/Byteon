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
    ]
  }
  
};

export default nextConfig;
