import React, { useState } from 'react';

export default function JobDetailModal({ job, onClose, onToggleSave }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [optimization, setOptimization] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleAnalyzeJob = async () => {
    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/v1/jobs/${job.id}/analyze`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimizeResume = async () => {
    setIsOptimizing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/v1/jobs/${job.id}/optimize-resume`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOptimization(data.suggestions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex justify-end animate-fade-in">
      <div className="w-full max-w-3xl bg-surface h-full flex flex-col shadow-2xl relative animate-slide-in-right overflow-hidden select-text">
        
        {/* Header toolbar */}
        <header className="p-4 border-b border-outline-variant/40 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-on-surface-variant cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
            </button>
            <span className="font-bold text-xs uppercase text-on-surface-variant tracking-wider">Job Details</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSave}
              className="p-1.5 border border-outline-variant hover:bg-white text-on-surface-variant rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-sm ${job.is_saved ? 'icon-filled text-primary font-bold' : ''}`}>
                bookmark
              </span>
              {job.is_saved ? 'Saved' : 'Save'}
            </button>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1 cursor-pointer"
            >
              Apply Now
              <span className="material-symbols-outlined text-xs font-bold">open_in_new</span>
            </a>
          </div>
        </header>

        {/* Modal scroll area */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 editor-scroll pb-16">
          
          {/* Main Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {job.employment_type && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                  {job.employment_type}
                </span>
              )}
              {job.work_mode && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                  {job.work_mode}
                </span>
              )}
            </div>
            <h2 className="font-headline-md text-headline-md text-on-background font-bold leading-tight">{job.title}</h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <span>{job.company}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
              <span className="text-primary">{job.location}</span>
              {job.posted_date && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                  <span>Posted: {job.posted_date}</span>
                </>
              )}
            </div>
          </div>

          <div className="h-px bg-outline-variant/30"></div>

          {/* Matches & Gaps Analysis block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Highlights */}
            <div className="bg-teal-500/5 border border-teal-500/10 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-xs text-teal-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold text-teal-600">check_circle</span>
                Why this matches
              </h4>
              <ul className="text-xs text-teal-900/80 space-y-1.5 pl-5 list-disc leading-relaxed">
                {job.match_reasons?.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
                {job.matched_skills?.slice(0, 3).map(skill => (
                  <li key={skill}>Requires <strong>{skill}</strong>, which you have</li>
                ))}
              </ul>
            </div>

            {/* Gaps */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-xs text-amber-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold text-amber-600">help</span>
                Potential Gaps
              </h4>
              <ul className="text-xs text-amber-900/80 space-y-1.5 pl-5 list-disc leading-relaxed">
                {job.missing_skills?.length > 0 ? (
                  job.missing_skills.map(skill => (
                    <li key={skill}>Missing skill: <strong>{skill}</strong></li>
                  ))
                ) : (
                  <li>No significant skill gaps detected. Great match!</li>
                )}
              </ul>
            </div>

          </div>

          {/* Job Description Text */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider">Job Description</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          <div className="h-px bg-outline-variant/30"></div>

          {/* Gemini AI Actions Panel */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase text-primary tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-sm font-bold">auto_awesome</span>
              Gemini AI Integrations
            </h3>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAnalyzeJob}
                disabled={isAnalyzing}
                className="bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing Job Description...' : 'Analyze with AI'}
              </button>
              <button
                onClick={handleOptimizeResume}
                disabled={isOptimizing}
                className="bg-secondary/5 hover:bg-secondary/10 text-secondary border border-secondary/20 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isOptimizing ? 'Reviewing Resume...' : 'Optimize Resume for This Job'}
              </button>
            </div>

            {/* Analysis results panel */}
            {analysis && (
              <div className="bg-slate-50 border border-outline-variant/40 rounded-xl p-4 space-y-4 animate-fade-in">
                <h4 className="font-bold text-xs text-on-surface border-b border-outline-variant/20 pb-1">AI Job Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-[10px] text-on-surface-variant uppercase">Required Technical Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.matched_skills?.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-teal-500/10 text-teal-700 font-semibold rounded text-[10px]">{s}</span>
                      ))}
                      {analysis.missing_skills?.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 text-on-surface-variant rounded text-[10px]">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-[10px] text-on-surface-variant uppercase">Experience Level Check</p>
                    <p className="text-on-surface mt-1">{analysis.relevant_experience}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <p className="font-bold text-[10px] text-on-surface-variant uppercase">Key Interview Topics</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1 text-on-surface">
                      {analysis.interview_topics?.map((topic, i) => <li key={i}>{topic}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-[10px] text-on-surface-variant uppercase">Recommended Resume Phrasing</p>
                    <ul className="list-disc pl-5 space-y-1 mt-1 text-on-surface">
                      {analysis.recommended_resume_changes?.map((change, i) => <li key={i}>{change}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Optimization suggestions results panel */}
            {optimization && (
              <div className="bg-slate-50 border border-outline-variant/40 rounded-xl p-4 space-y-3 animate-fade-in text-xs">
                <h4 className="font-bold text-xs text-on-surface border-b border-outline-variant/20 pb-1">Custom Resume Optimizations</h4>
                
                {optimization.summary_suggestion && (
                  <div className="space-y-1">
                    <p className="font-bold text-[10px] text-on-surface-variant uppercase">Summary Phrasing Customization</p>
                    <p className="bg-white border border-outline-variant/20 p-2.5 rounded-lg text-on-surface italic">
                      "{optimization.summary_suggestion}"
                    </p>
                  </div>
                )}

                {optimization.experience_suggestions?.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="font-bold text-[10px] text-on-surface-variant uppercase">Experience Phrasing Suggestions</p>
                    {optimization.experience_suggestions.map((exp, idx) => (
                      <div key={idx} className="bg-white border border-outline-variant/20 p-2.5 rounded-lg">
                        <p className="font-bold text-[10px] text-primary">{exp.role}</p>
                        <p className="text-on-surface mt-1">{exp.suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
