import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Editor from '@monaco-editor/react';

// Default templates configuration
const LATEX_TEMPLATES = {
  "ATS Resume": `% ATS Resume Template
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\begin{document}
\\begin{center}
{\\LARGE \\textbf{Jane Doe}} \\\\
Email: jane@example.com | Phone: +1 555-123-4567 | San Francisco, CA
\\end{center}
\\section*{Summary}
Results-oriented software developer with 5+ years of experience building scalable backend APIs.
\\section*{Experience}
\\textbf{TechCorp Solutions} \\hfill Lead Engineer (2021 - Present) \\\\
- Architected data pipeline services that processed 2M+ active client records. \\\\
- Optimized query speeds by 30% utilizing database caching tools.
\\end{document}`,
  
  "Software Engineer": `% Software Engineer Resume
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.8in]{geometry}
\\begin{document}
\\begin{center}
{\\LARGE \\textbf{Yamuna}} \\\\
Chennai, India | github.com/yamuna-97 | yamuna.dev
\\end{center}
\\section*{Technical Skills}
\\textbf{Languages:} Python, SQL, C++, JavaScript \\\\
\\textbf{Frameworks:} React, FastAPI, TensorFlow, PyTorch
\\section*{Projects}
\\textbf{CareerAI Platform} \\hfill \\textit{React, FastAPI, Supabase} \\\\
- Built mock interview simulator and Overleaf-style LaTeX code editor.
\\end{document}`,

  "Academic CV": `% Academic CV Template
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\begin{document}
\\begin{center}
{\\LARGE \\textbf{Dr. Alex Smith}} \\\\
Department of Computer Science | University of Science
\\end{center}
\\section*{Education}
\\textbf{Ph.D. in Computer Science} \\hfill University of Science (2018 - 2022)
\\section*{Publications}
- Smith, A. \\textit{Advanced Neural Architectures.} Journal of AI Research, 2023.
\\end{document}`
};

export default function LaTeXEditorPage() {
  const navigate = useNavigate();

  // Project/Files State
  const [projectId, setProjectId] = useState(null);
  const [projectName, setProjectName] = useState("New LaTeX Resume");
  const [files, setFiles] = useState({
    "cv.tex": `% CareerAI LaTeX Editor
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{Jane Doe}} \\\\
jane.doe@example.com | +1 (555) 123-4567 | San Francisco, CA
\\end{center}

\\section*{Professional Summary}
Senior Product Designer with 6+ years of experience transforming complex problems into intuitive SaaS dashboards.

\\section*{Professional Experience}
\\textbf{TechCorp Solutions} \\hfill Lead Designer (2021 - Present) \\\\
- Spearheaded the redesign of core analytics dashboard, boosting user engagement by 25\\%. \\\\
- Maintained a comprehensive design system utilized by 50+ engineers.

\\section*{Technical Skills}
\\textbf{Design:} UI/UX, Wireframing, Figma, Design Systems \\\\
\\textbf{Research:} Usability Testing, Personas, A/B Testing

\\end{document}`
  });
  const [activeFile, setActiveFile] = useState("cv.tex");
  
  // Compilation States
  const [compileStatus, setCompileStatus] = useState("Ready"); // 'Ready' | 'Compiling' | 'Success' | 'Failed'
  const [logs, setLogs] = useState("");
  const [errors, setErrors] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [autoCompile, setAutoCompile] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  // File explorer states
  const [newFileName, setNewFileName] = useState("");
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [projectList, setProjectList] = useState([]);

  // AI Assistant States
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hi! I am your LaTeX Assistant. I can generate templates, tailor formatting, or fix compilation errors. Try asking: 'Add a projects section' or 'Make margins 0.5 inches'." }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [proposedCodeFix, setProposedCodeFix] = useState(null);

  const autoCompileTimerRef = useRef(null);

  // Load initial templates / compile on startup
  useEffect(() => {
    handleCompile();
    fetchProjects();
  }, []);

  // Auto Compile Debounce logic
  const handleEditorChange = (value) => {
    setFiles(prev => ({
      ...prev,
      [activeFile]: value
    }));

    if (autoCompile) {
      if (autoCompileTimerRef.current) clearTimeout(autoCompileTimerRef.current);
      autoCompileTimerRef.current = setTimeout(() => {
        handleCompile();
      }, 2000);
    }
  };

  // Compile API Call
  const handleCompile = async () => {
    setCompileStatus("Compiling");
    try {
      const res = await fetch("http://localhost:8000/api/v1/latex/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files,
          compiler: "pdflatex"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || "");
        setErrors(data.errors || []);
        
        if (data.success && data.pdf) {
          setCompileStatus("Success");
          // Convert Base64 string to Blob URL for the iframe preview
          const byteCharacters = atob(data.pdf);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          setCompileStatus("Failed");
          setShowLogs(true);
        }
      } else {
        setCompileStatus("Failed");
      }
    } catch (e) {
      console.error(e);
      setCompileStatus("Failed");
    }
  };

  // Download PDF file
  const handleDownloadPDF = () => {
    if (!pdfUrl) return;
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${projectName.replace(/\s+/g, "_").toLowerCase()}_resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download LaTeX ZIP project
  const handleDownloadProject = () => {
    // Generate simple text summary zip contents
    const projectWording = Object.entries(files).map(([name, code]) => `=== FILE: ${name} ===\n${code}`).join("\n\n");
    const blob = new Blob([projectWording], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName.replace(/\s+/g, "_").toLowerCase()}_latex.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Project to Database
  const handleSaveProject = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (projectId) {
        // Update existing project files
        await fetch(`http://localhost:8000/api/v1/latex/projects/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ files })
        });
      } else {
        // Create new project
        const res = await fetch("http://localhost:8000/api/v1/latex/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            name: projectName,
            initial_latex: files["cv.tex"]
          })
        });
        if (res.ok) {
          const data = await res.json();
          setProjectId(data.project_id);
        }
      }
      
      // Notify save status locally
      alert("Project saved successfully!");
      fetchProjects();
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Saved Projects List
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8000/api/v1/latex/projects", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjectList(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load a Saved Project
  const handleLoadProject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/v1/latex/projects/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjectId(data.project.id);
        setProjectName(data.project.name);
        setFiles(data.files);
        const firstFile = Object.keys(data.files)[0] || "cv.tex";
        setActiveFile(firstFile);
        setShowProjectsModal(false);
        setTimeout(() => handleCompile(), 100);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Convert current CareerAI manual builder data into LaTeX
  const handleGenerateFromResume = async () => {
    const saved = localStorage.getItem("careerai_resume_data");
    if (!saved) {
      alert("No manual builder data found. Create a resume in Manual Builder first.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8000/api/v1/latex/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resume_data: JSON.parse(saved) })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.latex_code) {
          setFiles(prev => ({
            ...prev,
            "cv.tex": data.latex_code
          }));
          setActiveFile("cv.tex");
          setTimeout(() => handleCompile(), 100);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Import parsed structured details from LaTeX back to Manual Builder
  const handleImportToBuilder = async () => {
    if (!window.confirm("This will overwrite your Manual Builder resume data. Proceed?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8000/api/v1/latex/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ latex_code: files["cv.tex"] })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.resume_data) {
          localStorage.setItem("careerai_resume_data", JSON.stringify(data.resume_data));
          alert("Imported successfully! Redirecting to Manual Builder...");
          navigate("/resume/builder");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // AI Assistant commands
  const handleSendMessage = async () => {
    if (!aiMessage.trim() || isAiLoading) return;
    
    const userWording = aiMessage;
    setChatHistory(prev => [...prev, { role: "user", content: userWording }]);
    setAiMessage("");
    setIsAiLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8000/api/v1/latex/ai/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          latex_code: files[activeFile],
          instruction: userWording
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.latex_code) {
          setFiles(prev => ({
            ...prev,
            [activeFile]: data.latex_code
          }));
          setChatHistory(prev => [...prev, { role: "assistant", content: `Applied instruction: "${userWording}".` }]);
          setTimeout(() => handleCompile(), 100);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Trigger Gemini AI to fix compilation errors
  const handleAIFixErrors = async () => {
    if (errors.length === 0) return;
    setIsAiLoading(true);
    setShowAIPanel(true);

    const firstErr = errors[0];
    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8000/api/v1/latex/ai/fix", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          latex_code: files["cv.tex"],
          error_message: firstErr.message,
          line_number: firstErr.line
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.corrected_latex) {
          setProposedCodeFix(data.corrected_latex);
          setChatHistory(prev => [
            ...prev,
            { role: "assistant", content: `I found the syntax issue on line ${firstErr.line}: "${firstErr.message}". Explanation: ${data.explanation}. Click 'Apply Fix' below to resolve.` }
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Apply code fix
  const handleApplyFix = () => {
    if (!proposedCodeFix) return;
    setFiles(prev => ({ ...prev, "cv.tex": proposedCodeFix }));
    setProposedCodeFix(null);
    setChatHistory(prev => [...prev, { role: "assistant", content: "Applied error correction code fix." }]);
    setTimeout(() => handleCompile(), 100);
  };

  // File Explorer CRUD
  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    setFiles(prev => ({
      ...prev,
      [newFileName.trim()]: `% ${newFileName.trim()}\n`
    }));
    setActiveFile(newFileName.trim());
    setNewFileName("");
    setShowNewFileModal(false);
  };

  const handleDeleteFile = (name) => {
    if (name === "cv.tex") {
      alert("Cannot delete primary cv.tex file.");
      return;
    }
    if (window.confirm(`Delete ${name}?`)) {
      const updated = { ...files };
      delete updated[name];
      setFiles(updated);
      setActiveFile("cv.tex");
    }
  };

  return (
    <div className="flex-1 w-full relative overflow-hidden flex flex-col pb-20 md:pb-8">

        
        {/* Local Page Toolbar */}
        <div className="bg-surface border-b border-outline-variant/40 px-6 py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">LaTeX Resume Editor</h2>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary text-xs text-on-surface-variant font-medium py-0.5 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowProjectsModal(true)}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Open Project
            </button>
            <button
              onClick={handleSaveProject}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={handleGenerateFromResume}
              className="px-3 py-1.5 border border-primary/20 text-primary bg-primary/5 rounded-lg text-xs font-bold hover:bg-primary/10 cursor-pointer"
              title="Generate LaTeX structure using active manual builder draft"
            >
              Sync builder data
            </button>
            <button
              onClick={handleImportToBuilder}
              className="px-3 py-1.5 border border-secondary/20 text-secondary bg-secondary/5 rounded-lg text-xs font-bold hover:bg-secondary/10 cursor-pointer"
              title="Parse this LaTeX document and import structured data back to builder"
            >
              Import to Builder
            </button>
          </div>
        </div>

        {/* Editor IDE Sandbox area */}
        <div className="flex-grow flex overflow-hidden w-full relative">
          
          {/* File explorer panel (Left) */}
          <aside className="w-48 bg-slate-50 border-r border-outline-variant/40 flex flex-col shrink-0">
            <div className="p-3 border-b border-outline-variant/35 flex justify-between items-center bg-slate-100/50">
              <span className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">Project Files</span>
              <button
                onClick={() => setShowNewFileModal(true)}
                className="w-5 h-5 rounded hover:bg-slate-200 flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span>
              </button>
            </div>

            <ul className="p-2 space-y-1 overflow-y-auto flex-grow text-xs">
              {Object.keys(files).map(name => (
                <li
                  key={name}
                  onClick={() => setActiveFile(name)}
                  className={`flex justify-between items-center px-2 py-1.5 rounded cursor-pointer ${
                    activeFile === name ? 'bg-primary/10 text-primary font-semibold' : 'text-on-surface-variant hover:bg-slate-200'
                  }`}
                >
                  <span className="truncate flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-xs">description</span>
                    {name}
                  </span>
                  {name !== "cv.tex" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteFile(name); }}
                      className="text-error hover:bg-error-container/10 p-0.5 rounded opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </aside>

          {/* Code Editor Panel (Center) */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            
            {/* Editor Toolbar */}
            <div className="bg-slate-50 border-b border-outline-variant/30 px-4 py-2 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-primary">{activeFile}</span>
                <span className={`w-2 h-2 rounded-full ${
                  compileStatus === 'Success' ? 'bg-teal-500' : compileStatus === 'Failed' ? 'bg-error' : compileStatus === 'Compiling' ? 'bg-amber-500' : 'bg-slate-400'
                }`}></span>
                <span className="text-[10px] text-on-surface-variant font-medium capitalize">{compileStatus}</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[10px] text-on-surface-variant cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCompile}
                    onChange={(e) => setAutoCompile(e.target.checked)}
                    className="cursor-pointer"
                  />
                  Auto Compile
                </label>

                <button
                  onClick={handleCompile}
                  disabled={compileStatus === "Compiling"}
                  className="bg-primary text-on-primary px-3 py-1 rounded text-[10px] font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  Compile
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-grow w-full overflow-hidden">
              <Editor
                height="100%"
                language="latex"
                theme="vs-dark"
                value={files[activeFile]}
                onChange={handleEditorChange}
                options={{
                  fontSize: 12,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  lineNumbers: "on",
                  bracketPairColorization: { enabled: true },
                  autoClosingBrackets: "always"
                }}
              />
            </div>

            {/* Compilation logs collapsible drawer (Bottom) */}
            <div className={`bg-slate-900 border-t border-slate-700 transition-all flex flex-col shrink-0 ${
              showLogs ? 'h-40' : 'h-8'
            }`}>
              <div
                onClick={() => setShowLogs(!showLogs)}
                className="bg-slate-800 px-4 py-1 flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer hover:bg-slate-750"
              >
                <span>Compilation Logs & Errors ({errors.length})</span>
                <span className="material-symbols-outlined text-xs">
                  {showLogs ? 'expand_more' : 'expand_less'}
                </span>
              </div>
              
              {showLogs && (
                <div className="flex-grow p-3 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-2 select-text">
                  {errors.length > 0 ? (
                    errors.map((err, idx) => (
                      <div key={idx} className="text-red-400 border-l-2 border-red-500 pl-2">
                        <span className="font-bold">Line {err.line}:</span> {err.message}
                        <button
                          onClick={handleAIFixErrors}
                          className="ml-3 bg-red-900/50 hover:bg-red-900 border border-red-500 text-red-200 px-1.5 py-0.5 rounded text-[8px] font-bold cursor-pointer"
                        >
                          Fix with AI
                        </button>
                      </div>
                    ))
                  ) : (
                    <pre className="whitespace-pre-wrap">{logs || "✓ Compiled successfully. No errors found."}</pre>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* PDF Preview panel (Right) */}
          <section className="w-[45%] border-l border-outline-variant/40 bg-slate-100 flex flex-col overflow-hidden shrink-0">
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-outline-variant/30 px-4 py-2 flex justify-between items-center shrink-0">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">PDF PREVIEW</span>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom(z => Math.max(z - 10, 50))}
                  className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-sm font-bold">zoom_out</span>
                </button>
                <span className="text-[10px] font-bold text-on-surface-variant w-8 text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom(z => Math.min(z + 10, 150))}
                  className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-sm font-bold">zoom_in</span>
                </button>
                <div className="w-px h-3 bg-outline-variant/60 mx-1"></div>
                <button
                  onClick={handleDownloadPDF}
                  disabled={!pdfUrl}
                  className="p-1 text-primary hover:bg-primary/5 rounded cursor-pointer disabled:opacity-50"
                  title="Download PDF document"
                >
                  <span className="material-symbols-outlined text-sm font-bold">download</span>
                </button>
                <button
                  onClick={handleDownloadProject}
                  className="p-1 text-on-surface-variant hover:bg-slate-200 rounded cursor-pointer"
                  title="Download ZIP source files"
                >
                  <span className="material-symbols-outlined text-sm font-bold">archive</span>
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-grow w-full bg-slate-200 flex justify-center items-stretch relative">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-none transition-transform origin-top"
                  style={{ transform: `scale(${zoom / 100})`, width: `${100 * (100 / zoom)}%`, height: `${100 * (100 / zoom)}%` }}
                  title="LaTeX PDF Preview"
                />
              ) : (
                <div className="m-auto text-center space-y-2">
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant">description</span>
                  <p className="text-xs text-on-surface-variant">No PDF compiled yet. Click compile above.</p>
                </div>
              )}
            </div>
          </section>

          {/* AI LaTeX Assistant sidebar Drawer */}
          {showAIPanel && (
            <aside className="w-72 border-l border-outline-variant bg-surface flex flex-col shrink-0 animate-fade-in-left">
              <div className="p-3 border-b border-outline-variant/40 flex justify-between items-center bg-slate-50">
                <span className="font-bold text-[10px] text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm font-bold text-primary">auto_awesome</span>
                  AI LaTeX Assistant
                </span>
                <button
                  onClick={() => { setShowAIPanel(false); setProposedCodeFix(null); }}
                  className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-on-surface-variant cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">close</span>
                </button>
              </div>

              {/* Chat panel logs */}
              <div className="flex-grow p-4 overflow-y-auto space-y-3 text-xs editor-scroll">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-xl p-3 text-[11px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-primary text-on-primary rounded-tr-none'
                        : 'bg-slate-50 border border-outline-variant/20 text-on-surface rounded-tl-none shadow-sm'
                    }`}>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                ))}
                
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-xl p-3 bg-slate-50 border border-outline-variant/20 text-on-surface rounded-tl-none shadow-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Propose Fix footer bar */}
              {proposedCodeFix && (
                <div className="p-3 border-t border-outline-variant bg-amber-50/50 flex flex-col gap-2 shrink-0">
                  <p className="text-[10px] text-amber-800 font-semibold">I have resolved the syntax error. Apply the fix?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setProposedCodeFix(null)}
                      className="flex-1 border border-outline-variant py-1 text-[9px] font-bold rounded hover:bg-white cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      onClick={handleApplyFix}
                      className="flex-1 bg-primary text-on-primary py-1 text-[9px] font-bold rounded hover:opacity-90 cursor-pointer"
                    >
                      Apply Fix
                    </button>
                  </div>
                </div>
              )}

              {/* Input Chat message */}
              <div className="p-3 border-t border-outline-variant/35 flex gap-1.5 bg-white shrink-0">
                <input
                  type="text"
                  placeholder="Ask assistant to edit LaTeX..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-50 border border-outline-variant rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isAiLoading}
                  className="bg-primary text-on-primary w-8 h-8 rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </aside>
          )}

          {/* Quick AI drawer toggle button */}
          {!showAIPanel && (
            <button
              onClick={() => setShowAIPanel(true)}
              className="absolute right-4 top-16 bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-20 cursor-pointer"
              title="Open AI LaTeX Assistant"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
            </button>
          )}
        </div>

      {/* MODAL: New File */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 border border-outline-variant shadow-2xl space-y-4">
            <h3 className="font-bold text-on-surface text-sm">Add Project File</h3>
            <div className="space-y-1">
              <label className="text-[10px] text-on-surface-variant font-bold">Filename</label>
              <input
                type="text"
                placeholder="e.g. references.bib"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full bg-slate-50 border border-outline-variant rounded-lg p-2.5 text-xs focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setNewFileName(""); setShowNewFileModal(false); }}
                className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Load Projects */}
      {showProjectsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-md p-6 border border-outline-variant shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-on-surface text-sm">Open LaTeX Resume Project</h3>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="w-6 h-6 rounded hover:bg-slate-200 flex items-center justify-center text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>
            
            {/* List of projects */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {projectList.length > 0 ? (
                projectList.map(proj => (
                  <div
                    key={proj.id}
                    className="p-3 bg-slate-50 border border-outline-variant/30 rounded-lg flex justify-between items-center hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => handleLoadProject(proj.id)}
                  >
                    <div>
                      <p className="text-xs font-bold text-on-surface">{proj.name}</p>
                      <p className="text-[9px] text-on-surface-variant">Updated: {new Date(proj.updated_at).toLocaleString()}</p>
                    </div>
                    <span className="material-symbols-outlined text-primary text-sm">arrow_forward</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-on-surface-variant text-center py-6">No saved projects. Compile and save one above.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
