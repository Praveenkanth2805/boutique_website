'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22 viewBox=%220 0 800 400%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f8c8dc%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23333%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';

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
    if (imgErrors[idx]) return FALLBACK_IMAGE;
    return images[idx]?.imageUrl || FALLBACK_IMAGE;
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