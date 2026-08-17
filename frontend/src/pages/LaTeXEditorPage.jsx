import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import apiClient from '../api/client';

// ── Default LaTeX templates ───────────────────────────────────────────────────
const LATEX_TEMPLATES = {
  "Standard Resume": `% Standard Resume Template
\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\begin{document}
\\begin{center}
  {\\LARGE \\textbf{Your Name}} \\\\[4pt]
  \\small email@example.com $\\mid$ +1 555-000-0000 $\\mid$ City, Country
\\end{center}
\\section*{Professional Summary}
Driven professional with expertise in your field.
\\section*{Experience}
\\textbf{Company Name} \\hfill Job Title (2020 -- Present) \\\\
\\begin{itemize}[noitemsep,topsep=2pt]
  \\item Accomplishment or key responsibility.
\\end{itemize}
\\section*{Education}
\\textbf{Degree Name} \\hfill University Name (2016 -- 2020)
\\section*{Skills}
Skill 1, Skill 2, Skill 3
\\end{document}`,

  "Academic CV": `% Academic CV Template
\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\begin{document}
\\begin{center}
  {\\LARGE \\textbf{Dr. First Last}} \\\\[4pt]
  Department $\\mid$ Institution
\\end{center}
\\section*{Education}
\\textbf{Ph.D. Subject} \\hfill University Name (Year)
\\section*{Publications}
Last, F. \\textit{Title of Publication.} Journal Name, Year.
\\end{document}`
};

const DEFAULT_TEX = `% CareerAI LaTeX Editor — Overleaf-Style
\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Your Name}} \\\\[4pt]
  \\small email@example.com $\\mid$ +1 (555) 000-0000 $\\mid$ City, Country
\\end{center}

\\section*{Professional Summary}
Add your career objective or professional summary here.

\\section*{Professional Experience}
\\textbf{Company Name} \\hfill (Dates) \\\\
Role Title \\\\
\\begin{itemize}[noitemsep,topsep=2pt]
  \\item Key achievement or responsibility.
\\end{itemize}

\\section*{Technical Skills}
\\textbf{Languages:} Python, JavaScript, SQL \\\\
\\textbf{Frameworks & Tools:} React, FastAPI, Git, Docker

\\end{document}`;

export default function LaTeXEditorPage() {
  const navigate = useNavigate();

  // Project / Files State
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState('Untitled Resume');
  const [files, setFiles] = useState({ 'cv.tex': DEFAULT_TEX });
  const [activeFile, setActiveFile] = useState('cv.tex');

  // Compilation States
  const [compileStatus, setCompileStatus] = useState('ready'); // 'ready'|'compiling'|'success'|'failed'
  const [logs, setLogs] = useState('');
  const [errors, setErrors] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [autoCompile, setAutoCompile] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // File explorer states
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showTemplatesMenu, setShowTemplatesMenu] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [latexTemplatesList, setLatexTemplatesList] = useState([]);

  // AI Assistant States
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: "Hi! I'm your LaTeX Assistant. Try: 'Add a projects section', 'Make margins 0.5 inches', or 'Fix errors'." }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [proposedCodeFix, setProposedCodeFix] = useState(null);

  const autoCompileTimerRef = useRef(null);
  const templatesMenuRef = useRef(null);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchLatexTemplates();
    const params = new URLSearchParams(window.location.search);
    const tplId = params.get('template');
    if (tplId) {
      handleLoadTemplate(tplId);
      // Clean up URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      handleCompile();
      fetchProjects();
    }
  }, []);

  // ── Fetch LaTeX Templates ──────────────────────────────────────────────────
  const fetchLatexTemplates = async () => {
    try {
      const res = await apiClient.get('/latex/templates');
      setLatexTemplatesList(res.data || []);
    } catch (e) {
      console.error('Failed to fetch LaTeX templates:', e);
    }
  };

  // Close templates dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (templatesMenuRef.current && !templatesMenuRef.current.contains(e.target)) {
        setShowTemplatesMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Editor change + auto compile ─────────────────────────────────────────
  const handleEditorChange = (value) => {
    setFiles(prev => ({ ...prev, [activeFile]: value }));
    if (autoCompile) {
      if (autoCompileTimerRef.current) clearTimeout(autoCompileTimerRef.current);
      autoCompileTimerRef.current = setTimeout(() => handleCompile(), 2000);
    }
  };

  // ── Compile ───────────────────────────────────────────────────────────────
  const handleCompile = async () => {
    setCompileStatus('compiling');
    try {
      const res = await apiClient.post('/latex/compile', {
        files,
        compiler: 'pdflatex'
      });
      const data = res.data;
      setLogs(data.logs || '');
      setErrors(data.errors || []);

      if (data.success && data.pdf) {
        setCompileStatus('success');
        const bytes = atob(data.pdf);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: 'application/pdf' });
        setPdfUrl(URL.createObjectURL(blob));
      } else {
        setCompileStatus('failed');
        setShowLogs(true);
      }
    } catch (e) {
      console.error(e);
      setCompileStatus('failed');
    }
  };

  // ── Download PDF ──────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${projectName.replace(/\s+/g, '_')}.pdf`;
    a.click();
  };

  // ── Download ZIP ──────────────────────────────────────────────────────────
  const handleDownloadProject = async () => {
    try {
      const res = await apiClient.post('/latex/download', { files }, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '_')}_source.zip`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Save Project ──────────────────────────────────────────────────────────
  const handleSaveProject = async () => {
    try {
      if (projectId) {
        await apiClient.put(`/latex/projects/${projectId}`, { files });
      } else {
        const res = await apiClient.post('/latex/projects', {
          name: projectName,
          initial_latex: files['cv.tex']
        });
        setProjectId(res.data.project_id);
      }
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  // ── Fetch Projects ────────────────────────────────────────────────────────
  const fetchProjects = async () => {
    try {
      const res = await apiClient.get('/latex/projects');
      setProjectList(res.data?.projects || []);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Load Project ──────────────────────────────────────────────────────────
  const handleLoadProject = async (id) => {
    try {
      const res = await apiClient.get(`/latex/projects/${id}`);
      const data = res.data;
      setProjectId(data.project.id);
      setProjectName(data.project.name);
      setFiles(data.files);
      const firstFile = Object.keys(data.files)[0] || 'cv.tex';
      setActiveFile(firstFile);
      setShowProjectsModal(false);
      setTimeout(() => handleCompile(), 100);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Load Template ─────────────────────────────────────────────────────────
  const handleLoadTemplate = async (templateId) => {
    try {
      setCompileStatus('compiling');
      let loadedFiles = null;

      // Check if user has active resume data to render from backend
      try {
        const resumeListRes = await apiClient.get('/resumes');
        if (Array.isArray(resumeListRes.data) && resumeListRes.data.length > 0) {
          const fullResume = await apiClient.get(`/resumes/${resumeListRes.data[0].id}`);
          if (fullResume.data) {
            const renderRes = await apiClient.post(`/latex/templates/${templateId}/render`, {
              resume_data: fullResume.data
            });
            if (renderRes.data && renderRes.data.files) {
              loadedFiles = renderRes.data.files;
            }
          }
        }
      } catch (err) {
        console.warn('Render with user data failed, falling back to master files:', err);
      }

      if (!loadedFiles) {
        const res = await apiClient.get(`/latex/templates/${templateId}`);
        if (res.data && res.data.files) {
          loadedFiles = res.data.files;
        }
      }

      if (loadedFiles) {
        setFiles(loadedFiles);
        const firstFile = Object.keys(loadedFiles).includes('cv.tex') ? 'cv.tex' : Object.keys(loadedFiles)[0];
        setActiveFile(firstFile);
        setShowTemplatesMenu(false);
        setTimeout(() => handleCompile(), 100);
      }
    } catch (e) {
      console.error('Failed to load template:', e);
      alert('Failed to load template files.');
      setCompileStatus('ready');
    }
  };

  // ── Generate from Builder ─────────────────────────────────────────────────
  const handleGenerateFromManual = async () => {
    try {
      const listRes = await apiClient.get('/resumes');
      if (!Array.isArray(listRes.data) || listRes.data.length === 0) {
        alert('No resume found. Create a resume in Resume Editor first.');
        return;
      }
      const fullRes = await apiClient.get(`/resumes/${listRes.data[0].id}`);
      const res = await apiClient.post('/latex/generate', { resume_data: fullRes.data });
      if (res.data?.success && res.data?.latex_code) {
        setFiles(prev => ({ ...prev, 'cv.tex': res.data.latex_code }));
        setActiveFile('cv.tex');
        setTimeout(() => handleCompile(), 100);
      }
    } catch (e) {
      console.error(e);
      alert('Could not generate LaTeX from resume.');
    }
  };

  // ── Import to Builder ─────────────────────────────────────────────────────
  const handleImportToBuilder = async () => {
    if (!window.confirm('This will parse your LaTeX and create a new resume in the builder. Proceed?')) return;
    try {
      const res = await apiClient.post('/latex/import', { latex_code: files['cv.tex'] });
      if (res.data?.success && res.data?.resume_data) {
        const rData = res.data.resume_data;
        const p = rData.personal || {};
        const title = p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Imported Resume';
        const createRes = await apiClient.post('/resumes', {
          title,
          full_name: title,
          email: p.email || '',
          phone: p.phone || '',
          location: p.location || '',
          linkedin: p.linkedin || '',
          github: p.github || '',
          summary: rData.summary || ''
        });
        window.dispatchEvent(new CustomEvent('careerai:resume-saved'));
        navigate(createRes.data?.id ? `/resume/builder?id=${createRes.data.id}` : '/resume/builder');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to import LaTeX into resume builder.');
    }
  };

  // ── AI Assistant ──────────────────────────────────────────────────────────
  const handleSendMessage = async () => {
    if (!aiMessage.trim() || isAiLoading) return;
    const userWording = aiMessage;
    setChatHistory(prev => [...prev, { role: 'user', content: userWording }]);
    setAiMessage('');
    setIsAiLoading(true);
    try {
      const res = await apiClient.post('/latex/ai/edit', {
        latex_code: files[activeFile],
        instruction: userWording
      });
      if (res.data?.success && res.data?.latex_code) {
        setFiles(prev => ({ ...prev, [activeFile]: res.data.latex_code }));
        setChatHistory(prev => [...prev, { role: 'assistant', content: `Applied: "${userWording}"` }]);
        setTimeout(() => handleCompile(), 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAIFixErrors = async () => {
    if (errors.length === 0) return;
    setIsAiLoading(true);
    setShowAIPanel(true);
    const firstErr = errors[0];
    try {
      const res = await apiClient.post('/latex/ai/fix', {
        latex_code: files['cv.tex'],
        error_message: firstErr.message,
        line_number: firstErr.line
      });
      if (res.data?.success && res.data?.fixed_code) {
        setFiles(prev => ({ ...prev, 'cv.tex': res.data.fixed_code }));
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: `Fixed error: ${res.data.explanation || firstErr.message}`
        }]);
        setTimeout(() => handleCompile(), 100);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyFix = () => {
    if (!proposedCodeFix) return;
    setFiles(prev => ({ ...prev, 'cv.tex': proposedCodeFix }));
    setProposedCodeFix(null);
    setTimeout(() => handleCompile(), 100);
  };

  // ── File CRUD ─────────────────────────────────────────────────────────────
  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    setFiles(prev => ({ ...prev, [newFileName.trim()]: `% ${newFileName.trim()}\n` }));
    setActiveFile(newFileName.trim());
    setNewFileName('');
    setShowNewFileModal(false);
  };

  const handleDeleteFile = (name) => {
    if (name === 'cv.tex') { alert('Cannot delete primary cv.tex file.'); return; }
    if (window.confirm(`Delete ${name}?`)) {
      const updated = { ...files };
      delete updated[name];
      setFiles(updated);
      setActiveFile('cv.tex');
    }
  };

  // ── Status indicator ──────────────────────────────────────────────────────
  const statusColor = {
    ready: 'bg-slate-400',
    compiling: 'bg-amber-400 animate-pulse',
    success: 'bg-emerald-500',
    failed: 'bg-red-500',
  }[compileStatus] || 'bg-slate-400';

  const statusLabel = {
    ready: 'Ready',
    compiling: 'Compiling…',
    success: 'Success',
    failed: 'Errors',
  }[compileStatus] || 'Ready';

  return (
    <div className="flex flex-col w-full h-screen overflow-hidden bg-[#1e1e1e]">

      {/* ── Top Toolbar (Overleaf-style) ───────────────────────────────── */}
      <div className="bg-[#1a1a2e] border-b border-slate-700/80 px-4 py-2 flex items-center justify-between gap-3 shrink-0 z-10">

        {/* Left: project name + file actions */}
        <div className="flex items-center gap-3 min-w-0">
          {/* CareerAI brand logo area */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#EC4899] to-[#FF8A3D] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">description</span>
            </div>
          </div>

          <div className="w-px h-5 bg-slate-600/60 shrink-0"></div>

          {/* Project name editable */}
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent text-slate-200 text-sm font-semibold focus:outline-none min-w-0 max-w-[180px] truncate border-b border-transparent focus:border-slate-500 py-0.5"
          />
        </div>

        {/* Center: toolbar buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">

          {/* Templates dropdown */}
          <div className="relative" ref={templatesMenuRef}>
            <button
              onClick={() => setShowTemplatesMenu(v => !v)}
              className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-300 hover:bg-slate-700 border border-slate-600/50 cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">style</span>
              Templates
              <span className="material-symbols-outlined text-[10px]">expand_more</span>
            </button>
            {showTemplatesMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-[#252535] border border-slate-600/60 rounded-lg shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                {latexTemplatesList.map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={() => handleLoadTemplate(tpl.id)}
                    className="w-full text-left px-3 py-2 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white cursor-pointer border-b border-slate-700/40 last:border-0"
                    title={tpl.description}
                  >
                    <div className="font-semibold">{tpl.name}</div>
                    <div className="text-[9px] text-slate-400 truncate">{tpl.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowProjectsModal(true)}
            className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-300 hover:bg-slate-700 border border-slate-600/50 cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">folder_open</span>
            Open
          </button>

          <button
            onClick={handleSaveProject}
            className="px-2.5 py-1 rounded text-[11px] font-semibold text-slate-300 hover:bg-slate-700 border border-slate-600/50 cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">save</span>
            Save
          </button>

          <button
            onClick={handleGenerateFromManual}
            className="px-2.5 py-1 rounded text-[11px] font-semibold text-[#EC4899] hover:bg-[#EC4899]/10 border border-[#EC4899]/30 cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">sync</span>
            Sync Builder
          </button>

          <button
            onClick={handleImportToBuilder}
            className="px-2.5 py-1 rounded text-[11px] font-semibold text-[#FF8A3D] hover:bg-[#FF8A3D]/10 border border-[#FF8A3D]/30 cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">upload</span>
            To Builder
          </button>
        </div>

        {/* Right: compile button + download */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Auto-compile toggle */}
          <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoCompile}
              onChange={(e) => setAutoCompile(e.target.checked)}
              className="cursor-pointer accent-[#EC4899]"
            />
            Auto
          </label>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            disabled={!pdfUrl}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 cursor-pointer"
            title="Download PDF"
          >
            <span className="material-symbols-outlined text-sm">download</span>
          </button>

          {/* AI Toggle */}
          <button
            onClick={() => setShowAIPanel(v => !v)}
            className={`p-1.5 rounded cursor-pointer transition-colors ${showAIPanel ? 'bg-[#EC4899]/20 text-[#EC4899]' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
            title="AI LaTeX Assistant"
          >
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
          </button>

          {/* Recompile — main CTA */}
          <button
            onClick={handleCompile}
            disabled={compileStatus === 'compiling'}
            className="px-4 py-1.5 rounded-lg text-white text-[11px] font-bold shadow-lg hover:opacity-90 disabled:opacity-60 cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] transition-opacity"
          >
            {compileStatus === 'compiling' ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Compiling…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Recompile
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Editor Area ──────────────────────────────────────────────── */}
      <div className="flex-grow flex overflow-hidden">

        {/* File Explorer (Left sidebar — narrow) */}
        <aside className="w-44 bg-[#252535] border-r border-slate-700/60 flex flex-col shrink-0 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700/50 flex justify-between items-center bg-[#1e1e2e]">
            <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Files</span>
            <button
              onClick={() => setShowNewFileModal(true)}
              className="w-4 h-4 rounded hover:bg-slate-600 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-xs">add</span>
            </button>
          </div>
          <ul className="p-2 space-y-0.5 overflow-y-auto flex-grow text-xs">
            {Object.keys(files).map(name => (
              <li
                key={name}
                onClick={() => setActiveFile(name)}
                className={`flex justify-between items-center px-2 py-1.5 rounded cursor-pointer group ${
                  activeFile === name
                    ? 'bg-[#EC4899]/20 text-[#EC4899] font-semibold'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="truncate flex items-center gap-1.5 min-w-0">
                  <span className="material-symbols-outlined text-[11px] shrink-0">description</span>
                  <span className="truncate">{name}</span>
                </span>
                {name !== 'cv.tex' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFile(name); }}
                    className="text-slate-600 hover:text-red-400 p-0.5 rounded opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[10px]">close</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Code Editor (Center) */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* File tab bar */}
          <div className="bg-[#1e1e2e] border-b border-slate-700/50 flex items-center px-2 shrink-0">
            {Object.keys(files).map(name => (
              <button
                key={name}
                onClick={() => setActiveFile(name)}
                className={`px-4 py-2 text-[11px] font-medium border-b-2 transition-colors cursor-pointer shrink-0 ${
                  activeFile === name
                    ? 'border-[#EC4899] text-[#EC4899] bg-[#1a1a2e]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {name}
              </button>
            ))}
            {/* Status indicator in tab bar */}
            <div className="ml-auto flex items-center gap-2 px-3">
              <span className={`w-2 h-2 rounded-full ${statusColor}`}></span>
              <span className="text-[10px] text-slate-400 font-medium">{statusLabel}</span>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-grow overflow-hidden">
            <Editor
              height="100%"
              language="latex"
              theme="vs-dark"
              value={files[activeFile]}
              onChange={handleEditorChange}
              options={{
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                minimap: { enabled: false },
                wordWrap: 'on',
                lineNumbers: 'on',
                bracketPairColorization: { enabled: true },
                autoClosingBrackets: 'always',
                scrollBeyondLastLine: false,
                renderLineHighlight: 'gutter',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
              }}
            />
          </div>

          {/* Compilation Logs Drawer */}
          <div className={`bg-[#0d1117] border-t border-slate-700/50 transition-all flex flex-col shrink-0 ${showLogs ? 'h-36' : 'h-7'}`}>
            <div
              onClick={() => setShowLogs(v => !v)}
              className="bg-[#161b22] px-4 h-7 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 cursor-pointer hover:bg-slate-800 flex-shrink-0"
            >
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${errors.length > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                Compilation Logs
                {errors.length > 0 && <span className="text-red-400">({errors.length} error{errors.length > 1 ? 's' : ''})</span>}
              </span>
              <span className="material-symbols-outlined text-xs">{showLogs ? 'expand_more' : 'expand_less'}</span>
            </div>
            {showLogs && (
              <div className="flex-grow p-3 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1.5 select-text">
                {errors.length > 0 ? (
                  errors.map((err, idx) => (
                    <div key={idx} className="text-red-400 border-l-2 border-red-500/60 pl-2 flex items-start gap-2">
                      <span>
                        <span className="font-bold">Line {err.line}: </span>{err.message}
                      </span>
                      <button
                        onClick={handleAIFixErrors}
                        className="ml-auto shrink-0 bg-red-900/50 hover:bg-red-900 border border-red-500/50 text-red-300 px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer"
                      >
                        Fix with AI
                      </button>
                    </div>
                  ))
                ) : (
                  <pre className="whitespace-pre-wrap text-emerald-400">{logs || '✓ No errors found.'}</pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* PDF Preview (Right) */}
        <section className="w-[46%] border-l border-slate-700/60 bg-[#2d2d2d] flex flex-col overflow-hidden shrink-0">
          {/* Preview toolbar */}
          <div className="bg-[#1e1e2e] border-b border-slate-700/50 px-3 py-2 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">picture_as_pdf</span>
              PDF Preview
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(z => Math.max(z - 10, 50))}
                className="w-6 h-6 rounded hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-sm">remove</span>
              </button>
              <span className="text-[10px] font-bold text-slate-400 w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(z + 10, 175))}
                className="w-6 h-6 rounded hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
              <button
                onClick={() => setZoom(100)}
                className="text-[9px] text-slate-500 hover:text-slate-300 px-1 cursor-pointer"
                title="Reset Zoom"
              >
                Reset
              </button>
              <div className="w-px h-4 bg-slate-700/60 mx-1"></div>
              <button
                onClick={handleDownloadPDF}
                disabled={!pdfUrl}
                className="w-6 h-6 rounded hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                title="Download PDF"
              >
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
              <button
                onClick={handleDownloadProject}
                className="w-6 h-6 rounded hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                title="Download ZIP"
              >
                <span className="material-symbols-outlined text-sm">archive</span>
              </button>
            </div>
          </div>

          {/* PDF Frame */}
          <div className="flex-grow overflow-auto bg-[#3a3a3a] flex items-start justify-center p-4">
            {pdfUrl ? (
              <div
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  width: '100%',
                  height: `${100 * (100 / zoom)}%`,
                  minHeight: '800px',
                }}
              >
                <iframe
                  src={pdfUrl ? `${pdfUrl}#navpanes=0` : ''}
                  className="w-full h-full border-none shadow-2xl rounded"
                  title="LaTeX PDF Preview"
                />
              </div>
            ) : (
              <div className="m-auto text-center space-y-3 py-20">
                {compileStatus === 'compiling' ? (
                  <>
                    <span className="w-10 h-10 border-3 border-[#EC4899] border-t-transparent rounded-full animate-spin block mx-auto"></span>
                    <p className="text-xs text-slate-400">Compiling your resume…</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-slate-500">picture_as_pdf</span>
                    <p className="text-xs text-slate-400">
                      {compileStatus === 'failed'
                        ? 'Compilation failed. Check errors in the log panel.'
                        : 'Click Recompile to generate your PDF preview.'}
                    </p>
                    {compileStatus === 'failed' && (
                      <button
                        onClick={() => setShowLogs(true)}
                        className="text-[11px] text-red-400 border border-red-500/30 px-3 py-1 rounded hover:bg-red-900/20 cursor-pointer"
                      >
                        View Errors
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* AI Assistant Drawer */}
        {showAIPanel && (
          <aside className="w-72 border-l border-slate-700/60 bg-[#1a1a2e] flex flex-col shrink-0 animate-fade-in-left">
            <div className="p-3 border-b border-slate-700/50 flex justify-between items-center bg-[#252535]">
              <span className="font-bold text-[11px] flex items-center gap-1.5 text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]">
                <span className="material-symbols-outlined text-sm font-bold" style={{ color: '#EC4899' }}>auto_awesome</span>
                AI LaTeX Assistant
              </span>
              <button
                onClick={() => { setShowAIPanel(false); setProposedCodeFix(null); }}
                className="w-6 h-6 rounded hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <div className="flex-grow p-3 overflow-y-auto space-y-3 text-xs">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-xl p-3 text-[11px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white rounded-tr-none'
                      : 'bg-[#252535] border border-slate-700/40 text-slate-300 rounded-tl-none'
                  }`}>
                    <p>{msg.content}</p>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[88%] rounded-xl p-3 bg-[#252535] border border-slate-700/40 rounded-tl-none flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#EC4899] rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-[#EC4899] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#EC4899] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {proposedCodeFix && (
              <div className="p-3 border-t border-slate-700/40 bg-amber-900/20 flex flex-col gap-2 shrink-0">
                <p className="text-[10px] text-amber-400 font-semibold">AI has a fix ready. Apply it?</p>
                <div className="flex gap-2">
                  <button onClick={() => setProposedCodeFix(null)} className="flex-1 border border-slate-600 py-1 text-[9px] font-bold rounded hover:bg-slate-700 text-slate-300 cursor-pointer">Discard</button>
                  <button onClick={handleApplyFix} className="flex-1 bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white py-1 text-[9px] font-bold rounded hover:opacity-90 cursor-pointer">Apply Fix</button>
                </div>
              </div>
            )}

            <div className="p-3 border-t border-slate-700/40 flex gap-1.5 bg-[#252535] shrink-0">
              <input
                type="text"
                placeholder="Ask assistant to edit LaTeX…"
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-[#1a1a2e] border border-slate-600/50 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-[#EC4899]/50 placeholder-slate-600"
              />
              <button
                onClick={handleSendMessage}
                disabled={isAiLoading}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-50 shrink-0 cursor-pointer bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]"
              >
                <span className="material-symbols-outlined text-sm text-white">send</span>
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ── MODAL: New File ─────────────────────────────────────────────── */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-[#1e1e2e] rounded-2xl w-full max-w-sm p-6 border border-slate-600/50 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-200 text-sm">Add Project File</h3>
            <input
              type="text"
              placeholder="e.g. references.bib"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full bg-[#252535] border border-slate-600/50 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#EC4899]/60"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setNewFileName(''); setShowNewFileModal(false); }}
                className="px-3 py-1.5 border border-slate-600 rounded-lg text-xs text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Load Projects ─────────────────────────────────────────── */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-[#1e1e2e] rounded-2xl w-full max-w-md p-6 border border-slate-600/50 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-200 text-sm">Open LaTeX Project</h3>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="w-6 h-6 rounded hover:bg-slate-700 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {projectList.length > 0 ? (
                projectList.map(proj => (
                  <div
                    key={proj.id}
                    className="p-3 bg-[#252535] border border-slate-600/30 rounded-lg flex justify-between items-center hover:border-[#EC4899]/30 cursor-pointer transition-colors"
                    onClick={() => handleLoadProject(proj.id)}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">{proj.name}</p>
                      <p className="text-[9px] text-slate-500">Updated: {new Date(proj.updated_at).toLocaleString()}</p>
                    </div>
                    <span className="material-symbols-outlined text-[#EC4899] text-sm">arrow_forward</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No saved projects yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
