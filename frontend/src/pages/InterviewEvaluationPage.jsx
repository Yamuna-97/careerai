import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function InterviewEvaluationPage() {
  const navigate = useNavigate();
  const [activeQuestion, setActiveQuestion] = useState(0);

  const dimensionScores = [
    { name: 'Communication & Delivery', score: 88, color: 'bg-primary-container' },
    { name: 'Problem Solving & Structure', score: 85, color: 'bg-secondary' },
    { name: 'Technical & Domain Knowledge', score: 79, color: 'bg-tertiary-container' },
    { name: 'Cultural & Leadership Fit', score: 76, color: 'bg-secondary-container' },
  ];

  const questionFeedback = [
    {
      q: 'Can you describe a time you had to manage a conflict within a cross-functional team?',
      score: 85,
      strengths: 'Excellent use of the STAR method. Clear focus on resolution and cross-functional empathy.',
      improvement: 'Could quantify the impact with concrete metric values (e.g. reduction in cycle time).',
      sampleAnswer:
        'In my role at TechCorp, engineering and design clashed over redesign timelines. I organized an alignment workshop mapping UX friction to technical debt, successfully delivering a phased rollout.',
    },
    {
      q: 'How do you measure the business impact of your product design decisions?',
      score: 92,
      strengths: 'Strong alignment of product KPIs with customer retention metrics.',
      improvement: 'Mention secondary metrics such as NPS or usability testing satisfaction scores.',
      sampleAnswer:
        'I anchor UX goals to core business outcomes like task completion rate and conversion funnel drop-off, working closely with data science to run A/B experiments.',
    },
  ];

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex selection:bg-primary-container selection:text-white pb-20 md:pb-8">
      <Sidebar />

      <div className="flex-1 w-full md:ml-[260px] flex flex-col min-h-screen">
        <Header title="Interview Evaluation Report" subtitle="Role: Senior Product Designer • Mock Session Completed" />

        <main className="flex-1 p-margin-mobile md:p-margin-desktop overflow-y-auto">
          <div className="max-w-container-max mx-auto space-y-stack-lg">
            {/* Page Header Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="font-display-lg text-display-lg md:text-4xl text-on-surface tracking-tight font-extrabold">
                  Performance Evaluation
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                  AI Behavioral Assessment Scorecard & Action Plan
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/interview-session')}
                  className="px-4 py-2 rounded-lg font-label-md text-label-md bg-primary-container text-on-primary hover:bg-[#4338CA] transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  Practice Again
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg font-label-md text-label-md bg-surface text-on-surface border border-outline-variant hover:bg-surface-container transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export PDF
                </button>
              </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Readiness Card */}
              <div className="lg:col-span-2 bg-surface rounded-xl p-stack-lg shadow-md border border-outline-variant/50 flex flex-col md:flex-row items-center gap-8 hover:shadow-lg transition-all">
                {/* Score Ring */}
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-surface-container stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                    <circle className="text-secondary stroke-current progress-ring__circle" cx="50" cy="50" fill="transparent" r="40" strokeDasharray="251.2" strokeDashoffset="45.2" strokeLinecap="round" strokeWidth="8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-lg text-headline-lg font-extrabold text-on-surface">
                      82<span className="text-xl">%</span>
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                      Readiness
                    </span>
                  </div>
                </div>

                {/* Summary Details */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Strong & Competitive Performance
                    </h3>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                      You demonstrated solid readiness for the <span className="font-semibold text-on-surface">Senior Product Designer</span> role. Your articulation of design rationale was exceptionally structured.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                    <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary-container text-[20px]">timer</span>
                      <div>
                        <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Duration</p>
                        <p className="font-label-md text-on-surface font-bold">18 mins</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary-container text-[20px]">forum</span>
                      <div>
                        <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Questions</p>
                        <p className="font-label-md text-on-surface font-bold">5 Answered</p>
                      </div>
                    </div>
                    <div className="bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/30 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary-container text-[20px]">psychology_alt</span>
                      <div>
                        <p className="font-label-sm text-[10px] text-on-surface-variant uppercase">Format</p>
                        <p className="font-label-md text-on-surface font-bold">STAR Behavioral</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimension Breakdown */}
              <div className="lg:col-span-1 bg-surface rounded-xl p-stack-lg shadow-md border border-outline-variant/50">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-secondary">bar_chart</span>
                  Dimension Breakdown
                </h3>
                <div className="space-y-4">
                  {dimensionScores.map((dim, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>{dim.name}</span>
                        <span className="text-primary font-bold">{dim.score}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${dim.color} rounded-full`} style={{ width: `${dim.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Breakdown Section */}
            <div className="bg-surface rounded-xl p-stack-lg shadow-md border border-outline-variant/50 space-y-stack-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">fact_check</span>
                Question by Question Breakdown
              </h3>

              <div className="space-y-4">
                {questionFeedback.map((item, qIdx) => (
                  <div key={qIdx} className="p-stack-md bg-surface-container-lowest rounded-xl border border-outline-variant/50 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-on-surface text-base">
                        Q{qIdx + 1}: "{item.q}"
                      </h4>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-container/10 text-primary border border-primary/20 shrink-0">
                        Score: {item.score}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-surface rounded-lg border border-tertiary/20">
                        <p className="text-xs font-bold text-tertiary-container uppercase flex items-center gap-1 mb-1">
                          <span className="material-symbols-outlined text-sm">thumb_up</span>
                          Key Strengths
                        </p>
                        <p className="text-sm text-on-surface-variant">{item.strengths}</p>
                      </div>

                      <div className="p-3 bg-surface rounded-lg border border-secondary/20">
                        <p className="text-xs font-bold text-secondary uppercase flex items-center gap-1 mb-1">
                          <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                          Growth Suggestion
                        </p>
                        <p className="text-sm text-on-surface-variant">{item.improvement}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-surface-container-low rounded-lg text-xs text-on-surface">
                      <span className="font-bold text-primary">Sample Benchmark: </span>
                      {item.sampleAnswer}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Next Step Callout */}
            <div className="bg-gradient-to-r from-primary-container to-secondary p-stack-lg rounded-xl text-on-primary flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
              <div>
                <h4 className="font-headline-sm text-headline-sm font-bold">Ready to apply with your improved score?</h4>
                <p className="text-sm text-white/80 mt-1">
                  Discover 14+ top matching Senior Designer jobs aligned with your readiness profile.
                </p>
              </div>
              <Link
                to="/jobs"
                className="bg-white text-primary px-6 py-3 rounded-lg font-label-md text-label-md font-bold shadow-md hover:bg-gray-100 transition-colors whitespace-nowrap inline-flex items-center gap-2"
              >
                View Matched Jobs
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
