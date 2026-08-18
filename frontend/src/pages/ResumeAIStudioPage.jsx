import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { exportResumePDF } from "../utils/exportResumePDF";
import ResumePreview from "../components/ResumePreview";

const API = "/api/v1/resume/ai";
const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  localStorage.getItem("careerai_token") ||
  "";

async function apiPost(endpoint, body) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || data.message || `API error ${res.status}`);
  }
  return data;
}

function ScoreRing({ score, size = 88, stroke = 8, color = "#EC4899" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />
    </svg>
  );
}

function ScoreBar({ label, value, color = "#EC4899" }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] font-semibold">
        <span className="text-gray-600">{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ToolCard({ icon, title, description, features, buttonLabel, accent = "#EC4899", onClick, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="relative bg-white border border-gray-100 rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:border-pink-100"
      style={{ boxShadow: hovered ? `0 8px 32px ${accent}18` : undefined }}
    >
      {badge && (
        <span
          className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 rounded-full text-white"
          style={{ background: accent }}
        >
          {badge}
        </span>
      )}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${accent}15` }}>
        <span className="material-symbols-outlined text-xl" style={{ color: accent }}>
          {icon}
        </span>
      </div>
      <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">{title}</h3>
      <p className="text-[12px] text-gray-500 leading-relaxed mb-4">{description}</p>
      {features && (
        <ul className="space-y-1 mb-5">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-[11px] text-gray-500">
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: accent }} />
              {f}
            </li>
          ))}
        </ul>
      )}
      <button
        className="w-full py-2 rounded-xl text-[12px] font-bold text-white transition-opacity hover:opacity-90"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function LoadingState({ steps, currentStep }) {
  return (
    <div className="flex flex-col items-center py-16 gap-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#FF8A3D] flex items-center justify-center shadow-lg">
        <span className="material-symbols-outlined text-white text-3xl animate-spin" style={{ animationDuration: "2s" }}>
          auto_awesome
        </span>
      </div>
      <div className="text-center">
        <p className="font-bold text-gray-800 text-lg mb-1">AI is working on your request...</p>
        <p className="text-gray-500 text-sm">{steps[currentStep] || "Processing with Gemini..."}</p>
      </div>
      <div className="w-full max-w-sm space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${i < currentStep
                ? "bg-green-500"
                : i === currentStep
                  ? "bg-[#EC4899] animate-pulse"
                  : "bg-gray-200"
                }`}
            >
              {i < currentStep ? (
                <span className="material-symbols-outlined text-white" style={{ fontSize: 12 }}>
                  check
                </span>
              ) : i === currentStep ? (
                <span className="w-2 h-2 bg-white rounded-full block" />
              ) : null}
            </div>
            <span className={i <= currentStep ? "text-gray-800 font-bold" : "text-gray-400"}>
              {i === currentStep ? "✨ " : ""}{step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResumeAIStudioPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [bulletInput, setBulletInput] = useState("");
  const [bulletMode, setBulletMode] = useState("professional");
  const [tailoredResume, setTailoredResume] = useState(null);

  // Chat Drawer State
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your AI Resume Assistant. Ask me anything about your active resume, ATS optimization, or missing skills!",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const [recentActivity, setRecentActivity] = useState([]);
  const [savedResumesList, setSavedResumesList] = useState([]);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await apiClient.get('/resumes');
        if (Array.isArray(res.data)) {
          setSavedResumesList(res.data);
        }
      } catch (e) {
        // Unauthenticated or network issue
      }
    };
    fetchResumes();
  }, []);

  const saveActivity = (type, detail, extra = {}) => {
    const entry = { id: Date.now(), type, detail, extra, createdAt: new Date().toISOString() };
    setRecentActivity((prev) => [entry, ...prev].slice(0, 8));
  };

  const simulateLoading = async (steps) => {
    setLoadingSteps(steps);
    setLoadingStep(0);
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 300));
      setLoadingStep(i + 1);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);
    setActiveTool(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const headers = {};
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API}/upload`, { method: "POST", headers, body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.message || "Could not process file upload.");
      }
      if (data.resume_data) {
        setResumeData(data.resume_data);
        setResumeName(data.resume_data.personal?.fullName || file.name);
        sessionStorage.setItem("careerai_ai_session", JSON.stringify(data.resume_data));
      } else {
        setError(data.message || "Could not extract resume data from file.");
      }
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleImportSaved = (entry) => {
    const d = entry.data || entry;
    const fName = d.full_name || `${d.firstName || ""} ${d.lastName || ""}`.trim() || d.title || "My Resume";
    const converted = {
      personal: {
        fullName: fName,
        title: d.title || "",
        email: d.email || "",
        phone: d.phone || "",
        location: d.location || "",
        linkedin: d.linkedin || "",
        github: d.github || "",
        portfolio: d.portfolio || "",
        profileImage: d.profile_image || "",
      },
      summary: d.summary || "",
      experience: Array.isArray(d.experience || d.experiences)
        ? (d.experience || d.experiences).map((e, i) => ({
            id: String(e.id || i + 1),
            company: e.company || "",
            position: e.position || e.role || "",
            location: e.location || "",
            startDate: e.start_date || e.startDate || e.period?.split(" - ")[0] || "",
            endDate: e.end_date || e.endDate || e.period?.split(" - ")[1] || "",
            description: Array.isArray(e.bullets) ? e.bullets.join("\n") : (e.description || ""),
          }))
        : [],
      education: Array.isArray(d.education)
        ? d.education.map((edu, i) => ({
            id: String(edu.id || i + 1),
            institution: edu.institution || edu.school || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.field_of_study || edu.fieldOfStudy || "",
            startDate: edu.start_date || edu.startDate || edu.period?.split(" - ")[0] || "",
            endDate: edu.end_date || edu.endDate || edu.period?.split(" - ")[1] || "",
          }))
        : [],
      skills: Array.isArray(d.skills)
        ? d.skills.map((s, i) => ({
            id: String(s.id || i + 1),
            name: typeof s === 'string' ? s : (s.name || ''),
            category: s.category || "Other"
          })).filter(s => s.name)
        : (typeof d.skills === 'object' && d.skills !== null)
          ? Object.values(d.skills)
              .flatMap((v, ci) =>
                (typeof v === 'string' ? v.split(",") : []).map((s, i) => ({ id: String(ci * 20 + i), name: s.trim(), category: "Other" }))
              )
              .filter((s) => s.name)
          : [],
      projects: Array.isArray(d.projects) ? d.projects : [],
      certifications: Array.isArray(d.certifications) ? d.certifications : [],
      achievements: Array.isArray(d.achievements) ? d.achievements : [],
    };
    setResumeData(converted);
    setResumeName(fName);
    setResult(null);
    setActiveTool(null);
  };

  const handleClearResume = () => {
    setResumeData(null);
    setResumeName("");
    setResult(null);
    setActiveTool(null);
    sessionStorage.removeItem("careerai_ai_session");
  };

  const runTool = async (toolId, steps, endpoint, body, extraFn) => {
    setActiveTool(toolId);
    setLoading(true);
    setResult(null);
    setError("");
    await simulateLoading(steps);
    try {
      const data = await apiPost(endpoint, body);
      if (extraFn) extraFn(data);
      setResult({ tool: toolId, data });
    } catch (err) {
      setError(err.message || "AI operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const runAnalyze = () =>
    runTool(
      "analyze",
      [
        "Parsing resume structure",
        "Evaluating content & summary impact",
        "Checking experience bullet strength",
        "Identifying strengths & weaknesses",
        "Formulating tailored recommendations",
      ],
      "/analyze-resume",
      { resume_data: resumeData },
      (d) => saveActivity("Resume Analysis", resumeName, { score: d.overall_score })
    );

  const runATS = () =>
    runTool(
      "ats",
      [
        "Parsing section headings",
        "Calculating keyword density",
        "Checking readability & formatting",
        "Estimating ATS score",
      ],
      "/ats-analysis",
      { resume_data: resumeData, job_description: jobDescription },
      (d) => saveActivity("ATS Score", resumeName, { score: d.ats_score })
    );

  const runImprove = () =>
    runTool(
      "improve",
      [
        "Analyzing text clarity & grammar",
        "Strengthening action verbs",
        "Refining sentence structure",
        "Finalizing proofread version",
      ],
      "/improve-resume",
      { resume_data: resumeData },
      () => saveActivity("Resume Improved", resumeName, {})
    );

  const runJobMatch = () =>
    runTool(
      "match",
      [
        "Parsing target job description",
        "Comparing existing vs missing skills",
        "Analyzing keyword overlap",
        "Calculating match scores",
      ],
      "/job-match",
      { resume_data: resumeData, job_description: jobDescription },
      (d) => saveActivity("Job Match", "Job Description", { score: d.overall_match })
    );

  const runTailor = () =>
    runTool(
      "tailor",
      [
        "Analyzing target JD requirements",
        "Rewriting summary for target role",
        "Prioritizing relevant skills",
        "Optimizing bullet phrasing",
        "Generating side-by-side diff",
      ],
      "/tailor-resume",
      { resume_data: resumeData, job_description: jobDescription },
      (d) => {
        setTailoredResume(d.tailored_resume);
        saveActivity("Resume Tailored", "Job Description", {});
      }
    );

  const runSkills = () =>
    runTool(
      "skills",
      [
        "Extracting current skills",
        "Comparing with target role benchmarks",
        "Categorizing skills gap",
        "Generating skill recommendations",
      ],
      "/skills-recommendations",
      { resume_data: resumeData, target_role: targetRole, job_description: jobDescription },
      () => saveActivity("Skills Analysis", targetRole || "Target Role", {})
    );

  const runBullet = () =>
    runTool(
      "bullet",
      [
        "Analyzing bullet structure",
        "Generating Professional, ATS, Technical, Achievement, & Concise versions",
        "Ensuring factual safety",
      ],
      "/improve-bullet",
      { bullet: bulletInput, mode: bulletMode },
      () => saveActivity("Bullet Improved", bulletInput.substring(0, 40), {})
    );

  const runGenerate = () =>
    runTool(
      "generate",
      [
        "Initializing Google Gemini 2.5 Pro",
        "Crafting targeted professional summary",
        "Structuring STAR-method achievements",
        "Curating technical stack & industry keywords",
        "Synthesizing complete ATS-optimized resume",
      ],
      "/generate-resume",
      { resume_data: resumeData || {}, target_role: targetRole, user_profile: resumeData || {} },
      (d) => {
        if (d && d.resume_data) {
          setResumeData(d.resume_data);
          setResumeName(d.resume_data.personal?.fullName || targetRole || "AI Resume");
          sessionStorage.setItem("careerai_ai_session", JSON.stringify(d.resume_data));
        }
        saveActivity("Resume Generated", targetRole || "New Resume", {});
      }
    );

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newHistory = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newHistory);
    setChatLoading(true);

    try {
      const data = await apiPost("/chat", {
        message: userMsg,
        resume_data: resumeData || {},
        chat_history: newHistory,
      });
      setChatMessages([
        ...newHistory,
        {
          role: "assistant",
          content: data.reply || "I have analyzed your request.",
          followups: data.suggested_followups || [],
        },
      ]);
    } catch (err) {
      setChatMessages([
        ...newHistory,
        { role: "assistant", content: `Sorry, I ran into an issue: ${err.message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const TOOLS = [
    {
      id: "analyze",
      icon: "analytics",
      title: "Analyze Resume",
      accent: "#EC4899",
      description: "In-depth AI analysis of content quality, structure, strengths, weaknesses, and section scores.",
      features: ["Overall quality grade", "Section completeness", "Grammar & impact", "Actionable recommendations"],
      buttonLabel: "Analyze Resume",
      badge: "Gemini Pro",
      onClick: () => {
        if (resumeData) runAnalyze();
      },
    },
    {
      id: "ats",
      icon: "bar_chart",
      title: "ATS Score Analyzer",
      accent: "#0EA5E9",
      description: "Estimate ATS compatibility score, section structure, keyword density, and formatting issues.",
      features: ["AI-based ATS estimate", "Keyword optimization", "Readability rating", "Issue breakdown"],
      buttonLabel: "Check ATS Score",
      badge: "Gemini Flash",
      onClick: () => {
        if (resumeData) runATS();
      },
    },
    {
      id: "match",
      icon: "target",
      title: "Match Job Description",
      accent: "#3B82F6",
      description: "Compare your resume against a target job description and identify matching vs missing skills.",
      features: ["Overall match score", "Existing vs missing skills", "Keyword overlap", "Recommended keywords"],
      buttonLabel: "Analyze Job Match",
      badge: "Gemini Flash",
      onClick: () => setActiveTool("match-input"),
    },
    {
      id: "tailor",
      icon: "tune",
      title: "Tailor Resume",
      accent: "#F59E0B",
      description: "Generate a targeted version of your resume aligned with the job description without fabricating facts.",
      features: ["Role-specific summary", "Prioritized skills", "Side-by-side comparison", "Review before applying"],
      buttonLabel: "Tailor Resume",
      badge: "Gemini Pro",
      onClick: () => setActiveTool("tailor-input"),
    },
    {
      id: "generate",
      icon: "psychology",
      title: "Generate Resume",
      accent: "#10B981",
      description: "Create a complete, role-targeted resume from your profile details for any engineering or data role.",
      features: ["Target role selection", "Full resume generation", "Structured JSON output", "One-click export"],
      buttonLabel: "Generate Resume",
      badge: "Gemini Pro",
      onClick: () => setActiveTool("generate-input"),
    },
    {
      id: "skills",
      icon: "lightbulb",
      title: "Skills Recommendations",
      accent: "#F97316",
      description: "Categorize your skills into Already Have, Missing, and Recommended for career progression.",
      features: ["Already Have skills", "Missing required skills", "Recommended complimentary skills", "Priority list"],
      buttonLabel: "Analyze Skills",
      badge: "Gemini Flash",
      onClick: () => {
        if (resumeData) runSkills();
      },
    },
    {
      id: "bullet",
      icon: "edit_note",
      title: "Improve Bullet Points",
      accent: "#6366F1",
      description: "Generate 5 improved versions (Professional, ATS, Technical, Achievement-Focused, Concise) of any bullet point.",
      features: ["5 unique versions", "Action verb emphasis", "No fabricated metrics", "One-click copy"],
      buttonLabel: "Improve a Bullet",
      badge: "Gemini Flash",
      onClick: () => setActiveTool("bullet-input"),
    },
    {
      id: "improve",
      icon: "auto_awesome",
      title: "Improve Resume",
      accent: "#8B5CF6",
      description: "Fix grammar, spelling, and sentence phrasing while preserving all factual data.",
      features: ["Grammar & spelling fix", "Clarity enhancement", "Review suggested diffs", "Safe apply"],
      buttonLabel: "Improve Resume",
      badge: "Gemini Flash",
      onClick: () => {
        if (resumeData) runImprove();
      },
    },
  ];

  const accentFor = (id) => TOOLS.find((t) => t.id === id)?.accent || "#EC4899";
  const isToolInput = ["match-input", "tailor-input", "bullet-input", "generate-input"].includes(activeTool);

  const renderToolInput = () => {
    const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2";
    if (activeTool === "match-input")
      return (
        <ToolInputPanel
          title="Match Job Description"
          icon="target"
          accent="#3B82F6"
          onBack={() => setActiveTool(null)}
          onRun={runJobMatch}
          runLabel="Analyze Job Match"
          canRun={!!jobDescription.trim() && !!resumeData}
        >
          <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Paste Target Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste full job description here..."
            className={`${inputClass} focus:ring-blue-200`}
          />
        </ToolInputPanel>
      );
    if (activeTool === "tailor-input")
      return (
        <ToolInputPanel
          title="Tailor Resume"
          icon="tune"
          accent="#F59E0B"
          onBack={() => setActiveTool(null)}
          onRun={runTailor}
          runLabel="Tailor My Resume"
          canRun={!!jobDescription.trim() && !!resumeData}
        >
          <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Paste Target Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            placeholder="Paste full job description here..."
            className={`${inputClass} focus:ring-amber-200`}
          />
        </ToolInputPanel>
      );
    if (activeTool === "bullet-input")
      return (
        <ToolInputPanel
          title="Improve Bullet Points"
          icon="edit_note"
          accent="#6366F1"
          onBack={() => setActiveTool(null)}
          onRun={runBullet}
          runLabel="Improve Bullet Point"
          canRun={!!bulletInput.trim()}
        >
          <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Original Bullet Point</label>
          <textarea
            value={bulletInput}
            onChange={(e) => setBulletInput(e.target.value)}
            rows={3}
            placeholder="e.g. Worked on an internship management system."
            className={`${inputClass} focus:ring-indigo-200 mb-4`}
          />
        </ToolInputPanel>
      );
    if (activeTool === "generate-input")
      return (
        <ToolInputPanel
          title="Generate Resume with Google AI"
          icon="auto_awesome"
          accent="#10B981"
          onBack={() => setActiveTool(null)}
          onRun={runGenerate}
          runLabel="✨ Generate Full Resume"
          canRun={!!targetRole.trim()}
        >
          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Target Professional Role</label>
              <input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer, Cloud Architect..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Popular Role Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Senior Full Stack Engineer",
                  "AI / ML Research Engineer",
                  "Staff Cloud Architect",
                  "Product Engineering Lead",
                  "Quantitative Data Scientist",
                  "Cybersecurity & DevSecOps Lead",
                  "Principal Frontend Engineer",
                  "Autonomous Robotics Engineer",
                ].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTargetRole(r)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                      targetRole === r
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                        : "border-gray-200 text-gray-600 hover:bg-emerald-50 hover:border-emerald-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ToolInputPanel>
      );
    return null;
  };

  const renderResult = () => {
    if (!result) return null;
    const { tool, data } = result;
    const accent = accentFor(tool);

    // For single bullet point helper, we don't need a full resume document on the right
    if (tool === "bullet") {
      return <BulletResult data={data} accent={accent} />;
    }

    // Determine the tailored resume data if generated
    let tailored = null;
    if (tool === "tailor") {
      tailored = tailoredResume;
    } else if (tool === "improve") {
      tailored = data.improved_resume_data;
    } else if (tool === "generate") {
      tailored = data.resume_data;
    }

    const handleApply = () => {
      let activeApplied = null;
      if (tool === "tailor" && tailoredResume) {
        activeApplied = tailoredResume;
      } else if (tool === "improve" && data.improved_resume_data) {
        activeApplied = data.improved_resume_data;
      } else if (tool === "generate" && data.resume_data) {
        activeApplied = data.resume_data;
      }

      if (activeApplied) {
        setResumeData(activeApplied);

        // Persist to Supabase PostgreSQL backend
        try {
          const p = activeApplied.personal || {};
          const fName = p.fullName || activeApplied.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'My Resume';
          apiClient.post('/resumes', {
            title: fName,
            template: '4',
            full_name: fName,
            email: p.email || activeApplied.email || '',
            phone: p.phone || activeApplied.phone || '',
            location: p.location || activeApplied.location || '',
            linkedin: p.linkedin || activeApplied.linkedin || '',
            github: p.github || activeApplied.github || '',
            portfolio: p.portfolio || activeApplied.portfolio || '',
            summary: activeApplied.summary || p.summary || ''
          }).then((res) => {
            window.dispatchEvent(new CustomEvent('careerai:resume-saved'));
            const newId = res.data?.id;
            navigate(newId ? `/resume/builder?id=${newId}` : "/resume/builder");
          }).catch(() => {
            navigate("/resume/builder");
          });
        } catch {
          navigate("/resume/builder");
        }
        return;
      }
      setResult(null);
      setActiveTool(null);
    };

    return (
      <ResumeAIResultLayout
        tool={tool}
        data={data}
        originalResume={resumeData}
        tailoredResume={tailored}
        onApply={handleApply}
        onBack={() => {
          setResult(null);
          setActiveTool(null);
        }}
        navigate={navigate}
      />
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50 relative">
      <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileUpload} className="hidden" />

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 lg:px-10 py-5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EC4899] to-[#FF8A3D] flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">auto_awesome</span>
                </div>
                <h1 className="text-xl font-black text-gray-900">AI Studio</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  Google Gemini Powered
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Model-routed intelligence for resume parsing, analysis, ATS optimization, and tailoring.
              </p>
              {resumeData ? (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-[11px] text-gray-500 font-medium">
                    Working on: <span className="text-gray-800 font-bold">{resumeName || "My Resume"}</span>
                  </span>
                  <button
                    onClick={handleClearResume}
                    className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-red-500 transition-colors ml-1 font-semibold"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                      close
                    </span>
                    Change
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[11px] text-amber-700 font-medium">
                    No resume selected — Upload or select a resume to get started.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {resumeData && (
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">chat</span>
                  AI Assistant
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-[#EC4899] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 shadow-sm shadow-pink-200"
              >
                <span className="material-symbols-outlined text-sm">{uploading ? "hourglass_empty" : "upload_file"}</span>
                {uploading ? "Uploading..." : "Upload Resume"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 lg:px-10 py-8 max-w-6xl mx-auto w-full">
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <span className="material-symbols-outlined text-red-500">error</span>
            {error}
            <button onClick={() => setError("")} className="ml-auto">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {loading && <LoadingState steps={loadingSteps} currentStep={loadingStep} />}

        {!loading && isToolInput && renderToolInput()}

        {!loading && !error && result && !isToolInput && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-gray-900 text-lg">AI Results</h2>
              <button
                onClick={() => {
                  setResult(null);
                  setActiveTool(null);
                }}
                className="text-[12px] text-gray-500 hover:text-gray-800 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Tools
              </button>
            </div>
            {renderResult()}
          </div>
        )}

        {!loading && !error && !isToolInput && !result && !resumeData && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#EC4899]/10 to-[#FF8A3D]/10 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-[#EC4899]">auto_awesome</span>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Your AI Resume Assistant is Ready</h2>
            <p className="text-gray-500 text-sm max-w-md mb-8">
              Upload an existing resume (PDF, DOCX, TXT) or choose a saved resume to start using AI Studio.
            </p>
            <div className="flex gap-3 flex-wrap justify-center mb-10">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-[#EC4899] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 shadow-md shadow-pink-200"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>Upload Resume (PDF / DOCX)
              </button>
              <Link
                to="/resume/builder"
                className="flex items-center gap-2 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-sm">edit_note</span>Create Resume
              </Link>
            </div>

            {savedResumesList.length > 0 && (
              <div className="w-full max-w-lg text-left">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-gray-100" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">or choose a saved resume</span>
                  <div className="h-px flex-1 bg-gray-100" />
                </div>
                <div className="space-y-2">
                  {savedResumesList.slice(0, 4).map((entry) => {
                    const name = `${entry.data?.firstName || ""} ${entry.data?.lastName || ""}`.trim() || "Resume";
                    const date = new Date(entry.savedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    return (
                      <button
                        key={entry.id}
                        onClick={() => handleImportSaved(entry)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-xl hover:border-[#EC4899]/30 hover:shadow-md transition-all text-left group"
                      >
                        <div className="w-8 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[#EC4899] text-sm">description</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-gray-800 truncate">{name}</p>
                          <p className="text-[11px] text-[#EC4899]">
                            {entry.template} template · {date}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 group-hover:text-[#EC4899] transition-colors text-sm">
                          arrow_forward
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !error && !isToolInput && !result && resumeData && (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-black text-gray-900 mb-1">What do you want to do?</h2>
              <p className="text-sm text-gray-500">Choose an AI-powered tool to analyze or enhance your resume.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
              {TOOLS.map((tool) => (
                <ToolCard key={tool.id} {...tool} />
              ))}
            </div>
            {recentActivity.length > 0 && (
              <div>
                <h2 className="text-base font-black text-gray-900 mb-4">Recent AI Activity</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentActivity.map((a) => (
                    <div key={a.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-6 h-6 rounded-lg bg-[#EC4899]/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#EC4899]" style={{ fontSize: 13 }}>
                            auto_awesome
                          </span>
                        </span>
                        <span className="text-[12px] font-bold text-gray-800">{a.type}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mb-1">{a.detail}</p>
                      {a.extra?.score && <p className="text-[11px] font-semibold text-[#EC4899]">Score: {a.extra.score}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* AI Chat Side Drawer */}
      {showChat && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200">
          <div className="px-5 py-4 bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
              <div>
                <h3 className="font-bold text-sm">Resume AI Assistant</h3>
                <p className="text-[10px] text-purple-200">Context aware of active resume</p>
              </div>
            </div>
            <button onClick={() => setShowChat(false)} className="text-purple-200 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                    }`}
                >
                  {msg.content}
                </div>
                {msg.followups && msg.followups.length > 0 && (
                  <div className="mt-2 space-y-1 max-w-[85%]">
                    {msg.followups.map((f, fi) => (
                      <button
                        key={fi}
                        onClick={() => {
                          setChatInput(f);
                        }}
                        className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full text-left hover:bg-purple-100 block w-full"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400 italic">
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                Gemini is thinking...
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChatMessage()}
              placeholder="Ask about your resume..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <button
              onClick={handleSendChatMessage}
              disabled={!chatInput.trim() || chatLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolInputPanel({ title, icon, accent, onBack, onRun, runLabel, canRun, children }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
          <span className="material-symbols-outlined" style={{ color: accent }}>
            {icon}
          </span>
        </div>
        <h2 className="font-black text-gray-900 text-base">{title}</h2>
      </div>
      {children}
      <div className="flex gap-3 mt-5">
        <button onClick={onBack} className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={onRun}
          disabled={!canRun}
          className="flex-1 py-2 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: canRun ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : "#d1d5db" }}
        >
          {runLabel}
        </button>
      </div>
    </div>
  );
}

function AnalyzeResult({ data, accent }) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-8 flex-wrap">
        <div className="relative flex items-center justify-center">
          <ScoreRing score={data.overall_score || 0} size={96} color={accent} />
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black" style={{ color: accent }}>
              {data.overall_score}
            </span>
            <span className="text-[9px] text-gray-400 font-bold">/100</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black text-gray-900">{data.quality_grade || "B"}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Quality Grade</span>
          </div>
          <p className="text-sm text-gray-600 max-w-md">{data.summary_text}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.strengths?.length > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <h3 className="font-bold text-green-800 text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>Strengths
            </h3>
            <ul className="space-y-1.5">
              {data.strengths.map((s, i) => (
                <li key={i} className="text-[12px] text-green-700">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {data.weaknesses?.length > 0 && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <h3 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-sm">warning</span>Weaknesses
            </h3>
            <ul className="space-y-1.5">
              {data.weaknesses.map((s, i) => (
                <li key={i} className="text-[12px] text-red-700">
                  • {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {data.recommendations?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Recommendations</h3>
          {data.recommendations.map((r, i) => (
            <div key={i} className="flex gap-3 items-start mb-3">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${r.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
              >
                {r.priority?.toUpperCase()}
              </span>
              <div>
                <p className="text-[12px] font-semibold text-gray-800">{r.section}</p>
                <p className="text-[11px] text-gray-500">{r.action}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ATSResult({ data, accent, onFix }) {
  const scores = [
    ["Keyword Optimization", data.keyword_score || 0],
    ["Structure Completeness", data.structure_score || 0],
    ["Readability Rating", data.readability_score || 0],
    ["Section Completeness", data.section_completeness || 0],
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-8 flex-wrap">
        <div className="relative flex items-center justify-center">
          <ScoreRing score={data.ats_score || 0} size={96} color={accent} />
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black" style={{ color: accent }}>
              {data.ats_score}
            </span>
            <span className="text-[9px] text-gray-400 font-bold">ATS Score</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-100">
              {data.disclaimer || "AI-based ATS compatibility estimate"}
            </span>
          </div>
          <div className="space-y-2">
            {scores.map(([l, v]) => (
              <ScoreBar key={l} label={l} value={v} color={accent} />
            ))}
          </div>
        </div>
      </div>

      {data.issues?.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 text-sm mb-3">ATS Formatting & Keyword Issues</h3>
          {data.issues.map((issue, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] text-amber-700 mb-1">
              <span className="material-symbols-outlined text-sm text-amber-600">info</span>
              <b>{issue.section}:</b> {issue.issue}
            </div>
          ))}
        </div>
      )}

      {data.recommendations?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Fix Suggestions</h3>
          {data.recommendations.map((s, i) => (
            <div key={i} className="flex gap-2 text-[12px] mb-2">
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 h-fit ${s.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
              >
                {s.priority}
              </span>
              <span className="text-gray-600">
                <b className="text-gray-800">{s.section}:</b> {s.fix}
              </span>
            </div>
          ))}
          <button onClick={onFix} className="mt-3 px-5 py-2 bg-[#0EA5E9] text-white rounded-xl text-sm font-bold hover:opacity-90">
            Fix with AI
          </button>
        </div>
      )}
    </div>
  );
}

function ImproveResult({ data, onApply }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">AI Suggested Resume Proofread & Grammar Fixes</h3>
        <span className="text-[11px] bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-bold">
          Review Before Applying
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        The AI fixed grammar, spelling, and sentence clarity while preserving all your real experience and facts.
      </p>
      {data.changes_made?.length > 0 && (
        <div className="bg-purple-50 rounded-xl p-4 mb-4 space-y-1">
          {data.changes_made.map((c, i) => (
            <p key={i} className="text-[11px] text-purple-800">
              • <b>{c.section}:</b> {c.change}
            </p>
          ))}
        </div>
      )}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={onApply}
          className="flex items-center gap-2 px-5 py-2 bg-[#8B5CF6] text-white rounded-xl text-sm font-bold hover:opacity-90"
        >
          <span className="material-symbols-outlined text-sm">check</span>Apply Proofread Changes
        </button>
      </div>
    </div>
  );
}

function JobMatchResult({ data, accent }) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center gap-8 flex-wrap">
        <div className="relative flex items-center justify-center">
          <ScoreRing score={data.overall_match || 0} size={96} color={accent} />
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black" style={{ color: accent }}>
              {data.overall_match}%
            </span>
            <span className="text-[9px] text-gray-400 font-bold">Match</span>
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <p className="font-bold text-gray-900 mb-2">Job Description Match Analysis</p>
          <div className="space-y-2">
            {[
              ["Skills Match", data.skills_match],
              ["Keyword Match", data.keyword_match],
              ["Experience Match", data.experience_match],
              ["Education Match", data.education_match],
            ].map(([l, v]) => (
              <ScoreBar key={l} label={l} value={v || 0} color={accent} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
          <h3 className="font-bold text-green-800 text-sm mb-3">Existing Skills (In Resume)</h3>
          <div className="flex flex-wrap gap-1.5">
            {(data.matching_skills || []).map((s, i) => (
              <span key={i} className="text-[11px] bg-white border border-green-200 text-green-700 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <h3 className="font-bold text-red-800 text-sm mb-3">Missing Skills (Required)</h3>
          <div className="flex flex-wrap gap-1.5">
            {(data.missing_skills || []).map((s, i) => (
              <span key={i} className="text-[11px] bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
          <h3 className="font-bold text-amber-800 text-sm mb-3">Suggested Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {(data.suggested_skills || []).map((s, i) => (
              <span key={i} className="text-[11px] bg-white border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {data.recommendations?.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h3 className="font-bold text-gray-800 text-sm mb-3">Match Recommendations</h3>
          {data.recommendations.map((r, i) => (
            <p key={i} className="text-[12px] text-gray-600 mb-1.5">
              • {r}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function TailorResult({ data, tailored, original, onApply }) {
  const [view, setView] = useState("tailored");
  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <h3 className="font-bold text-gray-800 flex-1">Tailored Resume Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setView("original")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border ${view === "original" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600"
                }`}
            >
              Original
            </button>
            <button
              onClick={() => setView("tailored")}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border ${view === "tailored" ? "bg-amber-500 text-white border-amber-500" : "border-gray-200 text-gray-600"
                }`}
            >
              Tailored
            </button>
          </div>
        </div>

        {data.changes?.length > 0 && (
          <div className="bg-amber-50 rounded-xl p-4 mb-4">
            <p className="text-[11px] font-bold text-amber-700 mb-2">Section Changes Made:</p>
            {data.changes.map((c, i) => (
              <p key={i} className="text-[11px] text-amber-700">
                • <b>{c.section}:</b> {c.change}
              </p>
            ))}
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 max-h-48 overflow-y-auto text-[12px] text-gray-700 leading-relaxed font-mono">
          {view === "tailored"
            ? tailored?.summary || "Tailored summary."
            : original?.summary || "Original summary."}
        </div>

        <div className="flex gap-3 mt-4 flex-wrap">
          <button
            onClick={onApply}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white rounded-xl text-sm font-bold hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm">check</span>Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function SkillsResult({ data }) {
  const cats = [
    { key: "existing_skills", label: "Already Have", icon: "check_circle", color: "#10B981", bg: "bg-green-50", border: "border-green-100" },
    { key: "missing_skills", label: "Missing Required", icon: "warning", color: "#EF4444", bg: "bg-red-50", border: "border-red-100" },
    { key: "recommended_skills", label: "Recommended", icon: "star", color: "#F59E0B", bg: "bg-amber-50", border: "border-amber-100" },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cats.map((cat) => (
        <div key={cat.key} className={`${cat.bg} border ${cat.border} rounded-2xl p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-sm" style={{ color: cat.color }}>
              {cat.icon}
            </span>
            <h3 className="font-bold text-gray-800 text-sm flex-1">{cat.label}</h3>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white" style={{ color: cat.color }}>
              {(data[cat.key] || []).length}
            </span>
          </div>
          <div className="space-y-2">
            {(data[cat.key] || []).map((s, i) => (
              <div key={i} className="bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-bold text-gray-800">{s.name}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${cat.color}20`, color: cat.color }}>
                    {s.importance || "medium"}
                  </span>
                </div>
                {s.reason && <p className="text-[10px] text-gray-500">{s.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BulletResult({ data, accent }) {
  const [copied, setCopied] = useState(null);
  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  const versions = data.improved || [
    { version: "Professional", text: data.professional },
    { version: "ATS Friendly", text: data.ats_friendly },
    { version: "Technical", text: data.technical },
    { version: "Achievement-Focused", text: data.achievement_focused },
    { version: "Concise", text: data.concise },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-[11px] font-bold text-gray-500 mb-1">Original Bullet</p>
        <p className="text-sm text-gray-700 italic">"{data.original}"</p>
      </div>

      {versions.map((v, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full text-white" style={{ background: accent }}>
              {v.version}
            </span>
            <button onClick={() => copy(v.text, i)} className="text-[11px] text-gray-500 hover:text-gray-800 flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                {copied === i ? "check" : "content_copy"}
              </span>
              {copied === i ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-sm text-gray-800 font-medium mb-1">"{v.text}"</p>
          {v.explanation && <p className="text-[11px] text-gray-500">{v.explanation}</p>}
        </div>
      ))}
    </div>
  );
}



/* ─── Responsive A4 Modal Preview Wrapper ──────────────────────────── */
function ModalPreviewWrapper({ templateId, resumeData }) {
  const containerRef = React.useRef(null);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const targetWidth = containerWidth - 48; // 24px padding on each side
      const finalWidth = Math.min(targetWidth, 760);
      const newScale = finalWidth / 800;
      setScale(Math.max(0.3, newScale));
    };

    updateSize();
    const timer = setTimeout(updateSize, 50);
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-100 flex justify-center items-start min-h-[500px]"
    >
      <div
        className="shadow-xl bg-white flex-shrink-0"
        style={{
          width: '800px',
          height: '1131px',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: `${Math.round(1131 * (scale - 1))}px`
        }}
      >
        <ResumePreview resumeData={resumeData} templateId={templateId} scale={100} />
      </div>
    </div>
  );
}

/* ─── Premium Two-Column Resume Result Layout ─────────────────────── */
function ResumeAIResultLayout({
  tool,
  data,
  originalResume,
  tailoredResume,
  onApply,
  onBack,
  navigate
}) {
  const [view, setView] = useState(tailoredResume ? "tailored" : "original");
  const [zoom, setZoom] = useState(30);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  // Zoom controls
  const zoomIn = () => setZoom(z => Math.min(100, z + 5));
  const zoomOut = () => setZoom(z => Math.max(20, z - 5));

  const activeResumeData = view === "tailored" ? tailoredResume : originalResume;
  const activeTemplateId = localStorage.getItem("careerai_template_id") || "modern";

  const renderLeftContent = () => {
    switch (tool) {
      case "analyze":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-pink-50/50 p-4 border border-pink-100/50 rounded-2xl">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={data.overall_score || 0} size={72} stroke={6} color="#EC4899" />
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-pink-600">{data.overall_score}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-lg font-black text-gray-900">{data.quality_grade || "B"}</span>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Quality Grade</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{data.summary_text}</p>
              </div>
            </div>

            <div className="space-y-3">
              {data.strengths?.length > 0 && (
                <div className="bg-green-50/60 border border-green-100/50 rounded-xl p-4">
                  <h4 className="font-bold text-green-800 text-[11px] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span> Strengths
                  </h4>
                  <ul className="space-y-1">
                    {data.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-green-700">• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {data.weaknesses?.length > 0 && (
                <div className="bg-red-50/60 border border-red-100/50 rounded-xl p-4">
                  <h4 className="font-bold text-red-800 text-[11px] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-red-500 text-sm">warning</span> Weaknesses
                  </h4>
                  <ul className="space-y-1">
                    {data.weaknesses.map((w, i) => (
                      <li key={i} className="text-xs text-red-700">• {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {data.recommendations?.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">Recommendations</h4>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {data.recommendations.map((r, i) => (
                    <div key={i} className="flex gap-2.5 items-start">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase shrink-0 ${r.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                        {r.priority}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{r.section}</p>
                        <p className="text-[11px] text-gray-500 leading-normal">{r.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "ats":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-sky-50/50 p-4 border border-sky-100/50 rounded-2xl">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={data.ats_score || 0} size={72} stroke={6} color="#0EA5E9" />
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-sky-600">{data.ats_score}</span>
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-100 block w-fit mb-1">
                  ATS Score Analysis
                </span>
                <p className="text-xs text-gray-500 line-clamp-2">{data.disclaimer || "Compatibility estimate"}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <ScoreBar label="Keyword Optimization" value={data.keyword_score || 0} color="#0EA5E9" />
              <ScoreBar label="Structure Completeness" value={data.structure_score || 0} color="#0EA5E9" />
              <ScoreBar label="Readability Rating" value={data.readability_score || 0} color="#0EA5E9" />
              <ScoreBar label="Section Completeness" value={data.section_completeness || 0} color="#0EA5E9" />
            </div>

            {data.issues?.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-100/50 rounded-xl p-4">
                <h4 className="font-bold text-amber-800 text-[11px] mb-2 uppercase tracking-wider">Formatting & Keywords</h4>
                <div className="space-y-1.5">
                  {data.issues.map((issue, i) => (
                    <div key={i} className="flex gap-2 text-xs text-amber-700 leading-normal">
                      <span className="material-symbols-outlined text-sm text-amber-600 shrink-0">info</span>
                      <p><b>{issue.section}:</b> {issue.issue}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "match":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-blue-50/50 p-4 border border-blue-100/50 rounded-2xl">
              <div className="relative flex items-center justify-center">
                <ScoreRing score={data.overall_match || 0} size={72} stroke={6} color="#3B82F6" />
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black text-blue-600">{data.overall_match}%</span>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-xs">Job Description Match</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Resume suitability for target role</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-2.5">
              <ScoreBar label="Skills Match" value={data.skills_match || 0} color="#3B82F6" />
              <ScoreBar label="Keyword Match" value={data.keyword_match || 0} color="#3B82F6" />
              <ScoreBar label="Experience Match" value={data.experience_match || 0} color="#3B82F6" />
              <ScoreBar label="Education Match" value={data.education_match || 0} color="#3B82F6" />
            </div>

            <div className="space-y-3">
              {data.matching_skills?.length > 0 && (
                <div className="bg-green-50/60 border border-green-100/50 rounded-xl p-4">
                  <h4 className="font-bold text-green-800 text-[11px] mb-2 uppercase tracking-wider">Matching Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.matching_skills.map((s, i) => (
                      <span key={i} className="text-[10px] bg-white border border-green-200 text-green-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.missing_skills?.length > 0 && (
                <div className="bg-red-50/60 border border-red-100/50 rounded-xl p-4">
                  <h4 className="font-bold text-red-800 text-[11px] mb-2 uppercase tracking-wider">Missing Required Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {data.missing_skills.map((s, i) => (
                      <span key={i} className="text-[10px] bg-white border border-red-200 text-red-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case "tailor":
      case "improve":
        const changes = data.changes || data.changes_made || [];
        return (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-4">
              <h4 className="font-black text-gray-900 text-sm mb-1">AI Proofread Complete</h4>
              <p className="text-xs text-gray-500 leading-normal">
                {tool === "tailor"
                  ? "Generated a role-targeted version of your resume aligned with target description."
                  : "Fixed grammar, spelling, and phrasing while keeping experience details accurate."}
              </p>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-gray-800 text-[11px] uppercase tracking-wider">Changes Made</h4>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {changes.map((c, i) => {
                  const isExpanded = expandedSection === i;

                  let beforeText = "Original content.";
                  let afterText = "Tailored content.";
                  const sectionKey = c.section?.toLowerCase();

                  if (sectionKey?.includes("summary") || sectionKey?.includes("profile")) {
                    beforeText = originalResume?.summary || "No original summary.";
                    afterText = tailoredResume?.summary || "No tailored summary.";
                  } else if (sectionKey?.includes("skills")) {
                    beforeText = (originalResume?.skills || []).map(s => s.name).join(", ") || "No skills listed.";
                    afterText = (tailoredResume?.skills || []).map(s => s.name).join(", ") || "No skills listed.";
                  } else if (sectionKey?.includes("experience") || sectionKey?.includes("work")) {
                    beforeText = (originalResume?.experience || []).map(e => `${e.position} at ${e.company}`).join("\n• ") || "No experience listed.";
                    afterText = (tailoredResume?.experience || []).map(e => `${e.position} at ${e.company}`).join("\n• ") || "No experience listed.";
                  } else if (sectionKey?.includes("education")) {
                    beforeText = (originalResume?.education || []).map(e => `${e.degree} at ${e.institution}`).join("\n• ") || "No education listed.";
                    afterText = (tailoredResume?.education || []).map(e => `${e.degree} at ${e.institution}`).join("\n• ") || "No education listed.";
                  } else if (sectionKey?.includes("project")) {
                    beforeText = (originalResume?.projects || []).map(p => p.name).join("\n• ") || "No projects listed.";
                    afterText = (tailoredResume?.projects || []).map(p => p.name).join("\n• ") || "No projects listed.";
                  }

                  return (
                    <div key={i} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <button
                        onClick={() => setExpandedSection(isExpanded ? null : i)}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gray-50 text-left hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#EC4899] text-sm">check_circle</span>
                          {c.section}
                        </span>
                        <span className="material-symbols-outlined text-gray-400 text-sm">
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-white space-y-2.5 border-t border-gray-100 text-[11px] leading-relaxed">
                          <p className="text-purple-700 font-semibold">{c.change}</p>
                          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-gray-50">
                            <div>
                              <p className="font-bold text-gray-400 uppercase text-[9px] mb-0.5">Before</p>
                              <div className="bg-red-50/50 p-2 border border-red-100/30 rounded text-gray-600 whitespace-pre-line max-h-24 overflow-y-auto">{beforeText}</div>
                            </div>
                            <div>
                              <p className="font-bold text-gray-400 uppercase text-[9px] mb-0.5">After</p>
                              <div className="bg-green-50/50 p-2 border border-green-100/30 rounded text-gray-800 font-medium whitespace-pre-line max-h-24 overflow-y-auto">{afterText}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case "skills":
        return <SkillsResult data={data} />;

      case "generate":
        return (
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-800 text-sm mb-2">Targeted Resume Generated</h3>
              <p className="text-xs text-gray-600 mb-1"><b>Target Role:</b> {data.target_role}</p>
              <p className="text-xs text-gray-600">Generated personal details and structural matching templates for this profile.</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-800">
              <p>Press <b>✓ Apply Tailored Resume</b> to load this generated design structure into the builder dashboard.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
      {/* Left Column — Analysis & Details */}
      <div className="lg:col-span-5 space-y-6">
        {renderLeftContent()}

        {/* Unified Bottom Action */}
        {tailoredResume && (
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Ready to Edit?</p>
              <p className="text-xs text-gray-500">Apply this tailored layout and open in Resume Editor.</p>
            </div>
            <button
              onClick={onApply}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer animate-pulse"
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Open in Resume Editor
            </button>
          </div>
        )}
      </div>

      {/* Right Column — Actual Resume Preview */}
      <div className="lg:col-span-7 space-y-4">
        {/* Toggle and Zoom Toolbar */}
        <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex items-center justify-between flex-wrap gap-3">
          {/* Toggle */}
          <div className="flex gap-1 bg-gray-50 p-1 border border-gray-200/50 rounded-lg">
            <button
              onClick={() => setView("original")}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${view === "original"
                ? "bg-white text-gray-800 shadow-sm border border-gray-200/30"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              Original
            </button>
            {tailoredResume && (
              <button
                onClick={() => setView("tailored")}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${view === "tailored"
                  ? "bg-white text-[#EC4899] shadow-sm border border-[#EC4899]/15"
                  : "text-gray-500 hover:text-[#EC4899]"
                  }`}
              >
                Tailored
              </button>
            )}
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
            <button
              onClick={zoomOut}
              className="w-7 h-7 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm select-none">remove</span>
            </button>
            <span className="w-10 text-center select-none">{zoom}%</span>
            <button
              onClick={zoomIn}
              className="w-7 h-7 rounded border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm select-none">add</span>
            </button>
          </div>

          {/* Download & Open Full actions */}
          <div className="flex gap-2">
            <button
              onClick={() => exportResumePDF()}
              className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-colors shadow-sm bg-white cursor-pointer"
              title="Download PDF"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Download PDF
            </button>
            <button
              onClick={() => setShowFullPreview(true)}
              className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-gray-50 transition-colors shadow-sm bg-white cursor-pointer"
              title="Open Full Preview"
            >
              <span className="material-symbols-outlined text-sm">fullscreen</span>
              Full Preview
            </button>
          </div>
        </div>

        {/* Scrollable A4 Document Canvas Container */}
        <div className="bg-slate-100 border border-gray-200/50 rounded-2xl p-6 min-h-[550px] overflow-hidden flex justify-center items-start relative shadow-inner">
          <div
            className="transition-transform duration-200"
            style={{
              width: '800px',
              height: '1131px',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              marginBottom: `${Math.round(1131 * (zoom / 100 - 1))}px`
            }}
          >
            <ResumePreview resumeData={activeResumeData} templateId={activeTemplateId} scale={100} />
          </div>
        </div>
      </div>

      {/* Large Full Preview Modal Overlay */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col border border-outline-variant shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/40 shrink-0 bg-white">
              <div>
                <h3 className="font-bold text-on-surface text-base">Full Document Preview</h3>
                <p className="text-xs text-on-surface-variant">Reviewing {view} layout design</p>
              </div>
              <button
                onClick={() => setShowFullPreview(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <ModalPreviewWrapper resumeData={activeResumeData} templateId={activeTemplateId} />
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant/40 shrink-0 bg-white">
              <button
                onClick={() => setShowFullPreview(false)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
