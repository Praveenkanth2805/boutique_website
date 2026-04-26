'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalServices: 0, totalEnquiries: 0, totalUsers: 0 });
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load stats');
        if (err.response?.status === 401) router.push('/admin/login');
      }
    };
    fetchStats();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-rose mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-soft text-center">
          <h3 className="text-2xl font-bold text-rose">{stats.totalServices}</h3>
          <p className="text-gray-600">Services</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-soft text-center">
          <h3 className="text-2xl font-bold text-rose">{stats.totalEnquiries}</h3>
          <p className="text-gray-600">Enquiries</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-soft text-center">
          <h3 className="text-2xl font-bold text-rose">{stats.totalUsers}</h3>
          <p className="text-gray-600">Users</p>
        </div>
      </div>
    </div>
  );
}