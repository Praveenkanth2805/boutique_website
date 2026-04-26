'use client';
import Image from 'next/image';
import { useState } from 'react';

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22 viewBox=%220 0 150 150%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f8c8dc%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2212%22 fill=%22%23333%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';

export default function ImageGallery({ images }) {
  const [imgErrors, setImgErrors] = useState({});
  if (!images.length) return null;

  const getImageSrc = (idx) => {
    if (imgErrors[idx]) return FALLBACK_IMAGE;
    return images[idx]?.imageUrl || FALLBACK_IMAGE;
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