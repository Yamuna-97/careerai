import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function InterviewEvaluationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Evaluation State
  const [session, setSession] = useState(null);
  const [qnaReview, setQnaReview] = useState([]);
  const [improvementPlan, setImprovementPlan] = useState('');

  useEffect(() => {
    // If no session_id is provided, show mock demo evaluation
    if (!sessionId) {
      setSession({
        role: 'Senior Product Designer',
        difficulty: 'intermediate',
        interview_type: 'Technical',
        format: 'text',
        duration: 18,
        overall_score: 82,
        technical_score: 85,
        communication_score: 80,
        confidence_score: 78,
        problem_solving_score: 84,
        relevance_score: 88,
        strengths: "• Excellent conceptual design alignment.\n• Clear articulation of layout grids and spacing hierarchy.",
        weaknesses: "• Could improve structural STAR results by outlining key metric outcomes.",
      });
      setQnaReview([
        {
          question: 'Can you describe a time you had to manage a conflict within a cross-functional team?',
          answer: 'In my role at TechCorp, engineering and design clashed over redesign timelines. I organized an alignment workshop mapping UX friction to technical debt, successfully delivering a phased rollout.',
          score: 85,
          technical_accuracy: 88,
          communication: 82,
          relevance: 90,
          strengths: 'Excellent use of the STAR method. Clear focus on resolution and cross-functional empathy.',
          weaknesses: 'Could improve structural results by outlining key metrics (e.g. cycle time reduction).',
          suggestions: 'Quantify your outcome: e.g. saved 2 weeks of delay.',
          better_answer: 'In my previous project, engineering and design disagreed on timelines. I held an alignment workshop, leading to a phased rollout that reduced shipping delays by 2 weeks.',
          star_situation: true,
          star_task: true,
          star_action: true,
          star_result: false
        }
      ]);
      setImprovementPlan("### Priority 1: STAR Results\nQuantify your outcomes. Instead of saying 'improved user retention', say 'increased conversion by 14%'.\n\n### Priority 2: System Architecture\nDetail the database models and api response caching mechanisms when designing real-time interfaces.");
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/v1/interviews/${sessionId}/results`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load evaluation details.");
        const data = await res.json();
        
        setSession(data.session);
        setQnaReview(data.qna_review || []);
        setImprovementPlan(data.improvement_plan || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [sessionId]);

  const handlePracticeAgain = async () => {
    if (!sessionId) {
      navigate('/interview-setup');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/v1/interviews/${sessionId}/practice-again`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        navigate(`/interview-session?session_id=${data.session_id || data.id}`);
      } else {
        navigate('/interview-setup');
      }
    } catch (e) {
      navigate('/interview-setup');
    }
  };

  if (loading) {
    return (
      <div className="bg-surface-bright min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex pb-20 md:pb-8">
      <Sidebar />

      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen">
        <Header title="AI Interview Evaluation Report" subtitle={`Role: ${session?.role} • Detailed Mock Scorecard`} />

        <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto">
          <div className="max-w-container-max mx-auto space-y-stack-lg flex flex-col gap-6">
            
            {/* Top Bar Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-display-lg text-display-lg md:text-4xl text-on-surface tracking-tight font-extrabold">
                  Performance Evaluation
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                  AI Assessment Scorecard & Action Plan
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePracticeAgain}
                  className="px-4 py-2.5 rounded-lg font-label-md text-label-md bg-secondary text-white hover:opacity-90 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  Practice Again
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-lg font-label-md text-label-md bg-surface text-on-surface border border-outline-variant hover:bg-surface-container transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export PDF
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Overall Summary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Score ring */}
              <div className="lg:col-span-8 bg-surface rounded-xl p-stack-lg shadow-sm border border-outline-variant/40 flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-surface-container stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                    <circle className="text-secondary stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * (session?.overall_score || 0)) / 100} strokeLinecap="round" strokeWidth="8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">
                      {session?.overall_score || 0}<span className="text-xl">%</span>
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Overall Score
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {session?.overall_score >= 80 ? 'Competitive Performance!' : session?.overall_score >= 60 ? 'Good Progress' : 'Needs Practice'}
                    </h3>
                    <div className="font-body-md text-sm text-on-surface-variant mt-2 space-y-2">
                      <p><strong>Key Strengths:</strong></p>
                      <p className="whitespace-pre-wrap">{session?.strengths || "• Demonstrated good understanding of target role requirements."}</p>
                      <p className="mt-2"><strong>Areas to Improve:</strong></p>
                      <p className="whitespace-pre-wrap">{session?.weaknesses || "• Needs to provide deeper analysis of trade-offs."}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">timer</span>
                      <div>
                        <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Duration</p>
                        <p className="font-label-md text-on-surface font-bold">{session?.duration} mins</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">forum</span>
                      <div>
                        <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Questions</p>
                        <p className="font-label-md text-on-surface font-bold">{session?.num_questions} Questions</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[20px]">psychology_alt</span>
                      <div>
                        <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Format</p>
                        <p className="font-label-md text-on-surface font-bold">{session?.interview_type}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensional Scores */}
              <div className="lg:col-span-4 bg-surface rounded-xl p-stack-lg shadow-sm border border-outline-variant/40 flex flex-col gap-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">bar_chart</span>
                  Metric Breakdown
                </h3>
                <div className="space-y-3.5">
                  {[
                    { name: 'Technical Depth', score: session?.technical_score || 70, color: 'bg-primary' },
                    { name: 'Communication Clarity', score: session?.communication_score || 70, color: 'bg-secondary' },
                    { name: 'Relevance Focus', score: session?.relevance_score || 70, color: 'bg-tertiary-container' },
                    { name: 'Confidence/Delivery', score: session?.confidence_score || 70, color: 'bg-secondary-container' },
                    { name: 'Problem Solving', score: session?.problem_solving_score || 70, color: 'bg-primary-container' },
                  ].map((dim, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dim.name}</span>
                        <span className="text-secondary font-bold">{dim.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${dim.color} rounded-full`} style={{ width: `${dim.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* PERSONALIZED IMPROVEMENT ROADMAP */}
            {improvementPlan && (
              <div className="bg-surface border border-outline-variant/40 shadow-sm rounded-xl p-stack-lg space-y-4">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">assignment</span>
                  Your Interview Improvement Plan
                </h3>
                <div className="prose prose-sm font-body-sm text-sm text-on-surface-variant whitespace-pre-wrap leading-relaxed">
                  {improvementPlan}
                </div>
              </div>
            )}

            {/* QUESTION BY QUESTION BREAKDOWN */}
            <div className="bg-surface rounded-xl p-stack-lg shadow-sm border border-outline-variant/40 space-y-stack-md flex flex-col gap-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">fact_check</span>
                Question by Question Breakdown
              </h3>

              <div className="space-y-6">
                {qnaReview.map((item, qIdx) => (
                  <div key={qIdx} className="p-stack-md bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-4 flex flex-col gap-2">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-on-surface text-base">
                          Q{qIdx + 1}: "{item.question}"
                        </h4>
                        {session?.interview_type?.toLowerCase() === 'behavioral' || session?.interview_type?.toLowerCase() === 'hr / behavioral' ? (
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant bg-surface px-3 py-1.5 rounded border border-outline-variant/15 w-max">
                            <span>STAR Components:</span>
                            <span className={item.star_situation ? "text-tertiary" : "text-error"}>
                              {item.star_situation ? '✓' : '✗'} Situation
                            </span>
                            <span className={item.star_task ? "text-tertiary" : "text-error"}>
                              {item.star_task ? '✓' : '✗'} Task
                            </span>
                            <span className={item.star_action ? "text-tertiary" : "text-error"}>
                              {item.star_action ? '✓' : '✗'} Action
                            </span>
                            <span className={item.star_result ? "text-tertiary" : "text-error"}>
                              {item.star_result ? '✓' : '✗'} Result
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary-container/10 text-primary border border-primary/20 shrink-0">
                        Score: {item.score}/100
                      </span>
                    </div>

                    {/* Candidate Answer */}
                    <div className="bg-surface p-3 rounded-lg border border-outline-variant/10 text-xs">
                      <span className="font-bold text-on-surface-variant">Your Answer:</span>
                      <p className="text-on-surface mt-1 whitespace-pre-wrap font-mono">{item.answer}</p>
                    </div>

                    {/* AI Feedback Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div className="p-3 bg-surface rounded-lg border border-tertiary/20">
                        <p className="text-[10px] font-bold text-tertiary-container uppercase flex items-center gap-1 mb-1 font-bold">
                          <span className="material-symbols-outlined text-sm">thumb_up</span>
                          What you did well
                        </p>
                        <p className="text-xs text-on-surface-variant">{item.strengths || "Strong response clarity."}</p>
                      </div>

                      <div className="p-3 bg-surface rounded-lg border border-secondary/20">
                        <p className="text-[10px] font-bold text-secondary uppercase flex items-center gap-1 mb-1 font-bold">
                          <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                          Key Improvements
                        </p>
                        <p className="text-xs text-on-surface-variant">{item.weaknesses || "Detail your personal actions."}</p>
                      </div>
                    </div>

                    {item.suggestions && (
                      <div className="p-3 bg-surface-container rounded-lg text-xs border border-outline-variant/15 text-on-surface-variant">
                        <strong>Coach Suggestion:</strong> {item.suggestions}
                      </div>
                    )}

                    {/* Benchmark Solution */}
                    {item.better_answer && (
                      <div className="p-3 bg-surface-container-lowest rounded-lg text-xs text-on-surface border border-outline-variant/15">
                        <span className="font-bold text-primary">Benchmark Answer Guideline: </span>
                        <p className="mt-1 font-mono whitespace-pre-wrap">{item.better_answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
