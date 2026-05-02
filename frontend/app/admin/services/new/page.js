'use client';
import { useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NewService() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });
  const [images, setImages] = useState([]);
  const [imageDetails, setImageDetails] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setImageDetails(files.map(() => ({ price: '', description: '' })));
  };

  const updateImageDetail = (index, field, value) => {
    const newDetails = [...imageDetails];
    newDetails[index][field] = value;
    setImageDetails(newDetails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    images.forEach((file) => formData.append('images', file));
    formData.append('imagesDetails', JSON.stringify(imageDetails));

    const token = localStorage.getItem('adminToken');
    try {
      await api.post('/admin/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      toast.success('Service created');
      router.push('/admin/services');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-serif text-rose mb-6">Add New Service Category</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-soft">
          <input type="text" placeholder="Category Name (e.g., Bridal Lehengas)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border rounded-lg" required />
          <textarea placeholder="Category Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full p-3 border rounded-lg" required />
          <input type="number" placeholder="Default Price (optional, if all designs share same)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full p-3 border rounded-lg" />
          <input type="text" placeholder="Category Slug (e.g., bridal)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full p-3 border rounded-lg" required />

          <div>
            <label className="block font-semibold mb-2">Upload Designs (Images)</label>
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full" required />
          </div>

          {images.map((img, idx) => (
            <div key={idx} className="border p-4 rounded-lg space-y-2">
              <p className="font-medium">{img.name}</p>
              <input type="number" placeholder="Price for this design" value={imageDetails[idx]?.price || ''} onChange={(e) => updateImageDetail(idx, 'price', e.target.value)} className="w-full p-2 border rounded" />
              <textarea placeholder="Description for this design" value={imageDetails[idx]?.description || ''} onChange={(e) => updateImageDetail(idx, 'description', e.target.value)} className="w-full p-2 border rounded" rows="2" />
            </div>
          ))}

          <button type="submit" className="btn-primary w-full">Create Service</button>
        </form>
      </div>
    </AdminRoute>
  );
}