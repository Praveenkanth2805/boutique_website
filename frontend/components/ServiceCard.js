'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { getFullImageUrl } from '@/utils/imageUrl';

export default function ServiceCard({ service }) {
  const [imgSrc, setImgSrc] = useState(getFullImageUrl(service.thumbnail));
  const onError = () => setImgSrc(getFullImageUrl(null));

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft card-hover">
      <div className="relative h-64 w-full">
        <Image src={imgSrc} alt={service.title} fill className="object-cover" onError={onError} />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-serif text-rose">{service.title}</h3>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{service.description}</p>
        <Link href={`/services/${service.id}`} className="inline-block mt-4 text-rose font-medium border-b border-rose">
          View Designs →
        </Link>
      </div>
    </div>
  );
}