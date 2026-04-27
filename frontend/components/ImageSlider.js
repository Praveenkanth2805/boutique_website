'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getFullImageUrl } from '@/utils/imageUrl';

export default function ImageSlider({ images, interval = 4000 }) {
  const [current, setCurrent] = useState(0);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    if (!images.length) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);
    return () => clearInterval(timer);
  }, [images.length, interval]);

  if (!images.length) return null;

  const getImageSrc = (idx) => {
    if (imgErrors[idx]) return getFullImageUrl(null); // fallback
    const rawUrl = images[idx]?.imageUrl;
    return getFullImageUrl(rawUrl);
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-xl">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={getImageSrc(idx)}
            alt={`Slide ${idx + 1}`}
            fill
            className="object-cover"
            priority={idx === 0}
            onError={() => setImgErrors(prev => ({ ...prev, [idx]: true }))}
          />
        </div>
      ))}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all ${idx === current ? 'bg-rose w-4' : 'bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
}