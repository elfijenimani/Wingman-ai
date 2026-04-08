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

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

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

  async function handleAskAI(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAiError('');
    setAnswer('');

    if (!question.trim()) {
      setAiError('Please write a question first.');
      return;
    }

    try {
      setAiLoading(true);

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAiError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setAnswer(data.answer || 'No response from AI.');
    } catch (error) {
      setAiError('Failed to fetch AI response.');
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="card" style={{ maxWidth: '700px' }}>
          <h1 className="title">Dashboard</h1>
          <p className="subtitle">Logged in as: {user?.email}</p>

          <AddNote onNoteAdded={fetchNotes} />

          {loadingNotes ? (
            <p style={{ marginTop: '20px' }}>Loading notes...</p>
          ) : (
            <NotesList notes={notes} />
          )}

          <div style={{ marginTop: '30px' }}>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              Ask AI
            </h2>

            <form onSubmit={handleAskAI}>
              <textarea
                className="input"
                placeholder="Ask something about travel, airport, baggage, documents..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                style={{ minHeight: '120px', resize: 'vertical' }}
              />

              <button className="button" type="submit" disabled={aiLoading}>
                {aiLoading ? 'Thinking...' : 'Ask AI'}
              </button>
            </form>

            {aiError && (
              <p style={{ color: 'red', marginTop: '12px' }}>{aiError}</p>
            )}

            {answer && (
              <div
                style={{
                  marginTop: '16px',
                  background: '#f8f8f8',
                  padding: '16px',
                  borderRadius: '12px',
                  textAlign: 'left',
                }}
              >
                <h3 style={{ marginBottom: '8px' }}>AI Answer</h3>
                <p style={{ color: '#444', lineHeight: '1.6' }}>{answer}</p>
              </div>
            )}
          </div>

          <button
            className="button"
            style={{ background: '#dc2626', marginTop: '24px' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}