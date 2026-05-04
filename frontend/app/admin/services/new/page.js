'use client';
import { useState } from 'react';
import AdminRoute from '@/components/AdminRoute';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function NewService() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'uncategorized',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const addDesign = () => {
    setDesigns([...designs, { image: null, price: '', description: '' }]);
  };

  const removeDesign = (index) => {
    const updated = [...designs];
    updated.splice(index, 1);
    setDesigns(updated);
  };

  const updateDesign = (index, field, value) => {
    const updated = [...designs];
    updated[index][field] = value;
    setDesigns(updated);
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleDesignImageChange = (index, file) => {
    const updated = [...designs];
    updated[index].image = file;
    setDesigns(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!thumbnail) {
      toast.error('Please upload a thumbnail image for the service');
      return;
    }
    if (designs.length === 0) {
      toast.error('Please add at least one design');
      return;
    }
    for (let i = 0; i < designs.length; i++) {
      if (!designs[i].image) {
        toast.error(`Design ${i + 1} must have an image`);
        return;
      }
      if (!designs[i].price) {
        toast.error(`Design ${i + 1} must have a price`);
        return;
      }
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('category', form.category);
    formData.append('thumbnail', thumbnail);

    // Prepare designs data (excluding the file objects)
    const designsData = designs.map(d => ({
      price: parseFloat(d.price),
      description: d.description || ''
    }));
    formData.append('designs', JSON.stringify(designsData));

    // Append design images (files)
    designs.forEach(design => {
      if (design.image) formData.append('designImages', design.image);
    });

    const token = localStorage.getItem('adminToken');
    try {
      await api.post('/admin/services', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      toast.success('Service created successfully');
      router.push('/admin/services');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-serif text-rose mb-6">Add New Service</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-soft">
          {/* Service Info */}
          <div>
            <label className="block font-semibold mb-1">Service Title *</label>
            <input
              type="text"
              placeholder="e.g., Bridal Lehengas"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Service Description (optional)</label>
            <textarea
              placeholder="Describe this collection"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 border rounded-lg"
              rows="3"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Category Slug (used for filtering)</label>
            <input
              type="text"
              placeholder="e.g., bridal, party, casual"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value.toLowerCase().replace(/\s/g, '-') })}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block font-semibold mb-1">Service Thumbnail *</label>
            <input type="file" accept="image/*" onChange={handleThumbnailChange} className="w-full" required />
            {thumbnail && <p className="text-sm text-green-600 mt-1">{thumbnail.name}</p>}
          </div>

          {/* Designs Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-serif text-rose">Designs (Products)</h2>
              <button type="button" onClick={addDesign} className="bg-rose text-white px-3 py-1 rounded-lg text-sm hover:bg-opacity-80">+ Add Design</button>
            </div>
            {designs.map((design, idx) => (
              <div key={idx} className="border p-4 rounded-lg mb-4 relative">
                <button
                  type="button"
                  onClick={() => removeDesign(idx)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Design Image *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDesignImageChange(idx, e.target.files[0])}
                    className="w-full"
                    required
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g., 45000"
                    value={design.price}
                    onChange={(e) => updateDesign(idx, 'price', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <textarea
                    placeholder="Specific details about this design"
                    value={design.description}
                    onChange={(e) => updateDesign(idx, 'description', e.target.value)}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>
              </div>
            ))}
            {designs.length === 0 && (
              <p className="text-gray-500 text-center py-4">No designs added yet. Click "Add Design" to start.</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating...' : 'Create Service'}
          </button>
        </form>
      </div>
    </AdminRoute>
  );
}