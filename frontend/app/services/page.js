import ServiceCard from '@/components/ServiceCard';

async function getServices() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif text-center text-rose mb-10">All Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  );
}