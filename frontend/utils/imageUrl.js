const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22 viewBox=%220 0 800 400%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f8c8dc%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23333%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';

export const getFullImageUrl = (url) => {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith('http')) return url;
  // Backend serves images from http://localhost:5000/uploads/...
  const backendBase = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
  return `${backendBase}${url}`;
};