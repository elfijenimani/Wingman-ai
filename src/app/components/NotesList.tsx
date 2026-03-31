'use client';

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p style={{ marginTop: '20px', color: '#666' }}>
        No notes yet for this user.
      </p>
    );
  }

  return (
    <div style={{ marginTop: '24px' }}>
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            background: '#f8f8f8',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '12px',
            textAlign: 'left',
          }}
        >
          <h3 style={{ marginBottom: '8px' }}>{note.title}</h3>
          <p style={{ color: '#555' }}>{note.content}</p>
        </div>
      ))}
    </div>
  );
}