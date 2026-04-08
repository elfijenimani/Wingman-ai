'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="page-shell">
      <div className="bg-orb one" />
      <div className="bg-orb two" />
      <div className="bg-orb three" />

      <div className="container">
        <div className="auth-shell">
          <motion.div
            className="glass-card auth-hero"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="badge">✈ Wingman Airport Guide</div>

            <div className="logo-wrap left">
              <motion.img
                src="/logo.png"
                alt="Wingman Logo"
                className="logo-img"
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 1.5, -1.5, 0],
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            <h1 className="hero-title">
              Travel smarter with
              <br />
              Wingman AI
            </h1>

            <p className="hero-subtitle">
              A modern airport assistant that helps you manage personal travel
              notes, prepare for flights, and get instant AI guidance about
              baggage, documents, airport tips, and flight preparation.
            </p>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3 className="feature-title">AI Guidance</h3>
                <p className="feature-text">
                  Ask quick travel questions and receive clear AI-powered answers.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h3 className="feature-title">Personal Notes</h3>
                <p className="feature-text">
                  Save travel reminders and manage your own private checklist.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛫</div>
                <h3 className="feature-title">Airport Ready</h3>
                <p className="feature-text">
                  Stay prepared with airport tips, document checks, and smart actions.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="glass-card auth-form-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="auth-form-inner">
              <h2 className="title">Start your journey</h2>
              <p className="subtitle">
                Access your travel dashboard and AI assistant with one click.
              </p>

              <div className="form-stack">
                <Link href="/login">
                  <button className="btn btn-primary btn-full">Login</button>
                </Link>

                <Link href="/signup">
                  <button className="btn btn-success btn-full">Create Account</button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}