'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import EnquiryForm from '@/components/EnquiryForm';
import api from '@/utils/api';
import { getFullImageUrl } from '@/utils/imageUrl';

export default function ServiceGallery({ params }) {
  const [service, setService] = useState(null);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [priceRange, setPriceRange] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${params.id}`);
        setService(res.data);
        if (res.data.designs?.length) {
          setSelectedDesign(res.data.designs[0]); // highest price first
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [params.id]);

  if (loading) return <div className="text-center py-20">Loading designs...</div>;
  if (!service) return <div className="text-center py-20">Service not found</div>;

  // Filter by price range
  let filteredDesigns = service.designs;
  if (priceRange !== 'all') {
    const [minStr, maxStr] = priceRange.split('-');
    const min = parseFloat(minStr);
    const max = maxStr === 'plus' ? Infinity : parseFloat(maxStr);
    filteredDesigns = service.designs.filter(d => d.price >= min && d.price <= max);
  }
  // Ensure highest price first
  filteredDesigns.sort((a, b) => b.price - a.price);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-rose text-center mb-4">{service.title}</h1>
      {service.description && <p className="text-center text-gray-600 mb-8">{service.description}</p>}

      {/* Filter bar - responsive */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { label: 'All', value: 'all' },
          { label: 'Under ₹5,000', value: '0-5000' },
          { label: '₹5,001 – ₹10,000', value: '5001-10000' },
          { label: '₹10,001 – ₹20,000', value: '10001-20000' },
          { label: 'Above ₹20,000', value: '20001-plus' },
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setPriceRange(range.value)}
            className={`px-4 py-2 rounded-full transition ${priceRange === range.value ? 'bg-rose text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Designs gallery */}
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

        {/* Selected design details + enquiry form */}
        <div className="bg-white p-5 rounded-2xl shadow-soft sticky top-24 h-fit">
          {selectedDesign ? (
            <>
              <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                <Image src={getFullImageUrl(selectedDesign.imageUrl)} alt="Selected design" fill className="object-cover" />
              </div>
              <p className="text-2xl font-bold text-rose">₹{selectedDesign.price}</p>
              {selectedDesign.description && <p className="text-gray-600 mt-2 whitespace-pre-wrap">{selectedDesign.description}</p>}
              <div className="mt-4">
                <EnquiryForm designId={selectedDesign.id} serviceName={`${service.title} – Design #${selectedDesign.id}`} />
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center">Click a design to see details</p>
          )}
        </div>
      </div>
    </div>
  );
}