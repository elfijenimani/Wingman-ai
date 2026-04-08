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
        <motion.div
          className="glass-card home-card"
          initial={{ opacity: 0, y: 34, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <motion.div
            className="mini-badge"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            ✈ Smart Travel Assistant
          </motion.div>

          <div className="logo-wrap">
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

          <motion.h1
            className="title"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Wingman AI
          </motion.h1>

          <motion.p
            className="subtitle"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            A modern airport companion that helps you manage travel notes,
            prepare for flights, and get fast AI-powered guidance when you need it.
          </motion.p>

          <motion.div
            className="home-actions"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/login">
              <button className="btn btn-primary">Login</button>
            </Link>

            <Link href="/signup">
              <button className="btn btn-success">Sign Up</button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}