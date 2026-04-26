'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function VerifyOTP() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/verify-otp', { email, otp });
      toast.success('Email verified! You can now login.');
      router.push('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-white shadow-soft rounded-2xl p-8">
        <h1 className="text-2xl font-serif text-rose text-center mb-4">Verify OTP</h1>
        <p className="text-center text-gray-600 mb-6">Enter the OTP sent to {email}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 border rounded-lg text-center text-2xl" required />
          <button type="submit" className="btn-primary w-full">Verify</button>
        </form>
      </div>
    </div>
  );
}