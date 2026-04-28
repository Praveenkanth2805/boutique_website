const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const supabaseStorageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL;

const backendHostname = backendUrl
  ?.replace('https://', '')
  ?.replace('http://', '');

const supabaseHostname = supabaseStorageUrl
  ?.replace('https://', '')
  ?.replace('http://', '')
  ?.split('/')[0]; // IMPORTANT

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: backendHostname || 'your-backend.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: supabaseHostname || 'abc123.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;