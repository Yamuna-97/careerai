import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function JobsPage() {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [bookmarkedJobs, setBookmarkedJobs] = useState({ 2: true });

  const jobsList = [
    {
      id: 1,
      title: 'Senior Frontend Engineer',
      company: 'TechFlow Systems',
      location: 'Remote',
      salary: '$140k - $160k',
      matchScore: 92,
      matchCategory: 'Excellent Match',
      skillsMatched: ['React', 'TypeScript'],
      skillsMissing: ['GraphQL'],
      description: 'Lead architecture of scalable React design systems and real-time dashboard applications.',
    },
    {
      id: 2,
      title: 'Senior Product Designer',
      company: 'NexGen Tech',
      location: 'San Francisco, CA',
      salary: '$130k - $150k',
      matchScore: 78,
      matchCategory: 'Good Match',
      skillsMatched: ['Figma', 'UI/UX', 'Design Systems'],
      skillsMissing: ['Framer'],
      description: 'Collaborate with engineering leads to craft end-to-end multi-platform SaaS experiences.',
    },
    {
      id: 3,
      title: 'Staff AI Interface Engineer',
      company: 'Cognitive Dynamics',
      location: 'Remote',
      salary: '$170k - $210k',
      matchScore: 96,
      matchCategory: 'Top Pick',
      skillsMatched: ['React', 'WebGL', 'AI Integrations'],
      skillsMissing: [],
      description: 'Bridge generative AI models with high-fidelity, responsive client-side user interfaces.',
    },
  ];

  const toggleBookmark = (id) => {
    setBookmarkedJobs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredJobs = jobsList.filter((job) => {
    if (remoteOnly && job.location !== 'Remote') return false;
    if (selectedLocation !== 'All' && job.location !== selectedLocation) return false;
    return true;
  });

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex pb-20 md:pb-8">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen w-full">
        <Header title="Job Discovery & AI Matcher" subtitle="142 opportunities matched with your career profile" />

        <main className="flex-grow px-margin-mobile md:px-margin-desktop py-stack-lg w-full max-w-[1600px] mx-auto">
          {/* Header & Filters */}
          <div className="mb-stack-lg flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-1">
                  Job Opportunities
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  We found <strong className="text-primary">{filteredJobs.length}</strong> positions matching your current skillset.
                </p>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="flex flex-wrap gap-4 p-4 bg-surface rounded-xl shadow-sm border border-outline-variant/50 items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent border-none text-body-sm font-body-sm focus:ring-0 cursor-pointer text-on-background outline-none"
                >
                  <option value="All">All Locations</option>
                  <option value="San Francisco, CA">San Francisco, CA</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>

              <div className="h-6 w-px bg-outline-variant hidden sm:block"></div>

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                <select className="bg-transparent border-none text-body-sm font-body-sm focus:ring-0 cursor-pointer text-on-background outline-none">
                  <option>All Salary Ranges</option>
                  <option>$120k - $150k</option>
                  <option>$150k - $180k</option>
                  <option>$180k+</option>
                </select>
              </div>

              <div className="h-6 w-px bg-outline-variant hidden lg:block"></div>

              <div className="flex gap-2 ml-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="font-body-sm text-body-sm text-on-background font-medium">Remote Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Bento Layout: Jobs Grid + Match Analysis Side Panel */}
          <div className="flex flex-col lg:flex-row gap-gutter">
            {/* Jobs List */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-surface rounded-xl shadow-md border border-outline-variant/40 p-stack-lg relative overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container opacity-5 rounded-bl-full pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-start">
                      <div className="w-12 h-12 rounded bg-surface-container-high flex items-center justify-center font-bold text-primary text-xl border border-outline-variant">
                        {job.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-headline-sm text-headline-sm text-on-background font-bold">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                            {job.company}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="font-label-sm text-label-sm text-primary font-semibold">
                            {job.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleBookmark(job.id)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        bookmarkedJobs[job.id]
                          ? 'text-primary bg-primary-container/10'
                          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                      }`}
                      title={bookmarkedJobs[job.id] ? 'Bookmarked' : 'Save Job'}
                    >
                      <span className={`material-symbols-outlined ${bookmarkedJobs[job.id] ? 'icon-filled' : ''}`}>
                        bookmark
                      </span>
                    </button>
                  </div>

                  <p className="text-sm text-on-surface-variant mb-4">{job.description}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                    {/* Score Ring */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-surface-container-high"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          ></path>
                          <path
                            className={job.matchScore >= 90 ? 'text-tertiary-container' : 'text-secondary'}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray={`${job.matchScore}, 100`}
                            strokeLinecap="round"
                            strokeWidth="4"
                          ></path>
                        </svg>
                        <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">
                          {job.matchScore}%
                        </span>
                      </div>
                      <div>
                        <p className="font-label-sm text-label-sm text-on-background font-bold">{job.matchCategory}</p>
                        <span className="text-xs text-on-surface-variant">Profile Compatibility</span>
                      </div>
                    </div>

                    {/* Skill Badges */}
                    <div className="flex flex-wrap gap-2 sm:ml-auto">
                      {job.skillsMatched.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-tertiary-container/10 text-tertiary font-label-sm text-xs flex items-center gap-1 font-semibold"
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span> {s}
                        </span>
                      ))}
                      {job.skillsMissing.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-xs flex items-center gap-1 border border-error/20 font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 mt-4">
                    <span className="font-label-md text-label-md font-bold text-primary">{job.salary}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate('/resume-editor')}
                        className="px-4 py-2 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                      >
                        Tailor Resume
                      </button>
                      <button
                        onClick={() => navigate('/interview-session')}
                        className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-[#4338CA] transition-colors shadow-sm cursor-pointer"
                      >
                        Apply with AI
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Match Analysis Sidebar */}
            <div className="w-full lg:w-1/3">
              <div className="sticky top-20 bg-surface rounded-xl shadow-md border border-outline-variant/40 p-stack-lg flex flex-col gap-6">
                <div className="flex items-center gap-3 border-b border-outline-variant/30 pb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center relative overflow-hidden text-secondary">
                    <span className="material-symbols-outlined icon-filled">analytics</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-background font-bold">AI Match Analysis</h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Based on your Resume & Profile</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-label-md text-label-md text-on-background mb-3 font-bold">
                    Top Transferable Skills
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="font-body-sm text-on-surface-variant">React / Frontend Architecture</span>
                        <span className="font-bold text-primary">95%</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="font-body-sm text-on-surface-variant">Product & UX Design Systems</span>
                        <span className="font-bold text-secondary">88%</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div className="bg-secondary h-1.5 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="font-body-sm text-on-surface-variant">Design Collaboration</span>
                        <span className="font-bold text-tertiary">92%</span>
                      </div>
                      <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                        <div className="bg-tertiary h-1.5 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30">
                  <h4 className="font-label-md text-label-md text-on-background mb-2 flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-[18px] text-tertiary">lightbulb</span>
                    Improvement Opportunity
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">
                    Adding "GraphQL" and "Framer" to your profile increases your match rate for 45+ additional roles.
                  </p>
                  <button
                    onClick={() => navigate('/resume-editor')}
                    className="w-full py-2 rounded-lg border border-outline-variant bg-surface text-on-surface-variant hover:text-primary font-label-sm text-label-sm transition-colors cursor-pointer"
                  >
                    Update Resume Skills
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
