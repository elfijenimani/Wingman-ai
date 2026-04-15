'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { loadFromStorage, saveToStorage } from '../lib/storage';

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

type ChatItem = {
  role: 'user' | 'ai';
  text: string;
};

type ChecklistItem = {
  id: number;
  label: string;
  done: boolean;
};

type TripPlan = {
  id: number;
  destination: string;
  departureDate: string;
  reminder: string;
};

const quickPrompts = [
  'What should I do before my flight?',
  'What documents should I check before traveling?',
  'What can I carry in hand luggage?',
  'How early should I arrive at the airport?',
];

const defaultChecklist: ChecklistItem[] = [
  { id: 1, label: 'Passport / ID ready', done: false },
  { id: 2, label: 'Boarding pass downloaded', done: false },
  { id: 3, label: 'Baggage rules checked', done: false },
  { id: 4, label: 'Charger and essentials packed', done: false },
  { id: 5, label: 'Airport arrival time planned', done: false },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState('');
  const [noteSuccess, setNoteSuccess] = useState('');

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);

  const [tripDestination, setTripDestination] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [tripReminder, setTripReminder] = useState('');
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    setChecklist(loadFromStorage<ChecklistItem[]>('wingman_checklist', defaultChecklist));
    setChatHistory(loadFromStorage<ChatItem[]>('wingman_chat_history', []));
    setTripPlans(loadFromStorage<TripPlan[]>('wingman_trip_plans', []));

    const savedTheme = loadFromStorage<'dark' | 'light'>('wingman_theme', 'dark');
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    saveToStorage('wingman_checklist', checklist);
  }, [checklist]);

  useEffect(() => {
    saveToStorage('wingman_chat_history', chatHistory);
  }, [chatHistory]);

  useEffect(() => {
    saveToStorage('wingman_trip_plans', tripPlans);
  }, [tripPlans]);

  useEffect(() => {
    saveToStorage('wingman_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const completedChecklist = useMemo(
    () => checklist.filter((item) => item.done).length,
    [checklist]
  );

  const filteredNotes = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term)
    );
  }, [notes, searchTerm]);

  const userInitial = useMemo(() => {
    return user?.email?.[0]?.toUpperCase() || 'W';
  }, [user]);

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

    if (!error) {
      setNotes(data || []);
    }

    setLoadingNotes(false);
  }

  async function handleSaveNote(e: React.FormEvent<HTMLFormElement>) {
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

      if (editingId) {
        const { error } = await supabase
          .from('notes')
          .update({
            title: title.trim(),
            content: content.trim(),
          })
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) {
          setNoteError(error.message || 'Failed to update note.');
          return;
        }

        setNoteSuccess('Note updated successfully.');
      } else {
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

        setNoteSuccess('Note added successfully.');
      }

      setTitle('');
      setContent('');
      setEditingId(null);
      fetchNotes();
    } catch {
      setNoteError('Something went wrong. Please try again.');
    } finally {
      setNoteLoading(false);
    }
  }

  function handleEditNote(note: Note) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setNoteError('');
    setNoteSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle('');
    setContent('');
    setNoteError('');
    setNoteSuccess('');
  }

  async function handleDeleteNote(noteId: string) {
    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (!confirmDelete) return;

    const { error } = await supabase.from('notes').delete().eq('id', noteId);

    if (!error) {
      fetchNotes();
    }
  }

  async function sendAIRequest(prompt: string) {
    setAiError('');
    setAnswer('');
    setCopySuccess('');

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

      const aiResponse = data.answer || 'No response from AI.';
      setAnswer(aiResponse);

      setChatHistory((prev) => [
        { role: 'user', text: prompt },
        { role: 'ai', text: aiResponse },
        ...prev,
      ]);
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

  async function saveAiAnswerAsNote() {
    if (!answer.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase.from('notes').insert([
      {
        title: 'Saved AI Answer',
        content: answer,
        user_id: user.id,
      },
    ]);

    if (!error) {
      fetchNotes();
      setNoteSuccess('AI answer saved as note.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleCopyAnswer() {
    if (!answer.trim()) return;

    await navigator.clipboard.writeText(answer);
    setCopySuccess('Answer copied successfully.');

    setTimeout(() => {
      setCopySuccess('');
    }, 2000);
  }

  function toggleChecklist(id: number) {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, done: !item.done } : item
      )
    );
  }

  function clearChatHistory() {
    setChatHistory([]);
    saveToStorage('wingman_chat_history', []);
  }

  function handleAddTrip(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!tripDestination.trim() || !tripDate.trim() || !tripReminder.trim()) {
      return;
    }

    const newTrip: TripPlan = {
      id: Date.now(),
      destination: tripDestination.trim(),
      departureDate: tripDate,
      reminder: tripReminder.trim(),
    };

    setTripPlans((prev) => [newTrip, ...prev]);
    setTripDestination('');
    setTripDate('');
    setTripReminder('');
  }

  function handleDeleteTrip(id: number) {
    setTripPlans((prev) => prev.filter((trip) => trip.id !== id));
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
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

                <div className="topbar-actions">
                  <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                  <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-card">
                  <p className="stat-label">Saved Notes</p>
                  <h3 className="stat-value">{notes.length}</h3>
                </div>

                <div className="stat-card">
                  <p className="stat-label">AI Messages</p>
                  <h3 className="stat-value">{chatHistory.length}</h3>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Trips Planned</p>
                  <h3 className="stat-value">{tripPlans.length}</h3>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Checklist Done</p>
                  <h3 className="stat-value">
                    {completedChecklist}/{checklist.length}
                  </h3>
                </div>
              </div>

              <div className="dashboard-layout">
                <div className="sidebar">
                  <h3 className="sidebar-title">Navigation</h3>
                  <div className="sidebar-nav">
                    <a className="sidebar-link" href="#create-note">
                      <div className="icon-row"><span className="icon">✍️</span><span>Create Note</span></div>
                    </a>
                    <a className="sidebar-link" href="#my-notes">
                      <div className="icon-row"><span className="icon">📝</span><span>My Notes</span></div>
                    </a>
                    <a className="sidebar-link" href="#trip-planner">
                      <div className="icon-row"><span className="icon">🧳</span><span>Trip Planner</span></div>
                    </a>
                    <a className="sidebar-link" href="#quick-actions">
                      <div className="icon-row"><span className="icon">⚡</span><span>Quick Actions</span></div>
                    </a>
                    <a className="sidebar-link" href="#ask-ai">
                      <div className="icon-row"><span className="icon">🤖</span><span>Ask AI</span></div>
                    </a>
                    <a className="sidebar-link" href="#checklist">
                      <div className="icon-row"><span className="icon">✅</span><span>Checklist</span></div>
                    </a>
                  </div>
                </div>

                <div className="main-content">
                  <div id="create-note" className="panel section-anchor">
                    <h2 className="panel-title">
                      {editingId ? 'Edit Note' : 'Create Note'}
                    </h2>

                    <form className="form-stack" onSubmit={handleSaveNote}>
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
                        {noteLoading
                          ? editingId
                            ? 'Saving...'
                            : 'Adding...'
                          : editingId
                          ? 'Save Changes'
                          : 'Add Note'}
                      </button>

                      {editingId && (
                        <button
                          type="button"
                          className="btn btn-danger btn-full"
                          onClick={handleCancelEdit}
                        >
                          Cancel Edit
                        </button>
                      )}
                    </form>
                  </div>

                  <div id="my-notes" className="panel section-anchor">
                    <h2 className="panel-title">My Notes</h2>

                    <input
                      className="input"
                      type="text"
                      placeholder="Search notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ marginTop: '6px' }}
                    />

                    <div className="notes-list">
                      {loadingNotes ? (
                        <p className="empty-text">Loading notes...</p>
                      ) : filteredNotes.length === 0 ? (
                        <p className="empty-text">
                          {notes.length === 0
                            ? 'No notes yet for this user.'
                            : 'No notes match your search.'}
                        </p>
                      ) : (
                        filteredNotes.map((note, index) => (
                          <motion.div
                            key={note.id}
                            className="note-card"
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                          >
                            <h3 className="note-title">{note.title}</h3>
                            <p className="note-text">{note.content}</p>

                            <div className="edit-actions">
                              <button
                                type="button"
                                className="small-btn secondary"
                                onClick={() => handleEditNote(note)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="small-btn"
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  <div id="trip-planner" className="panel section-anchor">
                    <h2 className="panel-title">Trip Planner</h2>

                    <form className="form-stack" onSubmit={handleAddTrip}>
                      <input
                        className="input"
                        type="text"
                        placeholder="Destination"
                        value={tripDestination}
                        onChange={(e) => setTripDestination(e.target.value)}
                      />

                      <input
                        className="input"
                        type="date"
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                      />

                      <textarea
                        className="textarea"
                        placeholder="Packing reminder / travel note..."
                        value={tripReminder}
                        onChange={(e) => setTripReminder(e.target.value)}
                      />

                      <button className="btn btn-success btn-full" type="submit">
                        Save Trip Plan
                      </button>
                    </form>

                    <div className="trip-grid">
                      {tripPlans.length === 0 ? (
                        <p className="empty-text">No trip plans yet.</p>
                      ) : (
                        tripPlans.map((trip) => (
                          <div className="trip-card" key={trip.id}>
                            <h3 className="trip-title">{trip.destination}</h3>
                            <p className="trip-text">{trip.reminder}</p>
                            <p className="trip-meta">Departure: {trip.departureDate}</p>

                            <div className="edit-actions">
                              <button
                                type="button"
                                className="small-btn"
                                onClick={() => handleDeleteTrip(trip.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div id="quick-actions" className="panel section-anchor">
                    <h2 className="panel-title">Quick AI Actions</h2>

                    <div className="quick-actions">
                      {quickPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          className="quick-btn"
                          disabled={aiLoading}
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

                  <div id="ask-ai" className="panel section-anchor">
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

                    {aiLoading && (
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    )}

                    {aiError && <p className="message-error" style={{ marginTop: '14px' }}>{aiError}</p>}

                    {answer ? (
                      <motion.div
                        className="answer-box"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                      >
                        <h3 className="answer-title">Latest AI Answer</h3>
                        <p className="answer-text">{answer}</p>

                        <div className="two-btns" style={{ marginTop: '14px' }}>
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={saveAiAnswerAsNote}
                            disabled={!answer.trim()}
                          >
                            Save AI Answer
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleCopyAnswer}
                            disabled={!answer.trim()}
                          >
                            Copy Answer
                          </button>
                        </div>

                        {copySuccess && <p className="message-success">{copySuccess}</p>}
                      </motion.div>
                    ) : (
                      <div className="answer-box" style={{ marginTop: '14px' }}>
                        <h3 className="answer-title">Assistant Ready</h3>
                        <p className="empty-text">
                          Ask a question or use quick action buttons to get travel help instantly.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="right-column">
                  <div className="panel">
                    <h2 className="panel-title">Profile</h2>
                    <div className="profile-card">
                      <div className="avatar">{userInitial}</div>
                      <div>
                        <div className="profile-name">Wingman User</div>
                        <div className="profile-email">{user?.email}</div>
                      </div>
                      <p className="empty-text">
                        Your account is protected and your saved notes are visible only to you.
                      </p>
                    </div>
                  </div>

                  <div className="panel">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <h2 className="panel-title" style={{ marginBottom: 0 }}>
                        AI Chat History
                      </h2>

                      {chatHistory.length > 0 && (
                        <button type="button" className="small-btn" onClick={clearChatHistory}>
                          Clear History
                        </button>
                      )}
                    </div>

                    {chatHistory.length === 0 ? (
                      <p className="empty-text" style={{ marginTop: '14px' }}>
                        No AI history yet.
                      </p>
                    ) : (
                      <div className="chat-history">
                        {chatHistory.map((item, index) => (
                          <motion.div
                            key={index}
                            className={`chat-bubble ${item.role}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            <div className="chat-label">
                              {item.role === 'user' ? 'You' : 'Wingman AI'}
                            </div>
                            <div className="answer-text">{item.text}</div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div id="checklist" className="panel section-anchor">
                    <h2 className="panel-title">Travel Checklist</h2>

                    <div className="checklist">
                      {checklist.map((item) => (
                        <label
                          key={item.id}
                          className={`check-item check-row ${item.done ? 'done' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() => toggleChecklist(item.id)}
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
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