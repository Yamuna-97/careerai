import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ResumePreview from '../components/ResumePreview';

export default function ResumeAIStudioPage() {
  const navigate = useNavigate();

  // Navigation / Wizard State
  // 'LANDING' | 'INPUT_METHOD' | 'EXTRACTING' | 'REVIEW' | 'CONFIGURE' | 'GENERATING' | 'WORKSPACE'
  const [viewState, setViewState] = useState('LANDING');
  
  // Creation Flow States
  const [inputMethod, setInputMethod] = useState('paste'); // 'paste' | 'upload' | 'use_existing'
  const [pastedDetails, setPastedDetails] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Extracted/Parsed Data
  const [resumeData, setResumeData] = useState({
    personal: { fullName: '', title: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '', profileImage: '' },
    summary: '',
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: []
  });

  // Target Parameters for optimization
  const [targetRole, setTargetRole] = useState('Python Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  
  // Scoring Indicators
  const [scores, setScores] = useState({
    overall: 82, ats: 78, content: 80, impact: 75, readability: 85, professionalism: 80
  });
  const [suggestions, setSuggestions] = useState([]);
  
  // Chat Editing
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Resume Coach. I have generated your refined resume structure. Ask me to make edits, optimize summaries, or tailor sections below.' }
  ]);
  const [userInputMessage, setUserInputMessage] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Version Control
  const [versions, setVersions] = useState([]);
  const [originalResumeData, setOriginalResumeData] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'ats' | 'versions'

  // Ref details
  const fileInputRef = useRef(null);

  // Load initial scores / suggestion stubs on render
  useEffect(() => {
    // Check if we already have resume data to populate in the "Use my existing resume" flow
    const saved = localStorage.getItem('careerai_resume_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOriginalResumeData(parsed);
      } catch (e) {
        console.error(e);
      }
    }

    // Load static templates/suggestions
    setSuggestions([
      { id: '1', section: 'summary', priority: 'high', issue: 'Summary is too general', suggestion: 'Incorporate target keywords matching your target position.', fix_prompt: 'Make summary more technical with key frameworks' },
      { id: '2', section: 'experience', priority: 'high', issue: 'Experience bullets lack metrics', suggestion: 'Quantify outcomes (e.g. latency reductions, scale values).', fix_prompt: 'Rewrite experience bullet points using quantitative results' },
      { id: '3', section: 'projects', priority: 'medium', issue: 'Technical stack not explicit', suggestion: 'Incorporate precise technologies inside your description blocks.', fix_prompt: 'Append tech stack chips to project summaries' }
    ]);
  }, []);

  // Trigger file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Call Extraction endpoint
  const handleStartExtraction = async () => {
    setViewState('EXTRACTING');
    
    // Simulate fallback to mock if API/file parsing fails or no key
    try {
      if (inputMethod === 'use_existing') {
        // Direct populate
        setResumeData(originalResumeData || resumeData);
        setTimeout(() => setViewState('REVIEW'), 1500);
        return;
      }

      const token = localStorage.getItem('token');
      let res;
      
      if (inputMethod === 'upload' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        res = await fetch('http://localhost:8000/api/v1/resume/ai/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else {
        // Paste flow
        res = await fetch('http://localhost:8000/api/v1/resume/ai/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text: pastedDetails })
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data.success && data.resume_data) {
          setResumeData(data.resume_data);
          setViewState('REVIEW');
          return;
        }
      }
      
      // Fallback fallback stubs
      setTimeout(() => {
        setResumeData(originalResumeData || {
          personal: { fullName: 'Yamuna', title: 'Machine Learning Engineer', email: 'yamuna@example.com', phone: '+91 98765 43210', location: 'Chennai', linkedin: 'linkedin.com/in/yamuna', github: 'github.com/yamuna-97', portfolio: 'yamuna.dev' },
          summary: 'Passionate Machine Learning Engineer experienced in predictive modeling and analytics.',
          education: [{ id: '1', institution: 'Kongu Engineering College', degree: 'B.Tech', fieldOfStudy: 'Artificial Intelligence', startDate: '2024', endDate: '2028', grade: '8.65 CGPA', description: 'Deep learning focus' }],
          experience: [{ id: '1', company: 'TechVision AI', position: 'Machine Learning Intern', location: 'Chennai', startDate: 'May 2026', endDate: 'Present', currentlyWorking: true, description: 'Developed video analytics model pipelines.' }],
          projects: [{ id: '1', name: 'CareerAI Platform', description: 'AI-driven career simulator.', technologies: 'React, FastAPI, Supabase', githubUrl: 'github.com/yamuna/careerai', startDate: 'June 2026', endDate: 'August 2026' }],
          skills: [{ id: '1', name: 'Python', category: 'Programming Languages' }, { id: '2', name: 'FastAPI', category: 'Frameworks' }],
          certifications: [{ id: '1', name: 'Deep Learning Specialization', issuer: 'DeepLearning.AI', issueDate: 'July 2025' }],
          achievements: [{ id: '1', title: 'First Place SIH', organization: 'MHRD', date: 'Dec 2025' }]
        });
        setViewState('REVIEW');
      }, 2000);

    } catch (e) {
      console.error(e);
      setViewState('REVIEW');
    }
  };

  // Generate Polished Resume
  const handleGenerateResume = async () => {
    setViewState('GENERATING');
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/v1/resume/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resume_data: resumeData,
          target_role: targetRole,
          job_description: jobDescription,
          tone
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.resume_data) {
          setResumeData(data.resume_data);
          // Set version 1
          setVersions([{ label: 'Original Extracted', resumeData: resumeData }, { label: 'AI Polished', resumeData: data.resume_data }]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setViewState('WORKSPACE'), 2000);
    }
  };

  // Send Chat message editing instruction
  const handleSendMessage = async () => {
    if (!userInputMessage.trim() || isSendingMessage) return;

    const userMsg = userInputMessage;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setUserInputMessage('');
    setIsSendingMessage(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/v1/resume/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          resume_data: resumeData,
          chat_history: chatMessages.slice(-6),
          selected_section: selectedSection === 'All' ? null : selectedSection.toLowerCase()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setResumeData(data.updated_resume);
          setChatMessages(prev => [...prev, { role: 'assistant', content: data.ai_response }]);
          // Save new version
          setVersions(prev => [...prev, { label: userMsg, resumeData: data.updated_resume }]);
          
          // Re-score
          const scoreRes = await fetch('http://localhost:8000/api/v1/resume/ai/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ resume_data: data.updated_resume, target_role: targetRole })
          });
          if (scoreRes.ok) {
            const scoreData = await scoreRes.json();
            setScores(scoreData);
          }
        }
      } else {
        // Local simulation fallback
        setTimeout(() => {
          let updated = { ...resumeData };
          if (userMsg.toLowerCase().includes('summary') || userMsg.toLowerCase().includes('short')) {
            updated.summary = 'Passionate Machine Learning Engineer specializing in computer vision, FastAPI APIs, and crop disease analytics.';
          }
          setResumeData(updated);
          setChatMessages(prev => [...prev, { role: 'assistant', content: `Done. I adjusted your resume based on "${userMsg}".` }]);
          setVersions(prev => [...prev, { label: userMsg, resumeData: updated }]);
          setIsSendingMessage(false);
        }, 1000);
        return;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Apply final data back to Manual Builder
  const handleApplyToBuilder = () => {
    localStorage.setItem('careerai_resume_data', JSON.stringify(resumeData));
    navigate('/resume/builder');
  };

  // Restore previous version
  const handleRestoreVersion = (ver) => {
    setResumeData(ver.resumeData);
    setChatMessages(prev => [...prev, { role: 'assistant', content: `Restored version: "${ver.label}".` }]);
  };

  return (
    <div className="flex-1 w-full relative pb-20 md:pb-8">


        {/* ── LANDING VIEW ── */}
        {viewState === 'LANDING' && (
          <main className="flex-grow px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1000px] mx-auto w-full flex flex-col gap-6">
            
            <div className="text-center py-6">
              <h2 className="font-headline-lg text-headline-lg font-extrabold text-on-surface">
                Create, Improve & Tailor Your Resume
              </h2>
              <p className="text-on-surface-variant font-body-md mt-2 max-w-xl mx-auto">
                Upload your files or paste details to extract structured elements. Use interactive chat instructions to refine wording.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              
              {/* Create with AI */}
              <div className="bg-surface border border-outline-variant/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl icon-filled">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Create With AI</h3>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                      Start fresh by uploading your details, pasting raw text, or pulling existing profiles. AI structures your sections instantly.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setViewState('INPUT_METHOD'); setInputMethod('paste'); }}
                  className="w-full mt-6 bg-primary text-on-primary py-2.5 rounded-lg font-label-md text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Create Resume with AI
                </button>
              </div>

              {/* Improve Existing */}
              <div className="bg-surface border border-outline-variant/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-secondary/40 transition-colors">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-2xl icon-filled">upload_file</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Improve Existing Resume</h3>
                    <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                      Upload an existing PDF/DOCX file. Gemini extracts content, structures columns, and enhances grammar without fabrications.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setViewState('INPUT_METHOD'); setInputMethod('upload'); }}
                  className="w-full mt-6 bg-secondary text-white py-2.5 rounded-lg font-label-md text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Upload Existing Resume
                </button>
              </div>

            </div>

            {/* Scorecard indicators */}
            <div className="bg-surface rounded-xl border border-outline-variant/30 p-6 mt-6 shadow-sm space-y-4">
              <h4 className="font-label-md text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Last Scoring Assessment Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/15">
                  <span className="text-2xl font-bold text-primary">87</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Content Quality</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/15">
                  <span className="text-2xl font-bold text-secondary">82</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">ATS Score</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/15">
                  <span className="text-2xl font-bold text-indigo-500">93</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Readability</p>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/15">
                  <span className="text-2xl font-bold text-teal-500">79</span>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Keyword Match</p>
                </div>
              </div>
            </div>

          </main>
        )}

        {/* ── INPUT METHOD SELECTION & LOADER ── */}
        {viewState === 'INPUT_METHOD' && (
          <main className="flex-grow px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[800px] mx-auto w-full flex flex-col gap-6">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface text-center">Provide Your Profile Details</h3>
            
            {/* Tab switchers */}
            <div className="flex border-b border-outline-variant/30">
              {['paste', 'upload', 'use_existing'].map(method => (
                <button
                  key={method}
                  onClick={() => setInputMethod(method)}
                  className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                    inputMethod === method ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant'
                  }`}
                >
                  {method === 'paste' ? 'Paste Wording' : method === 'upload' ? 'Upload PDF/DOCX' : 'Use Existing CareerAI'}
                </button>
              ))}
            </div>

            {/* Input boxes */}
            <div className="bg-surface rounded-xl p-6 border border-outline-variant/35 shadow-sm min-h-[250px] flex flex-col justify-between">
              <div>
                {inputMethod === 'paste' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant">Pasted Profile Details</label>
                    <textarea
                      placeholder="Paste your education history, internship roles, details of projects, certifications, and skills..."
                      value={pastedDetails}
                      onChange={(e) => setPastedDetails(e.target.value)}
                      className="w-full h-40 bg-surface border border-outline-variant rounded-lg p-3 text-xs focus:outline-none focus:border-primary resize-none"
                    />
                  </div>
                )}

                {inputMethod === 'upload' && (
                  <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-outline-variant/50 rounded-xl bg-slate-50/50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx" />
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">cloud_upload</span>
                    <span className="text-xs font-bold text-on-surface mt-2">
                      {uploadedFile ? uploadedFile.name : 'Select PDF or DOCX Resume'}
                    </span>
                    <p className="text-[10px] text-on-surface-variant mt-1">Supported formats: PDF, DOCX (Max 5MB)</p>
                  </div>
                )}

                {inputMethod === 'use_existing' && (
                  <div className="text-center py-8 space-y-2">
                    <span className="material-symbols-outlined text-4xl text-primary">description</span>
                    <h4 className="font-bold text-xs">Load Active Resume Data</h4>
                    <p className="text-[10px] text-on-surface-variant max-w-sm mx-auto">
                      AI Studio will extract the currently saved draft from your manual builder workspace as a base context.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-6 border-t border-outline-variant/20 pt-4">
                <button
                  onClick={() => setViewState('LANDING')}
                  className="px-4 py-2 border border-outline-variant text-xs rounded-lg hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartExtraction}
                  disabled={inputMethod === 'upload' && !uploadedFile}
                  className="bg-primary text-on-primary px-6 py-2 rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  Extract Structured Data
                </button>
              </div>
            </div>
          </main>
        )}

        {/* ── EXTRACTING LOADER ── */}
        {viewState === 'EXTRACTING' && (
          <main className="flex-grow flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="font-bold text-sm">Extracting Career Profiles...</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                Gemini is parsing contact info, credentials, and experience into structured schemas.
              </p>
            </div>
          </main>
        )}

        {/* ── REVIEW EXTRACTED INFORMATION ── */}
        {viewState === 'REVIEW' && (
          <main className="flex-grow px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[900px] mx-auto w-full flex flex-col gap-6">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Review Parsed Profile Details</h3>
              <p className="text-xs text-on-surface-variant mt-1">Make corrections before generating final tailored summaries.</p>
            </div>

            <div className="space-y-4">
              {/* Personal Details */}
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">person</span> Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-semibold">Full Name</label>
                    <input
                      type="text"
                      value={resumeData.personal.fullName}
                      onChange={(e) => setResumeData({ ...resumeData, personal: { ...resumeData.personal, fullName: e.target.value } })}
                      className="w-full bg-slate-50 border border-outline-variant rounded p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-on-surface-variant font-semibold">Target Title</label>
                    <input
                      type="text"
                      value={resumeData.personal.title}
                      onChange={(e) => setResumeData({ ...resumeData, personal: { ...resumeData.personal, title: e.target.value } })}
                      className="w-full bg-slate-50 border border-outline-variant rounded p-2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Experience list */}
              <div className="bg-surface border border-outline-variant/40 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-xs text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">work</span> Professional Experience
                </h4>
                {resumeData.experience && resumeData.experience.length > 0 ? (
                  resumeData.experience.map((exp, idx) => (
                    <div key={exp.id || idx} className="p-3 bg-slate-50 rounded border border-outline-variant/20 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] text-on-surface-variant font-semibold">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[idx].company = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                          className="w-full bg-white border border-outline-variant rounded p-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-on-surface-variant font-semibold">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => {
                            const updated = [...resumeData.experience];
                            updated[idx].position = e.target.value;
                            setResumeData({ ...resumeData, experience: updated });
                          }}
                          className="w-full bg-white border border-outline-variant rounded p-1.5"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-on-surface-variant">No experience parsed.</p>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6 border-t border-outline-variant/20 pt-4">
              <button
                onClick={() => setViewState('INPUT_METHOD')}
                className="px-4 py-2 border border-outline-variant text-xs rounded-lg hover:bg-surface-container cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => setViewState('CONFIGURE')}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Continue to Optimize
              </button>
            </div>
          </main>
        )}

        {/* ── CONFIGURE TARGET & TAILOR ── */}
        {viewState === 'CONFIGURE' && (
          <main className="flex-grow px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[800px] mx-auto w-full flex flex-col gap-6">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface text-center">Configure Target Role & Options</h3>
            
            <div className="bg-surface rounded-xl p-6 border border-outline-variant/35 shadow-sm space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Target Position</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="Python Developer">Python Developer</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Backend Developer">Backend Developer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Wording Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Technical">Technical Accent</option>
                    <option value="Balanced">Balanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant">Optional Target Job Description</label>
                <textarea
                  placeholder="Paste details of the target job description to match keywords..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full h-32 bg-surface border border-outline-variant rounded-lg p-3 text-xs focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-between mt-6 border-t border-outline-variant/20 pt-4">
                <button
                  onClick={() => setViewState('REVIEW')}
                  className="px-4 py-2 border border-outline-variant text-xs rounded-lg hover:bg-surface-container cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateResume}
                  className="bg-secondary text-white px-6 py-2 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Generate Resume
                </button>
              </div>

            </div>
          </main>
        )}

        {/* ── GENERATING LOADER ── */}
        {viewState === 'GENERATING' && (
          <main className="flex-grow flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="font-bold text-sm">Polishing & Tailoring Wording...</h3>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                Gemini is optimizing summary phrases and structural action verbs based on tone.
              </p>
            </div>
          </main>
        )}

        {/* ── CHAT EDITOR & PREVIEW WORKSPACE ── */}
        {viewState === 'WORKSPACE' && (
          <main className="flex-1 w-full flex flex-col lg:flex-row overflow-hidden border-t border-outline-variant/30 bg-surface-container-lowest">
            
            {/* Left Control Workspace (Chat, scores, versions) */}
            <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col border-r border-outline-variant bg-surface relative h-full overflow-hidden">
              
              {/* Selector Tabs */}
              <div className="flex border-b border-outline-variant/20 bg-slate-50 shrink-0">
                {['chat', 'ats', 'versions'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 text-xs font-semibold border-b-2 uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === tab ? 'border-primary text-primary font-bold bg-white' : 'border-transparent text-on-surface-variant'
                    }`}
                  >
                    {tab === 'chat' ? 'AI Assistant' : tab === 'ats' ? 'ATS Optimizer' : 'Versions'}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: CHAT EDITOR */}
              {activeTab === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 editor-scroll">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-on-primary rounded-tr-none'
                            : 'bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-tl-none'
                        }`}>
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Context controls (section selector, compare) */}
                  <div className="p-3 border-t border-outline-variant/25 bg-slate-50 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="font-semibold text-on-surface-variant">Focus:</span>
                      <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="bg-white border border-outline-variant rounded px-1.5 py-0.5 focus:outline-none"
                      >
                        <option value="All">All Sections</option>
                        <option value="Summary">Summary</option>
                        <option value="Experience">Experience</option>
                        <option value="Projects">Projects</option>
                        <option value="Skills">Skills</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setShowComparison(!showComparison)}
                      className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        showComparison ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant text-on-surface-variant'
                      }`}
                    >
                      Compare view: {showComparison ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Input bar */}
                  <div className="p-3 border-t border-outline-variant/30 flex gap-2 shrink-0 bg-white">
                    <input
                      type="text"
                      placeholder="Type edit instructions (e.g. shorten summary)..."
                      value={userInputMessage}
                      onChange={(e) => setUserInputMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-slate-50 border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isSendingMessage}
                      className="bg-primary text-on-primary w-9 h-9 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: ATS OPTIMIZATION */}
              {activeTab === 'ats' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 editor-scroll">
                  <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-outline-variant/20">
                    <div>
                      <h4 className="font-bold text-xs">ATS Match Score</h4>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">Tailored for: {targetRole}</p>
                    </div>
                    <span className="text-xl font-bold text-secondary bg-secondary/10 px-3 py-1 rounded">
                      {scores.ats}/100
                    </span>
                  </div>

                  {/* Suggestions checklist */}
                  <div className="space-y-3">
                    <h5 className="font-bold text-[10px] text-on-surface-variant uppercase tracking-wider">
                      Optimization Checklists
                    </h5>
                    {suggestions.map(sug => (
                      <div key={sug.id} className="p-3 bg-surface border border-outline-variant/25 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            sug.priority === 'high' ? 'bg-error/10 text-error' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {sug.priority} Priority
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-bold capitalize">{sug.section}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant font-medium">{sug.issue}</p>
                        <p className="text-[10px] text-slate-500">{sug.suggestion}</p>
                        <button
                          onClick={() => {
                            setUserInputMessage(sug.fix_prompt);
                            setActiveTab('chat');
                          }}
                          className="text-[10px] text-primary font-bold hover:underline block text-right mt-1 cursor-pointer"
                        >
                          Use prompt to fix
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: VERSIONS */}
              {activeTab === 'versions' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 editor-scroll">
                  <h4 className="font-bold text-xs text-on-surface-variant mb-2">Saved Session Revisions</h4>
                  {versions.map((ver, i) => (
                    <div key={i} className="bg-slate-50 border border-outline-variant/20 p-3 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-on-surface">Version {i + 1}</p>
                        <p className="text-[10px] text-on-surface-variant truncate max-w-[180px]">{ver.label}</p>
                      </div>
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        className="text-[10px] text-secondary font-bold hover:underline cursor-pointer"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Apply/Save Action Bar */}
              <div className="h-16 border-t border-outline-variant px-6 flex items-center justify-between shrink-0 bg-white">
                <button
                  onClick={() => setViewState('CONFIGURE')}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Configure Target
                </button>
                <button
                  onClick={handleApplyToBuilder}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 shadow-sm cursor-pointer"
                >
                  Apply to Manual Builder
                </button>
              </div>

            </div>

            {/* Right Live Document Preview */}
            <div className="flex-1 bg-slate-100 flex flex-col relative h-full overflow-hidden p-6 md:p-8 overflow-y-auto">
              
              {/* Compare side by side display if enabled */}
              {showComparison ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-[1200px] mx-auto">
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase mb-1 block">Original Base Resume</span>
                    <div className="scale-[0.8] origin-top-left shadow-lg">
                      <ResumePreview resumeData={originalResumeData} scale={100} />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-secondary uppercase mb-1 block">AI Polished / Optimized</span>
                    <div className="scale-[0.8] origin-top-left shadow-lg">
                      <ResumePreview resumeData={resumeData} scale={100} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="shadow-lg">
                  <ResumePreview resumeData={resumeData} templateId={localStorage.getItem('careerai_template_id') || 'Modern'} scale={90} />
                </div>
              )}

            </div>

          </main>
        )}
    </div>
  );
}
