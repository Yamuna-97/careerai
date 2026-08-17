import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import ResumePreview from '../components/ResumePreview';
import { exportResumePDF } from '../utils/exportResumePDF';

const EMPTY_RESUME_SCHEMA = {
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  github: '',
  portfolio: '',
  summary: '',
  experiences: [],
  skills: {
    technical: '',
    frameworks: '',
    tools: ''
  },
  education: []
};

export default function ResumeEditorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [completedTabs, setCompletedTabs] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(() => localStorage.getItem('careerai_template_id') || '4');
  const [zoom, setZoom] = useState(85);
  const [saveToast, setSaveToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const tabsOrder = ['personal', 'experience', 'skills', 'education'];
  const tabLabels = { personal: 'Personal Info', experience: 'Experience', skills: 'Skills', education: 'Education' };

  // Resume Data State (Source of truth in Editor)
  const [resumeData, setResumeData] = useState(() => {
    const saved = localStorage.getItem('careerai_resume_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizeToEditorState(parsed);
      } catch (e) {
        console.error(e);
      }
    }
    return EMPTY_RESUME_SCHEMA;
  });

  const debounceTimerRef = useRef(null);

  // Helper to normalize any incoming database/parser format to editor state
  function normalizeToEditorState(data) {
    if (!data) return EMPTY_RESUME_SCHEMA;
    const personal = data.personal || {};
    const fullName = personal.fullName || data.fullName || '';
    const nameParts = fullName.split(' ');
    const fName = personal.firstName || data.firstName || (nameParts[0] || '');
    const lName = personal.lastName || data.lastName || (nameParts.slice(1).join(' ') || '');

    // Experiences
    const rawExp = data.experience || data.experiences || [];
    const experiences = rawExp.map((exp, idx) => ({
      id: exp.id || String(idx + 1),
      role: exp.position || exp.role || '',
      company: exp.company || '',
      location: exp.location || '',
      period: exp.period || (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : (exp.startDate || '')),
      bullets: exp.bullets || (exp.description ? exp.description.split('\n').map(b => b.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean) : [])
    }));

    // Skills
    let skillsObj = { technical: '', frameworks: '', tools: '' };
    if (data.skills && typeof data.skills === 'object' && !Array.isArray(data.skills)) {
      skillsObj = {
        technical: data.skills.technical || data.skills.design || '',
        frameworks: data.skills.frameworks || data.skills.tools || '',
        tools: data.skills.tools || data.skills.research || ''
      };
    } else if (Array.isArray(data.skills)) {
      skillsObj.technical = data.skills.map(s => typeof s === 'object' ? s.name : s).join(', ');
    }

    // Education
    const rawEdu = data.education || [];
    const eduList = Array.isArray(rawEdu) ? rawEdu : [rawEdu];
    const education = eduList.filter(Boolean).map((edu, idx) => ({
      id: edu.id || String(idx + 1),
      degree: edu.degree || '',
      school: edu.institution || edu.school || '',
      period: edu.period || (edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : (edu.startDate || ''))
    }));

    return {
      firstName: fName,
      lastName: lName,
      title: personal.title || data.title || '',
      email: personal.email || data.email || '',
      phone: personal.phone || data.phone || '',
      location: personal.location || data.location || '',
      linkedin: personal.linkedin || data.linkedin || '',
      github: personal.github || data.github || '',
      portfolio: personal.portfolio || data.portfolio || '',
      summary: data.summary || personal.summary || '',
      experiences,
      skills: skillsObj,
      education
    };
  }

  // Load from backend on mount
  useEffect(() => {
    apiClient.get('/resumes')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const active = res.data[0];
          const normalized = normalizeToEditorState(active);
          setResumeData(normalized);
          localStorage.setItem('careerai_resume_data', JSON.stringify(normalized));
        }
      })
      .catch(() => {
        // Continue with local storage cache
      });
  }, []);

  // Debounced auto-save to localStorage cache
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      localStorage.setItem('careerai_resume_data', JSON.stringify(resumeData));
    }, 1500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [resumeData]);

  const handleNext = () => {
    const currentIndex = tabsOrder.indexOf(activeTab);
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

  const handleSaveResume = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('careerai_resume_data', JSON.stringify(resumeData));
      
      const saved = JSON.parse(localStorage.getItem('careerai_saved_resumes') || '[]');
      const entry = {
        id: Date.now(),
        savedAt: new Date().toISOString(),
        template: selectedTemplate,
        data: resumeData,
      };
      localStorage.setItem('careerai_saved_resumes', JSON.stringify([entry, ...saved].slice(0, 10)));

      // If backend save endpoint is available, persist
      apiClient.post('/resumes', {
        title: `${resumeData.firstName} ${resumeData.lastName}`.trim() || 'My Resume',
        template: selectedTemplate,
        full_name: `${resumeData.firstName} ${resumeData.lastName}`.trim(),
        email: resumeData.email,
        phone: resumeData.phone,
        location: resumeData.location,
        linkedin: resumeData.linkedin,
        github: resumeData.github,
        summary: resumeData.summary
      }).catch(() => {
        // Keep in cache safely
      });

      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 2500);
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Experience Entry
  const handleAddExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: String(Date.now()),
          role: '',
          company: '',
          location: '',
          period: '',
          bullets: ['']
        }
      ]
    }));
  };

  // Update Experience Entry
  const handleUpdateExperience = (idx, field, value) => {
    setResumeData(prev => {
      const updated = [...prev.experiences];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, experiences: updated };
    });
  };

  // Remove Experience Entry
  const handleRemoveExperience = (idx) => {
    setResumeData(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== idx)
    }));
  };

  // Add Education Entry
  const handleAddEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: String(Date.now()),
          degree: '',
          school: '',
          period: ''
        }
      ]
    }));
  };

  // Update Education Entry
  const handleUpdateEducation = (idx, field, value) => {
    setResumeData(prev => {
      const updated = [...prev.education];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, education: updated };
    });
  };

  // Remove Education Entry
  const handleRemoveEducation = (idx) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-[calc(100vh-4rem)]">

      {/* Save toast */}
      {saveToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
          Resume saved successfully!
        </div>
      )}

      {/* Local Page Action Bar */}
      <div className="bg-surface/80 backdrop-blur-md sticky top-0 right-0 left-0 z-10 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant no-print">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-headline-sm font-extrabold text-on-background">Resume Builder</h2>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Auto-sync enabled
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveResume}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/30 px-4 py-2 rounded-lg font-label-md text-xs font-bold hover:bg-primary/20 transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Resume'}</span>
          </button>
          <button
            onClick={() => navigate('/resume/ai')}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary-container to-secondary text-on-primary px-4 py-2 rounded-lg font-label-md text-xs font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            AI Studio
          </button>
          <button
            onClick={() => exportResumePDF()}
            className="flex items-center gap-2 border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-label-md text-xs font-bold hover:bg-surface-container transition-colors shadow-sm bg-surface cursor-pointer"
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
          {/* Progress Stepper */}
          <div className="px-6 pt-5 pb-4 border-b border-outline-variant bg-surface/95 backdrop-blur z-10">
            <div className="relative flex items-start justify-between">
              <div className="absolute top-4 left-0 right-0 h-[2px] z-0" style={{ background: 'linear-gradient(to right, #EC4899 0%, #EC4899 ' + Math.round((tabsOrder.indexOf(activeTab) / (tabsOrder.length - 1)) * 100) + '%, #e5e7eb ' + Math.round((tabsOrder.indexOf(activeTab) / (tabsOrder.length - 1)) * 100) + '%, #e5e7eb 100%)' }} />
              {tabsOrder.map((tab, idx) => {
                const isCurrent = activeTab === tab;
                const isDone = completedTabs.includes(tab);
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="relative z-10 flex flex-col items-center gap-1.5 cursor-pointer group"
                    style={{ width: `${100 / tabsOrder.length}%` }}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                      isDone
                        ? 'bg-primary border-primary text-white'
                        : isCurrent
                        ? 'bg-white border-primary text-primary'
                        : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {isDone ? (
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      ) : isCurrent ? (
                        <span className="w-3 h-3 rounded-full bg-primary block" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                      isCurrent ? 'text-primary' : isDone ? 'text-primary/70' : 'text-gray-400'
                    }`}>
                      {tabLabels[tab]}
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
                <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Personal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">First Name</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. Sarah"
                      value={resumeData.firstName}
                      onChange={(e) => setResumeData({ ...resumeData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Last Name</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. Connor"
                      value={resumeData.lastName}
                      onChange={(e) => setResumeData({ ...resumeData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Professional Title</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. Full Stack Software Engineer"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Email</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="email"
                      placeholder="e.g. sarah@example.com"
                      value={resumeData.email}
                      onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Phone</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="tel"
                      placeholder="e.g. +1 555-019-2834"
                      value={resumeData.phone}
                      onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Location</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. San Francisco, CA"
                      value={resumeData.location}
                      onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">LinkedIn / GitHub</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. linkedin.com/in/username"
                      value={resumeData.linkedin}
                      onChange={(e) => setResumeData({ ...resumeData, linkedin: e.target.value })}
                    />
                  </div>
                </div>

                <hr className="border-outline-variant my-stack-md" />

                {/* Summary */}
                <div className="space-y-stack-xs">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">subject</span>
                    Professional Summary
                  </h3>
                  <textarea
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm resize-none text-xs"
                    rows={4}
                    placeholder="Briefly describe your career background, core competencies, and career goals..."
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                  />
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-stack-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">work_history</span>
                    Work Experience
                  </h3>
                  <button
                    onClick={handleAddExperience}
                    className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    Add Job
                  </button>
                </div>

                {resumeData.experiences.length === 0 ? (
                  <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center space-y-2">
                    <p className="text-xs text-on-surface-variant">No work experience entries added yet.</p>
                    <button
                      onClick={handleAddExperience}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      + Add your first position
                    </button>
                  </div>
                ) : (
                  resumeData.experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded-lg space-y-2.5 relative">
                      <button
                        onClick={() => handleRemoveExperience(idx)}
                        className="absolute top-2 right-2 text-on-surface-variant hover:text-rose-600 transition-colors"
                        title="Remove position"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Role (e.g. Senior Software Engineer)"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Company (e.g. Acme Corp)"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Location (e.g. San Francisco, CA)"
                          value={exp.location}
                          onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Dates (e.g. 2021 - Present)"
                          value={exp.period}
                          onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none"
                        />
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Bullet points or description of your achievements in this role..."
                        value={Array.isArray(exp.bullets) ? exp.bullets.join('\n') : (exp.description || '')}
                        onChange={(e) => handleUpdateExperience(idx, 'bullets', e.target.value.split('\n'))}
                        className="w-full px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none resize-none"
                      />
                    </div>
                  ))
                )}
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
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Core Technical Skills</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface text-xs"
                      type="text"
                      placeholder="e.g. Python, TypeScript, React, PostgreSQL, Docker"
                      value={resumeData.skills.technical}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, technical: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Frameworks & Libraries</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface text-xs"
                      type="text"
                      placeholder="e.g. FastAPI, Next.js, PyTorch, TailwindCSS"
                      value={resumeData.skills.frameworks}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, frameworks: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Tools & Methodologies</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-md text-on-surface text-xs"
                      type="text"
                      placeholder="e.g. Git, CI/CD, AWS, Kubernetes, Agile"
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
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">school</span>
                    Education
                  </h3>
                  <button
                    onClick={handleAddEducation}
                    className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-bold hover:bg-primary/20 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    Add Degree
                  </button>
                </div>

                {resumeData.education.length === 0 ? (
                  <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center space-y-2">
                    <p className="text-xs text-on-surface-variant">No education records added yet.</p>
                    <button
                      onClick={handleAddEducation}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      + Add education
                    </button>
                  </div>
                ) : (
                  resumeData.education.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded-lg space-y-2 relative">
                      <button
                        onClick={() => handleRemoveEducation(idx)}
                        className="absolute top-2 right-2 text-on-surface-variant hover:text-rose-600 transition-colors"
                        title="Remove education"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                      <input
                        type="text"
                        placeholder="Degree (e.g. B.S. in Computer Science)"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none font-bold"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Institution (e.g. Stanford University)"
                          value={edu.school}
                          onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Dates (e.g. 2018 - 2022)"
                          value={edu.period}
                          onChange={(e) => handleUpdateEducation(idx, 'period', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
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
            <span className="text-xs font-label-sm text-primary font-bold">Template #{selectedTemplate}</span>
          </div>

          {/* Document Canvas */}
          <div className="flex-1 overflow-y-auto editor-scroll p-8 md:p-12 flex justify-center items-start pt-16">
            <ResumePreview resumeData={resumeData} templateId={selectedTemplate} scale={zoom} />
          </div>

          {/* Template Selector Thumbnail Strip */}
          <div className="h-20 bg-surface border-t border-outline-variant px-6 flex items-center justify-between shrink-0 z-20 no-print">
            <div className="flex items-center gap-3">
              <span className="font-label-sm text-xs text-on-surface-variant font-bold">Active Template: #{selectedTemplate}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/resume/templates"
                className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Switch Template
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
