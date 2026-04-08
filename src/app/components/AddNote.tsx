'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AddNote({
  onNoteAdded,
}: {
  onNoteAdded: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!content.trim()) {
      setError('Content is required.');
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('Your session has expired. Please log in again.');
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
        setError(error.message || 'Failed to add note.');
        return;
      }

      setTitle('');
      setContent('');
      setSuccess('Note added successfully.');
      onNoteAdded();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAdd} style={{ marginTop: '20px' }}>
      <input
        className="input"
        type="text"
        placeholder="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className="input"
        placeholder="Note content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ minHeight: '100px', resize: 'vertical' }}
      />

      {error && (
        <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>
      )}

      {success && (
        <p style={{ color: 'green', marginBottom: '10px' }}>{success}</p>
      )}

      <button className="button" type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Note'}
      </button>
    </form>
  );
}