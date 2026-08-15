import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ResumeEditorPage from './pages/ResumeEditorPage';
import ResumeHubPage from './pages/ResumeHubPage';
import ResumeAIStudioPage from './pages/ResumeAIStudioPage';
import ResumeTemplatesPage from './pages/ResumeTemplatesPage';
import LaTeXEditorPage from './pages/LaTeXEditorPage';
import InterviewLandingPage from './pages/InterviewLandingPage';
import InterviewSetupPage from './pages/InterviewSetupPage';
import InterviewSessionPage from './pages/InterviewSessionPage';
import InterviewEvaluationPage from './pages/InterviewEvaluationPage';
import JobsPage from './pages/JobsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Main Application Layout Wrapper */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Separated Resume Workflows */}
          <Route path="/resume" element={<ResumeHubPage />} />
          <Route path="/resume/builder" element={<ResumeEditorPage />} />
          <Route path="/resume/ai-studio" element={<ResumeAIStudioPage />} />
          <Route path="/resume/ai-studio/text" element={<ResumeAIStudioPage />} />
          <Route path="/resume/ai-studio/image" element={<ResumeAIStudioPage />} />
          <Route path="/resume/ai-studio/video" element={<ResumeAIStudioPage />} />
          <Route path="/resume/ai-studio/audio" element={<ResumeAIStudioPage />} />
          <Route path="/resume/templates" element={<ResumeTemplatesPage />} />
          <Route path="/resume/latex-editor" element={<LaTeXEditorPage />} />
          <Route path="/resume-editor" element={<ResumeEditorPage />} />

          {/* Interview Mock module */}
          <Route path="/interview" element={<InterviewLandingPage />} />
          <Route path="/interview-setup" element={<InterviewSetupPage />} />
          <Route path="/interview-session" element={<InterviewSessionPage />} />
          <Route path="/interview-evaluation" element={<InterviewEvaluationPage />} />
          <Route path="/jobs" element={<JobsPage />} />
        </Route>
        
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

