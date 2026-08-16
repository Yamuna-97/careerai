import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';
import apiClient from '../../api/client';

export default function JobResults({ profile, onOpenJobDetails, onEditPreferences, onSearchFromResume }) {
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Search parameters state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Cursor-based pagination
  const [nextCursor, setNextCursor] = useState(null);

  // Filters State
  const [sortBy, setSortBy] = useState('best_match');
  const [workMode, setWorkMode] = useState('any');         // 'any' | 'remote'
  const [employmentType, setEmploymentType] = useState('any');
  const [experienceLevel, setExperienceLevel] = useState('any');
  const [datePosted, setDatePosted] = useState('week');    // 'all'|'today'|'3days'|'week'|'month'

  // Auto-search on filter changes (not on every keystroke)
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, workMode, employmentType, experienceLevel, datePosted]);

  const buildPayload = (cursorOverride = null) => ({
    query: searchQuery || null,
    location: searchLocation || null,
    sort_by: sortBy,
    work_mode: workMode === 'remote' ? 'remote' : null,
    employment_type: employmentType === 'any' ? null : employmentType,
    experience_level: experienceLevel === 'any' ? null : experienceLevel,
    date_posted: datePosted,
    cursor: cursorOverride || null,
    num_pages: 1,
  });

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    setErrorMessage(null);
    setJobs([]);
    setNextCursor(null);

    try {
      const res = await apiClient.post('/jobs/search', buildPayload());
      const data = res.data;
      setJobs(data.results || []);
      setTotalCount(data.total_results || 0);
      setNextCursor(data.next_cursor || null);
      if (data.error_message) setErrorMessage(data.error_message);
    } catch (err) {
      console.error('Job search error:', err);
      setErrorMessage('Unable to load jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await apiClient.post('/jobs/search', buildPayload(nextCursor));
      const data = res.data;
      setJobs(prev => [...prev, ...(data.results || [])]);
      setNextCursor(data.next_cursor || null);
    } catch (err) {
      console.error('Load more error:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleToggleSaveJob = async (job) => {
    try {
      if (job.is_saved) {
        await apiClient.delete(`/jobs/${job.saved_id || job.id}/save`);
        setJobs(prev => prev.map(j =>
          j.id === job.id ? { ...j, is_saved: false, saved_id: null } : j
        ));
      } else {
        const res = await apiClient.post(`/jobs/${job.id}/save`, job);
        setJobs(prev => prev.map(j =>
          j.id === job.id ? { ...j, is_saved: true, saved_id: res.data?.saved_id } : j
        ));
      }
    } catch (e) {
      console.error('Save job error:', e);
    }
  };

  return (
    <div className="space-y-6">

      {/* Error / Status Banner */}
      {errorMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
          <span className="material-symbols-outlined text-amber-600 font-bold shrink-0">warning</span>
          <div>
            <p className="font-bold">Job Search Notice</p>
            <p className="text-on-surface-variant mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Jobs Bar & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/35 pb-4">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Opportunities For You</h2>
          <p className="text-xs text-on-surface-variant">
            Found <strong>{jobs.length}</strong> matching listings via JSearch.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSearchFromResume}
            className="px-3.5 py-1.5 border border-[#EC4899]/30 text-[#EC4899] bg-[#EC4899]/5 rounded-lg text-xs font-bold hover:bg-[#EC4899]/10 cursor-pointer transition-colors"
            title="Reload profile preferences from your active resume"
          >
            Search from Resume
          </button>
          <button
            onClick={onEditPreferences}
            className="px-3.5 py-1.5 border border-outline-variant rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            Edit Preferences
          </button>
        </div>
      </div>

      {/* Search Bar Input */}
      <form onSubmit={handleSearch} className="bg-surface border border-outline-variant/40 rounded-xl p-3 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="flex-1 flex items-center gap-2 px-2">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            placeholder="Job title, keyword (e.g. AI Engineer)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs focus:ring-0 focus:outline-none"
          />
        </div>
        <div className="w-full md:w-px md:h-6 bg-outline-variant/50"></div>

        <div className="w-full md:w-48 flex items-center gap-2 px-2">
          <span className="material-symbols-outlined text-on-surface-variant text-lg">location_on</span>
          <input
            type="text"
            placeholder="Location (e.g. Chennai)"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full bg-transparent border-none text-xs focus:ring-0 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:opacity-95 transition-opacity cursor-pointer"
        >
          Search Jobs
        </button>
      </form>

      {/* Grid: Filters Panel (Left) + Results List (Right) */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Filters Sidebar */}
        <aside className="w-full lg:w-60 bg-slate-50 border border-outline-variant/30 rounded-xl p-4 space-y-5 h-fit shrink-0">
          <h3 className="font-bold text-xs uppercase text-on-surface-variant tracking-wider border-b border-outline-variant/20 pb-1">Filters</h3>

          {/* Sort By */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant font-bold uppercase">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:outline-none focus:border-primary"
            >
              <option value="best_match">Best Match</option>
              <option value="newest">Newest Posted</option>
              <option value="salary_high">Salary: High to Low</option>
              <option value="salary_low">Salary: Low to High</option>
            </select>
          </div>

          {/* Date Posted */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant font-bold uppercase">Date Posted</label>
            <select
              value={datePosted}
              onChange={(e) => setDatePosted(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:outline-none"
            >
              <option value="all">Any time</option>
              <option value="today">Today</option>
              <option value="3days">Last 3 days</option>
              <option value="week">Last week</option>
              <option value="month">Last month</option>
            </select>
          </div>

          {/* Work Mode */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant font-bold uppercase">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:outline-none"
            >
              <option value="any">Any Mode</option>
              <option value="remote">Remote Only</option>
            </select>
          </div>

          {/* Employment Type */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant font-bold uppercase">Job Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:outline-none"
            >
              <option value="any">Any Type</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
            </select>
          </div>

          {/* Experience Level */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant font-bold uppercase">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:outline-none"
            >
              <option value="any">Any Level</option>
              <option value="internship">Internship</option>
              <option value="entry">Entry Level</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior</option>
            </select>
          </div>
        </aside>

        {/* Results grid */}
        <div className="flex-1 flex flex-col gap-4">

          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-20 flex-grow gap-3">
              <span className="w-8 h-8 border-3 border-[#EC4899] border-t-transparent rounded-full animate-spin"></span>
              <p className="text-xs text-on-surface-variant">Searching jobs via JSearch...</p>
            </div>
          ) : (
            <>
              {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onOpenDetails={() => onOpenJobDetails(job)}
                      onToggleSave={() => handleToggleSaveJob(job)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-outline-variant/30 rounded-xl p-8 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
                  <div>
                    <p className="font-bold text-xs">No matching jobs found.</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">
                      Try a different job title, another location, removing filters, or selecting a broader date range.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => { setDatePosted('all'); }}
                      className="px-3 py-1 border border-outline-variant rounded text-[10px] font-bold hover:bg-white cursor-pointer"
                    >
                      Broaden Date Range
                    </button>
                    <button
                      onClick={() => { setWorkMode('any'); setEmploymentType('any'); }}
                      className="px-3 py-1 border border-outline-variant rounded text-[10px] font-bold hover:bg-white cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Load More (cursor-based) */}
              {nextCursor && jobs.length > 0 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white rounded-xl text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-60 cursor-pointer inline-flex items-center gap-2 transition-opacity"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Loading more jobs...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                        Load More Jobs
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
}
