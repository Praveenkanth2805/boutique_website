'use client';
import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';
import api from '@/utils/api';
import { getFullImageUrl } from '@/utils/imageUrl'; // not needed, but keep import pattern

export default function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('adminToken');
      try {
        const res = await api.get('/admin/contact', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch messages', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-rose mb-6">📬 Contact Messages</h1>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white p-5 rounded-xl shadow-soft border-l-4 border-rose">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">{msg.name}</p>
                    <p className="text-sm text-gray-500">{msg.email}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <p className="mt-3 text-gray-700 whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}