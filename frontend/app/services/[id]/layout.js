import { getFullImageUrl } from '@/utils/imageUrl';
import ServiceGalleryClient from './ServiceGalleryClient';

export async function generateMetadata({ params }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kaviyaboutique.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${apiUrl}/services/${params.id}`);
  const service = await res.json();
  const firstDesign = service.designs?.[0];
  const priceText = firstDesign ? ` – ₹${firstDesign.price}` : '';
  const title = `${service.title}${priceText} | ${process.env.NEXT_PUBLIC_NAME}`;
  const description = service.description || `Explore our exclusive ${service.title.toLowerCase()} collection`;
  const imageUrl = firstDesign ? getFullImageUrl(firstDesign.imageUrl) : `${baseUrl}/og-image.jpg`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${baseUrl}/services/${params.id}`, images: [{ url: imageUrl }] },
    twitter: { card: 'summary_large_image', title, description, images: [imageUrl] },
  };
}

export default function ServiceLayout({ children }) {
  return <>{children}</>;
}