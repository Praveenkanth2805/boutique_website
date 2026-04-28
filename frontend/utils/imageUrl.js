const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22 viewBox=%220 0 800 400%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f8c8dc%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23333%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';

export const getFullImageUrl = (url) => {
  // Return the fallback if there's no URL
  if (!url) return FALLBACK_IMAGE;

  // If the URL is already absolute, return it as is. This fixes the double https issue!
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // For relative paths (like those from your database that start with '/uploads/'), 
  // build the full URL for local development.
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:5000${url}`;
  }

  // For production, use your backend's host environment variable.
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_HOST;
  if (!backendBase) return FALLBACK_IMAGE;
  return `https://${backendBase}${url}`;
};