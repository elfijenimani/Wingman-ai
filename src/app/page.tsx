'use client';

import { FormEvent, useState } from 'react';

export default function HomePage() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError('');
    setAnswer('');

    if (!prompt.trim()) {
      setError('Please enter a question first.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Wingman
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            AI Airport Assistant
          </h1>
          <p className="mt-3 text-slate-600">
            Ask about check-in, baggage, documents, terminal timing, or airport steps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: What should I do before airport check-in?"
            rows={5}
            className="w-full rounded-2xl border border-slate-200 p-4 text-slate-900 outline-none transition focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Thinking...' : 'Submit'}
          </button>
        </form>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {answer && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              AI Response
            </h2>
            <p className="whitespace-pre-line text-slate-700">{answer}</p>
          </div>
        )}
      </div>
    </main>
  );
}