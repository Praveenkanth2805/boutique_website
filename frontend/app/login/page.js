'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, false); // false = customer login
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-white shadow-soft rounded-2xl p-8">
        <h1 className="text-3xl font-serif text-rose text-center mb-6">Customer Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <button type="submit" className="btn-primary w-full">Login</button>
        </form>
        {/* <p className="mt-4 text-center">
          Don't have an account? <Link href="/register" className="text-rose">Register</Link>
        </p> */}
        {/* <p className="mt-2 text-center text-sm">
          Admin? <Link href="/admin/login" className="text-rose underline">Login here</Link>
        </p> */}
      </div>
    </div>
  );
}