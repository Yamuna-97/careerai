import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function InterviewLandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeGuideTab, setActiveGuideTab] = useState('before'); // before, during, after
  
  // Readiness Stats
  const [readiness, setReadiness] = useState({
    readiness_score: 72,
    technical: 78,
    communication: 68,
    confidence: 71,
    problem_solving: 76,
    behavioral: 72,
    streak: 3,
    completed_count: 5,
    average_score: 74,
    best_score: 84,
  });

  // History List
  const [history, setHistory] = useState([
    {
      id: 'session_1',
      role: 'Python Developer',
      interview_type: 'Technical',
      difficulty: 'intermediate',
      overall_score: 84,
      duration: 20,
      created_at: '2026-08-12T14:32:00Z',
    },
    {
      id: 'session_2',
      role: 'Full Stack Developer',
      interview_type: 'Mixed Interview',
      difficulty: 'pro',
      overall_score: 68,
      duration: 30,
      created_at: '2026-08-10T10:15:00Z',
    },
    {
      id: 'session_3',
      role: 'Frontend Developer',
      interview_type: 'HR / Behavioral',
      difficulty: 'beginner',
      overall_score: 72,
      duration: 15,
      created_at: '2026-08-08T09:00:00Z',
    }
  ]);

  useEffect(() => {
    // Fetch real data from FastAPI backend
    const fetchData = async () => {
      try {
        const token = 'mock_user_token';
        
        // Fetch Stats
        const statsRes = await fetch('http://localhost:8000/api/v1/interviews/readiness', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          // Update only if we have actual completed interviews
          if (statsData.completed_count > 0) {
            setReadiness(statsData);
          }
        }

        // Fetch History
        const historyRes = await fetch('http://localhost:8000/api/v1/interviews/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (historyData && historyData.length > 0) {
            setHistory(historyData);
          }
        }
      } catch (err) {
        console.error("Failed to connect to backend api, using high-fidelity mock data.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStartBeginnerPractice = async () => {
    try {
      const token = 'mock_user_token';
      const payload = {
        role: 'Software Engineer',
        difficulty: 'beginner',
        interview_type: 'Mixed Interview',
        format: 'text',
        num_questions: 5,
        duration: 15,
        resume_based: false
      };
      
      const res = await fetch('http://localhost:8000/api/v1/interviews/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const data = await res.json();
        navigate(`/interview-session?session_id=${data.session_id || data.session.id}`);
      } else {
        // Fallback for static demo
        navigate('/interview-session?demo=true');
      }
    } catch (e) {
      console.error(e);
      navigate('/interview-session?demo=true');
    }
  };

  const handlePracticeAgain = async (sessionId) => {
    try {
      const token = 'mock_user_token';
      const res = await fetch(`http://localhost:8000/api/v1/interviews/${sessionId}/practice-again`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/interview-session?session_id=${data.session_id || data.session.id}`);
      } else {
        navigate('/interview-session?demo=true');
      }
    } catch (e) {
      navigate('/interview-session?demo=true');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm("Are you sure you want to delete this interview record?")) return;
    try {
      const token = 'mock_user_token';
      const res = await fetch(`http://localhost:8000/api/v1/interviews/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h.id !== sessionId));
      }
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex pb-20 md:pb-8">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen w-full">
        <Header title="AI Interview Prep Coach" subtitle="Interactive dashboards, personalized guidance, and real-time simulator" />

        <main className="flex-grow px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1280px] mx-auto w-full flex flex-col gap-8">
          
          {/* HERO SECTION */}
          <section className="relative bg-gradient-to-r from-secondary-container to-primary-container text-on-primary rounded-2xl p-8 md:p-12 overflow-hidden shadow-lg flex flex-col md:flex-row items-center gap-8">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-bl-full pointer-events-none"></div>
            <div className="flex-1 z-10 text-center md:text-left">
              <h2 className="font-display-lg text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
                Prepare Smarter. Interview Better.
              </h2>
              <p className="font-body-lg text-lg text-white/95 max-w-xl mb-8 leading-relaxed">
                Practice with an AI interviewer, get personalized feedback, and become interview-ready.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <button
                  onClick={() => navigate('/interview-setup')}
                  className="bg-white text-secondary px-8 py-3.5 rounded-lg font-label-md text-label-md font-bold shadow-md hover:bg-surface-container-low transition-all hover:scale-[1.02] cursor-pointer"
                >
                  Start Practice Interview
                </button>
                <a
                  href="#interview-guide"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-3.5 rounded-lg font-label-md text-label-md font-bold transition-all cursor-pointer"
                >
                  Explore Interview Guide
                </a>
              </div>
            </div>
            <div className="w-full md:w-1/3 flex justify-center z-10">
              <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center relative shadow-inner animate-pulse">
                <span className="material-symbols-outlined text-[96px] text-white icon-filled">psychology</span>
              </div>
            </div>
          </section>

          {/* READINESS & ANALYTICS SECTION */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            
            {/* Readiness Circle & Metrics */}
            <div className="lg:col-span-8 bg-surface rounded-xl p-stack-lg border border-outline-variant/40 shadow-sm flex flex-col md:flex-row items-center gap-8">
              
              {/* Circular gauge */}
              <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle className="text-surface-container-high stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                  <circle className="text-secondary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * readiness.readiness_score) / 100} strokeLinecap="round" strokeWidth="9"></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-display-lg text-4xl font-extrabold text-on-surface">
                    {readiness.readiness_score}%
                  </span>
                  <span className="font-label-sm text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                    Readiness
                  </span>
                </div>
              </div>

              {/* Dimensional scores list */}
              <div className="flex-1 w-full space-y-4">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface border-b border-outline-variant/30 pb-2">
                  Readiness Breakdown
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { label: 'Technical Accuracy', score: readiness.technical, color: 'bg-primary' },
                    { label: 'Communication Style', score: readiness.communication, color: 'bg-secondary' },
                    { label: 'Confidence & Delivery', score: readiness.confidence, color: 'bg-tertiary-container' },
                    { label: 'Problem Solving', score: readiness.problem_solving, color: 'bg-secondary-container' },
                  ].map((dim, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-on-surface-variant">{dim.label}</span>
                        <span className="font-bold text-on-surface">{dim.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${dim.color} rounded-full`} style={{ width: `${dim.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Completion Stats */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              {[
                { icon: 'task_alt', title: 'Completed', val: readiness.completed_count, desc: 'sessions' },
                { icon: 'star', title: 'Average Score', val: `${readiness.average_score}%`, desc: 'points' },
                { icon: 'emoji_events', title: 'Best Score', val: `${readiness.best_score}%`, desc: 'maximum' },
                { icon: 'local_fire_department', title: 'Practice Streak', val: readiness.streak, desc: 'days active' },
              ].map((stat, idx) => (
                <div key={idx} className="bg-surface rounded-xl p-4 border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-secondary text-2xl">{stat.icon}</span>
                    <span className="text-[10px] text-on-surface-variant font-label-sm uppercase font-bold tracking-wider">{stat.title}</span>
                  </div>
                  <div className="mt-4">
                    <p className="font-display-lg text-2xl font-bold text-on-surface">{stat.val}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* DYNAMIC JOURNEY PIPELINE */}
          <section className="bg-surface border border-outline-variant/40 shadow-sm rounded-xl p-stack-lg">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">insights</span>
              Your Mock Interview Journey
            </h3>
            <div className="flex flex-col md:flex-row justify-between items-center gap-y-4 gap-x-2 overflow-x-auto py-2">
              {[
                { step: '1', name: 'Choose Level' },
                { step: '2', name: 'Select Type' },
                { step: '3', name: 'Choose Role' },
                { step: '4', name: 'Configure Setup' },
                { step: '5', name: 'Mock Simulator' },
                { step: '6', name: 'AI Evaluation' },
                { step: '7', name: 'Feedback & Plan' }
              ].map((step, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center text-center shrink-0 w-24">
                    <div className="w-10 h-10 rounded-full bg-surface-container-high text-secondary border border-secondary/20 flex items-center justify-center font-bold font-label-md shadow-sm relative">
                      {step.step}
                    </div>
                    <span className="font-label-sm text-xs mt-2 text-on-surface-variant font-semibold">{step.name}</span>
                  </div>
                  {idx < 6 && (
                    <div className="hidden md:block flex-grow h-0.5 bg-outline-variant/40 mx-2 min-w-[20px]"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>

          {/* INTERVIEW STARTER GUIDE */}
          <section id="interview-guide" className="bg-surface rounded-xl p-stack-lg border border-outline-variant/40 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Interview Starter Guide
                </h3>
                <p className="font-body-sm text-sm text-on-surface-variant mt-1">
                  Master the essential strategies to ace your real-world interviews.
                </p>
              </div>
              <button
                onClick={handleStartBeginnerPractice}
                className="bg-secondary text-white px-5 py-2.5 rounded-lg font-label-sm text-xs hover:opacity-90 transition-opacity flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                Start Beginner Practice
              </button>
            </div>

            {/* Guide Tabs */}
            <div className="flex border-b border-outline-variant/30 mb-6">
              {[
                { id: 'before', label: 'Before the Interview' },
                { id: 'during', label: 'During the Interview' },
                { id: 'after', label: 'After the Interview' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveGuideTab(tab.id)}
                  className={`px-5 py-3 font-label-md text-label-md border-b-2 transition-colors cursor-pointer ${
                    activeGuideTab === tab.id
                      ? 'border-secondary text-secondary font-bold'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
              {activeGuideTab === 'before' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-label-md text-label-md text-secondary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">search</span>
                      Research & Understand
                    </h4>
                    <ul className="space-y-3 font-body-sm text-sm text-on-surface-variant">
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Research the company</strong>: Study their product values, tech stack, culture, and business models.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Analyze Job Description</strong>: Identify core skill requirements, responsibilities, and key tools.
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-label-md text-label-md text-secondary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">edit_note</span>
                      Resume Prep & Stories
                    </h4>
                    <ul className="space-y-3 font-body-sm text-sm text-on-surface-variant">
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Review your resume</strong>: Be prepared to talk in detail about every single project, job role, and skill mentioned.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Draft STAR behavioral answers</strong>: Prepare situation, task, action, and results stories for common HR questions.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeGuideTab === 'during' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-label-md text-label-md text-secondary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">forum</span>
                      Communication Basics
                    </h4>
                    <ul className="space-y-3 font-body-sm text-sm text-on-surface-variant">
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Listen closely</strong>: Do not interrupt. Wait until the interviewer finishes asking before formulating your answer.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Pause & Think</strong>: Taking 5-10 seconds to structure your thoughts before speaking projects confidence.
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-label-md text-label-md text-secondary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">code</span>
                      Problem Solving Mechanics
                    </h4>
                    <ul className="space-y-3 font-body-sm text-sm text-on-surface-variant">
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Explain your thinking process</strong>: Talk out loud. Interviewers care more about how you solve a problem than memorized solutions.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Ask clarifying questions</strong>: For coding or technical design tasks, define constraints and trade-offs first.
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeGuideTab === 'after' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-label-md text-label-md text-secondary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">rate_review</span>
                      Analyze & Review
                    </h4>
                    <ul className="space-y-3 font-body-sm text-sm text-on-surface-variant">
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Write down details immediately</strong>: Review questions you found tricky, concepts you stuttered on, or topics you failed to explain.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Analyze weak dimensions</strong>: Look at your AI feedback summaries to identify conceptual gaps.
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-label-md text-label-md text-secondary font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Action Plan
                    </h4>
                    <ul className="space-y-3 font-body-sm text-sm text-on-surface-variant">
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Practice again</strong>: Re-run weak sessions to practice using model answers.
                      </li>
                      <li className="flex gap-2">
                        <span className="material-symbols-outlined text-secondary text-sm mt-0.5">check_circle</span>
                        <strong>Refine code speed</strong>: Drill down on data structures and time complexity calculations.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* HISTORICAL INTERVIEWS LIST */}
          <section className="bg-surface rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden flex flex-col">
            <div className="p-stack-lg border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">history</span>
                  Interview Session History
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Track your scores, difficulty, and review completed performance scorecards
                </p>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 text-outline-variant">forum</span>
                <p className="font-body-md text-sm">No completed interview sessions yet.</p>
                <button
                  onClick={() => navigate('/interview-setup')}
                  className="mt-4 bg-secondary text-white px-5 py-2 rounded-lg font-label-sm text-xs cursor-pointer"
                >
                  Create First Session
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container/50 border-b border-outline-variant/30 text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-6">Role & Topic</th>
                      <th className="py-3 px-6">Type</th>
                      <th className="py-3 px-6">Difficulty</th>
                      <th className="py-3 px-6 text-center">Score</th>
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr
                        key={item.id + idx}
                        className="border-b border-outline-variant/20 hover:bg-surface-container-lowest/50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-label-md text-label-md text-on-surface font-semibold">{item.role}</p>
                          {item.topic && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                              {item.topic}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-body-sm text-sm text-on-surface-variant">
                          {item.interview_type}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.difficulty.toLowerCase() === 'pro'
                              ? 'bg-error-container text-on-error-container border border-error/20'
                              : item.difficulty.toLowerCase() === 'intermediate'
                              ? 'bg-primary-fixed text-on-primary-fixed-variant'
                              : 'bg-tertiary-container/10 text-tertiary font-bold'
                          }`}>
                            {item.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`font-display-lg text-base font-bold ${
                            item.overall_score >= 80
                              ? 'text-tertiary font-bold'
                              : item.overall_score >= 60
                              ? 'text-secondary'
                              : 'text-error'
                          }`}>
                            {item.overall_score}%
                          </span>
                        </td>
                        <td className="py-4 px-6 font-body-sm text-xs text-on-surface-variant">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => navigate(`/interview-evaluation?session_id=${item.id}`)}
                              className="px-3 py-1.5 rounded bg-surface-container hover:bg-secondary-container hover:text-on-secondary font-label-sm text-xs text-secondary font-semibold transition-all cursor-pointer"
                            >
                              Results
                            </button>
                            <button
                              onClick={() => handlePracticeAgain(item.id)}
                              className="px-3 py-1.5 rounded bg-surface border border-outline-variant hover:bg-surface-container font-label-sm text-xs text-on-surface transition-all cursor-pointer"
                              title="Practice again with same settings"
                            >
                              Retry
                            </button>
                            <button
                              onClick={() => handleDeleteSession(item.id)}
                              className="w-8 h-8 rounded bg-surface hover:bg-error-container hover:text-on-error-container text-on-surface-variant flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-error/10"
                              title="Delete Record"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
