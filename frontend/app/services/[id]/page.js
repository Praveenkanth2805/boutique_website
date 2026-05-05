// Server-side metadata (runs on server)
import { getFullImageUrl } from '@/utils/imageUrl';

export async function generateMetadata({ params }) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
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
    openGraph: {
      title,
      description,
      url: `${baseUrl}/services/${params.id}`,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import EnquiryForm from '@/components/EnquiryForm';
import api from '@/utils/api';
import { getFullImageUrl } from '@/utils/imageUrl';

export default function ServiceGallery({ params }) {
  const [service, setService] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [priceRange, setPriceRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${params.id}`);
        setService(res.data);
        // No automatic selection – setSelectedDesign remains null
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [params.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) return <div className="text-center py-20">Loading designs...</div>;
  if (!service) return <div className="text-center py-20">Service not found</div>;

  // Filter logic
  let filteredDesigns = service.designs;
  if (priceRange !== 'all') {
    const [minStr, maxStr] = priceRange.split('-');
    const min = parseFloat(minStr);
    const max = maxStr === 'plus' ? Infinity : parseFloat(maxStr);
    filteredDesigns = service.designs.filter(d => d.price >= min && d.price <= max);
  }
  filteredDesigns.sort((a, b) => b.price - a.price);

  const filterOptions = [
    { label: 'All', value: 'all' },
    { label: 'Under ₹1,000', value: '0-1000' },
    { label: '₹1,001 – ₹5,000', value: '1001-5000' },
    { label: '₹5,001 – ₹10,000', value: '5001-10000' },
    { label: 'Above ₹10,000', value: '10001-plus' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-rose text-center mb-4">{service.title}</h1>
      {service.description && <p className="text-center text-gray-600 mb-8">{service.description}</p>}

      {/* Filter Icon & Dropdown */}
      <div className="flex justify-end mb-4 relative" ref={filterRef}>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition"
        >
          <span className="text-xl">⚙️</span>
          <span className="text-sm font-medium">Filter</span>
          <span className="text-xs">{filterOpen ? '▲' : '▼'}</span>
        </button>
        {filterOpen && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setPriceRange(option.value);
                  setSelectedDesign(null);
                  setFilterOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                  priceRange === option.value ? 'bg-rose/10 text-rose font-semibold' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Two column layout */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredDesigns.map((design) => (
              <div key={design.id} className="cursor-pointer group" onClick={() => setSelectedDesign(design)}>
                <div className="relative aspect-square rounded-lg overflow-hidden shadow-md group-hover:shadow-xl transition">
                  <Image src={getFullImageUrl(design.imageUrl)} alt="Design" fill className="object-cover" />
                </div>
                <p className="text-center font-semibold mt-2 text-rose">₹{design.price}</p>
              </div>
            ))}
          </div>
          {filteredDesigns.length === 0 && <p className="text-center text-gray-500 py-8">No designs in this price range.</p>}
        </div>

        {/* Right side: show only when design clicked */}
        <div className="bg-white p-5 rounded-2xl shadow-soft sticky top-24 h-fit">
          {selectedDesign ? (
            <>
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <Image src={getFullImageUrl(selectedDesign.imageUrl)} alt="Selected design" fill className="object-cover" />
              </div>
              <p className="text-2xl font-bold text-rose">₹{selectedDesign.price}</p>
              {selectedDesign.description && <p className="text-gray-600 mt-2 whitespace-pre-wrap">{selectedDesign.description}</p>}
              <div className="mt-4">
                <EnquiryForm designId={selectedDesign.id} serviceName={`${service.title} – Design`} />
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">✨ Click any design to see details</p>
              <p className="text-sm mt-2">Price, description and enquiry form will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}