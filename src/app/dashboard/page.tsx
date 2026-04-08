'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { motion } from 'framer-motion';

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

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');

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

  async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNoteError('');
    setNoteSuccess('');

    if (!title.trim()) {
      setNoteError('Title is required.');
      return;
    }

    if (!content.trim()) {
      setNoteError('Content is required.');
      return;
    }

    try {
      setNoteLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setNoteError('Your session has expired. Please log in again.');
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('notes').insert([
        {
          title: title.trim(),
          content: content.trim(),
          user_id: user.id,
        },
      ]);

      if (error) {
        setNoteError(error.message || 'Failed to add note.');
        return;
      }

      setTitle('');
      setContent('');
      setNoteSuccess('Note added successfully.');
      fetchNotes();
    } catch {
      setNoteError('Something went wrong. Please try again.');
    } finally {
      setNoteLoading(false);
    }
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
        setAiError(data.error || 'Something went wrong with AI. Try again.');
        return;
      }

      setAnswer(data.answer || 'No response from AI.');
    } catch {
      setAiError('Failed to fetch AI response.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="logo-wrap">
            <motion.img
              src="/logo.png"
              alt="Wingman Logo"
              className="logo-img"
              animate={{ y: [0, -6, 0], rotate: [0, 1.2, -1.2, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <h1 className="title">Dashboard</h1>
          <p className="inline-user">Logged in as: {user?.email}</p>

          <form className="stack-sm" onSubmit={handleAddNote}>
            <input
              className="input"
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="textarea"
              placeholder="Note content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {noteError && <p className="message-error">{noteError}</p>}
            {noteSuccess && <p className="message-success">{noteSuccess}</p>}

            <button className="button" type="submit" disabled={noteLoading}>
              {noteLoading ? 'Adding...' : 'Add Note'}
            </button>
          </form>

          <div className="notes-grid">
            {loadingNotes ? (
              <p className="subtitle">Loading notes...</p>
            ) : notes.length === 0 ? (
              <p className="subtitle">No notes yet for this user.</p>
            ) : (
              notes.map((note, index) => (
                <motion.div
                  className="note-card"
                  key={note.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                >
                  <h3 className="note-title">{note.title}</h3>
                  <p className="note-text">{note.content}</p>
                </motion.div>
              ))
            )}
          </div>

          <h2 className="section-title">Ask AI</h2>

          <form className="stack-sm" onSubmit={handleAskAI}>
            <textarea
              className="textarea"
              placeholder="Ask something about travel, airport, baggage, documents..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />

            <button className="button" type="submit" disabled={aiLoading}>
              {aiLoading ? 'Thinking...' : 'Ask AI'}
            </button>
          </form>

          {aiError && <p className="message-error" style={{ marginTop: '12px' }}>{aiError}</p>}

          {answer && (
            <motion.div
              className="answer-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="answer-title">AI Answer</h3>
              <p className="answer-text">{answer}</p>
            </motion.div>
          )}

          <button
            className="button button-red"
            style={{ marginTop: '24px' }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}