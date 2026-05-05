export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ;
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/login/', '/register/', '/verify-otp/']
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}