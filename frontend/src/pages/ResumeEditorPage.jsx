import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ResumePreview from '../components/ResumePreview';
import { exportResumePDF } from '../utils/exportResumePDF';

export default function ResumeEditorPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [completedTabs, setCompletedTabs] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(() => localStorage.getItem('careerai_template_id') || 'Modern');
  const [zoom, setZoom] = useState(85);
  const [saveToast, setSaveToast] = useState(false);

  const tabsOrder = ['personal', 'experience', 'skills', 'education'];
  const tabLabels = { personal: 'Personal Info', experience: 'Experience', skills: 'Skills', education: 'Education' };
  const tabIcons  = { personal: 'person', experience: 'work', skills: 'psychology', education: 'school' };

  const handleNext = () => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    // Mark current tab as completed
    if (!completedTabs.includes(activeTab)) {
      setCompletedTabs(prev => [...prev, activeTab]);
    }
    if (currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    } else {
      exportResumePDF();
    }
  };

  const handleBack = () => {
    const currentIndex = tabsOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const [resumeData, setResumeData] = useState({
    firstName: 'Jane',
    lastName: 'Doe',
    title: 'Senior Product Designer',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/janedoe',
    summary:
      'Strategic Product Designer with 6+ years of experience transforming complex problems into intuitive, user-centric interfaces for Enterprise SaaS. Proven track record of leading design systems that increase team efficiency by 40%. Passionate about bridging the gap between user needs and business goals through data-informed design decisions.',
    experiences: [
      {
        role: 'Lead Product Designer',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        period: '2021 - Present',
        bullets: [
          'Spearheaded the redesign of the core analytics dashboard, resulting in a 25% increase in user engagement.',
          'Developed and maintained a comprehensive design system utilized by 50+ engineers and designers.',
          'Mentored 3 junior designers and led weekly design critiques.',
        ],
      },
      {
        role: 'UX/UI Designer',
        company: 'CreativeDigital Agency',
        location: 'New York, NY',
        period: '2018 - 2021',
        bullets: [
          'Collaborated with cross-functional teams to deliver end-to-end product designs for diverse client portfolio.',
          'Conducted extensive user research and usability testing sessions.',
        ],
      },
    ],
    skills: {
      design: 'UI/UX, Interaction Design, Wireframing, Prototyping, Design Systems',
      tools: 'Figma, Sketch, Adobe CC, Principle, Framer',
      research: 'User Testing, A/B Testing, Persona Development, Journey Mapping',
    },
    education: {
      degree: 'B.S. Interaction Design',
      school: 'California College of the Arts',
      period: '2014 - 2018',
    },
  });

  const handleSaveResume = () => {
    const saved = JSON.parse(localStorage.getItem('careerai_saved_resumes') || '[]');
    const entry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      template: selectedTemplate,
      data: resumeData,
    };
    // Keep max 10 saves, newest first
    const updated = [entry, ...saved].slice(0, 10);
    localStorage.setItem('careerai_saved_resumes', JSON.stringify(updated));
    // Show toast confirmation
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleImproveWithAI = () => {
    setResumeData((prev) => ({
      ...prev,
      summary:
        'Award-winning Senior Product Designer with 6+ years spearheading scalable enterprise UX ecosystems. Architected design systems that elevated cross-functional velocity by 40% while accelerating conversion rates by 28% across 2M+ active SaaS users.',
    }));
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-[calc(100vh-4rem)]">


      {/* Save toast */}
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[#EC4899] text-sm">check_circle</span>
          Resume saved successfully!
        </div>
      )}

      {/* Local Page Action Bar */}
      <div className="bg-surface/80 backdrop-blur-md sticky top-0 right-0 left-0 z-10 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant no-print">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-headline-sm font-extrabold text-on-background">Resume Builder</h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              Autosaved to cloud
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveResume}
            className="flex items-center gap-2 bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/30 px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-[#EC4899]/20 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">bookmark</span>
            <span className="hidden sm:inline">Save Resume</span>
          </button>
          <button
            onClick={handleImproveWithAI}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary-container to-secondary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            ✨ Improve with AI
          </button>
          <button
            onClick={() => exportResumePDF()}
            className="flex items-center gap-2 border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors shadow-sm bg-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </div>

      {/* Builder Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-surface-container-lowest pb-16 md:pb-0">
        {/* Left Panel: Editor */}
        <section className="w-full lg:w-[45%] xl:w-[40%] flex flex-col border-r border-outline-variant bg-surface relative h-full no-print">
          {/* Progress Stepper — Career Journey Style */}
          <div className="px-6 pt-5 pb-4 border-b border-outline-variant bg-surface/95 backdrop-blur z-10">
            <div className="relative flex items-start justify-between">
              {/* Connector line behind circles */}
              <div className="absolute top-4 left-0 right-0 h-[2px] z-0" style={{ background: 'linear-gradient(to right, #EC4899 0%, #EC4899 ' + Math.round((tabsOrder.indexOf(activeTab) / (tabsOrder.length - 1)) * 100) + '%, #e5e7eb ' + Math.round((tabsOrder.indexOf(activeTab) / (tabsOrder.length - 1)) * 100) + '%, #e5e7eb 100%)' }} />
              {tabsOrder.map((tab, idx) => {
                const isCurrent = activeTab === tab;
                const isDone = completedTabs.includes(tab);
                const isUpcoming = !isCurrent && !isDone;
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabClick(tab)}
                    className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group"
                    style={{ width: `${100 / tabsOrder.length}%` }}
                  >
                    {/* Circle */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                      isDone
                        ? 'bg-[#EC4899] border-[#EC4899] text-white shadow-pink-200'
                        : isCurrent
                        ? 'bg-white border-[#EC4899] text-[#EC4899]'
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {isDone ? (
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      ) : isCurrent ? (
                        <span className="w-3 h-3 rounded-full bg-[#EC4899] block" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    {/* Label */}
                    <span className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                      isCurrent ? 'text-[#EC4899]' : isDone ? 'text-[#EC4899]/70' : 'text-gray-400'
                    }`}>
                      {tabLabels[tab]}
                    </span>
                    {/* Sub-label */}
                    <span className={`text-[9px] font-medium ${
                      isCurrent ? 'text-[#EC4899] font-bold' : isDone ? 'text-[#EC4899]/60' : 'text-gray-400'
                    }`}>
                      {isDone ? 'Complete' : isCurrent ? 'Current' : 'Upcoming'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Form Area */}
          <div className="flex-1 overflow-y-auto editor-scroll p-stack-lg space-y-stack-lg">
            {activeTab === 'personal' && (
              <div className="space-y-stack-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Personal Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">First Name</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm"
                      type="text"
                      value={resumeData.firstName}
                      onChange={(e) => setResumeData({ ...resumeData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Last Name</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm"
                      type="text"
                      value={resumeData.lastName}
                      onChange={(e) => setResumeData({ ...resumeData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Professional Title</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm"
                      type="text"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Email</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm"
                      type="email"
                      value={resumeData.email}
                      onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Phone</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm"
                      type="tel"
                      value={resumeData.phone}
                      onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <hr className="border-outline-variant my-stack-md" />

                {/* Summary */}
                <div className="space-y-stack-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">subject</span>
                      Professional Summary
                    </h3>
                    <button
                      onClick={handleImproveWithAI}
                      className="flex items-center gap-1 text-secondary hover:text-secondary-container transition-colors text-sm font-label-md bg-secondary/10 px-2 py-1 rounded cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      AI Polish
                    </button>
                  </div>
                  <textarea
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm resize-none"
                    rows={5}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  />
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-stack-md">
                <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">work_history</span>
                  Work Experience
                </h3>
                {resumeData.experiences.map((exp, idx) => (
                  <div key={idx} className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded-lg space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>{exp.role}</span>
                      <span className="text-on-surface-variant text-sm">{exp.period}</span>
                    </div>
                    <p className="text-sm text-primary">{exp.company} • {exp.location}</p>
                    <ul className="list-disc list-inside text-sm text-on-surface-variant space-y-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-stack-md">
                <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary">psychology</span>
                  Skills & Competencies
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Design Skills</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface"
                      type="text"
                      value={resumeData.skills.design}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, design: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Tools & Tech</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface"
                      type="text"
                      value={resumeData.skills.tools}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, tools: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-stack-md">
                <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">school</span>
                  Education
                </h3>
                <div className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded-lg">
                  <h4 className="font-bold">{resumeData.education.degree}</h4>
                  <p className="text-sm text-primary">{resumeData.education.school}</p>
                  <p className="text-xs text-on-surface-variant">{resumeData.education.period}</p>
                </div>
              </div>
            )}

            <button className="w-full py-3 border-2 border-dashed border-outline-variant rounded-xl flex items-center justify-center gap-2 text-on-surface-variant hover:text-primary hover:border-primary hover:bg-surface-container-low transition-all cursor-pointer">
              <span className="material-symbols-outlined">add_circle</span>
              <span className="font-label-md text-label-md">Add Custom Section</span>
            </button>
          </div>

          {/* Navigation Footer */}
          <div className="p-4 border-t border-outline-variant bg-surface flex justify-between items-center shrink-0">
            <button
              onClick={handleBack}
              disabled={activeTab === 'personal'}
              className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-on-surface cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              Back
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              {activeTab === 'education' ? 'Export PDF' : 'Next'}
              <span className="material-symbols-outlined text-xs">{activeTab === 'education' ? 'download' : 'arrow_forward'}</span>
            </button>
          </div>
        </section>

        {/* Right Panel: Live Document Preview */}
        <section className="flex-1 bg-surface-container flex flex-col relative h-full overflow-hidden">
          {/* Preview Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-surface/90 backdrop-blur shadow-md rounded-full px-4 py-2 flex items-center gap-4 border border-outline-variant no-print">
            <button
              onClick={() => setZoom((z) => Math.max(z - 10, 50))}
              className="p-1 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-colors"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined">zoom_out</span>
            </button>
            <span className="font-label-sm text-label-sm">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 10, 120))}
              className="p-1 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-colors"
              title="Zoom In"
            >
              <span className="material-symbols-outlined">zoom_in</span>
            </button>
            <div className="w-px h-4 bg-outline-variant"></div>
            <span className="text-xs font-label-sm text-primary font-bold">{selectedTemplate} Template</span>
          </div>

          {/* Document Canvas */}
          <div className="flex-1 overflow-y-auto editor-scroll p-8 md:p-12 flex justify-center items-start pt-16">
            <ResumePreview resumeData={resumeData} templateId={selectedTemplate} scale={zoom} />
          </div>

          {/* Template Selector Thumbnail Strip */}
          <div className="h-20 bg-surface border-t border-outline-variant px-6 flex items-center gap-6 shrink-0 z-20 no-print">
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">Active Layout: {selectedTemplate}</span>
            <Link
              to="/resume/templates"
              className="px-4 py-1.5 border border-outline-variant hover:bg-surface-container text-on-surface rounded-lg font-label-md text-xs font-bold transition-all shadow-sm bg-surface cursor-pointer"
            >
              Browse Templates →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
