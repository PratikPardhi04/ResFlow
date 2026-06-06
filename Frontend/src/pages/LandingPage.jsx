import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Target, FileText, MessageSquare, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Career Coach',
    description: 'Get instant, personalized feedback on your resume using our advanced AI engine.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10'
  },
  {
    icon: Target,
    title: 'JD Matching',
    description: 'Compare your profile against job descriptions and uncover critical skill gaps.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10'
  },
  {
    icon: FileText,
    title: 'Cover Letter Generator',
    description: 'Create tailored cover letters in seconds that highlight your exact qualifications.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  {
    icon: Briefcase,
    title: 'Smart Job Search',
    description: 'Discover relevant roles matched to your unique skills and experience.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10'
  }
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-cyan-500/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-500/10 blur-[120px] pointer-events-none rounded-full" />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 shadow-glow-cyan flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ResFlow</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary flex items-center gap-2 px-5 py-2">
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                Log In
              </Link>
              <Link to="/register" className="btn-primary py-2 px-5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05] mb-8 shadow-glass"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-gray-300">The next generation of career intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-tight"
        >
          Land your dream job with <br className="hidden md:block" />
          <span className="text-gradient">AI-Powered Precision</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed"
        >
          ResFlow analyzes your resume, matches you with job descriptions, and provides an interactive AI coach to supercharge your career trajectory.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link to={isAuthenticated ? "/dashboard" : "/register"} className="btn-primary text-lg px-8 py-4 flex items-center gap-2 shadow-glow-cyan">
            Start Optimizing For Free <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-28 w-full"
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="glass-panel-hover p-6 text-left group border border-white/[0.04]">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-sm font-medium">ResFlow</span>
          </div>
          <p className="text-gray-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} ResFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
