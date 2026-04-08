'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="container">
      <motion.div
        className="card home-card"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="logo-wrap">
          <motion.img
            src="/logo.png"
            alt="Wingman Logo"
            className="logo-img"
            animate={{ y: [0, -6, 0], rotate: [0, 1.5, -1.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.h1
          className="title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.55 }}
        >
          Wingman AI
        </motion.h1>

        <motion.p
          className="subtitle"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.55 }}
        >
          Your smart airport assistant for travel preparation, quick guidance,
          notes, and AI-powered answers.
        </motion.p>

        <motion.div
          className="home-actions"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55 }}
        >
          <Link href="/login">
            <button className="button">Login</button>
          </Link>

          <Link href="/signup">
            <button className="button button-green">Sign Up</button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}