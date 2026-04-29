/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // 👇 Production / Supabase Storage (always active)
      {
        protocol: 'https',
        hostname: '**.supabase.co',     // matches any Supabase project
        port: '',
        pathname: '/storage/v1/object/public/**',
      },

      // 👇 Local development (if you ever need local images, uncomment this block)
      // {
      //   protocol: 'http',
      //   hostname: 'localhost',
      //   port: '5000',
      //   pathname: '/uploads/**',
      // },
    ],
  },
};

module.exports = nextConfig;