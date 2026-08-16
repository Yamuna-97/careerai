import React from 'react';

export default function JobCard({ job, onOpenDetails, onToggleSave, isSelected }) {
  const score = job.match_score || 0;
  const strokeColor = score >= 85 ? 'text-[#EC4899]' : score >= 70 ? 'text-[#FF8A3D]' : 'text-slate-400';

  // Use company logo if available, else show initial
  const hasLogo = job.company_logo && job.company_logo.startsWith('http');

  // Primary apply link
  const applyLink = job.apply_link || job.url || '#';

  return (
    <div
      onClick={onOpenDetails}
      className={`rounded-xl shadow-sm p-5 hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer border ${
        isSelected
          ? 'bg-[#EC4899]/5 border-[#EC4899]/40 ring-1 ring-[#EC4899]/30'
          : 'bg-surface border-outline-variant/40 hover:border-[#EC4899]/30'
      }`}
    >
      {/* Decorative background ring */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#EC4899]/5 rounded-bl-full pointer-events-none"></div>

      <div>
        {/* Header Details */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-3.5 items-start">
            {/* Company logo or initial */}
            <div className="w-10 h-10 rounded bg-[#EC4899]/10 flex items-center justify-center font-bold text-[#EC4899] text-lg border border-[#EC4899]/20 shrink-0 overflow-hidden">
              {hasLogo ? (
                <img src={job.company_logo} alt={job.company} className="w-full h-full object-contain p-1" />
              ) : (
                (job.company ? job.company.charAt(0).toUpperCase() : 'J')
              )}
            </div>
            <div>
              <h3 className="font-bold text-on-background text-sm leading-snug line-clamp-1 hover:text-[#EC4899] transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-on-surface-variant">
                <span>{job.company || 'Unknown Company'}</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                <span className="text-[#EC4899]">{job.location || 'Location not specified'}</span>
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              job.is_saved
                ? 'text-[#EC4899] bg-[#EC4899]/10'
                : 'text-on-surface-variant hover:text-[#EC4899] hover:bg-slate-100'
            }`}
            title={job.is_saved ? 'Unsave Job' : 'Save Job'}
          >
            <span className={`material-symbols-outlined text-base ${job.is_saved ? 'icon-filled font-bold' : ''}`}>
              bookmark
            </span>
          </button>
        </div>

        {/* Tags: employment type, remote, posted date */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.employment_type && (
            <span className="px-2 py-0.5 rounded bg-slate-100 text-on-surface-variant text-[10px] font-bold uppercase tracking-wide">
              {job.employment_type}
            </span>
          )}
          {job.remote && (
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
              Remote
            </span>
          )}
          {job.posted_at && (
            <span className="px-2 py-0.5 rounded bg-slate-50 text-on-surface-variant text-[10px]">
              {job.posted_at}
            </span>
          )}
          {/* Source / Publisher */}
          {job.publisher && job.publisher !== 'Source unavailable' && (
            <span className="px-2 py-0.5 rounded bg-[#FF8A3D]/10 text-[#FF8A3D] text-[10px] font-semibold">
              via {job.publisher}
            </span>
          )}
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
              <span className="absolute font-extrabold text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]">
                {Math.round(score)}%
              </span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] uppercase tracking-wide">
                {score >= 85 ? 'Excellent Match' : score >= 70 ? 'Good Match' : 'Fair Match'}
              </p>
              <span className="text-[9px] text-on-surface-variant leading-none font-medium">Resume Match</span>
            </div>
          </div>

          {/* Skill compatibility chips */}
          <div className="flex flex-wrap gap-1 sm:ml-auto">
            {(job.matched_skills || []).slice(0, 2).map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-[#EC4899]/10 text-[#EC4899] text-[10px] font-bold flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[10px] font-bold">check</span> {s}
              </span>
            ))}
            {(job.missing_skills || []).slice(0, 1).map((s, idx) => (
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
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]">
          {job.salary_display || 'Salary not disclosed'}
        </span>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant font-bold text-xs hover:bg-slate-50 cursor-pointer"
          >
            Details
          </button>
          {applyLink && applyLink !== '#' && (
            <a
              href={applyLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white font-bold text-xs shadow-md hover:opacity-95 transition-opacity cursor-pointer inline-flex items-center gap-1"
            >
              Apply
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
