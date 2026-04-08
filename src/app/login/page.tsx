'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="bg-orb one" />
      <div className="bg-orb two" />
      <div className="container">
        <motion.form
          className="glass-card auth-card"
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65 }}
        >
          <div className="logo-wrap">
            <motion.img
              src="/logo.png"
              alt="Wingman Logo"
              className="logo-img"
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <h1 className="title">Welcome Back</h1>
          <p className="subtitle">
            Log in to access your smart airport dashboard and AI assistant.
          </p>

          <div className="form-stack">
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="message-error" style={{ marginTop: '14px' }}>{error}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '16px' }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="link-row">
            Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}