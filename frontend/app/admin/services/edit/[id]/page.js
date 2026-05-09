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
  const [form, setForm] = useState({ title: '', description: '', category: '' });
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState('');
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [designs, setDesigns] = useState([]);        // existing designs
  const [newDesigns, setNewDesigns] = useState([]);  // new designs to add
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    const res = await api.get(`/services/${id}`);
    const s = res.data;
    setForm({
      title: s.title,
      description: s.description || '',
      category: s.category || 'uncategorized',
    });
    setExistingThumbnailUrl(s.thumbnail);
    setDesigns(s.designs || []);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    if (newThumbnail) formData.append('thumbnail', newThumbnail);

    // Prepare existing designs data (update only non‑deleted)
    const existingDesignsData = designs
      .filter(d => !d._deleted)
      .map(d => ({
        id: d.id,
        price: d.price,
        description: d.description || '',
      }));
    formData.append('existingDesigns', JSON.stringify(existingDesignsData));

    // Deleted design IDs
    const deletedIds = designs.filter(d => d._deleted).map(d => d.id);
    formData.append('deletedDesignIds', JSON.stringify(deletedIds));

    // New designs data (without file)
    const newDesignsData = newDesigns.map(d => ({
      price: d.price,
      description: d.description || '',
    }));
    formData.append('newDesigns', JSON.stringify(newDesignsData));
    // Append new design image files
    newDesigns.forEach(d => {
      if (d.imageFile) formData.append('newDesignImages', d.imageFile);
    });

    const token = localStorage.getItem('adminToken');
    try {
      await api.put(`/admin/services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      toast.success('Service updated successfully');
      router.push('/admin/services');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const updateDesign = (index, field, value) => {
    const updated = [...designs];
    updated[index][field] = value;
    setDesigns(updated);
  };

  const markDesignForDeletion = (index) => {
    const updated = [...designs];
    updated[index]._deleted = true;
    setDesigns(updated);
  };

  const addNewDesign = () => {
    setNewDesigns([...newDesigns, { imageFile: null, price: '', description: '' }]);
  };

  const updateNewDesign = (index, field, value) => {
    const updated = [...newDesigns];
    updated[index][field] = value;
    setNewDesigns(updated);
  };

  const removeNewDesign = (index) => {
    const updated = [...newDesigns];
    updated.splice(index, 1);
    setNewDesigns(updated);
  };

  const handleNewDesignImage = (index, file) => {
    const updated = [...newDesigns];
    updated[index].imageFile = file;
    setNewDesigns(updated);
  };

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-serif text-rose mb-6">Edit Service</h1>
        <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded-2xl shadow-soft mb-8">
          <input
            type="text"
            placeholder="Service Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <textarea
            placeholder="Service Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 border rounded-lg"
            rows="3"
          />
          <input
            type="text"
            placeholder="Category Slug (e.g., bridal)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value.toLowerCase().replace(/\s/g, '-') })}
            className="w-full p-3 border rounded-lg"
            required
          />

          {/* Thumbnail */}
          <div>
            <label className="block font-semibold mb-1">Thumbnail Image</label>
            {existingThumbnailUrl && !newThumbnail && (
              <div className="mb-2">
                <Image src={getFullImageUrl(existingThumbnailUrl)} alt="thumbnail" width={150} height={150} className="rounded" />
                <p className="text-sm text-gray-500">Current thumbnail</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => setNewThumbnail(e.target.files[0])} className="w-full" />
          </div>

          {/* Existing Designs */}
          <div className="border-t pt-4">
            <h2 className="text-xl font-serif text-rose mb-3">Existing Designs</h2>
            {designs.filter(d => !d._deleted).length === 0 && <p className="text-gray-500">No designs yet.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {designs.map((design, idx) => (
                !design._deleted && (
                  <div key={design.id} className="border p-3 rounded-lg relative">
                    <div className="relative h-32 w-full mb-2">
                      <Image src={getFullImageUrl(design.imageUrl)} alt="design" fill className="object-cover rounded" />
                    </div>
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={design.price}
                      onChange={(e) => updateDesign(idx, 'price', parseFloat(e.target.value))}
                      className="w-full p-2 border rounded mb-2"
                      required
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={design.description || ''}
                      onChange={(e) => updateDesign(idx, 'description', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      rows="2"
                    />
                   <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('⚠️ Are you sure you want to permanently delete this design? This action cannot be undone.')) {
                        const token = localStorage.getItem('adminToken');
                        try {
                          await api.delete(`/admin/designs/${design.id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          toast.success('Design deleted');
                          // Remove from UI immediately
                          const updatedDesigns = designs.filter((_, i) => i !== idx);
                          setDesigns(updatedDesigns);
                        } catch (err) {
                          toast.error('Failed to delete design');
                        }
                      }
                    }}
                    className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                  >
                    Delete Design
                  </button>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Add New Designs */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-serif text-rose">Add New Designs</h2>
              <button type="button" onClick={addNewDesign} className="bg-rose text-white px-3 py-1 rounded-lg text-sm">+ Add Design</button>
            </div>
            {newDesigns.map((design, idx) => (
              <div key={idx} className="border p-3 rounded-lg mt-2 relative">
                <button
                  type="button"
                  onClick={() => removeNewDesign(idx)}
                  className="absolute top-2 right-2 text-red-500"
                >
                  ✕
                </button>
                <div className="mb-2">
                  <label className="block text-sm font-medium">Design Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleNewDesignImage(idx, e.target.files[0])}
                    className="w-full"
                    required
                  />
                </div>
                <input
                  type="number"
                  placeholder="Price (₹) *"
                  value={design.price}
                  onChange={(e) => updateNewDesign(idx, 'price', parseFloat(e.target.value))}
                  className="w-full p-2 border rounded mb-2"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={design.description}
                  onChange={(e) => updateNewDesign(idx, 'description', e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                  rows="2"
                />
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Updating...' : 'Update Service'}
          </button>
        </form>
      </div>
    </AdminRoute>
  );
}