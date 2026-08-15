import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import JobSearchSetup from '../components/jobs/JobSearchSetup';
import JobResults from '../components/jobs/JobResults';
import SavedJobsPanel from '../components/jobs/SavedJobsPanel';
import JobDetailModal from '../components/jobs/JobDetailModal';

export default function JobsPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' | 'saved'
  
  // Update tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'saved') {
      setActiveTab('saved');
    } else {
      setActiveTab('recommended');
    }
  }, [location.search]);

  // Profile Loading/Checking States
  const [profileExists, setProfileExists] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileDraft, setProfileDraft] = useState(null);
  
  // Selection states
  const [selectedJob, setSelectedJob] = useState(null);
  
  // Dashboard Stats State
  const [stats, setStats] = useState({
    recommended: 0,
    saved: 0,
    applications: 0,
    interviews: 0
  });

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8000/api/v1/jobs/profile", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile_exists) {
          setProfileExists(true);
          fetchDashboardStats();
        } else if (data.has_resume) {
          setProfileDraft(data.extracted_draft);
          setProfileExists(false);
        } else {
          setProfileExists(false);
        }
      }
    } catch (e) {
      console.error("Failed to fetch profile settings status:", e);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch saved jobs list
      const savedRes = await fetch("http://localhost:8000/api/v1/jobs/saved", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      let savedCount = 0;
      let appCount = 0;
      let interviewCount = 0;
      
      if (savedRes.ok) {
        const data = await savedRes.json();
        const list = data.jobs || [];
        savedCount = list.length;
        appCount = list.filter(j => j.status === 'applied').length;
        interviewCount = list.filter(j => j.status === 'interview').length;
      }

      setStats(prev => ({
        ...prev,
        saved: savedCount,
        applications: appCount,
        interviews: interviewCount
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchFromResume = async () => {
    if (!window.confirm("Reload career parameters from your active resume?")) return;
    setIsLoadingProfile(true);
    
    try {
      const token = localStorage.getItem('token');
      // Fetch latest resume data
      const res = await fetch("http://localhost:8000/api/v1/resumes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const resumes = await res.json();
        if (resumes.length > 0) {
          // Recheck profile triggers auto-extract automatically on backend
          await checkProfile();
        } else {
          alert("No resumes found to extract. Setup manually.");
          setIsLoadingProfile(false);
        }
      }
    } catch (e) {
      console.error(e);
      setIsLoadingProfile(false);
    }
  };

  const handleToggleSaveDetailJob = async () => {
    if (!selectedJob) return;
    try {
      const token = localStorage.getItem('token');
      if (selectedJob.is_saved) {
        // Unsave
        const res = await fetch(`http://localhost:8000/api/v1/jobs/${selectedJob.saved_id || selectedJob.id}/save`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          setSelectedJob(prev => ({ ...prev, is_saved: false, saved_id: null }));
          fetchDashboardStats();
        }
      } else {
        // Save
        const res = await fetch(`http://localhost:8000/api/v1/jobs/${selectedJob.id}/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(selectedJob)
        });
        if (res.ok) {
          const data = await res.json();
          setSelectedJob(prev => ({ ...prev, is_saved: true, saved_id: data.saved_id }));
          fetchDashboardStats();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-lg w-full max-w-[1600px] mx-auto space-y-6 pb-20 md:pb-8">

          
          {isLoadingProfile ? (
            <div className="flex justify-center items-center py-40">
              <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
            </div>
          ) : !profileExists ? (
            <div className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <h2 className="font-headline-lg font-bold text-on-surface">Find Jobs That Match You</h2>
                <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                  Search real-world opportunities based on your resume, skills and career goals. Let's create your Job Search Profile.
                </p>
              </div>
              <JobSearchSetup
                initialData={profileDraft}
                onComplete={() => {
                  setProfileExists(true);
                  fetchDashboardStats();
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Dashboard stats panel */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined">recommend</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Recommended</p>
                    <p className="font-bold text-sm text-on-surface">Matched Jobs</p>
                  </div>
                </div>

                <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">bookmark</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Saved Jobs</p>
                    <p className="font-bold text-sm text-on-surface">{stats.saved} Opportunities</p>
                  </div>
                </div>

                <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined">send</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Applications</p>
                    <p className="font-bold text-sm text-on-surface">{stats.applications} Active</p>
                  </div>
                </div>

                <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined">event</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Interviews</p>
                    <p className="font-bold text-sm text-on-surface">{stats.interviews} Scheduled</p>
                  </div>
                </div>
              </section>

              {/* Workspace Navigation Tabs */}
              <div className="flex gap-2 border-b border-outline-variant/30 pb-2">
                <button
                  onClick={() => setActiveTab('recommended')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'recommended'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Recommended Jobs
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'saved'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Saved Jobs & Tracker
                </button>
              </div>

              {/* Workspace content */}
              <div className="pt-2">
                {activeTab === 'recommended' ? (
                  <JobResults
                    onOpenJobDetails={setSelectedJob}
                    onEditPreferences={() => setProfileExists(false)}
                    onSearchFromResume={handleSearchFromResume}
                  />
                ) : (
                  <SavedJobsPanel
                    onOpenJobDetails={setSelectedJob}
                  />
                )}
              </div>

            </div>
          )}

      {/* Slide-out details modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => {
            setSelectedJob(null);
            fetchDashboardStats();
          }}
          onToggleSave={handleToggleSaveDetailJob}
        />
      )}

    </div>
  );
}
