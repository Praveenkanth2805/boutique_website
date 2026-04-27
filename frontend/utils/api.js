import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.response.use((response) => {
  const backendBase = process.env.NEXT_PUBLIC_API_URL.replace('/api', '');
  const transformImages = (obj) => {
    if (obj && typeof obj === 'object') {
      if (obj.imageUrl && typeof obj.imageUrl === 'string' && !obj.imageUrl.startsWith('http')) {
        obj.imageUrl = `${backendBase}${obj.imageUrl}`;
      }
      Object.values(obj).forEach(val => transformImages(val));
    }
  };
  transformImages(response.data);
  return response;
});

export default api;