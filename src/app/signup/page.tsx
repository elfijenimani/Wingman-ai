'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function validateEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value);
  }

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

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

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess('Account created successfully. Redirecting to login...');

      setTimeout(() => {
        router.push('/login');
      }, 1400);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="bg-orb one" />
      <div className="bg-orb three" />
      <div className="container">
        <motion.form
          className="glass-card auth-card"
          onSubmit={handleSignup}
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

          <h1 className="title">Create Account</h1>
          <p className="subtitle">
            Join Wingman AI and keep your travel notes and AI help in one place.
          </p>

          <div className="form-stack">
            <input
              className="input"
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
          {success && <p className="message-success" style={{ marginTop: '14px' }}>{success}</p>}

          <button
            className="btn btn-success"
            style={{ width: '100%', marginTop: '16px' }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="link-row">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </motion.form>
      </div>
    </div>
  );
}