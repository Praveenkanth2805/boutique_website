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
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '' });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImageDetails, setNewImageDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    const res = await api.get(`/services/${id}`);
    const s = res.data;
    setForm({
      name: s.name,
      description: s.description,
      price: s.price || '',
      category: s.category || 'Uncategorized',
    });
    setExistingImages(s.images || []);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);

    // Prepare existing images details (price, description, isPrimary)
    const imagesDetails = existingImages.map(img => ({
      id: img.id,
      price: img.price || '',
      description: img.description || '',
      isPrimary: img.isPrimary,
    }));
    formData.append('imagesDetails', JSON.stringify(imagesDetails));

    // Collect IDs of images marked for deletion
    const deletedIds = existingImages.filter(img => img._deleted).map(img => img.id);
    formData.append('deletedImageIds', JSON.stringify(deletedIds));

    // Append new image files and their details
    for (let i = 0; i < newImages.length; i++) {
      formData.append('newImages', newImages[i]);
    }
    formData.append('newImagesDetails', JSON.stringify(newImageDetails));

    const token = localStorage.getItem('adminToken');
    try {
      await api.put(`/admin/services/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
      toast.success('Service updated successfully');
      setNewImages([]);
      setNewImageDetails([]);
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

  const updateExistingImage = (index, field, value) => {
    const updated = [...existingImages];
    updated[index][field] = value;
    setExistingImages(updated);
  };

  const markImageForDeletion = (index) => {
    const updated = [...existingImages];
    updated[index]._deleted = true;
    setExistingImages(updated);
  };

  const setPrimaryImage = (index) => {
    const updated = existingImages.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setExistingImages(updated);
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setNewImageDetails(files.map(() => ({ price: '', description: '' })));
  };

  const updateNewImageDetail = (index, field, value) => {
    const updated = [...newImageDetails];
    updated[index][field] = value;
    setNewImageDetails(updated);
  };

  const removeNewImage = (index) => {
    const updatedFiles = [...newImages];
    const updatedDetails = [...newImageDetails];
    updatedFiles.splice(index, 1);
    updatedDetails.splice(index, 1);
    setNewImages(updatedFiles);
    setNewImageDetails(updatedDetails);
  };

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-serif text-rose mb-6">Edit Service Category</h1>

        <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded-2xl shadow-soft mb-8">
          <input
            type="text"
            placeholder="Category Name (e.g., Bridal Lehengas)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <textarea
            placeholder="Category Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Default Price (optional, if all designs share same)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="Category Slug (e.g., bridal)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full p-3 border rounded-lg"
            required
          />

          {/* Existing images with editable price/description */}
          <div>
            <h2 className="text-xl font-serif text-rose mb-3">Existing Designs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {existingImages.map((img, idx) => (
                !img._deleted && (
                  <div key={img.id} className="border p-3 rounded-lg relative">
                    <div className="relative h-32 w-full mb-2">
                      <Image
                        src={getFullImageUrl(img.imageUrl)}
                        alt="design"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Price for this design"
                      value={img.price || ''}
                      onChange={(e) => updateExistingImage(idx, 'price', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                    />
                    <textarea
                      placeholder="Description for this design"
                      value={img.description || ''}
                      onChange={(e) => updateExistingImage(idx, 'description', e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className={`text-xs px-2 py-1 rounded ${img.isPrimary ? 'bg-rose text-white' : 'bg-gray-200'}`}
                      >
                        {img.isPrimary ? 'Primary' : 'Set Primary'}
                      </button>
                      <button
                        type="button"
                        onClick={() => markImageForDeletion(idx)}
                        className="bg-red-500 text-white text-xs px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              ))}
            </div>
            {existingImages.filter(img => !img._deleted).length === 0 && (
              <p className="text-gray-500 mt-2">No designs yet. Add some below.</p>
            )}
          </div>

          {/* New images upload with price/description */}
          <div>
            <label className="block font-semibold mb-2">Add New Designs</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleNewImages}
              className="w-full"
            />
            {newImages.map((file, idx) => (
              <div key={idx} className="border p-3 rounded-lg mt-2 relative">
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>
                <p className="font-medium mb-2">{file.name}</p>
                <input
                  type="number"
                  placeholder="Price for this design"
                  value={newImageDetails[idx]?.price || ''}
                  onChange={(e) => updateNewImageDetail(idx, 'price', e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                />
                <textarea
                  placeholder="Description for this design"
                  value={newImageDetails[idx]?.description || ''}
                  onChange={(e) => updateNewImageDetail(idx, 'description', e.target.value)}
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