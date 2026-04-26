import ImageSlider from '@/components/ImageSlider';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';

async function getServices() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const services = await getServices();
  const sliderImages = services.slice(0, 5).flatMap(s => s.images).slice(0, 5);

  return (
    <div>
      <section className="mb-12">
        {sliderImages.length > 0 && <ImageSlider images={sliderImages} />}
      </section>
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-serif text-center text-rose mb-10">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
      <section className="bg-pink/30 py-16 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-rose">About Our Boutique</h2>
          <p className="max-w-2xl mx-auto mt-4 text-gray-600">
            We bring you the finest collection of ethnic and contemporary wear, crafted with love and luxury.
          </p>
          <Link href="/about" className="inline-block mt-6 text-gold font-semibold border-b border-gold">
            Know More →
          </Link>
        </div>
      </section>
    </div>
  );
}