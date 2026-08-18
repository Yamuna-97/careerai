import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
    soft: '',
    tools: '',
    languages: ''
  },
  education: []
};

const POPULAR_AI_ROLES = [
  "Senior Full Stack Engineer",
  "AI / Machine Learning Engineer",
  "Staff Cloud Infrastructure Architect",
  "Product Engineering Lead",
  "Quantitative Data Scientist",
  "Cybersecurity & DevSecOps Lead",
  "Principal Frontend Architect",
  "Robotics & Autonomous Systems Engineer"
];

export default function ResumeEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeIdParam = searchParams.get('id');
  const templateParam = searchParams.get('template');
  const [resumeId, setResumeId] = useState(resumeIdParam || null);
  const [activeTab, setActiveTab] = useState('personal');
  const [completedTabs, setCompletedTabs] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(templateParam || '4');
  const [zoom, setZoom] = useState(85);
  const [saveToast, setSaveToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Google AI Modal & State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiRoleInput, setAiRoleInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  const [polishingId, setPolishingId] = useState(null);

  const tabsOrder = ['personal', 'experience', 'skills', 'education'];
  const tabLabels = { personal: 'Personal Info', experience: 'Experience', skills: 'Skills', education: 'Education' };

  // Resume Data State (Source of truth in Editor)
  const [resumeData, setResumeData] = useState(EMPTY_RESUME_SCHEMA);

  // Helper to normalize any incoming database/parser format to editor state
  function normalizeToEditorState(data) {
    if (!data) return EMPTY_RESUME_SCHEMA;
    const personal = data.personal || {};
    const fullName = personal.fullName || data.fullName || data.full_name || '';
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
      period: exp.period || (exp.startDate && exp.endDate ? `${exp.startDate} – ${exp.endDate}` : (exp.startDate || '')),
      bullets: exp.bullets || (exp.description ? exp.description.split('\n').map(b => b.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean) : [''])
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
      period: edu.period || (edu.startDate && edu.endDate ? `${edu.startDate} – ${edu.endDate}` : (edu.startDate || ''))
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
      experiences: experiences.length > 0 ? experiences : [],
      skills: skillsObj,
      education: education.length > 0 ? education : []
    };
  }

  // Load from backend on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        if (resumeIdParam) {
          const res = await apiClient.get(`/resumes/${resumeIdParam}`);
          if (res.data) {
            setResumeId(res.data.id);
            setSelectedTemplate(res.data.template || '4');
            setResumeData(normalizeToEditorState(res.data));
            return;
          }
        }
        const listRes = await apiClient.get('/resumes');
        if (Array.isArray(listRes.data) && listRes.data.length > 0) {
          const latest = listRes.data[0];
          const fullRes = await apiClient.get(`/resumes/${latest.id}`);
          if (fullRes.data) {
            setResumeId(fullRes.data.id);
            setSelectedTemplate(fullRes.data.template || '4');
            setResumeData(normalizeToEditorState(fullRes.data));
          }
        }
      } catch (err) {
        console.warn('Could not load resume from backend:', err);
      }
    };
    loadResume();
  }, [resumeIdParam]);

  // Google AI Generation Trigger
  const handleGenerateWithAI = async (roleToUse) => {
    const target = roleToUse || aiRoleInput || resumeData.title || "Senior Software Engineer";
    setAiGenerating(true);
    setAiError('');
    try {
      const payload = {
        target_role: target,
        resume_data: {
          personal: {
            fullName: `${resumeData.firstName} ${resumeData.lastName}`.trim() || undefined,
            title: target,
            email: resumeData.email || undefined,
            location: resumeData.location || undefined
          },
          summary: resumeData.summary || undefined,
          experience: resumeData.experiences,
          education: resumeData.education,
          skills: resumeData.skills
        }
      };

      const res = await apiClient.post('/resume/ai/generate', payload);
      if (res.data && res.data.resume_data) {
        const generated = res.data.resume_data;
        const normalized = normalizeToEditorState(generated);
        setResumeData(normalized);
        setShowAiModal(false);
        setSaveToast(true);
        setTimeout(() => setSaveToast(false), 3000);
      } else {
        setAiError("Could not parse AI response. Please try again.");
      }
    } catch (err) {
      console.error("AI Generation error:", err);
      setAiError(err.response?.data?.detail || err.message || "AI generation failed.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Inline AI Bullet Point Polisher
  const handlePolishBullet = async (expIdx, bulletIdx) => {
    const bullet = resumeData.experiences[expIdx]?.bullets[bulletIdx];
    if (!bullet || !bullet.trim()) return;

    const polishKey = `${expIdx}-${bulletIdx}`;
    setPolishingId(polishKey);
    try {
      const res = await apiClient.post('/resume/ai/improve-bullet', {
        bullet: bullet,
        mode: 'professional'
      });

      const improved = res.data?.improved?.[0]?.text || res.data?.achievement_focused || res.data?.professional || bullet;
      setResumeData(prev => {
        const updatedExp = [...prev.experiences];
        const updatedBullets = [...updatedExp[expIdx].bullets];
        updatedBullets[bulletIdx] = improved;
        updatedExp[expIdx] = { ...updatedExp[expIdx], bullets: updatedBullets };
        return { ...prev, experiences: updatedExp };
      });
    } catch (e) {
      console.error("Bullet polishing failed:", e);
    } finally {
      setPolishingId(null);
    }
  };

  // Inline AI Summary Writer
  const handleGenerateSummary = async () => {
    const role = resumeData.title || "Senior Software Engineer";
    try {
      const res = await apiClient.post('/resume/ai/generate', {
        target_role: role,
        resume_data: {
          personal: { fullName: `${resumeData.firstName} ${resumeData.lastName}`.trim(), title: role },
          experience: resumeData.experiences,
          skills: resumeData.skills
        }
      });
      if (res.data?.resume_data?.summary) {
        setResumeData(prev => ({ ...prev, summary: res.data.resume_data.summary }));
      }
    } catch (e) {
      console.error("Summary generation failed:", e);
    }
  };

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
      const payload = {
        title: `${resumeData.firstName} ${resumeData.lastName}`.trim() || 'My Resume',
        template: selectedTemplate,
        full_name: `${resumeData.firstName} ${resumeData.lastName}`.trim(),
        email: resumeData.email,
        phone: resumeData.phone,
        location: resumeData.location,
        linkedin: resumeData.linkedin,
        github: resumeData.github,
        portfolio: resumeData.portfolio,
        summary: resumeData.summary
      };

      let savedId = resumeId;
      if (savedId) {
        await apiClient.put(`/resumes/${savedId}`, payload);
      } else {
        const res = await apiClient.post('/resumes', payload);
        savedId = res.data?.id;
        if (savedId) setResumeId(savedId);
      }

      window.dispatchEvent(new CustomEvent('careerai:resume-saved'));
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
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Action Bar */}
      <div className="h-14 border-b border-outline-variant bg-surface px-6 flex items-center justify-between shrink-0 z-20 no-print">
        <div className="flex items-center gap-3">
          <Link
            to="/resume"
            className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary font-bold transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Hub
          </Link>
          <div className="h-4 w-px bg-outline-variant" />
          <h2 className="font-headline-sm text-sm text-on-background font-bold truncate max-w-[220px]">
            {`${resumeData.firstName} ${resumeData.lastName}`.trim() || 'Untitled Resume'}
          </h2>
          <span className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-600 border border-pink-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] animate-pulse">auto_awesome</span>
            Google AI Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Generate with Google AI Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg text-xs font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer hover:shadow-md"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span>✨ Generate with Google AI</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSaveResume}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>{isSaving ? 'Saving...' : saveToast ? 'Saved! ✓' : 'Save'}</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={() => exportResumePDF()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
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
              <div
                className="absolute top-4 left-0 right-0 h-[2px] z-0"
                style={{
                  background:
                    'linear-gradient(to right, #EC4899 0%, #EC4899 ' +
                    Math.round((tabsOrder.indexOf(activeTab) / (tabsOrder.length - 1)) * 100) +
                    '%, #e5e7eb ' +
                    Math.round((tabsOrder.indexOf(activeTab) / (tabsOrder.length - 1)) * 100) +
                    '%, #e5e7eb 100%)'
                }}
              />
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
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shadow-sm ${
                        isDone
                          ? 'bg-primary border-primary text-white'
                          : isCurrent
                          ? 'bg-white border-primary text-primary'
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}
                    >
                      {isDone ? (
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      ) : isCurrent ? (
                        <span className="w-3 h-3 rounded-full bg-primary block" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-semibold whitespace-nowrap transition-colors ${
                        isCurrent ? 'text-primary' : isDone ? 'text-primary/70' : 'text-gray-400'
                      }`}
                    >
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
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    Personal Details
                  </h3>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="text-xs text-pink-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    Auto-Fill with AI
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">First Name</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. Jordan"
                      value={resumeData.firstName}
                      onChange={(e) => setResumeData({ ...resumeData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Last Name</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. Taylor"
                      value={resumeData.lastName}
                      onChange={(e) => setResumeData({ ...resumeData, lastName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Professional Title</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. Senior Machine Learning Engineer"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">Email</label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="email"
                      placeholder="e.g. jordan.taylor@example.com"
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
                  <div className="flex justify-between items-center">
                    <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary">subject</span>
                      Professional Summary
                    </h3>
                    <button
                      onClick={handleGenerateSummary}
                      className="text-xs text-pink-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">auto_awesome</span>
                      ✨ AI Draft Summary
                    </button>
                  </div>
                  <textarea
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm resize-none text-xs"
                    rows={4}
                    placeholder="Briefly describe your career background, core competencies, and notable value delivered..."
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
                    <span className="material-symbols-outlined text-primary">work</span>
                    Work Experience
                  </h3>
                  <button
                    onClick={handleAddExperience}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    Add Position
                  </button>
                </div>

                {resumeData.experiences.length === 0 ? (
                  <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto">
                      <span className="material-symbols-outlined text-xl">auto_awesome</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">No experience records added yet.</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        Add manually or let Google AI generate benchmark STAR bullet points for your target role.
                      </p>
                    </div>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={handleAddExperience}
                        className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container"
                      >
                        + Add Manually
                      </button>
                      <button
                        onClick={() => setShowAiModal(true)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-xs font-bold shadow-sm hover:opacity-90"
                      >
                        ✨ Generate with AI
                      </button>
                    </div>
                  </div>
                ) : (
                  resumeData.experiences.map((exp, idx) => (
                    <div
                      key={exp.id || idx}
                      className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded-lg space-y-2 relative"
                    >
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
                          placeholder="Job Title (e.g. Lead Software Engineer)"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none font-bold"
                        />
                        <input
                          type="text"
                          placeholder="Company (e.g. Google DeepMind)"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Location (e.g. San Francisco, CA)"
                          value={exp.location}
                          onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Dates (e.g. 2022 – Present)"
                          value={exp.period}
                          onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                          className="px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none"
                        />
                      </div>

                      {/* Bullet points */}
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                          Achievements (STAR Method Bullets)
                        </label>
                        {(exp.bullets || ['']).map((bullet, bi) => (
                          <div key={bi} className="flex items-start gap-1.5">
                            <span className="text-xs text-primary font-bold mt-1.5">•</span>
                            <textarea
                              rows={2}
                              placeholder="Action Verb + Context + Quantified Impact (e.g. Architected microservices handling 15M+ daily requests, reducing latency by 42%)..."
                              value={bullet}
                              onChange={(e) => {
                                const newBullets = [...(exp.bullets || [''])];
                                newBullets[bi] = e.target.value;
                                handleUpdateExperience(idx, 'bullets', newBullets);
                              }}
                              className="flex-1 px-2.5 py-1.5 text-xs bg-surface border border-outline-variant rounded focus:outline-none resize-none"
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handlePolishBullet(idx, bi)}
                                disabled={polishingId === `${idx}-${bi}` || !bullet}
                                title="Polish with Google AI"
                                className="p-1 text-pink-600 hover:bg-pink-50 rounded border border-pink-200 transition-colors disabled:opacity-40"
                              >
                                <span
                                  className={`material-symbols-outlined text-[13px] ${
                                    polishingId === `${idx}-${bi}` ? 'animate-spin' : ''
                                  }`}
                                >
                                  auto_awesome
                                </span>
                              </button>
                              <button
                                onClick={() => {
                                  const newBullets = (exp.bullets || ['']).filter((_, bidx) => bidx !== bi);
                                  handleUpdateExperience(idx, 'bullets', newBullets.length > 0 ? newBullets : ['']);
                                }}
                                className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                              >
                                <span className="material-symbols-outlined text-[13px]">close</span>
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const newBullets = [...(exp.bullets || ['']), ''];
                            handleUpdateExperience(idx, 'bullets', newBullets);
                          }}
                          className="text-[11px] text-primary font-bold hover:underline flex items-center gap-1 pt-1"
                        >
                          + Add bullet point
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-stack-md">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline-sm text-headline-sm text-on-background flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    Skills & Tech Stack
                  </h3>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="text-xs text-pink-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    Recommend Skills
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Programming Languages & Core Technologies
                    </label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. Python, TypeScript, Go, C++, SQL, Rust"
                      value={resumeData.skills.technical || ''}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, technical: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Frameworks, Libraries & Platforms
                    </label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. React, Next.js, PyTorch, FastAPI, Node.js"
                      value={resumeData.skills.frameworks || ''}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, frameworks: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-sm text-label-sm text-on-surface-variant">
                      Cloud, DevOps & Databases
                    </label>
                    <input
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg focus:outline-none input-focus-ring font-body-md text-on-surface shadow-sm text-xs"
                      type="text"
                      placeholder="e.g. AWS, GCP, Docker, Kubernetes, PostgreSQL, Redis, Kafka"
                      value={resumeData.skills.tools || ''}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, tools: e.target.value }
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
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">add</span>
                    Add Degree
                  </button>
                </div>

                {resumeData.education.length === 0 ? (
                  <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center space-y-2">
                    <p className="text-xs text-on-surface-variant">No education records added yet.</p>
                    <button onClick={handleAddEducation} className="text-xs text-primary font-bold hover:underline">
                      + Add education
                    </button>
                  </div>
                ) : (
                  resumeData.education.map((edu, idx) => (
                    <div
                      key={edu.id || idx}
                      className="p-stack-md bg-surface-container-lowest border border-outline-variant rounded-lg space-y-2 relative"
                    >
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
                          placeholder="Dates (e.g. 2018 – 2022)"
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
              <span className="material-symbols-outlined text-xs">
                {activeTab === 'education' ? 'download' : 'arrow_forward'}
              </span>
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
            <div className="w-px h-4 bg-outline-variant" />
            <span className="text-xs font-label-sm text-primary font-bold">Template #{selectedTemplate}</span>
          </div>

          {/* Document Canvas */}
          <div className="flex-1 overflow-y-auto editor-scroll p-8 md:p-12 flex justify-center items-start pt-16">
            <ResumePreview resumeData={resumeData} templateId={selectedTemplate} scale={zoom} />
          </div>

          {/* Template Selector Thumbnail Strip */}
          <div className="h-20 bg-surface border-t border-outline-variant px-6 flex items-center justify-between shrink-0 z-20 no-print">
            <div className="flex items-center gap-3">
              <span className="font-label-sm text-xs text-on-surface-variant font-bold">
                Active Template: #{selectedTemplate}
              </span>
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

      {/* Google AI Generation Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-[540px] overflow-hidden flex flex-col border border-outline-variant shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/40 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-sm">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-base">Generate Resume with Google AI</h3>
                  <p className="text-xs text-on-surface-variant">Powered by Google Gemini 2.5 Pro</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Select your target career role or type any specialized title. Google Gemini will generate an
                elite, ATS-optimized resume with realistic STAR-method achievements, modern tech stacks, and
                impact-driven bullets.
              </p>

              {/* Preset Role Chips */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Quick Select Roles:
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_AI_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setAiRoleInput(role);
                        handleGenerateWithAI(role);
                      }}
                      disabled={aiGenerating}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold border border-outline-variant/60 bg-surface-container-low hover:bg-pink-50 hover:border-pink-300 hover:text-pink-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Role Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Or Enter Custom Target Role:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Lead Distributed Systems Engineer..."
                    value={aiRoleInput}
                    onChange={(e) => setAiRoleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateWithAI()}
                    className="flex-1 px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    onClick={() => handleGenerateWithAI()}
                    disabled={aiGenerating}
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {aiGenerating ? (
                      <>
                        <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xs">auto_awesome</span>
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {aiError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-outline-variant/40 bg-surface-container-low flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
