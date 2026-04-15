'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { motion } from 'framer-motion';
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
  { id: 1, label: 'Passport ready', done: false },
  { id: 2, label: 'Boarding pass downloaded', done: false },
  { id: 3, label: 'Baggage rules checked', done: false },
  { id: 4, label: 'Charger packed', done: false },
  { id: 5, label: 'Arrival time planned', done: false },
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

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [tripPlans, setTripPlans] = useState<TripPlan[]>([]);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    setChecklist(loadFromStorage('wingman_checklist', defaultChecklist));
    setChatHistory(loadFromStorage('wingman_chat_history', []));
    setTripPlans(loadFromStorage('wingman_trip_plans', []));
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

  async function fetchNotes() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id);

    setNotes(data || []);
    setLoadingNotes(false);
  }

  async function handleSaveNote(e: any) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (editingId) {
      await supabase
        .from('notes')
        .update({ title, content })
        .eq('id', editingId);
    } else {
      await supabase.from('notes').insert([
        {
          title,
          content,
          user_id: user.id,
        },
      ]);
    }

    setTitle('');
    setContent('');
    setEditingId(null);
    fetchNotes();
  }

  async function handleDeleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id);
    fetchNotes();
  }

  async function sendAIRequest(prompt: string) {
    setAiLoading(true);

    const res = await fetch('/api/ask', {
      method: 'POST',
      body: JSON.stringify({ question: prompt }),
    });

    const data = await res.json();
    setAnswer(data.answer);

    setChatHistory((prev) => [
      { role: 'user', text: prompt },
      { role: 'ai', text: data.answer },
      ...prev,
    ]);

    setAiLoading(false);
  }

  async function saveAiAnswerAsNote() {
    if (!answer) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from('notes').insert([
      {
        title: 'AI Answer',
        content: answer,
        user_id: user?.id,
      },
    ]);

    fetchNotes();
  }

  async function handleCopyAnswer() {
    await navigator.clipboard.writeText(answer);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  }

  function toggleChecklist(id: number) {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  }

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  function handleAddTrip(e: any) {
    e.preventDefault();

    const newTrip = {
      id: Date.now(),
      destination: title,
      departureDate: content,
      reminder: 'Remember everything!',
    };

    setTripPlans((prev) => [newTrip, ...prev]);
  }

  return (
    <ProtectedRoute>
      <div className="container">
        <div className="glass-card dashboard-card">

          <div className="topbar">
            <h1>Wingman Dashboard</h1>
            <div>
              <button onClick={toggleTheme}>Toggle Theme</button>
            </div>
          </div>

          <div className="panel">
            <h2>Create Note</h2>
            <form onSubmit={handleSaveNote}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Content"
              />
              <button type="submit">Save</button>
            </form>
          </div>

          <div className="panel">
            <h2>Notes</h2>
            {notes.map((n) => (
              <div key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.content}</p>
                <button onClick={() => handleDeleteNote(n.id)}>Delete</button>
              </div>
            ))}
          </div>

          <div className="panel">
            <h2>Ask AI</h2>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={() => sendAIRequest(question)} disabled={aiLoading}>
              Ask
            </button>

            {answer && (
              <>
                <p>{answer}</p>
                <button onClick={saveAiAnswerAsNote}>Save</button>
                <button onClick={handleCopyAnswer}>Copy</button>
                {copySuccess && <p>{copySuccess}</p>}
              </>
            )}
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}