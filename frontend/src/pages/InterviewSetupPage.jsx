import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function InterviewSetupPage() {
  const navigate = useNavigate();

  // Setup Wizard State
  const [currentStep, setCurrentStep] = useState(1); // 1: Level, 2: Type, 3: Role & Sandbox, 4: Context & Mode
  
  // Selection States
  const [difficulty, setDifficulty] = useState('intermediate');
  const [interviewType, setInterviewType] = useState('Technical');
  const [role, setRole] = useState('Python Developer');
  const [customRole, setCustomRole] = useState('');
  const [resumeBased, setResumeBased] = useState(false);
  
  // Job Specific Context
  const [useJobDescription, setUseJobDescription] = useState(false);
  const [jobCompany, setJobCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Coding Specific Details
  const [language, setLanguage] = useState('python');
  const [topic, setTopic] = useState('Arrays');

  // Config parameters
  const [numQuestions, setNumQuestions] = useState(5);
  const [duration, setDuration] = useState(15);
  const [format, setFormat] = useState('text'); // text, voice
  
  const [submitting, setSubmitting] = useState(false);

  // Suggested roles list
  const suggestedRoles = [
    'AI Engineer',
    'Machine Learning Engineer',
    'Data Scientist',
    'Data Analyst',
    'Python Developer',
    'Backend Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'Software Engineer',
    'Cloud Engineer',
    'DevOps Engineer',
    'Cybersecurity',
    'Product Manager',
    'Business Analyst',
    'Custom Role'
  ];

  const handleStart = async () => {
    setSubmitting(true);
    try {
      const token = 'mock_user_token';
      const finalRole = role === 'Custom Role' ? customRole : role;
      
      const payload = {
        role: finalRole || 'Software Engineer',
        difficulty,
        interview_type: interviewType,
        format,
        num_questions: parseInt(numQuestions),
        duration: parseInt(duration),
        resume_based: resumeBased,
        job_company: useJobDescription ? jobCompany : null,
        job_title: useJobDescription ? jobTitle : null,
        job_description: useJobDescription ? jobDescription : null,
        language: interviewType.lower() === 'coding' ? language : null,
        topic: interviewType.lower() === 'coding' ? topic : null
      };

      const res = await fetch('http://localhost:8000/api/v1/interviews/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        navigate(`/interview-session?session_id=${data.session_id || data.id}`);
      } else {
        // Fallback to static session
        navigate('/interview-session?demo=true');
      }
    } catch (e) {
      console.error("API start failed, fallback to demo mode.", e);
      navigate('/interview-session?demo=true');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to check step validity
  const isStepValid = (step) => {
    if (step === 3 && role === 'Custom Role' && !customRole.trim()) return false;
    if (step === 3 && interviewType === 'Coding' && !language) return false;
    return true;
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex pb-20 md:pb-8">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen w-full">
        <Header title="Configure AI Mock Interview" subtitle="Tailor the difficulty, category, role, and context for target preparation" />

        <main className="flex-grow px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1000px] mx-auto w-full flex flex-col gap-6">
          
          {/* STEP TRACKER BAR */}
          <div className="bg-surface p-4 border border-outline-variant/40 rounded-xl shadow-sm">
            <div className="flex justify-between items-center max-w-md mx-auto relative">
              {[
                { s: 1, name: 'Level' },
                { s: 2, name: 'Type' },
                { s: 3, name: 'Role & Topic' },
                { s: 4, name: 'Context & Mode' }
              ].map(step => (
                <div key={step.s} className="flex flex-col items-center z-10">
                  <button
                    onClick={() => currentStep > step.s && setCurrentStep(step.s)}
                    disabled={currentStep < step.s}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border ${
                      currentStep === step.s
                        ? 'bg-secondary text-white border-secondary shadow-md scale-105'
                        : currentStep > step.s
                        ? 'bg-secondary-container text-on-secondary-container border-secondary-container cursor-pointer'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30 cursor-not-allowed'
                    }`}
                  >
                    {step.s}
                  </button>
                  <span className={`text-[10px] font-bold uppercase mt-1 tracking-wider ${
                    currentStep === step.s ? 'text-secondary' : 'text-on-surface-variant'
                  }`}>
                    {step.name}
                  </span>
                </div>
              ))}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-outline-variant/30 -z-0"></div>
            </div>
          </div>

          {/* STEP 1: CHOOSE DIFFICULTY LEVEL */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-6">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface text-center">
                Select Your Difficulty Level
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    id: 'beginner',
                    title: 'Beginner',
                    desc: 'For students and first-time interview candidates',
                    features: [
                      'Basic HR questions',
                      'Self introduction',
                      'Resume questions',
                      'Simple technical questions',
                      'Guided hints available',
                      'Detailed explanation assistance'
                    ]
                  },
                  {
                    id: 'intermediate',
                    title: 'Intermediate',
                    desc: 'For candidates with interview experience',
                    features: [
                      'HR & Behavioral questions',
                      'Role-specific technical questions',
                      'Follow-up adaptive questions',
                      'Resume-based testing',
                      'Moderate difficulty scale',
                      'Limited hints'
                    ]
                  },
                  {
                    id: 'pro',
                    title: 'Pro',
                    desc: 'For advanced interview preparation',
                    features: [
                      'Difficult technical questions',
                      'Deep follow-up questions',
                      'System / Design challenges',
                      'Pressure-style questioning',
                      'Strict evaluations',
                      'No hints available'
                    ]
                  }
                ].map(level => (
                  <div
                    key={level.id}
                    onClick={() => setDifficulty(level.id)}
                    className={`bg-surface rounded-xl p-6 border-2 flex flex-col justify-between hover:shadow-md cursor-pointer transition-all ${
                      difficulty === level.id
                        ? 'border-secondary bg-surface-container-low shadow-sm'
                        : 'border-outline-variant/30 hover:border-outline-variant'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-headline-sm text-lg font-bold text-on-surface">{level.title}</h4>
                        <input
                          type="radio"
                          name="difficulty"
                          checked={difficulty === level.id}
                          onChange={() => setDifficulty(level.id)}
                          className="text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
                        />
                      </div>
                      <p className="text-xs text-on-surface-variant mb-4">{level.desc}</p>
                      <ul className="space-y-2 border-t border-outline-variant/30 pt-4 font-body-sm text-xs text-on-surface-variant">
                        {level.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-secondary">check_circle</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDifficulty(level.id);
                        setCurrentStep(2);
                      }}
                      className={`w-full mt-6 py-2.5 rounded-lg font-label-sm text-xs font-bold transition-colors cursor-pointer ${
                        difficulty === level.id
                          ? 'bg-secondary text-white hover:opacity-90'
                          : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-dim'
                      }`}
                    >
                      Start {level.title}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CHOOSE INTERVIEW TYPE */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-6">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface text-center">
                Select Interview Category
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { type: 'HR / Behavioral', desc: 'Evaluates soft skills, workplace behavior, teamwork, and conflict resolution using STAR methods.' },
                  { type: 'Technical', desc: 'Focuses on fundamental technical concepts, syntax, frameworks, databases, and trade-offs.' },
                  { type: 'Role-Specific', desc: 'Tailors questions specifically to target responsibilities and daily routines of your selected role.' },
                  { type: 'Resume-Based', desc: 'Analyzes your uploaded profile to craft specific, experience-driven questions.' },
                  { type: 'Coding', desc: 'Generates algorithmic sandbox problems for code execution, profiling, and algorithmic evaluation.' },
                  { type: 'Mixed Interview', desc: 'Covers a balanced combination of technical, HR, scenario-based, and design questions.' }
                ].map(item => (
                  <div
                    key={item.type}
                    onClick={() => setInterviewType(item.type)}
                    className={`bg-surface rounded-xl p-5 border-2 flex items-start gap-4 hover:shadow-sm cursor-pointer transition-all ${
                      interviewType === item.type
                        ? 'border-secondary bg-surface-container-low'
                        : 'border-outline-variant/30 hover:border-outline-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interviewType"
                      checked={interviewType === item.type}
                      onChange={() => setInterviewType(item.type)}
                      className="text-secondary focus:ring-secondary w-4 h-4 mt-1 cursor-pointer"
                    />
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface">{item.type}</h4>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant font-label-sm text-xs cursor-pointer hover:bg-surface-container"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-secondary text-white px-6 py-2.5 rounded-lg font-label-sm text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE ROLE & CODING PARAMETERS */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-6">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface text-center">
                Configure Target Role & Focus
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
                {/* Target Role selection */}
                <div className="lg:col-span-8 space-y-4">
                  <label className="block font-label-md text-label-md text-on-surface font-bold">
                    Choose Target Position
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {suggestedRoles.map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-3 rounded-lg border text-center font-label-sm text-xs transition-colors cursor-pointer ${
                          role === r
                            ? 'bg-secondary text-white border-secondary font-bold'
                            : 'bg-surface border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>

                  {role === 'Custom Role' && (
                    <div className="mt-4 animate-fade-in-up">
                      <label className="block font-label-sm text-xs text-on-surface-variant mb-1 font-semibold">
                        Enter Custom Role Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Security Architect"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-secondary"
                      />
                    </div>
                  )}
                </div>

                {/* Topic & Language selectors for Coding mode */}
                <div className="lg:col-span-4 bg-surface-container-low rounded-xl p-5 border border-outline-variant/20 flex flex-col gap-4">
                  <h4 className="font-label-md text-label-md font-bold text-secondary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">settings_suggest</span>
                    Category Modifiers
                  </h4>
                  
                  {interviewType === 'Coding' ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Sandbox Language</label>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none cursor-pointer"
                        >
                          <option value="python">Python</option>
                          <option value="javascript">JavaScript</option>
                          <option value="java">Java</option>
                          <option value="cpp">C++</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-on-surface-variant mb-1">Algorithm Topic</label>
                        <select
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="w-full bg-surface border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none cursor-pointer"
                        >
                          <option value="Arrays">Arrays</option>
                          <option value="Strings">Strings</option>
                          <option value="Hashing">Hashing</option>
                          <option value="Sorting">Sorting & Searching</option>
                          <option value="Dynamic Programming">Dynamic Programming</option>
                          <option value="Linked List">Linked Lists</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 text-on-surface-variant text-xs">
                      No additional coding overrides needed for {interviewType} mode.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant font-label-sm text-xs cursor-pointer hover:bg-surface-container"
                >
                  Back
                </button>
                <button
                  onClick={() => isStepValid(3) && setCurrentStep(4)}
                  disabled={!isStepValid(3)}
                  className={`px-6 py-2.5 rounded-lg font-label-sm text-xs font-bold transition-opacity ${
                    isStepValid(3) ? 'bg-secondary text-white hover:opacity-90 cursor-pointer' : 'bg-outline-variant/30 text-on-surface-variant/40 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONTEXT & INTERVIEW MODE */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-6">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface text-center">
                Configure Profile Context & Audio Mode
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Profile Context Cards */}
                <div className="bg-surface rounded-xl p-5 border border-outline-variant/35 shadow-sm space-y-4">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">Experience & Profile Context</h4>
                  
                  <div className="flex flex-col gap-3">
                    <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={resumeBased}
                        onChange={(e) => {
                          setResumeBased(e.target.checked);
                          if (e.target.checked) setUseJobDescription(false);
                        }}
                        className="rounded border-outline-variant text-secondary focus:ring-secondary mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="font-label-sm text-xs font-bold text-on-surface">Use My Resume</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">Integrates your existing resume skills, experiences, and projects.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-lg border border-outline-variant/10 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useJobDescription}
                        onChange={(e) => {
                          setUseJobDescription(e.target.checked);
                          if (e.target.checked) setResumeBased(false);
                        }}
                        className="rounded border-outline-variant text-secondary focus:ring-secondary mt-0.5 cursor-pointer"
                      />
                      <div>
                        <p className="font-label-sm text-xs font-bold text-on-surface">Target Job Specifics</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">Focus questions on specific company name and job requirements.</p>
                      </div>
                    </label>
                  </div>

                  {useJobDescription && (
                    <div className="space-y-3 pt-2 animate-fade-in-up border-t border-outline-variant/20">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Company Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Google"
                            value={jobCompany}
                            onChange={(e) => setJobCompany(e.target.value)}
                            className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-secondary"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Job Title</label>
                          <input
                            type="text"
                            placeholder="e.g. AI Analyst"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-secondary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-on-surface-variant uppercase">Job Description / Skills Focus</label>
                        <textarea
                          placeholder="Paste details of the job description or primary tech stack required..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="w-full h-24 bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-secondary resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Configuration parameters */}
                <div className="bg-surface rounded-xl p-5 border border-outline-variant/35 shadow-sm space-y-4">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">Session Parameters</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Questions</label>
                      <select
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="5">5 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="15">15 Questions</option>
                        <option value="20">20 Questions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Duration</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full bg-surface border border-outline-variant rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                      >
                        <option value="10">10 Minutes</option>
                        <option value="15">15 Minutes</option>
                        <option value="20">20 Minutes</option>
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-outline-variant/20">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-2">Interviewer Mode</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'text', name: 'Text Interview', icon: 'keyboard', desc: 'Type answers manually' },
                        { id: 'voice', name: 'Voice Interview', icon: 'mic', desc: 'Real-time bidirectional speech' }
                      ].map(mode => (
                        <div
                          key={mode.id}
                          onClick={() => setFormat(mode.id)}
                          className={`p-3 rounded-lg border-2 text-center cursor-pointer hover:bg-surface-container-low transition-all ${
                            format === mode.id
                              ? 'border-secondary bg-surface-container-low font-semibold'
                              : 'border-outline-variant/20'
                          }`}
                        >
                          <span className="material-symbols-outlined text-secondary text-xl mb-1">{mode.icon}</span>
                          <p className="font-label-sm text-xs text-on-surface">{mode.name}</p>
                          <p className="text-[9px] text-on-surface-variant mt-0.5">{mode.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-lg border border-outline-variant font-label-sm text-xs cursor-pointer hover:bg-surface-container"
                >
                  Back
                </button>
                <button
                  onClick={handleStart}
                  disabled={submitting}
                  className="bg-secondary text-white px-8 py-2.5 rounded-lg font-label-sm text-xs font-bold hover:opacity-90 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Generating Questions...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      Start Mock Interview
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
