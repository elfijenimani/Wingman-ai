'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="card">
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">
            Logged in as: {user?.email}
          </p>

          <button
            className="button"
            style={{ background: '#dc2626' }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}