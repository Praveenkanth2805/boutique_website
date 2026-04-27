import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-serif mb-2">{process.env.NEXT_PUBLIC_NAME}</h3>
          <p className="text-gray-400">Luxury redefined.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li><Link href="/" className="text-gray-400 hover:text-white">Home</Link></li>
            <li><Link href="/services" className="text-gray-400 hover:text-white">Services</Link></li>
            <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
            <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contact</h4>
          <p className="text-gray-400">Email: info@boutique.com</p>
          <p className="text-gray-400">Phone: {process.env.NEXT_PUBLIC_NUMBER}</p>
          <div className="flex space-x-4 mt-2">
            <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} target="_blank" className="text-gray-400 hover:text-pink">Instagram</a>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-sm mt-8">© 2026 Boutique. All rights reserved.</div>
    </footer>
  );
}