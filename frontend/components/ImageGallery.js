'use client';
import Image from 'next/image';
import { useState } from 'react';
import { getFullImageUrl } from '@/utils/imageUrl';

export default function ImageGallery({ images }) {
  const [imgErrors, setImgErrors] = useState({});

  if (!images.length) return null;

  const getImageSrc = (idx) => {
    if (imgErrors[idx]) return getFullImageUrl(null);
    const rawUrl = images[idx]?.imageUrl;
    return getFullImageUrl(rawUrl);
  };

  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      {images.map((img, idx) => (
        <div key={img.id} className="relative h-24 w-full rounded-md overflow-hidden">
          <Image
            src={getImageSrc(idx)}
            alt="Gallery"
            fill
            className="object-cover"
            onError={() => setImgErrors(prev => ({ ...prev, [idx]: true }))}
          />
        </div>
      ))}
    </div>
  );
}