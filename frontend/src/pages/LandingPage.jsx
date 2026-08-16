import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Mic,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Award,
  Terminal,
  Layers,
  Bot,
  Search,
  Menu,
  X,
  Code,
  BarChart3,
  Check,
  Star,
  Zap,
  Users,
  ChevronRight,
  Cpu,
  Target
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Framer Motion Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: custom * 0.1, ease: [0.25, 0.4, 0.25, 1] }
    })
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const cardVariant = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="bg-[#FAF8FA] text-gray-900 font-sans min-h-screen flex flex-col selection:bg-pink-100 selection:text-[#EC4899]">
      
      {/* ── 1. NAVIGATION BAR ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#EC4899] via-[#F43F5E] to-[#FF8A3D] p-0.5 shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#EC4899]" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900 block leading-none">
                Career<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]">AI</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
                Smart Career Platform
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              ['Home', '#home'],
              ['Resume', '#resume'],
              ['AI Studio', '#ai-studio'],
              ['Interview', '#interview'],
              ['Jobs', '#jobs'],
              ['Workflow', '#workflow'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#EC4899] transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right Auth CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs font-bold uppercase tracking-wider text-gray-700 hover:text-[#EC4899] px-4 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-xs font-bold uppercase tracking-wider text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FF8A3D] hover:opacity-95 hover:shadow-lg hover:shadow-pink-500/25 transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-gray-900 p-2 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 px-6 py-5 flex flex-col gap-4 shadow-xl"
          >
            {[
              ['Home', '#home'],
              ['Resume', '#resume'],
              ['AI Studio', '#ai-studio'],
              ['Interview', '#interview'],
              ['Jobs', '#jobs'],
              ['Workflow', '#workflow'],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-gray-700 hover:text-[#EC4899] py-1"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full text-center py-2.5 border border-gray-200 text-gray-800 rounded-xl font-bold text-xs uppercase"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="w-full text-center py-2.5 text-white bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] rounded-xl font-bold text-xs uppercase shadow-md"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </header>


      <main className="flex-1">

        {/* ── 2. HERO SECTION ───────────────────────────────────────────────────── */}
        <section id="home" className="relative pt-12 md:pt-20 pb-20 md:pb-32 overflow-hidden">
          
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-200/40 rounded-full filter blur-3xl -z-10 pointer-events-none" />
          <div className="absolute top-1/3 left-10 w-80 h-80 bg-orange-200/30 rounded-full filter blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Hero Text */}
              <motion.div
                className="lg:col-span-6 flex flex-col gap-6"
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200/60 text-[#EC4899] text-xs font-extrabold uppercase tracking-wider w-fit shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#EC4899] animate-pulse" />
                  AI-Powered Career Platform
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                  Build Your Career.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FF8A3D]">
                    Powered by AI.
                  </span>
                </h1>

                {/* Supporting Text */}
                <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed max-w-xl">
                  Create smarter resumes, practice realistic interviews, discover the right job opportunities, and get personalized career guidance — all in one unified AI-powered platform.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                  <Link
                    to="/signup"
                    className="text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-xl bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FF8A3D] hover:opacity-95 shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                  >
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href="#features"
                    className="bg-white border border-gray-200/80 text-gray-800 font-bold text-sm uppercase tracking-wider px-7 py-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    Explore Features
                  </a>
                </div>

                {/* Trust Highlights */}
                <div className="pt-6 border-t border-gray-200/60 grid grid-cols-3 gap-4 text-center sm:text-left">
                  <div>
                    <span className="block text-xl font-black text-gray-900">ATS Compatible</span>
                    <span className="text-xs font-semibold text-gray-500">20+ Modern Templates</span>
                  </div>
                  <div>
                    <span className="block text-xl font-black text-gray-900">Live Sandbox</span>
                    <span className="text-xs font-semibold text-gray-500">Piston Code Execution</span>
                  </div>
                  <div>
                    <span className="block text-xl font-black text-gray-900">STAR Evaluator</span>
                    <span className="text-xs font-semibold text-gray-500">Behavioral Feedback</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Hero Animated Product Composition */}
              <motion.div
                className="lg:col-span-6 relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Floating Preview Canvas */}
                <div className="relative mx-auto max-w-lg bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-3xl p-6 shadow-2xl shadow-pink-500/10">
                  
                  {/* Top Bar Mockup */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-xs font-bold text-gray-400 ml-2">CareerAI AI Studio Workspace</span>
                    </div>
                    <span className="px-2.5 py-1 bg-pink-50 text-[#EC4899] rounded-full text-[10px] font-black uppercase">
                      Live AI Engine
                    </span>
                  </div>

                  {/* Main Metric Cards Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    
                    {/* Resume Score Card */}
                    <div className="bg-gradient-to-br from-pink-50/50 to-white border border-pink-100 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-600">Resume Score</span>
                        <FileText className="w-4 h-4 text-[#EC4899]" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900">92</span>
                        <span className="text-xs font-bold text-pink-600">%</span>
                      </div>
                      <div className="w-full h-1.5 bg-pink-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] w-[92%] rounded-full" />
                      </div>
                    </div>

                    {/* ATS Compatibility */}
                    <div className="bg-gradient-to-br from-orange-50/50 to-white border border-orange-100 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-600">ATS Match</span>
                        <CheckCircle2 className="w-4 h-4 text-[#FF8A3D]" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900">88</span>
                        <span className="text-xs font-bold text-orange-600">%</span>
                      </div>
                      <div className="w-full h-1.5 bg-orange-100 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[#FF8A3D] w-[88%] rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Interview & Job Match Row */}
                  <div className="space-y-3">
                    <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Technical Interview Mock</p>
                          <p className="text-[10px] text-gray-500">STAR Analysis & Sandbox Code Execution</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        84/100
                      </span>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Senior Backend Engineer</p>
                          <p className="text-[10px] text-gray-500">Python · FastAPI · PostgreSQL</p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                        91% Match
                      </span>
                    </div>
                  </div>

                  {/* Animated Floating Suggestion Badge */}
                  <motion.div
                    className="absolute -bottom-5 -right-4 bg-white border border-gray-200/80 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 max-w-xs"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EC4899] to-[#FF8A3D] flex items-center justify-center text-white flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">✨ AI Suggestions</p>
                      <p className="text-[11px] text-gray-500 leading-tight">Tailored 12 keywords for target role</p>
                    </div>
                  </motion.div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>


        {/* ── 3. TRUST & PRODUCT OVERVIEW ────────────────────────────────────── */}
        <section id="features" className="py-20 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#EC4899] block mb-2">
                All-In-One Platform
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Everything You Need to Move Your Career Forward
              </h2>
              <p className="text-base text-gray-600 font-medium mt-3">
                One platform for your resume, interviews, job search, and AI-powered career growth.
              </p>
            </div>

            {/* 4 Feature Core Cards */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: FileText,
                  color: 'text-pink-500 bg-pink-50 border-pink-100',
                  title: '📄 Resume Suite',
                  desc: 'Create, edit, and export ATS-optimized resumes with live preview & LaTeX code editor.'
                },
                {
                  icon: Sparkles,
                  color: 'text-rose-500 bg-rose-50 border-rose-100',
                  title: '✨ AI Studio',
                  desc: 'Analyze ATS compatibility, tailor content to job descriptions, and improve bullet points.'
                },
                {
                  icon: Mic,
                  color: 'text-amber-500 bg-amber-50 border-amber-100',
                  title: '🎤 Mock Interviews',
                  desc: 'Practice technical, STAR behavioral, and coding interviews with live Piston code execution.'
                },
                {
                  icon: Briefcase,
                  color: 'text-orange-500 bg-orange-50 border-orange-100',
                  title: '💼 Smart Job Search',
                  desc: 'Discover relevant tech opportunities matching your real skills and experience.'
                }
              ].map((f, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariant}
                  className="bg-white border border-gray-200/70 p-6 rounded-2xl shadow-xs hover:shadow-xl hover:border-pink-200 transition-all group transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl border ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </section>


        {/* ── 4. RESUME SECTION ──────────────────────────────────────────────── */}
        <section id="resume" className="py-24 relative overflow-hidden bg-[#FAF8FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Description */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-[#EC4899] text-xs font-extrabold uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  Resume Builder & Editor
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  Create a Resume That Gets Noticed
                </h2>

                <p className="text-base text-gray-600 font-medium leading-relaxed">
                  Build professional, ATS-friendly resumes using your real skills, education, projects, and work experience. Choose from executive templates or tweak raw code.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs font-bold text-gray-800 pt-2">
                  {[
                    'AI Resume Generation',
                    '20+ Modern Templates',
                    'Real-time Section Builder',
                    'ATS Compatibility Check',
                    'LaTeX Code Editor',
                    'PDF Instant Export',
                    'Bullet Point Improver',
                    'Multiple Versions'
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#EC4899] flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-95 shadow-md shadow-pink-500/20"
                  >
                    Create Your Resume
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Mockup */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xl">
                  
                  {/* Editor Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#EC4899] flex items-center justify-center font-bold">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Software_Engineer_Resume.pdf</h4>
                        <span className="text-[10px] text-gray-400">ATS Optimized · Executive Template</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> ATS Score: 92%
                    </span>
                  </div>

                  {/* Resume Paper Mockup */}
                  <div className="bg-gray-50 border border-gray-200/60 p-6 rounded-2xl space-y-4 text-left">
                    <div className="border-b border-gray-200 pb-3">
                      <div className="h-4 bg-gray-900 w-1/3 rounded mb-1" />
                      <div className="h-3 bg-[#EC4899] w-1/4 rounded" />
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Technical Skills</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Python', 'FastAPI', 'PostgreSQL', 'React', 'TypeScript', 'Docker', 'AWS'].map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 rounded text-[11px] font-bold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Work Experience</span>
                      <div className="bg-white p-3 rounded-xl border border-gray-200/60 space-y-1">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-900">
                          <span>Senior Backend Developer · CareerTech</span>
                          <span className="text-gray-400">2024 - Present</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium">
                          • Architected FastAPI microservices handling 1M daily requests with Supabase PostgreSQL.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ── 5. AI STUDIO SECTION ────────────────────────────────────────────── */}
        <section id="ai-studio" className="py-24 bg-white border-y border-gray-100 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-[#EC4899] text-xs font-extrabold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                AI Studio Intelligence
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Your Resume's AI Copilot
              </h2>
              <p className="text-base text-gray-600 font-medium mt-3">
                Analyze, improve, tailor, and optimize your resume with intelligent AI tools.
              </p>
            </div>

            {/* 8 AI Operation Pills */}
            <div className="flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto mb-12">
              {[
                'Analyze Resume',
                'Improve Resume',
                'Match Job Description',
                'Tailor Resume',
                'Generate Resume',
                'Skills Recommendations',
                'Improve Bullet Points',
                'ATS Score Analyzer'
              ].map((op, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-[#FAF8FA] border border-gray-200/80 hover:border-pink-300 hover:text-[#EC4899] rounded-xl text-xs font-bold text-gray-700 transition-colors shadow-2xs"
                >
                  ✨ {op}
                </span>
              ))}
            </div>

            {/* AI Studio Analysis Card Mockup */}
            <div className="max-w-3xl mx-auto bg-gradient-to-b from-white to-pink-50/20 border border-pink-100 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">AI Resume Analysis Report</h3>
                    <p className="text-xs text-gray-500">Evaluated against Senior Software Engineer benchmark</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-gray-900">92%</span>
                  <span className="text-[10px] font-bold text-pink-600 block uppercase">ATS Compatibility</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50/80 border border-green-200/60 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-green-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Key Strengths
                  </h4>
                  <ul className="text-xs text-green-800 space-y-1 font-medium">
                    <li>✓ Strong technical depth in Python & FastAPI</li>
                    <li>✓ Good project experience & quantitative metrics</li>
                  </ul>
                </div>

                <div className="bg-amber-50/80 border border-amber-200/60 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Improvement Opportunities
                  </h4>
                  <ul className="text-xs text-amber-800 space-y-1 font-medium">
                    <li>⚠ Expand professional summary focus</li>
                    <li>⚠ Add target job keywords for Cloud & Docker</li>
                  </ul>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider px-7 py-3 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-95 shadow-md shadow-pink-500/20"
                >
                  Explore AI Studio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </section>


        {/* ── 6. INTERVIEW PREPARATION SECTION ────────────────────────────────── */}
        <section id="interview" className="py-24 bg-[#FAF8FA] border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Interactive Mockup Preview */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xl">
                  
                  {/* Interview Session Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Software Engineer Mock Interview</h4>
                        <span className="text-[10px] text-gray-400">Technical Mode · Intermediate Level</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                      Question 4 of 10
                    </span>
                  </div>

                  {/* Question Box */}
                  <div className="bg-gray-50 border border-gray-200/60 p-4 rounded-xl mb-4">
                    <p className="text-xs font-bold text-gray-900">
                      "How would you design authentication and token rotation for a FastAPI application?"
                    </p>
                  </div>

                  {/* Evaluation Score Card */}
                  <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-purple-900 uppercase">Answer Score</span>
                      <span className="text-lg font-black text-purple-900">82 / 100</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold">
                      <div className="bg-white px-2.5 py-1.5 rounded-lg border border-purple-100 text-purple-900 text-center">
                        Technical 85%
                      </div>
                      <div className="bg-white px-2.5 py-1.5 rounded-lg border border-purple-100 text-purple-900 text-center">
                        Relevance 90%
                      </div>
                      <div className="bg-white px-2.5 py-1.5 rounded-lg border border-purple-100 text-purple-900 text-center">
                        Clarity 82%
                      </div>
                      <div className="bg-white px-2.5 py-1.5 rounded-lg border border-purple-100 text-purple-900 text-center">
                        Completeness 78%
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Description */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-extrabold uppercase tracking-wider">
                  <Mic className="w-3.5 h-3.5" />
                  AI Interview Studio
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                  Practice Interviews. Build Confidence.
                </h2>

                <p className="text-base text-gray-600 font-medium leading-relaxed">
                  Prepare for technical, STAR behavioral, HR, and live coding interviews with dynamic AI evaluation and immediate feedback.
                </p>

                <div className="space-y-3 text-xs font-bold text-gray-800 pt-1">
                  {[
                    'Technical & System Design Interviews',
                    'Behavioral STAR Method Evaluation',
                    'Piston Sandbox Live Code Execution',
                    'Adaptive Non-Repetitive Questions',
                    'Weighted Mathematical Scoring',
                    'Detailed Model Ideal Answers'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-95 shadow-md shadow-pink-500/20"
                  >
                    Practice an Interview
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ── 7. JOB SEARCH SECTION ───────────────────────────────────────────── */}
        <section id="jobs" className="py-24 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF8A3D] text-xs font-extrabold uppercase tracking-wider mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                Smart Job Discovery
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Find Jobs That Match You
              </h2>
              <p className="text-base text-gray-600 font-medium mt-3">
                Search for relevant opportunities based on your skills, experience, resume, and target role.
              </p>
            </div>

            {/* Mock Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {[
                {
                  role: 'Senior Software Engineer',
                  company: 'CloudTech Solutions',
                  match: '91%',
                  tags: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
                  color: 'text-green-600 bg-green-50 border-green-200'
                },
                {
                  role: 'AI/ML Solutions Engineer',
                  company: 'Nexus AI Labs',
                  match: '87%',
                  tags: ['Python', 'PyTorch', 'RAG Pipelines', 'Vector DB'],
                  color: 'text-pink-600 bg-pink-50 border-pink-200'
                },
                {
                  role: 'Full Stack Engineer',
                  company: 'Innovate Digital',
                  match: '84%',
                  tags: ['React', 'TypeScript', 'Node.js', 'Supabase'],
                  color: 'text-orange-600 bg-orange-50 border-orange-200'
                }
              ].map((job, idx) => (
                <div key={idx} className="bg-[#FAF8FA] border border-gray-200/80 p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900">{job.role}</h3>
                        <p className="text-xs text-gray-500 font-medium">{job.company}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black border ${job.color}`}>
                        {job.match} Match
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {job.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 rounded text-[10px] font-bold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      to="/signup"
                      className="w-full text-center py-2.5 bg-white border border-gray-200 hover:border-pink-300 hover:text-[#EC4899] text-gray-800 text-xs font-bold rounded-xl transition-colors inline-block"
                    >
                      View Job Match Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-95 shadow-md shadow-pink-500/20"
              >
                Explore Job Search
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </section>


        {/* ── 8. CAREER INTELLIGENCE SECTION ─────────────────────────────────── */}
        <section className="py-20 bg-[#FAF8FA] border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#EC4899] block mb-2">
                Example Career Insights (Visual Product Preview)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Understand Where You Stand
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { label: 'Resume Readiness', val: '92%', color: 'from-pink-500 to-rose-500' },
                { label: 'Interview Readiness', val: '84%', color: 'from-purple-500 to-indigo-500' },
                { label: 'Target Job Match', val: '88%', color: 'from-amber-500 to-orange-500' },
                { label: 'Skill Profile Completeness', val: '96%', color: 'from-green-500 to-emerald-500' }
              ].map((m, idx) => (
                <div key={idx} className="bg-white border border-gray-200/70 p-5 rounded-2xl text-center shadow-xs">
                  <span className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${m.color}`}>
                    {m.val}
                  </span>
                  <p className="text-xs font-bold text-gray-600 mt-1">{m.label}</p>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ── 9. CAREER WORKFLOW ──────────────────────────────────────────────── */}
        <section id="workflow" className="py-24 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#EC4899] block mb-2">
                Step-by-Step Pathway
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                How CareerAI Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Create Your Profile',
                  desc: 'Tell CareerAI about your skills, education, projects, and target role preferences.'
                },
                {
                  step: '02',
                  title: 'Build Your Resume',
                  desc: 'Craft ATS-friendly resumes using executive templates or raw LaTeX code.'
                },
                {
                  step: '03',
                  title: 'Improve With AI',
                  desc: 'Analyze ATS compatibility, tailor content to job descriptions, and enhance bullet points.'
                },
                {
                  step: '04',
                  title: 'Practice Interviews',
                  desc: 'Practice technical, STAR behavioral, and live coding interviews with sandbox evaluation.'
                },
                {
                  step: '05',
                  title: 'Discover Matching Jobs',
                  desc: 'Search for opportunities curated to your exact profile and skill strengths.'
                },
                {
                  step: '06',
                  title: 'Grow Your Career',
                  desc: 'Track your career readiness, bridge skill gaps, and land your next role with confidence.'
                }
              ].map((w, idx) => (
                <div key={idx} className="bg-[#FAF8FA] border border-gray-200/80 p-6 rounded-2xl space-y-3 relative group hover:border-pink-300 transition-colors">
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]">
                    {w.step}
                  </span>
                  <h3 className="text-base font-extrabold text-gray-900">{w.title}</h3>
                  <p className="text-xs text-gray-600 font-medium leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* ── 10. COMPREHENSIVE FEATURE GRID ──────────────────────────────────── */}
        <section className="py-24 bg-[#FAF8FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Everything in One Career Platform
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Resume Pillar */}
              <div className="bg-white border border-gray-200/70 p-6 rounded-2xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#EC4899] flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Resume Suite</h3>
                <ul className="text-xs text-gray-600 space-y-2 font-medium">
                  <li>• Resume Builder & Editor</li>
                  <li>• 20+ Executive Templates</li>
                  <li>• Built-in LaTeX Editor</li>
                  <li>• Instant PDF Export</li>
                  <li>• Multiple Target Versions</li>
                </ul>
              </div>

              {/* AI Studio Pillar */}
              <div className="bg-white border border-gray-200/70 p-6 rounded-2xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">AI Studio</h3>
                <ul className="text-xs text-gray-600 space-y-2 font-medium">
                  <li>• ATS Score Analyzer</li>
                  <li>• Job Match Keyword Engine</li>
                  <li>• Bullet Point Improver</li>
                  <li>• Resume Tailoring Copilot</li>
                  <li>• Interactive AI Assistant</li>
                </ul>
              </div>

              {/* Interview Pillar */}
              <div className="bg-white border border-gray-200/70 p-6 rounded-2xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Interview Studio</h3>
                <ul className="text-xs text-gray-600 space-y-2 font-medium">
                  <li>• Technical & System Design</li>
                  <li>• STAR Behavioral Evaluator</li>
                  <li>• Piston Code Sandbox Execution</li>
                  <li>• Adaptive Difficulty Logic</li>
                  <li>• Detailed Score Reports</li>
                </ul>
              </div>

              {/* Job Discovery Pillar */}
              <div className="bg-white border border-gray-200/70 p-6 rounded-2xl space-y-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-extrabold text-gray-900">Jobs & Intelligence</h3>
                <ul className="text-xs text-gray-600 space-y-2 font-medium">
                  <li>• Resume-Based Job Search</li>
                  <li>• Skill Matching & Gap Analysis</li>
                  <li>• Salary & Location Filters</li>
                  <li>• Career Readiness Scoring</li>
                  <li>• Practice Action Plans</li>
                </ul>
              </div>

            </div>

          </div>
        </section>


        {/* ── 11. FINAL CONVERSION BANNER ─────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="bg-gradient-to-r from-[#EC4899] via-[#F43F5E] to-[#FF8A3D] rounded-3xl p-8 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-6 relative z-10">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Ready to Build Your Career With AI?
                </h2>
                <p className="text-sm sm:text-base font-medium opacity-90 leading-relaxed">
                  Create your CareerAI profile today and start building a smarter path toward your next opportunity.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto bg-white text-gray-900 font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg shadow-black/10"
                  >
                    Get Started Free →
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto border border-white/40 text-white font-extrabold text-xs uppercase tracking-wider px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>


      {/* ── 12. FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200/80 pt-16 pb-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Branding Column */}
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#EC4899] to-[#FF8A3D] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-lg tracking-tight text-gray-900">
                  Career<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]">AI</span>
                </span>
              </Link>
              <p className="text-xs text-gray-500 font-medium max-w-sm leading-relaxed">
                Smart Career Platform powering resumes, mock interviews, job search matching, and AI career guidance.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">Product</h4>
              <ul className="space-y-2 text-gray-600 font-medium">
                <li><a href="#resume" className="hover:text-[#EC4899]">Resume Suite</a></li>
                <li><a href="#ai-studio" className="hover:text-[#EC4899]">AI Studio</a></li>
                <li><a href="#interview" className="hover:text-[#EC4899]">Mock Interview</a></li>
                <li><a href="#jobs" className="hover:text-[#EC4899]">Job Discovery</a></li>
              </ul>
            </div>

            {/* Account Links */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">Account</h4>
              <ul className="space-y-2 text-gray-600 font-medium">
                <li><Link to="/login" className="hover:text-[#EC4899]">Login</Link></li>
                <li><Link to="/signup" className="hover:text-[#EC4899]">Sign Up</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#EC4899]">Dashboard</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-[11px]">Legal</h4>
              <ul className="space-y-2 text-gray-600 font-medium">
                <li><a href="#" className="hover:text-[#EC4899]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#EC4899]">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#EC4899]">Security</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between text-gray-400 font-medium text-[11px]">
            <p>© 2026 CareerAI. All rights reserved.</p>
            <p>Designed with Sunset Brand Gradient (#EC4899 → #FF8A3D)</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
