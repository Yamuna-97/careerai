import React from 'react';

export default function JobCard({ job, onOpenDetails, onToggleSave }) {
  // Circular match score color determination
  const score = job.match_score || 0;
  const strokeColor = score >= 85 ? 'text-teal-500' : score >= 70 ? 'text-amber-500' : 'text-slate-400';
  
  return (
    <div className="bg-surface rounded-xl shadow-md border border-outline-variant/40 p-5 hover:-translate-y-1 hover:shadow-lg transition-all relative overflow-hidden flex flex-col justify-between">
      {/* Decorative background ring */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      <div>
        {/* Header Details */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3.5 items-start">
            <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center font-bold text-primary text-lg border border-outline-variant">
              {job.company ? job.company.charAt(0) : 'J'}
            </div>
            <div>
              <h3 className="font-bold text-on-background text-sm leading-snug line-clamp-1 hover:text-primary cursor-pointer" onClick={onOpenDetails}>
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-on-surface-variant">
                <span>{job.company || 'Unknown Company'}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                <span className="text-primary">{job.location || 'Remote'}</span>
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={onToggleSave}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              job.is_saved
                ? 'text-primary bg-primary/10'
                : 'text-on-surface-variant hover:text-primary hover:bg-slate-100'
            }`}
            title={job.is_saved ? 'Unsave Job' : 'Save Job'}
          >
            <span className={`material-symbols-outlined text-base ${job.is_saved ? 'icon-filled font-bold' : ''}`}>
              bookmark
            </span>
          </button>
        </div>

        {/* Short Description snippet */}
        <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-4">
          {job.description || 'No description provided.'}
        </p>

        {/* Compatibility breakdown */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4 pt-1">
          {/* Circular Score Ring */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                ></path>
                <path
                  className={strokeColor}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${score}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                ></path>
              </svg>
              <span className="absolute font-bold text-[10px] text-on-surface">
                {Math.round(score)}%
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-on-background uppercase tracking-wide">
                {score >= 85 ? 'Excellent Match' : score >= 70 ? 'Good Match' : 'Fair Match'}
              </p>
              <span className="text-[9px] text-on-surface-variant leading-none">CareerAI Score</span>
            </div>
          </div>

          {/* Skill compatibility chips */}
          <div className="flex flex-wrap gap-1 sm:ml-auto">
            {job.matched_skills?.slice(0, 2).map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-700 text-[10px] font-bold flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[10px] font-bold">check</span> {s}
              </span>
            ))}
            {job.missing_skills?.slice(0, 1).map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 text-[10px] font-bold"
                title={`Missing skill: ${s}`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between border-t border-outline-variant/30 pt-3 mt-2 text-xs">
        <span className="font-bold text-primary">{job.salary_display || 'Salary undisclosed'}</span>
        <button
          onClick={onOpenDetails}
          className="px-3.5 py-1.5 rounded-lg bg-primary/5 hover:bg-primary/10 text-primary font-bold text-[11px] transition-colors cursor-pointer"
        >
          View Job
        </button>
      </div>

    </div>
  );
}
