export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';
  
  // Static pages
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];
  
  // Dynamic services & designs
  let serviceRoutes = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`);
    const services = await res.json();
    serviceRoutes = services.map(service => ({
      url: `${baseUrl}/services/${service.id}`,
      lastModified: new Date(service.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (err) {
    console.error('Sitemap fetch error:', err);
  }
  
  return [...staticRoutes, ...serviceRoutes];
}