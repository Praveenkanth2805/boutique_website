'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import api from '@/utils/api';

export default function EnquiryForm({ serviceId, designId, serviceName }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    address: user?.address || '',
    pincode: user?.pincode || '',
    mobile: user?.mobile || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/enquiries', { ...formData, designId });
      toast.success('Enquiry sent! We will contact you soon.');
      setFormData({ name: '', address: '', pincode: '', mobile: '' });
    } catch (err) {
      toast.error('Failed to send enquiry');
    } finally{
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-2xl shadow-soft">
      <h3 className="text-2xl font-serif text-rose">Enquire about {serviceName}</h3>
      <input
        type="text"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose"
        required
      />
      <textarea
        placeholder="Address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        className="w-full p-3 border rounded-lg"
        required
      />
      <input
         type="text"
         placeholder="Pincode (6 digits)"
         value={formData.pincode}
         onChange={(e) => {
           const val = e.target.value.replace(/\D/g, '').slice(0, 6);
           setFormData({ ...formData, pincode: val });
         }}
         className="w-full p-3 border rounded-lg"
         required
         pattern="\d{6}"
         title="Must be exactly 6 digits"
      />
      <input
        type="tel"
        placeholder="Mobile Number (10 digits)"
        value={formData.mobile}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
          setFormData({ ...formData, mobile: val });
        }}
        className="w-full p-3 border rounded-lg"
        required
        pattern="\d{10}"
        title="Must be exactly 10 digits"
      />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "sending..." : "Send Enquiry"}
        </button>
      <div className="text-center mt-4">
        <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} target="_blank" className="text-rose underline">
          Or DM us on Instagram
        </a>
      </div>
    </form>
  );
}