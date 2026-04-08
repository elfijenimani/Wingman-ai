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
        <div className="auth-shell">
          <motion.div
            className="glass-card auth-hero"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="badge">✨ Create Your Account</div>

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
              Join the next generation
              <br />
              of travel help
            </h1>

            <p className="hero-subtitle">
              Create your Wingman AI account to save personal notes, explore AI travel
              support, and prepare for flights more confidently.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Fast Setup</h3>
                <p className="feature-text">
                  Create your account quickly and start using the assistant immediately.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📌</div>
                <h3 className="feature-title">Smart Planning</h3>
                <p className="feature-text">
                  Store travel notes, reminders, and pre-flight planning in one place.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🌍</div>
                <h3 className="feature-title">Travel Ready</h3>
                <p className="feature-text">
                  Stay ready with AI-powered help for flights, documents, and baggage.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.form
            className="glass-card auth-form-card"
            onSubmit={handleSignup}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="auth-form-inner">
              <h1 className="title">Sign Up</h1>
              <p className="subtitle">Create your account to continue.</p>

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

              {error && <p className="message-error">{error}</p>}
              {success && <p className="message-success">{success}</p>}

              <button
                className="btn btn-success btn-full"
                style={{ marginTop: '16px' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="link-row">
                Already have an account? <Link href="/login">Login</Link>
              </p>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}