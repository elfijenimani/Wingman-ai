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

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from('notes').insert([
      {
        title,
        content,
        user_id: user?.id,
      },
    ]);

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setTitle('');
    setContent('');
    onNoteAdded();
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

      <button className="button" type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Note'}
      </button>
    </form>
  );
}