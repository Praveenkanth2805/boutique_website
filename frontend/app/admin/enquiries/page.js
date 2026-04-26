'use client';
import { useState, useEffect } from 'react';
import AdminRoute from '@/components/AdminRoute';
import api from '@/utils/api';

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
    const fetchEnquiries = async () => {
      const token = localStorage.getItem('adminToken');
      const res = await api.get('/admin/enquiries', { headers: { Authorization: `Bearer ${token}` } });
      setEnquiries(res.data);
    };
    fetchEnquiries();
  }, []);

  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-rose mb-6">Enquiries</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-2xl shadow-soft">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Name</th>
                <th className="p-4 text-left">Mobile</th>
                <th className="p-4 text-left">Address</th>
                <th className="p-4 text-left">Service</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="p-4">{e.name}</td>
                  <td className="p-4">{e.mobile}</td>
                  <td className="p-4">{e.address}, {e.pincode}</td>
                  <td className="p-4">{e.service?.name || 'N/A'}</td>
                  <td className="p-4">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminRoute>
  );
}