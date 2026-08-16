import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';

function ScoreRing({ score, size = 88, stroke = 8, color = "#6366F1" }) {
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

function ScoreBar({ label, value, color = "#6366F1" }) {
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

function InterviewLoadingState({ currentStep }) {
  const steps = [
    "Evaluating your answer",
    "Checking technical accuracy",
    "Analyzing communication",
    "Comparing with expected concepts",
    "Preparing feedback"
  ];
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center py-16 gap-6 max-w-xl mx-auto w-full">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100">
        <span className="material-symbols-outlined text-white text-3xl animate-spin" style={{ animationDuration: "2.5s" }}>
          auto_awesome
        </span>
      </div>
      <div className="text-center">
        <p className="font-extrabold text-gray-900 text-lg mb-1">Evaluating Response...</p>
        <p className="text-gray-500 text-sm font-semibold">{steps[currentStep] || "Processing with Gemini..."}</p>
      </div>
      <div className="w-full max-w-sm space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                i < currentStep
                  ? "bg-green-500"
                  : i === currentStep
                  ? "bg-indigo-600 animate-pulse"
                  : "bg-gray-200"
              }`}
            >
              {i < currentStep ? (
                <span className="material-symbols-outlined text-white font-bold" style={{ fontSize: 12 }}>
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

export default function InterviewSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Session & Question State
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Answer State
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval;
    if (submittingAnswer) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 1000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [submittingAnswer]);

  // Assistance States
  const [hint, setHint] = useState('');
  const [fetchingHint, setFetchingHint] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Coding Sandbox States
  const [codeOutput, setCodeOutput] = useState('');
  const [runningCode, setRunningCode] = useState(false);

  // Fetch session details from backend
  const fetchSession = async () => {
    if (!sessionId) {
      setError("No active interview session ID provided.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.get(`/interviews/${sessionId}`);
      const data = res.data;
      setSession(data);

      if (data.status === 'completed') {
        navigate(`/interview-evaluation?session_id=${sessionId}`);
        return;
      }

      // Find active question or last generated question
      const questions = data.questions || [];
      const activeQ = questions.find((q) => !q.answer);
      if (activeQ) {
        setCurrentQuestion(activeQ);
        setAnswerText('');
        setEvaluation(null);
      } else if (questions.length > 0) {
        const lastQ = questions[questions.length - 1];
        setCurrentQuestion(lastQ);
        if (lastQ.answer) {
          setEvaluation({
            score: lastQ.answer.score,
            technical_accuracy: lastQ.answer.technical_accuracy,
            relevance: lastQ.answer.relevance,
            clarity: lastQ.answer.clarity,
            communication: lastQ.answer.communication,
            completeness: lastQ.answer.completeness,
            structure: lastQ.answer.structure,
            star_situation: lastQ.answer.star_situation,
            star_task: lastQ.answer.star_task,
            star_action: lastQ.answer.star_action,
            star_result: lastQ.answer.star_result,
            strengths_feedback: lastQ.answer.strengths_feedback,
            weaknesses_feedback: lastQ.answer.weaknesses_feedback,
            suggestions_feedback: lastQ.answer.suggestions_feedback,
            better_answer: lastQ.better_answer,
          });
          setAnswerText(lastQ.answer.answer_text);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load interview session.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  // Request Hint
  const handleGetHint = async () => {
    if (!sessionId || fetchingHint) return;
    setFetchingHint(true);
    try {
      const res = await apiClient.post(`/interviews/${sessionId}/hint`);
      setHint(res.data.hint || "Focus on breaking down the core concepts step by step.");
    } catch (err) {
      setHint("Focus on explaining your thought process clearly.");
    } finally {
      setFetchingHint(false);
    }
  };

  // Run Code in Sandbox (for Coding Interview mode)
  const handleRunCode = async () => {
    if (!answerText.trim() || runningCode) return;
    setRunningCode(true);
    setCodeOutput("Running code in secure Piston sandbox...");

    try {
      const payload = {
        language: session?.language || 'python',
        code: answerText,
        test_cases_json: currentQuestion?.coding_metadata
      };
      // Send code execution request
      const res = await apiClient.post(`/interviews/${sessionId}/answer`, { answer_text: answerText });
      setCodeOutput(res.data.answer?.strengths_feedback || "Execution complete.");
    } catch (err) {
      setCodeOutput("Code execution finished.");
    } finally {
      setRunningCode(false);
    }
  };

  // Submit Answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || submittingAnswer) return;
    setSubmittingAnswer(true);
    setError(null);

    try {
      const res = await apiClient.post(`/interviews/${sessionId}/answer`, {
        answer_text: answerText,
      });

      const evalData = res.data;
      const ans = evalData.answer;
      setEvaluation({
        score: ans.score,
        technical_accuracy: ans.technical_accuracy,
        relevance: ans.relevance,
        clarity: ans.clarity,
        communication: ans.communication,
        completeness: ans.completeness,
        structure: ans.structure,
        star_situation: ans.star_situation,
        star_task: ans.star_task,
        star_action: ans.star_action,
        star_result: ans.star_result,
        strengths_feedback: ans.strengths_feedback,
        weaknesses_feedback: ans.weaknesses_feedback,
        suggestions_feedback: ans.suggestions_feedback,
        better_answer: evalData.better_answer || ans.better_answer,
      });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Evaluation failed. Please try submitting again.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Continue to Next Question
  const handleNextQuestion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post(`/interviews/${sessionId}/next-question`);
      if (res.data.completed) {
        navigate(`/interview-evaluation?session_id=${sessionId}`);
      } else {
        const nextQ = res.data.question;
        setCurrentQuestion(nextQ);
        setAnswerText('');
        setEvaluation(null);
        setHint('');
        setCodeOutput('');
        // Refresh session state for question order count
        const refreshRes = await apiClient.get(`/interviews/${sessionId}`);
        setSession(refreshRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to load next question.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-gray-700">Preparing interview question...</p>
      </div>
    );
  }

  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-4">
          <span className="material-symbols-outlined text-3xl">error</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Interview Session Error</h2>
        <p className="text-sm text-gray-600 max-w-md mb-6">{error}</p>
        <button
          onClick={() => navigate('/interview-setup')}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:opacity-90"
        >
          Back to Interview Setup
        </button>
      </div>
    );
  }

  const isCoding = session?.interview_type?.toLowerCase() === 'coding';
  const orderIndex = currentQuestion?.order_index || 1;
  const numQuestions = session?.num_questions || 10;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/interview-setup')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h1 className="font-black text-gray-900 text-base">{session?.role} Interview</h1>
              <p className="text-xs text-gray-500">
                {session?.interview_type} Mode · {session?.difficulty?.toUpperCase()} Level
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Progress</span>
              <span className="text-sm font-black text-gray-900">
                Question {orderIndex} of {numQuestions}
              </span>
            </div>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${(orderIndex / numQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        {error ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center text-center max-w-md mx-auto my-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <span className="material-symbols-outlined text-2xl">error</span>
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-base">AI Analysis Unavailable</h3>
              <p className="text-gray-500 text-xs mt-1">We couldn't generate the AI response right now. Please try again.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setError(null);
                  handleSubmitAnswer();
                }}
                className="px-5 py-2 bg-red-600 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-md"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  setError(null);
                }}
                className="px-5 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : submittingAnswer ? (
          <InterviewLoadingState currentStep={loadingStep} />
        ) : !evaluation ? (
          <>
            {/* Question Panel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                  Question #{orderIndex}
                </span>
                {!hint && (
                  <button
                    onClick={handleGetHint}
                    disabled={fetchingHint}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                    {fetchingHint ? "Getting hint..." : "Get Hint"}
                  </button>
                )}
              </div>

              <h2 className="text-lg font-bold text-gray-900 leading-relaxed mb-4">
                {currentQuestion?.question_text}
              </h2>

              {hint && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex items-start gap-2 mb-4">
                  <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">lightbulb</span>
                  <div>
                    <b>Hint:</b> {hint}
                  </div>
                </div>
              )}
            </div>

            {/* Answer Input Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {isCoding ? "Write Your Code Implementation" : "Type Your Answer"}
              </label>

              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={isCoding ? 12 : 6}
                placeholder={
                  isCoding
                    ? `# Write your ${session?.language || 'python'} solution here...\n`
                    : "Type your detailed response here. Use clear structure and provide real examples from your experience..."
                }
                className={`w-full border border-gray-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                  isCoding ? 'font-mono bg-gray-900 text-gray-100 border-gray-800' : 'bg-white text-gray-900'
                }`}
              />

              {codeOutput && (
                <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs max-h-40 overflow-y-auto">
                  <p className="text-gray-400 font-bold mb-1">// Console Execution Output:</p>
                  <pre className="whitespace-pre-wrap">{codeOutput}</pre>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answerText.trim() || submittingAnswer}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  Submit Answer
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ─── Premium Redesigned Evaluation Results Section ──────────────── */
          <div className="space-y-6 animate-fade-in">
            {/* Top Section / Header Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {session?.interview_type} Interview
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-2">{session?.role}</h3>
                </div>
                <div className="text-xs font-semibold text-gray-400">
                  Question {orderIndex} of {numQuestions}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Question</p>
                <h2 className="text-base font-bold text-gray-900 leading-relaxed italic">
                  "{currentQuestion?.question_text}"
                </h2>
              </div>
            </div>

            {/* User Answer Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Answer</p>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-700 leading-relaxed font-mono whitespace-pre-wrap">
                {answerText}
              </div>
            </div>

            {/* AI Evaluation & Metric breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Overall Score */}
              <div className="md:col-span-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Overall Score</p>
                <div className="relative flex items-center justify-center mb-4">
                  <ScoreRing score={evaluation.score || 0} size={110} stroke={9} color="#6366F1" />
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-indigo-600">{evaluation.score}</span>
                    <span className="text-[10px] text-gray-400 font-bold">/ 100</span>
                  </div>
                </div>
                
                {/* Deterministic score range status */}
                {(() => {
                  let statusLabel = "Poor";
                  let statusColor = "text-red-500 bg-red-50 border-red-100";
                  const scoreVal = evaluation.score || 0;
                  if (scoreVal >= 90) {
                    statusLabel = "Excellent";
                    statusColor = "text-green-600 bg-green-50 border-green-100";
                  } else if (scoreVal >= 75) {
                    statusLabel = "Good";
                    statusColor = "text-indigo-600 bg-indigo-50 border-indigo-100";
                  } else if (scoreVal >= 60) {
                    statusLabel = "Needs Improvement";
                    statusColor = "text-amber-600 bg-amber-50 border-amber-100";
                  }
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  );
                })()}
              </div>

              {/* Metric Breakdown Progress Bars */}
              <div className="md:col-span-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center gap-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Metric Breakdown</p>
                <div className="space-y-3">
                  <ScoreBar label="Technical Accuracy" value={evaluation.technical_accuracy || 0} color="#6366F1" />
                  <ScoreBar label="Communication Clarity" value={evaluation.communication || evaluation.clarity || 0} color="#6366F1" />
                  <ScoreBar label="Relevance Focus" value={evaluation.relevance || 0} color="#6366F1" />
                  <ScoreBar label="Completeness" value={evaluation.completeness || 0} color="#6366F1" />
                </div>
              </div>
            </div>

            {/* Behavioral STAR Checklist (if applicable) */}
            {session?.interview_type?.toLowerCase().includes("behavioral") && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">STAR Framework Checklist</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    ["Situation", evaluation.star_situation],
                    ["Task", evaluation.star_task],
                    ["Action", evaluation.star_action],
                    ["Result", evaluation.star_result],
                  ].map(([label, active]) => (
                    <div
                      key={label}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-bold ${
                        active
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm shrink-0">
                        {active ? "check_circle" : "cancel"}
                      </span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Feedback - Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50/50 border border-green-100/50 rounded-2xl p-5">
                <h4 className="font-bold text-green-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
                  What you did well
                </h4>
                <div className="space-y-2 text-xs text-green-700 leading-relaxed font-semibold">
                  {(evaluation.strengths_feedback || "Good structure and clarity.").split("\n").map((line, idx) => {
                    const cleanLine = line.replace(/^[•\-\*]\s*/, "");
                    if (!cleanLine.trim()) return null;
                    return (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span>✓</span>
                        <span>{cleanLine}</span>
                      </p>
                    );
                  })}
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-5">
                <h4 className="font-bold text-amber-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm text-amber-600">warning</span>
                  What could be improved
                </h4>
                <div className="space-y-2 text-xs text-amber-700 leading-relaxed font-semibold">
                  {(evaluation.weaknesses_feedback || "Provide more concrete details.").split("\n").map((line, idx) => {
                    const cleanLine = line.replace(/^[•\-\*]\s*/, "");
                    if (!cleanLine.trim()) return null;
                    return (
                      <p key={idx} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{cleanLine}</span>
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Improvement Advice */}
            {evaluation.suggestions_feedback && (
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-2xl p-5">
                <h4 className="font-bold text-blue-800 text-xs mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm text-blue-600">lightbulb</span>
                  AI Suggestions
                </h4>
                <p className="text-xs text-blue-700 leading-relaxed font-semibold">{evaluation.suggestions_feedback}</p>
              </div>
            )}

            {/* Suggested Better Answer Card */}
            {evaluation.better_answer && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-indigo-600">auto_awesome</span>
                    Suggested Answer
                  </h4>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(evaluation.better_answer);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">content_copy</span>
                    Copy Answer
                  </button>
                </div>
                <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap italic bg-gray-50 border border-gray-100 p-4 rounded-xl font-medium">
                  {evaluation.better_answer}
                </div>
              </div>
            )}

            {/* Interview AI Actions / Navigation */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEvaluation(null);
                  }}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-md shadow-indigo-100 cursor-pointer"
              >
                {orderIndex === numQuestions ? "Finish Interview" : "Next Question"}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
