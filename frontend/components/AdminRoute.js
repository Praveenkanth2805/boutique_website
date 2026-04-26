'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRoute({ children }) {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) router.push('/login');
  }, [router]);

  return children;
}