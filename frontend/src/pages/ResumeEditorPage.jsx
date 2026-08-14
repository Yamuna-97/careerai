import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function ResumeEditorPage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedTemplate, setSelectedTemplate] = useState('Modern');
  const [zoom, setZoom] = useState(85);

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

  const handleImproveWithAI = () => {
    setResumeData((prev) => ({
      ...prev,
      summary:
        'Award-winning Senior Product Designer with 6+ years spearheading scalable enterprise UX ecosystems. Architected design systems that elevated cross-functional velocity by 40% while accelerating conversion rates by 28% across 2M+ active SaaS users.',
    }));
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex overflow-hidden">
      {/* SideNavBar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-[260px] w-full min-h-screen h-screen">
        {/* TopNavBar */}
        <header className="bg-surface/80 backdrop-blur-md sticky top-0 right-0 left-0 z-40 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant">
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
              onClick={handleImproveWithAI}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary-container to-secondary text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              ✨ Improve with AI
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors shadow-sm bg-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          </div>
        </header>

        {/* Builder Workspace */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-surface-container-lowest pb-16 md:pb-0">
          {/* Left Panel: Editor */}
          <section className="w-full lg:w-[45%] xl:w-[40%] flex flex-col border-r border-outline-variant bg-surface relative h-full">
            {/* Section Tabs */}
            <div className="p-stack-md border-b border-outline-variant bg-surface/95 backdrop-blur z-10">
              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
                {['personal', 'experience', 'skills', 'education'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-md text-label-md transition-colors capitalize ${
                      activeTab === tab
                        ? 'bg-primary-container/10 text-primary border border-primary/20 font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {tab === 'personal' ? 'Personal Info' : tab}
                  </button>
                ))}
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
          </section>

          {/* Right Panel: Live Document Preview */}
          <section className="flex-1 bg-surface-container flex flex-col relative h-full overflow-hidden">
            {/* Preview Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-surface/90 backdrop-blur shadow-md rounded-full px-4 py-2 flex items-center gap-4 border border-outline-variant">
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
              <div
                className="w-full max-w-[800px] bg-white text-gray-900 shadow-xl rounded-sm p-10 flex flex-col border border-outline-variant mx-auto transition-transform origin-top"
                style={{ transform: `scale(${zoom / 100})`, minHeight: '1000px' }}
              >
                {/* Resume Header */}
                <header className="border-b-2 border-gray-900 pb-6 mb-6">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 uppercase">
                    {resumeData.firstName} {resumeData.lastName}
                  </h1>
                  <p className="text-xl text-primary font-medium mt-1">{resumeData.title}</p>
                  <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">mail</span>
                      {resumeData.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">phone</span>
                      {resumeData.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {resumeData.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">link</span>
                      {resumeData.linkedin}
                    </div>
                  </div>
                </header>

                <div className="flex-1 grid grid-cols-3 gap-8 text-left">
                  {/* Left Column */}
                  <div className="col-span-2 space-y-6">
                    {/* Summary */}
                    <section>
                      <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">
                        Professional Summary
                      </h2>
                      <p className="text-sm leading-relaxed text-gray-700">{resumeData.summary}</p>
                    </section>

                    {/* Experience */}
                    <section>
                      <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-3">
                        Experience
                      </h2>
                      {resumeData.experiences.map((exp, i) => (
                        <div key={i} className="mb-4">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-gray-900 text-sm">{exp.role}</h3>
                            <span className="text-xs font-medium text-gray-500">{exp.period}</span>
                          </div>
                          <p className="text-xs text-primary font-medium mb-1">
                            {exp.company} | {exp.location}
                          </p>
                          <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 ml-1">
                            {exp.bullets.map((b, bi) => (
                              <li key={bi}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="col-span-1 space-y-6">
                    {/* Skills */}
                    <section>
                      <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">
                        Skills
                      </h2>
                      <div className="space-y-2 text-xs">
                        <div>
                          <h4 className="font-bold text-gray-800">Design</h4>
                          <p className="text-gray-600">{resumeData.skills.design}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Tools</h4>
                          <p className="text-gray-600">{resumeData.skills.tools}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800">Research</h4>
                          <p className="text-gray-600">{resumeData.skills.research}</p>
                        </div>
                      </div>
                    </section>

                    {/* Education */}
                    <section>
                      <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-2">
                        Education
                      </h2>
                      <div>
                        <h3 className="font-bold text-gray-900 text-xs">{resumeData.education.degree}</h3>
                        <p className="text-[11px] text-gray-600 mt-0.5">{resumeData.education.school}</p>
                        <p className="text-[11px] text-gray-500">{resumeData.education.period}</p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Selector Thumbnail Strip */}
            <div className="h-20 bg-surface border-t border-outline-variant px-6 flex items-center gap-6 shrink-0 z-20">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">Templates:</span>
              {['Modern', 'Executive', 'Creative'].map((tpl) => (
                <button
                  key={tpl}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-label-md border transition-all cursor-pointer ${
                    selectedTemplate === tpl
                      ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {tpl}
                </button>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
