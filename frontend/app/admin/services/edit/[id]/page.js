'use client';
import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { getFullImageUrl } from '@/utils/imageUrl';

export default function EditService() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // <-- this is the variable
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    const res = await api.get(`/services/${id}`);
    const s = res.data;
    setForm({ name: s.name, description: s.description, price: s.price });
    setExistingImages(s.images || []);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    // Use newImages, not "images"
    for (let i = 0; i < newImages.length; i++) {
      formData.append('newImages', newImages[i]);
    }
    const token = localStorage.getItem('adminToken');
    try {
      await api.put(`/admin/services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      toast.success('Service updated successfully');
      setNewImages([]);
      fetchService(); // refresh images
    } catch (err) {
      if (err.response?.status === 413) {
        toast.error('File too large. Max size 5MB.');
      } else {
        toast.error(err.response?.data?.message || 'Update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const setPrimaryImage = async (imageId) => {
    const token = localStorage.getItem('adminToken');
    try {
      await api.put(`/admin/services/${id}`, { primaryImageId: imageId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Primary image updated');
      fetchService();
    } catch {
      toast.error('Failed to set primary');
    }
  };

  const deleteImage = async (imageId) => {
    if (!confirm('Delete this image?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      await api.delete(`/admin/services/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Image deleted');
      fetchService();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-serif text-rose mb-6">Edit Service</h1>
        
        <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded-2xl shadow-soft mb-8">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          
          <div>
            <label className="block font-semibold mb-2">Add More Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setNewImages(Array.from(e.target.files))}
              className="w-full"
            />
            {newImages.length > 0 && (
              <p className="text-sm text-green-600 mt-1">{newImages.length} new image(s) selected</p>
            )}
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Updating...' : 'Update Service'}
          </button>
        </form>

        <div className="bg-white p-6 rounded-2xl shadow-soft">
          <h2 className="text-2xl font-serif text-rose mb-4">Service Images</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <div className="relative h-40 w-full rounded-lg overflow-hidden border">
                  <Image
                    src={getFullImageUrl(img.imageUrl)}
                    alt="service"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  {!img.isPrimary && (
                    <button
                      onClick={() => setPrimaryImage(img.id)}
                      className="bg-gold text-white text-xs px-2 py-1 rounded"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
                {img.isPrimary && (
                  <span className="absolute bottom-2 left-2 bg-rose text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </div>
            ))}
          </div>
          {existingImages.length === 0 && <p className="text-gray-500">No images yet. Upload some above.</p>}
        </div>
      </div>
    </AdminRoute>
  );
}