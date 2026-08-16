import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';

export default function ResumeHubPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    completion: 0,
    atsScore: 0,
    templateName: 'Modern',
    sectionsCount: 0
  });

  useEffect(() => {
    // Read stats from localStorage to show dynamic completion indicator
    const savedData = localStorage.getItem('careerai_resume_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        let filledCount = 0;
        let totalCount = 7; // personal, summary, education, experience, projects, skills, certifications

        if (data.fullName) filledCount++;
        if (data.summary) filledCount++;
        if (data.education && data.education.length > 0) filledCount++;
        if (data.experience && data.experience.length > 0) filledCount++;
        if (data.projects && data.projects.length > 0) filledCount++;
        if (data.skills && data.skills.length > 0) filledCount++;
        if (data.certifications && data.certifications.length > 0) filledCount++;

        const completionPct = Math.round((filledCount / totalCount) * 100);

        setStats({
          completion: completionPct,
          atsScore: data.summary ? 82 : 45, // Dynamic placeholder
          templateName: localStorage.getItem('careerai_template_id') || 'Modern',
          sectionsCount: filledCount
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1100px] mx-auto w-full flex flex-col gap-8 pb-20 md:pb-8">


      {/* Hero Section */}
      <div className="bg-surface rounded-2xl border border-outline-variant/40 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10 orb-pulse"></div>

        <div className="space-y-4 max-w-xl">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Upgrade V2.0 Active
          </span>
          <h2 className="font-headline-lg text-headline-lg font-extrabold text-on-surface leading-tight">
            Craft Your Perfect Resume.
          </h2>
          <p className="font-body-md text-on-surface-variant leading-relaxed">
            Choose to edit manually with our step-by-step editor, invoke the AI Studio to analyze and optimize against real job descriptions, or select from our library of stunning ATS-friendly templates.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/resume/builder"
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 text-white px-5 py-2.5 rounded-lg font-label-md text-sm font-bold shadow-md hover:opacity-95 transition-opacity"
            >
              Go to Builder
            </Link>
            <Link
              to="/resume/ai-studio"
              className="bg-gradient-to-r from-rose-500 to-amber-500 text-white px-5 py-2.5 rounded-lg font-label-md text-sm font-bold shadow-md hover:opacity-95 transition-opacity"
            >
              Launch AI Studio
            </Link>
          </div>
        </div>

        {/* Quick Scorecard Info */}
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 w-full md:w-80 shadow-inner flex flex-col gap-4">
          <h3 className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Current Resume Status
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-lg p-3 border border-outline-variant/15 text-center">
              <span className="text-2xl font-bold text-primary">{stats.completion}%</span>
              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">Completion</p>
            </div>
            <div className="bg-surface rounded-lg p-3 border border-outline-variant/15 text-center">
              <span className="text-2xl font-bold text-secondary">{stats.atsScore}</span>
              <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">ATS Score</p>
            </div>
          </div>

          <div className="border-t border-outline-variant/20 pt-3 text-[11px] text-on-surface-variant flex justify-between">
            <span>Active Template: <strong>{stats.templateName}</strong></span>
            <span>Sections Filled: <strong>{stats.sectionsCount}/7</strong></span>
          </div>
        </div>
      </div>

      {/* Three Workflows Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Card 1: Manual Builder */}
        <div className="bg-surface rounded-xl p-6 border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl icon-filled">edit_note</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Manual Builder</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Enter your details step-by-step using our structured forms. Ideal for adding fine-grained bullet points, custom certificates, and manual refinements.
            </p>
          </div>
          <Link
            to="/resume/builder"
            className="w-full mt-6 bg-surface-container-high hover:bg-surface-container text-on-surface text-center py-2.5 rounded-lg font-label-md text-xs font-bold transition-colors"
          >
            Open Manual Editor
          </Link>
        </div>

        {/* Card 2: AI Studio */}
        <div className="bg-surface rounded-xl p-6 border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl icon-filled font-bold">auto_awesome</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">AI Resume Studio</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Upload an old resume or paste raw work history. AI extracts, formats, scores, and optimizes details against real job description keywords in real-time.
            </p>
          </div>
          <Link
            to="/resume/ai-studio"
            className="w-full mt-6 bg-secondary text-white text-center py-2.5 rounded-lg font-label-md text-xs font-bold transition-colors hover:opacity-95"
          >
            Launch AI Studio
          </Link>
        </div>

        {/* Card 3: Templates */}
        <div className="bg-surface rounded-xl p-6 border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-tertiary-container/15 flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl icon-filled">dashboard</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Browse Templates</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Browse 20+ professional layouts designed for technology, business, academic, and creative fields. Supports instant previewing with your live data.
            </p>
          </div>
          <Link
            to="/resume/templates"
            className="w-full mt-6 bg-surface-container-high hover:bg-surface-container text-on-surface text-center py-2.5 rounded-lg font-label-md text-xs font-bold transition-colors"
          >
            View 20+ Designs
          </Link>
        </div>

        {/* Card 4: LaTeX Editor */}
        <div className="bg-surface rounded-xl p-6 border border-outline-variant/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-2xl icon-filled">code</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">LaTeX Editor</h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Build your resume utilizing source-code based LaTeX compiles. Overleaf-style split layout, templates, logs, and Gemini debugging fixes.
            </p>
          </div>
          <Link
            to="/resume/latex-editor"
            className="w-full mt-6 bg-surface-container-high hover:bg-surface-container text-on-surface text-center py-2.5 rounded-lg font-label-md text-xs font-bold transition-colors"
          >
            Open LaTeX Editor
          </Link>
        </div>

      </div>
    </div>
  );
}
