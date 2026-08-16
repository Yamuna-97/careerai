import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import JobSearchSetup from '../components/jobs/JobSearchSetup';
import JobResults from '../components/jobs/JobResults';
import SavedJobsPanel from '../components/jobs/SavedJobsPanel';
import JobDetailModal from '../components/jobs/JobDetailModal';
import apiClient from '../api/client';

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

  useEffect(() => {
    if (location.state?.selectedJob) {
      setSelectedJob(location.state.selectedJob);
      // Clean up state history to prevent re-opening on reload
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const checkProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await apiClient.get('/jobs/profile');
      const data = res.data;
      if (data.profile_exists) {
        setProfileExists(true);
        fetchDashboardStats();
      } else if (data.has_resume) {
        setProfileDraft(data.extracted_draft);
        setProfileExists(false);
      } else {
        setProfileExists(false);
      }
    } catch (e) {
      console.error("Failed to fetch profile settings status:", e);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await apiClient.get('/jobs/saved');
      const list = res.data?.jobs || [];
      const savedCount = list.length;
      const appCount = list.filter(j => j.status === 'applied').length;
      const interviewCount = list.filter(j => j.status === 'interview').length;

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
      const res = await apiClient.get('/resumes');
      if (res.data?.length > 0) {
        await checkProfile();
      } else {
        alert("No resumes found to extract. Setup manually.");
        setIsLoadingProfile(false);
      }
    } catch (e) {
      console.error(e);
      setIsLoadingProfile(false);
    }
  };

  const handleToggleSaveDetailJob = async () => {
    if (!selectedJob) return;
    try {
      if (selectedJob.is_saved) {
        await apiClient.delete(`/jobs/${selectedJob.saved_id || selectedJob.id}/save`);
        setSelectedJob(prev => ({ ...prev, is_saved: false, saved_id: null }));
        fetchDashboardStats();
      } else {
        const res = await apiClient.post(`/jobs/${selectedJob.id}/save`, selectedJob);
        setSelectedJob(prev => ({ ...prev, is_saved: true, saved_id: res.data?.saved_id }));
        fetchDashboardStats();
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
                  <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 text-[#EC4899] flex items-center justify-center">
                    <span className="material-symbols-outlined">recommend</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Recommended</p>
                    <p className="font-bold text-sm text-on-surface">Matched Jobs</p>
                  </div>
                </div>

                <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FF8A3D]/10 text-[#FF8A3D] flex items-center justify-center">
                    <span className="material-symbols-outlined">bookmark</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Saved Jobs</p>
                    <p className="font-bold text-sm text-on-surface">{stats.saved} Opportunities</p>
                  </div>
                </div>

                <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 text-[#EC4899] flex items-center justify-center">
                    <span className="material-symbols-outlined">send</span>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Applications</p>
                    <p className="font-bold text-sm text-on-surface">{stats.applications} Active</p>
                  </div>
                </div>

                <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#FF8A3D]/10 text-[#FF8A3D] flex items-center justify-center">
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
                      ? 'border-[#EC4899] text-[#EC4899]'
                      : 'border-transparent text-on-surface-variant hover:text-[#EC4899]'
                  }`}
                >
                  Recommended Jobs
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    activeTab === 'saved'
                      ? 'border-[#EC4899] text-[#EC4899]'
                      : 'border-transparent text-on-surface-variant hover:text-[#EC4899]'
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
