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

const quickPrompts = [
  'What should I do before my flight?',
  'What documents should I check before traveling?',
  'What can I carry in hand luggage?',
  'How early should I arrive at the airport?',
];

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

  async function sendAIRequest(prompt: string) {
    setAiError('');
    setAnswer('');

    if (!prompt.trim()) {
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
        body: JSON.stringify({ question: prompt }),
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

  async function handleAskAI(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await sendAIRequest(question);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <ProtectedRoute>
      <div className="page-shell">
        <div className="bg-orb one" />
        <div className="bg-orb two" />
        <div className="bg-orb three" />

        <div className="container">
          <div className="dashboard-shell">
            <motion.div
              className="glass-card dashboard-card"
              initial={{ opacity: 0, y: 26, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.65 }}
            >
              <div className="topbar">
                <div className="topbar-left">
                  <motion.img
                    src="/logo.png"
                    alt="Wingman Logo"
                    className="topbar-logo"
                    animate={{ y: [0, -5, 0], rotate: [0, 1.2, -1.2, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div>
                    <h1 className="topbar-title">Wingman Dashboard</h1>
                    <p className="topbar-subtitle">Logged in as: {user?.email}</p>
                  </div>
                </div>

                <button className="btn btn-danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>

              <div className="stats-row">
                <div className="stat-card">
                  <p className="stat-label">Saved Notes</p>
                  <h3 className="stat-value">{notes.length}</h3>
                </div>

                <div className="stat-card">
                  <p className="stat-label">AI Status</p>
                  <h3 className="stat-value">{aiLoading ? 'Busy' : 'Ready'}</h3>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Travel Mode</p>
                  <h3 className="stat-value">Active</h3>
                </div>
              </div>

              <div className="dashboard-grid">
                <div>
                  <div className="panel">
                    <h2 className="panel-title">Create Note</h2>

                    <form className="form-stack" onSubmit={handleAddNote}>
                      <input
                        className="input"
                        type="text"
                        placeholder="Note title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />

                      <textarea
                        className="textarea"
                        placeholder="Write a note..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />

                      {noteError && <p className="message-error">{noteError}</p>}
                      {noteSuccess && <p className="message-success">{noteSuccess}</p>}

                      <button className="btn btn-primary btn-full" type="submit" disabled={noteLoading}>
                        {noteLoading ? 'Adding...' : 'Add Note'}
                      </button>
                    </form>
                  </div>

                  <div className="panel">
                    <h2 className="panel-title">My Notes</h2>

                    <div className="notes-list">
                      {loadingNotes ? (
                        <p className="empty-text">Loading notes...</p>
                      ) : notes.length === 0 ? (
                        <p className="empty-text">No notes yet for this user.</p>
                      ) : (
                        notes.map((note, index) => (
                          <motion.div
                            key={note.id}
                            className="note-card"
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
                  </div>
                </div>

                <div>
                  <div className="panel">
                    <h2 className="panel-title">Quick AI Actions</h2>

                    <div className="quick-actions">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          className="quick-btn"
                          onClick={() => {
                            setQuestion(prompt);
                            sendAIRequest(prompt);
                          }}
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="panel">
                    <h2 className="panel-title">Ask AI</h2>

                    <form className="form-stack" onSubmit={handleAskAI}>
                      <textarea
                        className="textarea"
                        placeholder="Ask something about airport rules, baggage, documents, or travel preparation..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                      />

                      <button className="btn btn-primary btn-full" type="submit" disabled={aiLoading}>
                        {aiLoading ? 'Thinking...' : 'Ask AI'}
                      </button>
                    </form>

                    {aiError && <p className="message-error" style={{ marginTop: '14px' }}>{aiError}</p>}

                    {answer ? (
                      <motion.div
                        className="answer-box"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <h3 className="answer-title">AI Answer</h3>
                        <p className="answer-text">{answer}</p>
                      </motion.div>
                    ) : (
                      <div className="answer-box" style={{ marginTop: '14px' }}>
                        <h3 className="answer-title">Assistant Ready</h3>
                        <p className="empty-text">
                          Ask a question or use the quick action buttons to get travel help instantly.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="panel">
                    <h2 className="panel-title">Travel Checklist</h2>

                    <div className="checklist">
                      <div className="check-item">✅ Passport / ID ready</div>
                      <div className="check-item">✅ Boarding pass downloaded</div>
                      <div className="check-item">✅ Baggage rules checked</div>
                      <div className="check-item">✅ Charger and essentials packed</div>
                      <div className="check-item">✅ Airport arrival time planned</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}