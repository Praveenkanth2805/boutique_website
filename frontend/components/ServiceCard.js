'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22400%22 viewBox=%220 0 600 400%22%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22%23f8c8dc%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23333%22 text-anchor=%22middle%22 dy=%22.3em%22%3ENo Image%3C/text%3E%3C/svg%3E';

export default function ServiceCard({ service }) {
  const [imgSrc, setImgSrc] = useState(service.images?.[0]?.imageUrl || FALLBACK_IMAGE);
  const primaryImage = imgSrc;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-soft card-hover">
      <div className="relative h-64 w-full">
        <Image
          src={primaryImage}
          alt={service.name}
          fill
          className="object-cover"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-serif text-rose">{service.name}</h3>
        <p className="text-gold font-semibold mt-1">₹{service.price}</p>
        <p className="text-gray-600 text-sm mt-2 line-clamp-2">{service.description}</p>
        <Link href={`/services/${service.id}`} className="inline-block mt-4 text-rose font-medium border-b border-rose">
          View Details →
        </Link>
      </div>
    </div>
  );
}