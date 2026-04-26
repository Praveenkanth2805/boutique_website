'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/utils/api';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact', form); // you'd need a contact endpoint, but for demo just toast
      toast.success('Message sent!');
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error('Failed to send');
    }
  };
  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-4xl font-serif text-rose mb-6 text-center">Contact Us</h1>
      <div className="bg-white shadow-soft rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-3 border rounded-lg" required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-3 border rounded-lg" required />
          <textarea placeholder="Message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full p-3 border rounded-lg" required />
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-gray-600">Or reach us directly:</p>
          <p className="font-semibold">Email: hello@boutique.com</p>
          <p className="font-semibold">Instagram: <a href={process.env.NEXT_PUBLIC_INSTAGRAM_URL} target="_blank" className="text-rose">@boutique</a></p>
        </div>
      </div>
    </div>
  );
}