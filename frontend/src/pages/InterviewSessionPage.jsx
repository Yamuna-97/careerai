import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function InterviewSessionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const isDemo = searchParams.get('demo') === 'true' || !sessionId;

  // Session State
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User Answer State
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120);

  // Assistance States
  const [hint, setHint] = useState('');
  const [fetchingHint, setFetchingHint] = useState(false);
  const [betterAnswer, setBetterAnswer] = useState('');
  const [answerEvaluation, setAnswerEvaluation] = useState(null);

  // Coding Sandbox States
  const [consoleOutput, setConsoleOutput] = useState('');
  const [runningCode, setRunningCode] = useState(false);

  // Voice Interview States
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const wsRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  // Load session from backend
  useEffect(() => {
    if (isDemo) {
      // Mock Demo Session
      setSession({
        id: 'demo_session',
        role: 'Senior Product Designer',
        difficulty: 'intermediate',
        interview_type: 'Technical',
        format: 'text',
        num_questions: 5,
        duration: 15,
        language: null,
        topic: null,
      });
      setCurrentQuestion({
        id: 'q_demo',
        question_text: 'Describe a project you worked on recently. What was your role and what technologies did you choose?',
        order_index: 1,
        hint: null,
        coding_metadata: null
      });
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      try {
        const token = 'mock_user_token';
        const res = await fetch(`http://localhost:8000/api/v1/interviews/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to load session details.");
        const data = await res.json();
        setSession(data);
        
        // Find active question
        const activeQ = data.questions && data.questions.find(q => !q.answer);
        if (activeQ) {
          setCurrentQuestion(activeQ);
        } else if (data.questions && data.questions.length > 0) {
          setCurrentQuestion(data.questions[data.questions.length - 1]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, isDemo]);

  // Timer Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Browser Voice Synthesis/Speech Recognition Setup
  useEffect(() => {
    if (session?.format === 'voice' && !isDemo) {
      setupSpeechEngines();
    }
    return () => {
      // Cleanup WebSockets and recognition
      if (wsRef.current) wsRef.current.close();
      if (recognitionRef.current) recognitionRef.current.stop();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [session]);

  const setupSpeechEngines = () => {
    // 1. WebSocket Gateway
    const wsUrl = `ws://localhost:8000/api/v1/interviews/${sessionId}/voice`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      setVoiceConnected(true);
      // Send start event
      wsRef.current.send(JSON.stringify({ event: 'start' }));
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'speech') {
        setLiveTranscript('');
        speakText(data.text);
      } else if (data.event === 'completed') {
        navigate(`/interview-evaluation?session_id=${sessionId}`);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error("Voice Socket error", err);
      setError("Voice connection error. Falling back to text mode.");
      setFormatFallback();
    };

    // 2. Web Speech API Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            finalTranscript += e.results[i][0].transcript;
          } else {
            interimTranscript += e.results[i][0].transcript;
          }
        }
        setLiveTranscript(finalTranscript || interimTranscript);
        setAnswerText(prev => prev + (finalTranscript ? ' ' + finalTranscript : ''));
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    } else {
      setError("Speech recognition not supported in this browser. Falling back to text.");
      setFormatFallback();
    }
  };

  const setFormatFallback = () => {
    setSession(prev => prev ? { ...prev, format: 'text' } : null);
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      setIsSpeaking(true);
      if (recognitionRef.current) recognitionRef.current.stop(); // Stop listening while speaking
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      // Start listening when AI finishes speaking
      if (recognitionRef.current && !voiceMuted) {
        recognitionRef.current.start();
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceSend = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && answerText.trim()) {
      wsRef.current.send(JSON.stringify({
        event: 'speech_input',
        text: answerText
      }));
      setAnswerText('');
    }
  };

  // Run Code via Piston API
  const handleRunCode = async () => {
    if (!answerText.trim()) {
      setConsoleOutput("No code to run.");
      return;
    }
    setRunningCode(true);
    setConsoleOutput("Compiling and executing in secure sandbox...");

    const langMap = {
      'python': { language: 'python', version: '3.10.0', filename: 'solution.py' },
      'javascript': { language: 'javascript', version: '18.15.0', filename: 'solution.js' },
      'java': { language: 'java', version: '15.0.2', filename: 'Main.java' },
      'cpp': { language: 'c++', version: '10.2.0', filename: 'main.cpp' }
    };

    const targetLang = langMap[session?.language?.toLowerCase() || 'python'];
    const payload = {
      language: targetLang.language,
      version: targetLang.version,
      files: [{ name: targetLang.filename, content: answerText }]
    };

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const data = await response.json();
        const run = data.run;
        setConsoleOutput(run.stdout + (run.stderr ? "\n" + run.stderr : ""));
      } else {
        setConsoleOutput("Failed to run code. execution service returned HTTP " + response.status);
      }
    } catch (e) {
      setConsoleOutput("Error running code: " + e.message);
    } finally {
      setRunningCode(false);
    }
  };

  // Submit Text/Coding Answer
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    setSubmittingAnswer(true);
    
    // Clear helpers
    setHint('');
    setBetterAnswer('');
    setAnswerEvaluation(null);

    if (isDemo) {
      // Mock Demo Flow
      setTimeout(() => {
        setAnswerEvaluation({
          score: 84,
          strengths_feedback: "Clearly explained core concepts, structured architecture.",
          weaknesses_feedback: "Could mention quantitative tradeoffs.",
          suggestions_feedback: "Quantify metrics (e.g. latency reductions)."
        });
        setBetterAnswer("FastAPI was chosen due to async native processing and auto open-api integrations.");
        setSubmittingAnswer(false);
        
        // Auto transition questions in demo mode
        setTimeout(() => {
          if (currentQuestion?.order_index >= (session?.num_questions || 5)) {
            navigate('/interview-evaluation');
          } else {
            setCurrentQuestion(prev => ({
              ...prev,
              order_index: prev.order_index + 1,
              question_text: prev.order_index === 1 
                ? 'What is the difference between supervised and unsupervised learning?'
                : 'Explain regularization in machine learning. How do L1 and L2 regularization differ?'
            }));
            setAnswerText('');
            setAnswerEvaluation(null);
            setBetterAnswer('');
            setTimerSeconds(120);
          }
        }, 3500);
      }, 1000);
      return;
    }

    try {
      const token = 'mock_user_token';
      const res = await fetch(`http://localhost:8000/api/v1/interviews/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answer_text: answerText })
      });

      if (res.ok) {
        const data = await res.json();
        setAnswerEvaluation(data.answer);
        setBetterAnswer(data.better_answer);
        
        // Wait or trigger next question
        if (data.is_completed) {
          // Trigger complete
          await fetch(`http://localhost:8000/api/v1/interviews/${sessionId}/complete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setTimeout(() => navigate(`/interview-evaluation?session_id=${sessionId}`), 2500);
        } else {
          // Load next question
          setTimeout(() => {
            setCurrentQuestion(data.next_question);
            setAnswerText('');
            setAnswerEvaluation(null);
            setBetterAnswer('');
            setTimerSeconds(120);
          }, 3500);
        }
      }
    } catch (e) {
      console.error(e);
      setError("Failed to submit answer. Please retry.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Skip Question
  const handleSkipQuestion = () => {
    setAnswerText('Skipped question.');
    setTimeout(() => handleSubmitAnswer(), 200);
  };

  // Get Hint
  const handleGetHint = async () => {
    if (isDemo) {
      setHint("Explain Situation -> Task -> Action -> Result.");
      return;
    }
    setFetchingHint(true);
    try {
      const token = 'mock_user_token';
      const res = await fetch(`http://localhost:8000/api/v1/interviews/${sessionId}/hint`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHint(data.hint);
      }
    } catch (e) {
      setHint("Explain the fundamental concepts first.");
    } finally {
      setFetchingHint(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="bg-surface-bright min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface-bright text-on-surface font-body-md min-h-screen flex pb-20 md:pb-8">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen relative">
        <Header
          title="AI Mock Interview Coach"
          subtitle={`Role: ${session?.role} • Mode: ${session?.interview_type} (${session?.difficulty?.toUpperCase()})`}
        />

        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Main simulator screen */}
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            
            {/* Header progress info */}
            <div className="flex flex-col gap-stack-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
                    Mock Interview Session
                  </h2>
                  <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
                    Time Remaining: {formatTime(timerSeconds)}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/interview')}
                  className="px-4 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container/50 transition-colors border border-transparent hover:border-error/20 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  End Session
                </button>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-2 mt-stack-sm">
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Question {currentQuestion?.order_index || 1} of {session?.num_questions || 5}</span>
                  <span>{Math.round(((currentQuestion?.order_index || 1) / (session?.num_questions || 5)) * 100)}% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion?.order_index || 1) / (session?.num_questions || 5)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-lg text-xs font-semibold">
                {error}
              </div>
            )}

            {/* VOICE INTERVIEW INTERFACE */}
            {session?.format === 'voice' ? (
              <div className="bg-surface rounded-xl border border-outline-variant/30 p-8 flex flex-col items-center justify-center text-center gap-6 min-h-[300px] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 orb-pulse pointer-events-none"></div>
                
                {/* Voice Orb */}
                <div className={`w-28 h-28 rounded-full border flex items-center justify-center shadow-lg relative ${
                  isSpeaking ? 'bg-primary-container/20 border-primary' : isListening ? 'bg-secondary-container/20 border-secondary animate-pulse' : 'bg-surface border-outline-variant'
                }`}>
                  {isSpeaking && (
                    <div className="absolute inset-0 rounded-full bg-primary/10 orb-pulse"></div>
                  )}
                  <span className={`material-symbols-outlined text-4xl ${
                    isSpeaking ? 'text-primary' : isListening ? 'text-secondary icon-filled' : 'text-on-surface-variant'
                  }`}>
                    {isSpeaking ? 'volume_up' : isListening ? 'mic' : 'voice_chat'}
                  </span>
                </div>

                <div className="max-w-xl">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                    "{currentQuestion?.question_text}"
                  </h3>
                  <p className="text-xs text-on-surface-variant tracking-wider uppercase font-bold mt-1">
                    {isSpeaking ? 'Interviewer is speaking...' : isListening ? 'Listening for response...' : 'Voice connected'}
                  </p>
                </div>

                {liveTranscript && (
                  <div className="max-w-lg bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 text-xs italic text-on-surface-variant">
                    "{liveTranscript}"
                  </div>
                )}

                <div className="flex gap-4 items-center mt-4">
                  <button
                    onClick={() => {
                      setVoiceMuted(!voiceMuted);
                      if (recognitionRef.current) {
                        if (!voiceMuted) recognitionRef.current.stop();
                        else recognitionRef.current.start();
                      }
                    }}
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                      voiceMuted ? 'bg-error text-on-error border-error' : 'bg-surface hover:bg-surface-container text-on-surface border-outline-variant'
                    }`}
                    title={voiceMuted ? 'Unmute microphone' : 'Mute microphone'}
                  >
                    <span className="material-symbols-outlined">{voiceMuted ? 'mic_off' : 'mic'}</span>
                  </button>
                  <button
                    onClick={handleVoiceSend}
                    className="bg-secondary text-white px-6 py-3 rounded-lg font-label-md text-label-md font-bold shadow-md hover:opacity-90 flex items-center gap-1 cursor-pointer"
                  >
                    Send Answer
                  </button>
                </div>
              </div>
            ) : (
              /* TEXT OR CODING MODE INTERFACE */
              <div className="flex flex-col gap-6">
                
                {/* AI Question Panel */}
                <div className="bg-surface rounded-xl shadow-sm p-stack-lg border border-outline-variant/30 flex flex-col items-center text-center gap-stack-md relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10 orb-pulse pointer-events-none"></div>
                  <div className="w-12 h-12 rounded-full bg-surface-container-low border border-primary/20 flex items-center justify-center shadow-sm relative">
                    <div className="absolute inset-0 rounded-full bg-primary/10 orb-pulse"></div>
                    <span className="material-symbols-outlined text-primary text-2xl z-10 icon-filled">smart_toy</span>
                  </div>
                  <h3 className="font-headline-md text-headline-sm md:text-headline-md text-on-surface max-w-2xl mx-auto leading-relaxed">
                    "{currentQuestion?.question_text}"
                  </h3>
                </div>

                {/* CODING MODE SANDBOX INTERFACE */}
                {session?.interview_type?.toLowerCase() === 'coding' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left code input */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center bg-surface-container px-3 py-2 rounded-t-lg border-b border-outline-variant/30 text-xs font-bold uppercase tracking-wider">
                        <span>Code Editor ({session?.language})</span>
                        <button
                          onClick={handleRunCode}
                          disabled={runningCode}
                          className="bg-primary text-white px-3 py-1 rounded hover:opacity-90 font-label-sm text-[10px] cursor-pointer"
                        >
                          {runningCode ? 'Running...' : 'Run Code'}
                        </button>
                      </div>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder={`def solution():\n    # Write your code here...\n    pass`}
                        className="w-full h-80 bg-surface border border-outline-variant p-4 font-mono text-xs focus:outline-none rounded-b-lg resize-none shadow-inner"
                      />
                    </div>

                    {/* Right Sandbox Console */}
                    <div className="flex flex-col gap-2">
                      <div className="bg-surface-container px-3 py-2 rounded-t-lg border-b border-outline-variant/30 text-xs font-bold uppercase tracking-wider">
                        Console Output
                      </div>
                      <div className="w-full h-80 bg-[#1e1e1e] text-white p-4 font-mono text-xs overflow-auto rounded-b-lg shadow-inner">
                        {consoleOutput ? (
                          <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
                        ) : (
                          <span className="text-gray-500">Run code to see logs/test cases output...</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* STANDARD TEXT INPUT */
                  <div className="relative w-full">
                    <textarea
                      className="w-full h-48 bg-surface border border-outline-variant rounded-xl p-stack-md font-body-lg text-body-lg text-on-surface focus:outline-none input-focus-ring resize-none shadow-sm transition-shadow"
                      placeholder="Type your response here..."
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                    />
                  </div>
                )}

                {/* Question Evaluations / Suggestions (shown inline immediately after submit) */}
                {answerEvaluation && (
                  <div className="bg-surface-container-low border border-tertiary/20 p-4 rounded-xl space-y-2 animate-fade-in-up">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-tertiary-container flex items-center gap-1 text-sm">
                        <span className="material-symbols-outlined text-sm">analytics</span>
                        Immediate AI Evaluation Summary
                      </h4>
                      <span className="text-xs bg-tertiary/10 text-tertiary px-2 py-0.5 rounded font-bold">
                        Score: {answerEvaluation.score}/100
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant"><strong>Strengths:</strong> {answerEvaluation.strengths_feedback}</p>
                    <p className="text-xs text-on-surface-variant"><strong>Suggestions:</strong> {answerEvaluation.suggestions_feedback}</p>
                  </div>
                )}

                {betterAnswer && (
                  <div className="bg-surface-container border border-primary/20 p-4 rounded-xl space-y-1 animate-fade-in-up">
                    <h4 className="font-bold text-primary flex items-center gap-1 text-sm">
                      <span className="material-symbols-outlined text-sm">lightbulb</span>
                      AI Benchmark Model Answer
                    </h4>
                    <p className="text-xs text-on-surface whitespace-pre-wrap font-mono">{betterAnswer}</p>
                  </div>
                )}

                {/* Text simulator Actions */}
                <div className="flex justify-between items-center mt-stack-sm">
                  <button
                    onClick={handleSkipQuestion}
                    className="px-6 py-3 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
                  >
                    Skip Question
                  </button>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !answerText.trim()}
                    className="bg-gradient-to-r from-primary-container to-secondary px-8 py-3 rounded-lg font-label-md text-label-md text-on-primary shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                  >
                    {submittingAnswer ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <span>{currentQuestion?.order_index === (session?.num_questions || 5) ? 'Finish & Evaluate' : 'Submit Answer'}</span>
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Contextual Guidance Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-stack-lg">
            
            {/* Need a Hint card */}
            <div className="bg-surface rounded-xl shadow-sm border border-outline-variant p-stack-md">
              <div className="flex justify-between items-center mb-stack-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">lightbulb</span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Preparation Hints</h4>
                </div>
                {session?.difficulty !== 'pro' && (
                  <button
                    onClick={handleGetHint}
                    disabled={fetchingHint}
                    className="text-xs text-secondary font-bold hover:underline cursor-pointer"
                  >
                    {fetchingHint ? 'Fetching...' : 'Get Hint'}
                  </button>
                )}
              </div>
              
              {hint ? (
                <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg text-xs leading-relaxed text-on-surface-variant animate-fade-in-up">
                  {hint}
                </div>
              ) : (
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  {session?.difficulty === 'pro'
                    ? 'Pro mode has hints disabled. Explain concepts, details, and trade-offs directly.'
                    : 'Click "Get Hint" above to receive structural prompts and STAR guides.'}
                </p>
              )}
            </div>

            {/* Suggested Structure */}
            <div className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/50 p-stack-md relative overflow-hidden">
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md relative z-10 flex justify-between items-center">
                Answering Framework
                <span className="font-label-sm text-label-sm bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                  {session?.interview_type?.toLowerCase() === 'coding' ? 'Big O Notation' : 'STAR Method'}
                </span>
              </h4>
              
              {session?.interview_type?.toLowerCase() === 'coding' ? (
                <div className="flex flex-col gap-stack-sm text-xs leading-relaxed text-on-surface-variant">
                  <p><strong>1. Understand the problem:</strong> restate inputs, outputs, and edge cases (empty lists, duplicates).</p>
                  <p><strong>2. Devise a plan:</strong> describe your brute force approach before coding the optimized solution.</p>
                  <p><strong>3. Complexity Analysis:</strong> compute and explain Time and Space complexity.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-stack-sm relative z-10">
                  {[
                    { char: 'S', title: 'Situation', desc: 'Set the scene and context of the engineering event.' },
                    { char: 'T', title: 'Task', desc: 'Explain your specific responsibility or challenge.' },
                    { char: 'A', title: 'Action', desc: 'Detail the precise technical actions you implemented.' },
                    { char: 'R', title: 'Result', desc: 'Highlight quantitative metrics or business outcomes.' }
                  ].map((star, idx) => (
                    <div key={idx} className="flex gap-stack-sm">
                      <div className="w-6 h-6 rounded bg-surface-variant text-primary font-bold flex items-center justify-center shrink-0 font-label-sm">
                        {star.char}
                      </div>
                      <div>
                        <p className="font-label-md text-xs text-on-surface font-bold">{star.title}</p>
                        <p className="font-body-sm text-[10px] text-on-surface-variant">{star.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
