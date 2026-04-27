'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Admin navbar
  if (isAdmin || pathname?.startsWith('/admin')) {
    return (
      <nav className="bg-white-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-full" />
            <span className="text-xl font-serif font-bold">Admin Panel</span>
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link href="/admin" className="hover:text-rose">Dashboard</Link>
            <Link href="/admin/services" className="hover:text-rose">Services</Link>
            <Link href="/admin/enquiries" className="hover:text-rose">Enquiries</Link>
            <Link href="/admin/contact" className="hover:text-rose">Contact Msgs</Link>
            <button onClick={logout} className="hover:text-rose">Logout</button>
          </div>
          <button className="md:hidden text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 py-4 px-4 flex flex-col space-y-3">
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
            <Link href="/admin/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
            <Link href="/admin/enquiries" onClick={() => setMobileMenuOpen(false)}>Enquiries</Link>
            <Link href="/admin/contact" onClick={() => setMobileMenuOpen(false)}>Contact Msgs</Link>
            <button onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</button>
          </div>
        )}
      </nav>
    );
  }

  // Customer navbar (with logo)
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Boutique Logo" width={40} height={40} className="rounded-full" />
          <span className="text-2xl font-serif text-rose font-bold">Boutique</span>
        </Link>
        <div className="hidden md:flex space-x-8">
          <Link href="/" className="hover:text-rose">Home</Link>
          <Link href="/services" className="hover:text-rose">Services</Link>
          <Link href="/about" className="hover:text-rose">About</Link>
          <Link href="/contact" className="hover:text-rose">Contact</Link>
          {user ? (
            <>
              <Link href="/profile" className="hover:text-rose">Profile</Link>
              <button onClick={logout} className="hover:text-rose">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-rose">Login</Link>
              <Link href="/register" className="hover:text-rose">Register</Link>
            </>
          )}
        </div>
        <button className="md:hidden text-2xl" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-white py-4 px-4 flex flex-col space-y-3">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/services" onClick={() => setMobileMenuOpen(false)}>Services</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}