'use client';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-serif text-rose mb-6">My Profile</h1>
        <div className="bg-white shadow-soft rounded-2xl p-6">
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}