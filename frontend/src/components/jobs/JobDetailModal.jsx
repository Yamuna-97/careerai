import React, { useState } from 'react';
import apiClient from '../../api/client';

export default function JobDetailModal({ job, onClose, onToggleSave }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [optimization, setOptimization] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleAnalyzeJob = async () => {
    setIsAnalyzing(true);
    try {
      const res = await apiClient.post(`/jobs/${job.id}/analyze`);
      setAnalysis(res.data?.analysis);
    } catch (e) {
      console.error('AI job analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimizeResume = async () => {
    setIsOptimizing(true);
    try {
      const res = await apiClient.post(`/jobs/${job.id}/optimize-resume`);
      setOptimization(res.data?.suggestions);
    } catch (e) {
      console.error('Resume optimization error:', e);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Determine best apply link
  const primaryApplyLink = job.apply_link || job.url;

  // Apply options from JSearch
  const applyOptions = job.apply_options || [];

  // Highlights from JSearch (qualifications, responsibilities, benefits)
  const highlights = job.highlights || {};
  const qualifications = highlights.Qualifications || [];
  const responsibilities = highlights.Responsibilities || [];
  const benefitsHighlight = highlights.Benefits || [];
  const benefits = job.benefits || benefitsHighlight;

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
            {primaryApplyLink && (
              <a
                href={primaryApplyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1 cursor-pointer"
              >
                Apply Now
                <span className="material-symbols-outlined text-xs font-bold">open_in_new</span>
              </a>
            )}
          </div>
        </header>

        {/* Modal scroll area */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 editor-scroll pb-16">

          {/* Main Info */}
          <div className="space-y-2">
            {/* Company logo + name */}
            <div className="flex items-center gap-3 mb-3">
              {job.company_logo && job.company_logo.startsWith('http') ? (
                <img src={job.company_logo} alt={job.company} className="w-12 h-12 object-contain rounded border border-outline-variant/30 p-1 bg-white" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#EC4899]/10 flex items-center justify-center font-bold text-[#EC4899] text-xl border border-[#EC4899]/20">
                  {job.company ? job.company.charAt(0).toUpperCase() : 'J'}
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-on-surface">{job.company || 'Unknown Company'}</p>
                {job.company_website && (
                  <a
                    href={job.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-[#EC4899] hover:underline"
                  >
                    {job.company_website}
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {job.employment_type && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                  {job.employment_type}
                </span>
              )}
              {job.remote && (
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">Remote</span>
              )}
              {job.seniority_level && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
                  {job.seniority_level}
                </span>
              )}
            </div>

            <h2 className="font-headline-md text-headline-md text-on-background font-bold leading-tight">{job.title}</h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant flex-wrap">
              <span className="text-primary">{job.location}</span>
              {job.posted_at && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                  <span>Posted: {job.posted_at}</span>
                </>
              )}
              {job.publisher && job.publisher !== 'Source unavailable' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                  <span className="text-[#FF8A3D]">via {job.publisher}</span>
                </>
              )}
            </div>

            {/* Salary */}
            <div className="flex items-center gap-2 mt-1">
              <span className="material-symbols-outlined text-sm text-on-surface-variant">payments</span>
              <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]">
                {job.salary_display || 'Salary not disclosed'}
              </span>
            </div>
          </div>

          <div className="h-px bg-outline-variant/30"></div>

          {/* Matches & Gaps Analysis block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Highlights */}
            <div className="bg-[#EC4899]/5 border border-[#EC4899]/15 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-xs text-[#EC4899] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm font-bold text-[#EC4899]">check_circle</span>
                Why this matches
              </h4>
              <ul className="text-xs text-on-surface/80 space-y-1.5 pl-5 list-disc leading-relaxed">
                {(job.match_reasons || []).map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
                {(job.matched_skills || []).slice(0, 3).map(skill => (
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
                {(job.missing_skills || []).length > 0 ? (
                  job.missing_skills.map(skill => (
                    <li key={skill}>Missing skill: <strong>{skill}</strong></li>
                  ))
                ) : (
                  <li>No significant skill gaps detected. Great match!</li>
                )}
              </ul>
            </div>

          </div>

          {/* Skills from JSearch */}
          {(job.skills || []).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-on-surface-variant text-[11px] font-semibold capitalize"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply Options — real JSearch data only */}
          {applyOptions.length > 1 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider">Apply Via</h3>
              <div className="flex flex-wrap gap-2">
                {applyOptions.map((opt, idx) => (
                  opt.apply_link ? (
                    <a
                      key={idx}
                      href={opt.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-bold hover:border-[#EC4899]/40 hover:bg-[#EC4899]/5 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                      {opt.publisher || 'Apply'}
                    </a>
                  ) : null
                ))}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {qualifications.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider">Qualifications</h3>
              <ul className="text-xs text-on-surface-variant leading-relaxed pl-5 list-disc space-y-1">
                {qualifications.map((q, idx) => <li key={idx}>{q}</li>)}
              </ul>
            </div>
          )}

          {/* Responsibilities */}
          {responsibilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider">Responsibilities</h3>
              <ul className="text-xs text-on-surface-variant leading-relaxed pl-5 list-disc space-y-1">
                {responsibilities.map((r, idx) => <li key={idx}>{r}</li>)}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {benefits.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider">Benefits</h3>
              <ul className="text-xs text-on-surface-variant leading-relaxed pl-5 list-disc space-y-1">
                {benefits.map((b, idx) => <li key={idx}>{b}</li>)}
              </ul>
            </div>
          )}

          {/* Job Description Text */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider">Job Description</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {/* Google Jobs Link */}
          {job.job_google_link && (
            <div>
              <a
                href={job.job_google_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#EC4899] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">open_in_new</span>
                View on Google Jobs
              </a>
            </div>
          )}

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
