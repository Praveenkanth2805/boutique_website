'use client';
import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';

export default function EditService() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    const fetchService = async () => {
      const res = await api.get(`/services/${id}`);
      const s = res.data;
      setForm({ name: s.name, description: s.description, price: s.price });
    };
    fetchService();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    for (let i = 0; i < newImages.length; i++) {
      formData.append('newImages', newImages[i]);
    }
    const token = localStorage.getItem('adminToken');
    await api.put(`/admin/services/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
    });
    toast.success('Service updated');
    router.push('/admin/services');
  };

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-serif text-rose mb-6">Edit Service</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-soft">
          <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border rounded-lg" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 border rounded-lg" required />
          <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-3 border rounded-lg" required />
          <input type="file" multiple accept="image/*" onChange={(e) => setNewImages(Array.from(e.target.files))} className="w-full" />
          <button type="submit" className="btn-primary w-full">Update Service</button>
        </form>
      </div>
    </AdminRoute>
  );
}