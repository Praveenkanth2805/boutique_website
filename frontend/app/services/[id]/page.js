'use client';
import { useState, useEffect } from 'react';
import ImageSlider from '@/components/ImageSlider';
import ImageGallery from '@/components/ImageGallery';
import EnquiryForm from '@/components/EnquiryForm';
import api from '@/utils/api';

export default function ServiceDetail({ params }) {
  const [service, setService] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get(`/services/${params.id}`);
        setService(res.data);
        setSelectedImage(res.data.images[0]); // default to first image
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [params.id]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!service) return <div className="text-center py-20">Service not found</div>;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Left column: image slider and gallery */}
        <div>
          <ImageSlider images={service.images} interval={5000} />
          <div className="mt-8">
            <ImageGallery 
              images={service.images} 
              onImageClick={(img) => setSelectedImage(img)} 
            />
          </div>
        </div>

        {/* Right column: selected design details + enquiry form */}
        <div>
          {selectedImage && (
            <>
              <h1 className="text-4xl font-serif text-rose mb-2">{service.name}</h1>
              <p className="text-2xl font-semibold text-gold mb-4">
                ₹{selectedImage.price || service.price}
              </p>
              <p className="text-gray-600 mb-8 whitespace-pre-wrap">
                {selectedImage.description || service.description}
              </p>
            </>
          )}
          <EnquiryForm 
            serviceId={service.id} 
            designId={selectedImage?.id} 
            serviceName={`${service.name} - ${selectedImage?.id || ''}`} 
          />
        </div>
      </div>
    </div>
  );
}