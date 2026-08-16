import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import apiClient from '../api/client';
import { getAuthToken } from '../utils/auth';

/* ─── AI Chat Panel ─────────────────────────────────────────────────── */
function AIChatPanel({ onClose, userName = 'User' }) {
  const prompts = [
    'Improve my resume',
    'What skills should I learn?',
    'Prepare me for an ML interview',
    'Find jobs matching my skills',
    'Why is my job match score low?',
  ];
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hi ${userName}! I'm your AI Career Assistant. How can I help you today?` },
  ]);
  const [input, setInput] = useState('');

  const send = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: msg },
      { role: 'ai', text: `Great question! I'm analysing your profile for: "${msg}". Give me a moment to generate a personalised recommendation.` },
    ]);
    setInput('');
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 bg-surface border border-outline-variant rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-secondary text-on-primary">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined icon-filled text-[20px]">smart_toy</span>
          <span className="font-label-md text-label-md font-bold">✨ AI Career Assistant</span>
        </div>
        <button onClick={onClose} className="hover:opacity-70 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 space-y-3 max-h-56 overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl font-body-sm text-body-sm ${m.role === 'user'
                ? 'bg-primary text-on-primary rounded-br-sm'
                : 'bg-surface-container-low text-on-surface rounded-bl-sm'
                }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Quick prompts */}
      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="text-[10px] px-2 py-1 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors cursor-pointer font-label-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-3 pb-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask anything..."
          className="flex-1 bg-surface-container rounded-full px-3 py-1.5 text-body-sm font-body-sm text-on-surface border border-outline-variant focus:outline-none focus:border-primary text-sm"
        />
        <button
          onClick={() => send()}
          className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────── */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [jobProfile, setJobProfile] = useState(null);
  const [latestResumeStats, setLatestResumeStats] = useState(null);
  const [interviewReadiness, setInterviewReadiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch all protected dashboard endpoints using centralized apiClient
        const [userRes, jobRes, resumesRes, readinessRes] = await Promise.allSettled([
          apiClient.get('/users/me'),
          apiClient.get('/jobs/profile'),
          apiClient.get('/resumes'),
          apiClient.get('/interviews/readiness')
        ]);

        if (userRes.status === 'fulfilled') setProfile(userRes.value.data);
        if (jobRes.status === 'fulfilled') setJobProfile(jobRes.value.data);
        if (readinessRes.status === 'fulfilled') setInterviewReadiness(readinessRes.value.data);

        if (resumesRes.status === 'fulfilled' && resumesRes.value.data?.length > 0) {
          const resumes = resumesRes.value.data;
          resumes.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
          const latestResume = resumes[0];

          try {
            const statsData = await apiClient.get(`/resumes/${latestResume.id}/stats`);
            setLatestResumeStats(statsData.data);
          } catch (e) {
            console.warn("Could not fetch resume stats:", e);
          }
        }

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const recommendedJobs = [
    {
      title: 'Machine Learning Intern',
      company: 'TechVision AI',
      location: 'Chennai, India',
      skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
      match: 94,
      matchColor: 'text-tertiary',
      matchBg: 'bg-tertiary-container/10',
    },
    {
      title: 'Data Science Intern',
      company: 'AI Solutions',
      location: 'Bangalore, India',
      skills: ['Python', 'Pandas', 'SQL', 'Machine Learning'],
      match: 89,
      matchColor: 'text-primary',
      matchBg: 'bg-primary/10',
    },
    {
      title: 'AI Engineer Intern',
      company: 'TechLabs',
      location: 'Hyderabad, India',
      skills: ['Python', 'Deep Learning', 'FastAPI'],
      match: 86,
      matchColor: 'text-secondary',
      matchBg: 'bg-secondary/10',
    },
  ];

  const currentSkills = jobProfile?.profile?.skills?.length > 0
    ? jobProfile.profile.skills
    : ['Python', 'SQL', 'Machine Learning', 'Pandas', 'FastAPI'];

  const recommendedSkills = ['TensorFlow', 'AWS', 'Docker', 'Deep Learning'];

  const activityItems = [
    { icon: 'draw', label: 'Resume Updated', detail: 'Added Python and TensorFlow skills', time: '2 hours ago', color: '' },
    { icon: 'mic', label: 'Interview Completed', detail: 'Machine Learning Technical Interview', time: 'Yesterday', color: '' },
    { icon: 'work', label: 'New Job Match', detail: '3 new jobs match your profile', time: 'Yesterday', color: '' },
    { icon: 'tips_and_updates', label: 'Skill Recommendation', detail: 'AI recommends learning Docker', time: '2 days ago', isLast: true, color: 'text-primary' },
  ];

  const resumeScore = latestResumeStats ? latestResumeStats.completion_percentage : 0;
  const resumeOffset = 251.2 - (251.2 * resumeScore) / 100;

  const interviewScore = interviewReadiness ? interviewReadiness.readiness_score : 0;
  const interviewOffset = 251.2 - (251.2 * interviewScore) / 100;

  return (
    <div className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto w-full relative pb-24 md:pb-8">

          {/* Decorative Background Orb */}
          <div className="absolute top-10 right-20 w-96 h-96 bg-primary-container/20 rounded-full blur-[100px] pointer-events-none orb-pulse z-0"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* ── Left Column ────────────────────────────────────── */}
            <div className="lg:col-span-8 flex flex-col gap-gutter">

              {/* 1. Welcome Section */}
              <div className="stagger-1">
                {isLoading ? (
                  <div className="space-y-2 mb-4">
                    <div className="w-64 h-8 bg-outline-variant/20 animate-pulse rounded"></div>
                    <div className="w-96 h-4 bg-outline-variant/20 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display-lg text-display-lg font-extrabold text-on-background tracking-tight mb-2">
                      Welcome back, {profile?.full_name || 'User'} 👋
                    </h2>
                    <p className="font-body-lg text-body-lg text-on-surface-variant mb-4">
                      Track your career progress, improve your skills, and discover opportunities matched to your profile.
                    </p>
                  </>
                )}
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/resume-editor"
                    className="bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white px-5 py-2.5 rounded-lg font-label-md text-label-md transition-opacity shadow-md hover:opacity-95 inline-flex items-center gap-2 font-bold"
                  >
                    Create Resume
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                  <Link
                    to="/interview-session"
                    className="border border-outline-variant text-on-surface hover:bg-surface-container px-5 py-2.5 rounded-lg font-label-md text-label-md transition-colors inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">mic</span>
                    Start Interview
                  </Link>
                  <Link
                    to="/jobs"
                    className="border border-outline-variant text-on-surface hover:bg-surface-container px-5 py-2.5 rounded-lg font-label-md text-label-md transition-colors inline-flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">work</span>
                    Find Jobs
                  </Link>
                </div>
              </div>

              {/* 2. Continue Where You Left Off */}
              <div
                onClick={() => navigate('/resume-editor')}
                className="stagger-1 bg-surface rounded-xl p-stack-md border border-outline-variant shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-surface-container-low to-transparent opacity-50"></div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined icon-filled">description</span>
                    </div>
                    {isLoading ? (
                      <div className="space-y-1">
                        <div className="w-24 h-3 bg-outline-variant/20 animate-pulse rounded"></div>
                        <div className="w-48 h-4 bg-outline-variant/20 animate-pulse rounded"></div>
                      </div>
                    ) : latestResumeStats ? (
                      <div>
                        <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-1 font-semibold">
                          Continue where you left off
                        </p>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-background">
                          {latestResumeStats.title}
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Last edited {new Date(latestResumeStats.updated_at).toLocaleDateString()} • {latestResumeStats.completion_percentage}% complete
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-label-sm text-label-sm text-primary uppercase tracking-wider mb-1 font-semibold">
                          Get Started
                        </p>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-background">
                          Create your first resume
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          Build a professional, AI-powered resume in minutes.
                        </p>
                      </div>
                    )}
                  </div>
                  <Link
                    to="/resume-editor"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white px-4 py-2 rounded-lg font-label-md text-label-md transition-opacity shadow-md hover:opacity-95 inline-flex items-center gap-2 whitespace-nowrap font-bold"
                  >
                    Resume Editor
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* 3. Readiness Scores */}
              <div className="stagger-2 bg-surface rounded-xl p-stack-lg border border-outline-variant shadow-md">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-background mb-stack-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">query_stats</span>
                  Readiness Scores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-stack-md">
                  {/* Resume Strength */}
                  <div className="flex flex-col items-center justify-center p-stack-md bg-surface-container-lowest rounded-lg border border-outline-variant/50 hover:bg-surface-container-low hover:border-primary transition-all group">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-surface-container-high stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                        <circle className="text-primary stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={resumeOffset} strokeLinecap="round" strokeWidth="8"></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-headline-md text-headline-md font-bold text-primary">{resumeScore}%</span>
                      </div>
                    </div>
                    <p className="font-label-md text-label-md text-on-surface text-center group-hover:text-primary transition-colors font-semibold">
                      Resume<br />Strength
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1 text-[11px]">
                      Your resume is {resumeScore}% complete and optimized.
                    </p>
                    <Link
                      to="/resume-editor"
                      className="mt-2 text-primary text-[11px] font-semibold hover:underline flex items-center gap-1"
                    >
                      Improve Resume <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </Link>
                  </div>

                  {/* Interview Readiness */}
                  <div className="flex flex-col items-center justify-center p-stack-md bg-surface-container-lowest rounded-lg border border-outline-variant/50 hover:bg-surface-container-low hover:border-secondary transition-all group">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-surface-container-high stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                        <circle className="text-secondary stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={interviewOffset} strokeLinecap="round" strokeWidth="8"></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-headline-md text-headline-md font-bold text-secondary">{interviewScore}%</span>
                      </div>
                    </div>
                    <p className="font-label-md text-label-md text-on-surface text-center group-hover:text-secondary transition-colors font-semibold">
                      Interview<br />Readiness
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1 text-[11px]">
                      Based on your recent AI mock interview practice.
                    </p>
                    <Link
                      to="/interview-session"
                      className="mt-2 text-secondary text-[11px] font-semibold hover:underline flex items-center gap-1"
                    >
                      Practice Interview <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </Link>
                  </div>

                  {/* Job Match 94% */}
                  <div className="flex flex-col items-center justify-center p-stack-md bg-surface-container-lowest rounded-lg border border-outline-variant/50 hover:bg-surface-container-low hover:border-tertiary transition-all group">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-surface-container-high stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                        <circle className="text-tertiary-container stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="15.07" strokeLinecap="round" strokeWidth="8"></circle>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-headline-md text-headline-md font-bold text-tertiary-container">94%</span>
                      </div>
                    </div>
                    <p className="font-label-md text-label-md text-on-surface text-center group-hover:text-tertiary transition-colors font-semibold">
                      Job<br />Match
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1 text-[11px]">
                      Average match with recommended opportunities.
                    </p>
                    <Link
                      to="/jobs"
                      className="mt-2 text-tertiary text-[11px] font-semibold hover:underline flex items-center gap-1"
                    >
                      Explore Jobs <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* 4. Career Journey Stepper */}
              <div className="stagger-3 bg-surface rounded-xl p-stack-lg border border-outline-variant shadow-md">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-background mb-stack-lg">
                  Your Career Journey
                </h3>
                <div className="relative px-4">
                  {/* Background Line */}
                  <div className="absolute top-5 left-8 right-8 h-1 bg-surface-container-high z-0"></div>
                  {/* Progress Line — 40% = steps 1+2 done */}
                  <div className="absolute top-5 left-8 w-[40%] h-1 bg-primary z-0 transition-all duration-1000"></div>

                  <div className="relative z-10 flex justify-between">
                    {/* 01 Profile ✓ */}
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface">Profile</span>
                      <span className="font-label-sm text-[10px] text-primary font-bold">Complete</span>
                    </div>

                    {/* 02 Resume ✓ */}
                    <Link to="/resume-editor" className="flex flex-col items-center group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface">Resume</span>
                      <span className="font-label-sm text-[10px] text-primary font-bold">85%</span>
                    </Link>

                    {/* 03 Interview — current */}
                    <Link to="/interview-session" className="flex flex-col items-center group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-surface border-2 border-primary text-primary flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform relative">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                        <div className="absolute -inset-1 bg-primary rounded-full opacity-20 animate-ping"></div>
                      </div>
                      <span className="font-label-sm text-label-sm text-primary font-bold">Interview</span>
                      <span className="font-label-sm text-[10px] text-primary">Current</span>
                    </Link>

                    {/* 04 Job Search — upcoming */}
                    <Link to="/jobs" className="flex flex-col items-center group cursor-pointer opacity-80 hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-surface border-2 border-outline-variant text-outline flex items-center justify-center mb-2">
                        <span className="font-label-md text-label-md">4</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Job Search</span>
                      <span className="font-label-sm text-[10px] text-on-surface-variant">Upcoming</span>
                    </Link>

                    {/* 05 Career Growth — upcoming */}
                    <div className="flex flex-col items-center group cursor-default opacity-60">
                      <div className="w-10 h-10 rounded-full bg-surface border-2 border-outline-variant text-outline flex items-center justify-center mb-2">
                        <span className="font-label-md text-label-md">5</span>
                      </div>
                      <span className="font-label-sm text-label-sm text-on-surface-variant">Career Growth</span>
                      <span className="font-label-sm text-[10px] text-on-surface-variant">Upcoming</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Recommended Jobs */}
              <div className="stagger-3 bg-surface rounded-xl p-stack-lg border border-outline-variant shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-background flex items-center gap-2">
                      <span className="material-symbols-outlined text-outline">work</span>
                      Recommended Jobs
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      Opportunities matched to your skills and career goals.
                    </p>
                  </div>
                  <Link
                    to="/jobs"
                    className="text-primary font-label-sm text-label-sm font-semibold hover:underline flex items-center gap-1 whitespace-nowrap"
                  >
                    View All Jobs <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
                <div className="flex flex-col gap-3">
                  {recommendedJobs.map((job, i) => (
                    <div
                      key={i}
                      className="bg-surface-container-lowest border border-outline-variant/50 rounded-lg p-4 hover:bg-surface-container-low hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 items-start">
                          <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center shrink-0 font-bold text-primary text-base">
                            {job.company.charAt(0)}
                          </div>
                          <div>
                            <p className="font-label-md text-label-md font-bold text-on-background">{job.title}</p>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              {job.company} • {job.location}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {job.skills.map((s) => (
                                <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/40 font-label-sm">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className={`shrink-0 text-right`}>
                          <span className={`font-headline-sm text-headline-sm font-extrabold ${job.matchColor}`}>
                            {job.match}%
                          </span>
                          <p className="font-label-sm text-[10px] text-on-surface-variant">Match</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3 pt-3 border-t border-outline-variant/30">
                        <Link to="/jobs" className="text-[11px] px-3 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-sm cursor-pointer">
                          View Details
                        </Link>
                        <button className="text-[11px] px-3 py-1.5 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-sm cursor-pointer">
                          Save
                        </button>
                        <Link to="/jobs" className="text-[11px] px-3 py-1.5 rounded text-white bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-90 transition-all font-label-sm cursor-pointer ml-auto">
                          Apply
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Skill Gap Analysis */}
              <div className="stagger-3 bg-surface rounded-xl p-stack-lg border border-outline-variant shadow-md">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-background mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">trending_up</span>
                  Skill Gap Analysis
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  Skills that can improve your career opportunities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Current Skills */}
                  <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/50 p-4">
                    <p className="font-label-md text-label-md font-bold text-on-surface mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-tertiary text-[18px]">check_circle</span>
                      Current Skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {currentSkills.map((s) => (
                        <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-tertiary-container/10 text-tertiary border border-tertiary/20 font-label-sm font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Recommended Skills */}
                  <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/50 p-4">
                    <p className="font-label-md text-label-md font-bold text-on-surface mb-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-secondary text-[18px]">add_circle</span>
                      Recommended to Learn
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recommendedSkills.map((s) => (
                        <span key={s} className="text-[11px] px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-label-sm font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-3 flex items-start gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">tips_and_updates</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Learning <span className="font-semibold text-primary">TensorFlow</span> and <span className="font-semibold text-primary">AWS</span> could increase your eligibility for Machine Learning Engineer roles.
                  </p>
                </div>
                <Link
                  to="/interview-evaluation"
                  className="inline-flex items-center gap-2 text-primary font-label-md text-label-md font-semibold hover:underline"
                >
                  View Career Roadmap
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>

              {/* 7. Recent Interview Performance */}
              <div className="stagger-3 bg-surface rounded-xl p-stack-lg border border-outline-variant shadow-md">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-background mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">mic</span>
                  Recent Interview Performance
                </h3>
                {isLoading ? (
                  <div className="w-full h-32 bg-outline-variant/10 animate-pulse rounded-lg"></div>
                ) : interviewReadiness && interviewReadiness.completed_count > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Overall Score Ring */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center bg-surface-container-lowest rounded-lg border border-outline-variant/50 p-4">
                      <div className="relative w-28 h-28 mb-2">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                          <circle className="text-surface-container-high stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                          <circle className="text-secondary stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * interviewReadiness.average_score) / 100} strokeLinecap="round" strokeWidth="8"></circle>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-headline-md text-headline-md font-bold text-secondary">{interviewReadiness.average_score}%</span>
                          <span className="font-label-sm text-[10px] text-on-surface-variant">Average</span>
                        </div>
                      </div>
                      <p className="font-label-md text-label-md font-bold text-on-surface text-center">Overall Score</p>
                    </div>

                    {/* Breakdown bars */}
                    <div className="md:col-span-5 flex flex-col justify-center gap-3">
                      {[
                        { label: 'Technical Accuracy', score: interviewReadiness.technical, color: 'bg-primary' },
                        { label: 'Communication Style', score: interviewReadiness.communication, color: 'bg-secondary' },
                        { label: 'Confidence & Delivery', score: interviewReadiness.confidence, color: 'bg-tertiary-container' },
                      ].map((dim) => (
                        <div key={dim.label}>
                          <div className="flex justify-between mb-1">
                            <span className="font-body-sm text-body-sm text-on-surface-variant">{dim.label}</span>
                            <span className="font-label-sm text-label-sm font-bold text-on-surface">{dim.score}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className={`h-full ${dim.color} rounded-full`} style={{ width: `${dim.score}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-3 flex flex-col justify-center gap-2">
                      <Link
                        to="/interview-evaluation"
                        className="w-full text-center px-3 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-sm text-label-sm cursor-pointer"
                      >
                        View Results
                      </Link>
                      <Link
                        to="/interview-session"
                        className="w-full text-center px-3 py-2 rounded-lg text-white bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-90 transition-all font-label-sm text-label-sm cursor-pointer"
                      >
                        Practice Again
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                      You haven't completed any AI mock interviews yet.
                    </p>
                    <Link
                      to="/interview-session"
                      className="text-white px-5 py-2.5 rounded-lg font-label-md text-label-md transition-all shadow-sm inline-flex items-center gap-2 bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-90"
                    >
                      <span className="material-symbols-outlined text-[18px]">mic</span>
                      Start Mock Interview
                    </Link>
                  </div>
                )}
              </div>

            </div>

            {/* ── Right Column ────────────────────────────────────── */}
            <div className="lg:col-span-4 flex flex-col gap-gutter">

              {/* AI Career Insight Card */}
              <div className="stagger-2 bg-surface rounded-xl p-1 relative overflow-hidden shadow-md group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-tertiary opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="absolute inset-[1px] bg-surface rounded-[10px] z-10"></div>
                <div className="relative z-20 p-stack-md">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined ai-text-gradient icon-filled">smart_toy</span>
                    <h4 className="font-label-md text-label-md font-bold text-on-background tracking-wide uppercase ai-text-gradient">
                      AI Career Insight
                    </h4>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface mb-4">
                    Your profile is strong for <span className="font-semibold text-primary">Machine Learning</span> roles. Adding TensorFlow and AWS could improve your job match score.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-surface-container-low border border-outline-variant/30 text-on-surface px-2 py-1 rounded text-label-sm font-label-sm">
                      TensorFlow
                    </span>
                    <span className="bg-surface-container-low border border-outline-variant/30 text-on-surface px-2 py-1 rounded text-label-sm font-label-sm">
                      AWS
                    </span>
                  </div>
                  <Link
                    to="/interview-evaluation"
                    className="w-full block text-center bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white py-2 rounded-lg font-label-md text-label-md hover:opacity-95 transition-opacity shadow-md font-bold"
                  >
                    View Skill Gaps →
                  </Link>
                </div>
              </div>

              {/* Recent Activity Panel */}
              <div className="stagger-3 bg-surface rounded-xl border border-outline-variant shadow-md flex-1 overflow-hidden flex flex-col">
                <div className="p-stack-md border-b border-outline-variant/50 bg-surface-container-lowest">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-background">Recent Activity</h3>
                </div>
                <div className="p-stack-md flex-1 overflow-y-auto">
                  <ul className="space-y-4">
                    {activityItems.map((item, i) => (
                      <li key={i} className="flex gap-3 relative">
                        {!item.isLast && (
                          <div className="w-[2px] bg-surface-container-high absolute left-4 top-8 bottom-[-16px]"></div>
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${item.isLast ? 'bg-primary-container/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-body-sm text-body-sm text-on-background">
                            <span className="font-semibold">{item.label}:</span> {item.detail}
                          </p>
                          <span className="font-label-sm text-label-sm text-outline">{item.time}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
          </div>
        </div>

      {/* ── Floating AI Assistant Button ───────────────────────────── */}
      <button
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-24 md:bottom-8 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white px-4 py-3 rounded-full shadow-xl hover:opacity-95 transition-opacity cursor-pointer font-label-md text-label-md font-bold"
        title="AI Career Assistant"
      >
        <span className="material-symbols-outlined icon-filled text-[20px]">smart_toy</span>
        <span className="hidden sm:inline">✨ AI Career Assistant</span>
      </button>

      {/* AI Chat Panel */}
      {chatOpen && <AIChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}
