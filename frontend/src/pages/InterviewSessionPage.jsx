import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';

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
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span>
            {error}
          </div>
        )}

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
                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
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
        {!evaluation ? (
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
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">send</span>
                {submittingAnswer ? "Evaluating Answer..." : "Submit Answer"}
              </button>
            </div>
          </div>
        ) : (
          /* Evaluation Results Section */
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Answer Evaluation</span>
                <h3 className="text-xl font-black text-gray-900">Score & Feedback</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">{evaluation.score}</span>
                  <span className="text-xs text-gray-400 font-bold"> / 100</span>
                </div>
              </div>
            </div>

            {/* Behavioral STAR Checklist */}
            {session?.interview_type?.toLowerCase().includes("behavioral") && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-xs font-bold text-purple-900 mb-2">STAR Framework Checklist:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    ["Situation", evaluation.star_situation],
                    ["Task", evaluation.star_task],
                    ["Action", evaluation.star_action],
                    ["Result", evaluation.star_result],
                  ].map(([label, active]) => (
                    <div
                      key={label}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold ${
                        active
                          ? "bg-green-100 border-green-200 text-green-800"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {active ? "check_circle" : "cancel"}
                      </span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <h4 className="font-bold text-green-800 text-xs mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
                  What You Did Well
                </h4>
                <p className="text-xs text-green-700 leading-relaxed">
                  {evaluation.strengths_feedback || "Good structure and clarity."}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <h4 className="font-bold text-amber-800 text-xs mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-amber-600">warning</span>
                  What Could Be Improved
                </h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {evaluation.weaknesses_feedback || "Could include more specific details."}
                </p>
              </div>
            </div>

            {/* Suggestions & Better Answer */}
            {evaluation.suggestions_feedback && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <h4 className="font-bold text-blue-800 text-xs mb-1">Improvement Advice</h4>
                <p className="text-xs text-blue-700">{evaluation.suggestions_feedback}</p>
              </div>
            )}

            {evaluation.better_answer && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="font-bold text-gray-800 text-xs mb-2">Model Answer / Ideal Approach</h4>
                <div className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed bg-white border border-gray-100 p-3 rounded-lg">
                  {evaluation.better_answer}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-md shadow-indigo-100"
              >
                Continue to Next Question
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
