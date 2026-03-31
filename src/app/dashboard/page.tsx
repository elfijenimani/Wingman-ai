'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AddNote from '../components/AddNote';
import NotesList from '../components/NotesList';

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  async function fetchNotes() {
    setLoadingNotes(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoadingNotes(false);
      return;
    }

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.log(error.message);
    } else {
      setNotes(data || []);
    }

    setLoadingNotes(false);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="card" style={{ maxWidth: '600px' }}>
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">Logged in as: {user?.email}</p>

          <AddNote onNoteAdded={fetchNotes} />

          {loadingNotes ? (
            <p style={{ marginTop: '20px' }}>Loading notes...</p>
          ) : (
            <NotesList notes={notes} />
          )}

          <button
            className="button"
            style={{ background: '#dc2626', marginTop: '20px' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}