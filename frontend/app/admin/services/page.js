'use client';
import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function AdminServices() {
  const [services, setServices] = useState([]);

  const fetchServices = async () => {
    const res = await api.get('/services');
    setServices(res.data);
  };

  const deleteService = async (id) => {
    if (confirm('Delete this service?')) {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/admin/services/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Deleted');
      fetchServices();
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-serif text-rose">Manage Services</h1>
          <Link href="/admin/services/new" className="btn-primary">+ Add New</Link>
        </div>
        <div className="grid gap-4">
          {services.map((s) => (
            <div key={s.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-soft">
              <div>
                <h3 className="font-semibold">{s.name}</h3>
                <p className="text-gold">₹{s.price}</p>
              </div>
              <div className="space-x-2">
                <Link href={`/admin/services/edit/${s.id}`} className="text-blue-600">Edit</Link>
                <button onClick={() => deleteService(s.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminRoute>
  );
}