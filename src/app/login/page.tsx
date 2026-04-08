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
        <div className="auth-shell">
          <motion.div
            className="glass-card auth-hero"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="badge">🔐 Secure Access</div>

            <div className="logo-wrap left">
              <motion.img
                src="/logo.png"
                alt="Wingman Logo"
                className="logo-img"
                animate={{ y: [0, -8, 0], rotate: [0, 1.5, -1.5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <h1 className="hero-title">
              Welcome back to
              <br />
              Wingman AI
            </h1>

            <p className="hero-subtitle">
              Log in to access your airport guide dashboard, saved travel notes,
              and AI-powered assistant features.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">📄</div>
                <h3 className="feature-title">Travel Notes</h3>
                <p className="feature-text">
                  Keep important reminders and personal flight notes in one place.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3 className="feature-title">Assistant</h3>
                <p className="feature-text">
                  Get instant answers for airport, baggage, and travel preparation.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3 className="feature-title">Private Data</h3>
                <p className="feature-text">
                  Your notes and account are protected and visible only to you.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.form
            className="glass-card auth-form-card"
            onSubmit={handleLogin}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="auth-form-inner">
              <h1 className="title">Login</h1>
              <p className="subtitle">Enter your details to continue.</p>

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

              {error && <p className="message-error">{error}</p>}

              <button
                className="btn btn-primary btn-full"
                style={{ marginTop: '16px' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="link-row">
                Don&apos;t have an account? <Link href="/signup">Sign Up</Link>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}