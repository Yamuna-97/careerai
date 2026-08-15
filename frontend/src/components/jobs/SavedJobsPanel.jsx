import React, { useState, useEffect } from 'react';

const TRACKER_STAGES = [
  { value: 'saved', label: 'Saved Opportunities' },
  { value: 'applied', label: 'Applied' },
  { value: 'interview', label: 'Interview Scheduled' },
  { value: 'offer', label: 'Offer Received' },
  { value: 'rejected', label: 'Archived / Rejected' }
];

export default function SavedJobsPanel({ onOpenJobDetails }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotesJob, setSelectedNotesJob] = useState(null);
  const [notesText, setNotesText] = useState('');

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8000/api/v1/jobs/saved", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.jobs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // Update app status
      const res = await fetch("http://localhost:8000/api/v1/jobs/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          saved_job_id: jobId,
          status: newStatus
        })
      });

      if (res.ok) {
        // Optimistically update status
        setSavedJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: newStatus } : job
        ));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedNotesJob) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/v1/jobs/applications/${selectedNotesJob.application_id || selectedNotesJob.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: selectedNotesJob.status,
          notes: notesText
        })
      });
      if (res.ok) {
        setSavedJobs(prev => prev.map(job => 
          job.id === selectedNotesJob.id ? { ...job, notes: notesText } : job
        ));
        setSelectedNotesJob(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveBookmark = async (id) => {
    if (!window.confirm("Remove this bookmark and delete tracker logs?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/v1/jobs/${id}/save`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedJobs(prev => prev.filter(job => job.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-text">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Application Status Tracker</h2>
          <p className="text-xs text-on-surface-variant">Drag or toggle status indicators to track progress.</p>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {TRACKER_STAGES.map(stage => {
          const stageJobs = savedJobs.filter(j => j.status === stage.value);
          
          return (
            <div key={stage.value} className="bg-slate-50 border border-outline-variant/30 rounded-xl p-3 flex flex-col min-h-[400px]">
              {/* Column Header */}
              <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2 mb-3">
                <span className="font-bold text-[11px] text-on-surface-variant uppercase tracking-wider">{stage.label}</span>
                <span className="bg-slate-200 text-on-surface-variant text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {stageJobs.length}
                </span>
              </div>

              {/* Cards in column */}
              <div className="flex-grow space-y-2 overflow-y-auto max-h-[600px] editor-scroll">
                {stageJobs.map(job => (
                  <div key={job.id} className="bg-white border border-outline-variant/40 rounded-lg p-3.5 shadow-sm space-y-3">
                    <div className="space-y-1">
                      <p
                        onClick={() => onOpenJobDetails(job)}
                        className="font-bold text-xs text-on-surface hover:text-primary cursor-pointer leading-tight line-clamp-2"
                      >
                        {job.title}
                      </p>
                      <p className="text-[10px] font-semibold text-on-surface-variant">{job.company}</p>
                      <p className="text-[9px] text-primary">{job.location}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] pt-1">
                      <span className="font-bold text-primary">{Math.round(job.match_score)}% Match</span>
                      <button
                        onClick={() => { setSelectedNotesJob(job); setNotesText(job.notes || ''); }}
                        className="text-on-surface-variant hover:text-primary flex items-center gap-0.5"
                        title="Add/View Notes"
                      >
                        <span className="material-symbols-outlined text-xs">notes</span>
                        Notes
                      </button>
                    </div>

                    {/* Simple status mover strip */}
                    <div className="border-t border-outline-variant/20 pt-2 flex justify-between items-center gap-1">
                      <select
                        value={job.status}
                        onChange={(e) => handleUpdateStatus(job.id, e.target.value)}
                        className="bg-slate-50 border border-outline-variant rounded p-1 text-[9px] focus:outline-none flex-grow"
                      >
                        {TRACKER_STAGES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleRemoveBookmark(job.id)}
                        className="p-1 hover:bg-red-50 text-error rounded cursor-pointer"
                        title="Remove Bookmark"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    </div>

                  </div>
                ))}
                
                {stageJobs.length === 0 && (
                  <p className="text-[10px] text-on-surface-variant text-center py-10 italic">No jobs in this stage.</p>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Notes Modal */}
      {selectedNotesJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md p-6 border border-outline-variant shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-on-surface text-sm">Application Notes</h3>
              <p className="text-[10px] text-on-surface-variant">{selectedNotesJob.title} – {selectedNotesJob.company}</p>
            </div>
            
            <textarea
              placeholder="e.g. Followed up on LinkedIn. Interview scheduled with HR on Tuesday."
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 border border-outline-variant rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedNotesJob(null)}
                className="px-3.5 py-1.5 border border-outline-variant rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
