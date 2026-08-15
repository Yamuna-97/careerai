import React, { useState, useEffect } from 'react';
import JobCard from './JobCard';

const RESULTS_PER_PAGE = 20;

export default function JobResults({ profile, onOpenJobDetails, onEditPreferences, onSearchFromResume }) {
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Search parameters state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [page, setPage] = useState(1);

  // Filters State
  const [sortBy, setSortBy] = useState('best_match');
  const [workMode, setWorkMode] = useState('any');
  const [employmentType, setEmploymentType] = useState('any');
  const [experienceLevel, setExperienceLevel] = useState('any');
  const [minSalary, setMinSalary] = useState('');
  const [dateFilterDays, setDateFilterDays] = useState(30);

  useEffect(() => {
    handleSearch();
  }, [page, sortBy, workMode, employmentType, experienceLevel, dateFilterDays]);

  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
      if (page !== 1) {
        setPage(1);
        return; // Page change triggers useEffect search
      }
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        query: searchQuery || null,
        location: searchLocation || null,
        page: page,
        sort_by: sortBy,
        work_mode: workMode,
        employment_type: employmentType,
        experience_level: experienceLevel === 'any' ? null : experienceLevel,
        date_filter_days: dateFilterDays,
        salary_min: minSalary ? parseInt(minSalary) : null
      };

      const res = await fetch("http://localhost:8000/api/v1/jobs/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setJobs(data.results || []);
        setTotalCount(data.total_results || 0);
        setIsDemoMode(data.is_demo_mode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSaveJob = async (job) => {
    try {
      const token = localStorage.getItem('token');
      if (job.is_saved) {
        const res = await fetch(`http://localhost:8000/api/v1/jobs/${job.saved_id || job.id}/save`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setJobs(prev => prev.map(j => 
            j.id === job.id ? { ...j, is_saved: false, saved_id: null } : j
          ));
        }
      } else {
        const res = await fetch(`http://localhost:8000/api/v1/jobs/${job.id}/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(job)
        });
        if (res.ok) {
          const data = await res.json();
          setJobs(prev => prev.map(j => 
            j.id === job.id ? { ...j, is_saved: true, saved_id: data.saved_id } : j
          ));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Demo Warning Banner */}
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
          <span className="material-symbols-outlined text-amber-600 font-bold shrink-0">warning</span>
          <div>
            <p className="font-bold">FastAPI in Job Sandbox Mode</p>
            <p className="text-on-surface-variant mt-0.5 leading-relaxed">
              Adzuna API credentials (ADZUNA_APP_ID/KEY) are missing in .env. We are rendering simulated jobs aligned to your profile settings for demo purposes.
            </p>
          </div>
        </div>
      )}

      {/* Main Jobs Bar & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-outline-variant/35 pb-4">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Opportunities For You</h2>
          <p className="text-xs text-on-surface-variant">
            Found <strong>{totalCount}</strong> matching listings based on your target profile.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onSearchFromResume}
            className="px-3.5 py-1.5 border border-primary/20 text-primary bg-primary/5 rounded-lg text-xs font-bold hover:bg-primary/10 cursor-pointer"
            title="Reload profile preferences from manual builder resume"
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
            placeholder="Search keyword override (e.g. PyTorch, React Lead)"
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
            placeholder="Location override"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            className="w-full bg-transparent border-none text-xs focus:ring-0 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer"
        >
          Search
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
              <option value="hybrid">Hybrid Only</option>
              <option value="onsite">On-site Only</option>
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

          {/* Date Filter */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant font-bold uppercase">Date Posted</label>
            <select
              value={dateFilterDays}
              onChange={(e) => setDateFilterDays(parseInt(e.target.value))}
              className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:outline-none"
            >
              <option value={1}>Today</option>
              <option value={3}>Last 3 days</option>
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
            </select>
          </div>

          {/* Experience level */}
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

          {/* Min Salary */}
          <div className="space-y-1">
            <label className="text-[10px] text-on-surface-variant font-bold uppercase">Min Salary (Annual)</label>
            <input
              type="number"
              placeholder="e.g. 500000"
              value={minSalary}
              onChange={(e) => setMinSalary(e.target.value)}
              onBlur={() => handleSearch()}
              className="w-full bg-white border border-outline-variant rounded-lg p-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>
        </aside>

        {/* Results grid */}
        <div className="flex-1 flex flex-col gap-4">
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20 flex-grow">
              <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
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
                    <p className="font-bold text-xs">No exact matches found.</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5 leading-relaxed">
                      Try removing some filters, broadening your location override, or searching remote jobs.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => { setSearchQuery('Software Engineer'); handleSearch(); }}
                      className="px-3 py-1 border border-outline-variant rounded text-[10px] font-bold hover:bg-white cursor-pointer"
                    >
                      Broaden Role Search
                    </button>
                  </div>
                </div>
              )}

              {/* Pagination controls */}
              {totalCount > RESULTS_PER_PAGE && (
                <div className="flex justify-center items-center gap-3 pt-6 border-t border-outline-variant/20 mt-4 text-xs">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3.5 py-1.5 border border-outline-variant rounded-lg hover:bg-slate-50 disabled:opacity-50 font-bold cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-bold text-on-surface-variant">Page {page}</span>
                  <button
                    disabled={jobs.length < RESULTS_PER_PAGE}
                    onClick={() => setPage(page + 1)}
                    className="px-3.5 py-1.5 border border-outline-variant rounded-lg hover:bg-slate-50 disabled:opacity-50 font-bold cursor-pointer"
                  >
                    Next
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
