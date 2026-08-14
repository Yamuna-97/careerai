import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function InterviewSessionPage() {
  const navigate = useNavigate();
  const [currentQIndex, setCurrentQIndex] = useState(2); // 3 of 10 (0-indexed 2)
  const [isRecording, setIsRecording] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [timerSeconds, setTimerSeconds] = useState(120);

  const questions = [
    'Can you tell me about yourself and your design journey?',
    'How do you approach user research when working under tight deadlines?',
    'Can you describe a time you had to manage a conflict within a cross-functional team?',
    'How do you measure the business impact of your product design decisions?',
    'What is your process for creating and maintaining a design system?',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setAnswerText('');
      setTimerSeconds(120);
    } else {
      navigate('/interview-evaluation');
    }
  };

  return (
    <div className="bg-surface-bright text-on-surface font-body-md min-h-screen flex pb-20 md:pb-8">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen relative">
        <Header title="Live AI Interview Coach" subtitle="Role: Senior Product Designer • Behavioral Mock Interview" />

        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-stack-lg max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Interview Interface */}
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            {/* Header Actions & Progress */}
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
                  onClick={() => navigate('/interview-evaluation')}
                  className="px-4 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container/50 transition-colors border border-transparent hover:border-error/20 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  End Session
                </button>
              </div>

              <div className="flex flex-col gap-2 mt-stack-sm">
                <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                  <span>Question {currentQIndex + 1} of {questions.length}</span>
                  <span>{Math.round(((currentQIndex + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* AI Question Card */}
            <div className="bg-surface rounded-xl shadow-md p-stack-lg border border-outline-variant/30 flex flex-col items-center text-center gap-stack-md relative overflow-hidden mt-stack-sm">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -z-10 orb-pulse pointer-events-none"></div>
              <div className="w-16 h-16 rounded-full bg-surface-container-low border border-primary/20 flex items-center justify-center shadow-sm relative">
                <div className="absolute inset-0 rounded-full bg-primary/10 orb-pulse"></div>
                <span className="material-symbols-outlined text-primary text-3xl z-10 icon-filled">smart_toy</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface max-w-2xl mx-auto">
                "{questions[currentQIndex]}"
              </h3>
            </div>

            {/* Answer Input Area */}
            <div className="flex flex-col gap-stack-sm">
              <div className="relative w-full">
                <textarea
                  className="w-full h-48 bg-surface border border-outline-variant rounded-xl p-stack-md font-body-lg text-body-lg text-on-surface focus:outline-none input-focus-ring resize-none shadow-sm transition-shadow"
                  placeholder="Type your response here or click the microphone to speak..."
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                />

                {/* Voice Input Action */}
                <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-surface p-2 rounded-full shadow-md border border-outline-variant/50">
                  {isRecording && (
                    <div className="flex items-end gap-1 px-2 h-6 animate-pulse">
                      <div className="w-1 h-3 bg-primary rounded-full"></div>
                      <div className="w-1 h-6 bg-primary rounded-full"></div>
                      <div className="w-1 h-4 bg-primary rounded-full"></div>
                      <div className="w-1 h-5 bg-primary rounded-full"></div>
                      <div className="w-1 h-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                  <button
                    className={`w-10 h-10 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
                      isRecording
                        ? 'bg-error text-on-error'
                        : 'bg-surface-container hover:bg-primary-container hover:text-on-primary text-primary'
                    }`}
                    onClick={() => {
                      setIsRecording(!isRecording);
                      if (!isRecording && !answerText) {
                        setAnswerText(
                          'In my previous role at TechCorp, our engineering and design teams had conflicting priorities regarding the analytics overhaul timeline. I facilitated a workshop aligning technical debt with UX metrics, resulting in a phased release that shipped on time.'
                        );
                      }
                    }}
                    title={isRecording ? 'Stop Recording' : 'Start Voice Input'}
                  >
                    <span className={`material-symbols-outlined ${isRecording ? 'icon-filled' : ''}`}>mic</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-stack-sm">
                <button
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer"
                >
                  Skip Question
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-primary-container to-secondary px-8 py-3 rounded-lg font-label-md text-label-md text-on-primary shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>{currentQIndex === questions.length - 1 ? 'Finish & Evaluate' : 'Submit Answer'}</span>
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contextual Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-stack-lg">
            <div className="bg-surface rounded-xl shadow-sm border border-outline-variant p-stack-md">
              <div className="flex items-center gap-2 mb-stack-md">
                <span className="material-symbols-outlined text-secondary">lightbulb</span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface">Tips for Success</h4>
              </div>
              <ul className="flex flex-col gap-stack-sm font-body-sm text-body-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary-container text-[18px] mt-0.5">check_circle</span>
                  Focus on the resolution, not just the conflict itself.
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary-container text-[18px] mt-0.5">check_circle</span>
                  Maintain a professional tone when describing differing opinions.
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary-container text-[18px] mt-0.5">check_circle</span>
                  Quantify the positive outcome (e.g., "saved 2 weeks of delay").
                </li>
              </ul>
            </div>

            <div className="bg-surface-container-low rounded-xl shadow-sm border border-outline-variant/50 p-stack-md relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-0"></div>
              <h4 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md relative z-10 flex justify-between items-center">
                Suggested Structure
                <span className="font-label-sm text-label-sm bg-primary/10 text-primary px-2 py-1 rounded font-bold">
                  STAR Method
                </span>
              </h4>
              <div className="flex flex-col gap-stack-sm relative z-10">
                <div className="flex gap-stack-sm">
                  <div className="w-6 h-6 rounded bg-surface-variant text-primary font-bold flex items-center justify-center shrink-0 font-label-sm">
                    S
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Situation</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Briefly set the scene and context of the cross-functional project.
                    </p>
                  </div>
                </div>
                <div className="flex gap-stack-sm">
                  <div className="w-6 h-6 rounded bg-surface-variant text-primary font-bold flex items-center justify-center shrink-0 font-label-sm">
                    T
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Task</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Explain your responsibility and the specific conflict that arose.
                    </p>
                  </div>
                </div>
                <div className="flex gap-stack-sm">
                  <div className="w-6 h-6 rounded bg-surface-variant text-primary font-bold flex items-center justify-center shrink-0 font-label-sm">
                    A
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Action</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Detail the steps you took to mediate or resolve the issue.
                    </p>
                  </div>
                </div>
                <div className="flex gap-stack-sm">
                  <div className="w-6 h-6 rounded bg-surface-variant text-primary font-bold flex items-center justify-center shrink-0 font-label-sm">
                    R
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Result</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Share the positive outcome achieved for the team and project.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
