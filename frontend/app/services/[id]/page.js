import ImageSlider from '@/components/ImageSlider';
import ImageGallery from '@/components/ImageGallery';
import EnquiryForm from '@/components/EnquiryForm';

async function getService(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Service not found');
  return res.json();
}

export default async function ServiceDetail({ params }) {
  const service = await getService(params.id);
  const allImages = service.images;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <ImageSlider images={allImages} interval={5000} />
          <div className="mt-8">
            <ImageGallery images={allImages} />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-serif text-rose mb-4">{service.name}</h1>
          <p className="text-2xl font-semibold text-gold mb-6">₹{service.price}</p>
          <p className="text-gray-600 mb-8">{service.description}</p>
          <EnquiryForm serviceId={service.id} serviceName={service.name} />
        </div>
      </div>
    </div>
  );
}