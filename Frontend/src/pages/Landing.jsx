import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accentSecondary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <header className="px-8 py-6 flex justify-between items-center border-b border-zinc-800/50 backdrop-blur-sm z-10">
        <h1 className="text-2xl font-display font-bold text-white tracking-widest uppercase">ResFlow</h1>
        <nav className="flex items-center gap-6 text-sm font-mono text-zinc-400">
          <Link to="/login" className="hover:text-white transition">Log In</Link>
          <Link to="/register" className="border border-zinc-700 px-4 py-2 hover:border-accent hover:text-accent transition">
            Access Terminal
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-block px-3 py-1 border border-accent/30 bg-accent/10 text-accent font-mono text-xs tracking-widest uppercase mb-6 rounded-sm">
            System Online • v1.0.0
          </div>
          <h2 className="text-6xl md:text-8xl font-display font-bold text-white leading-tight mb-6">
            Your Resume.<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accentSecondary">Weaponized.</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 font-body">
            Advanced parsing, 5-dimensional ATS scoring, and AI-driven career coaching. 
            Calibrate your profile against precision targets and dominate the market.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 font-mono text-sm">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-accent text-background font-bold hover:bg-accent/90 transition shadow-[0_0_20px_rgba(110,231,183,0.3)]">
              [ Analyze My Resume ]
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition">
              See How It Works ↗
            </Link>
          </div>
        </motion.div>
      </main>

      <footer className="border-t border-zinc-800/50 py-6 text-center text-zinc-600 font-mono text-xs z-10">
        <p>ResFlow Intelligence Core © 2026</p>
      </footer>
    </div>
  );
}
