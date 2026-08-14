import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ResumeEditorPage from './pages/ResumeEditorPage';
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resume-editor" element={<ResumeEditorPage />} />
        <Route path="/interview-session" element={<InterviewSessionPage />} />
        <Route path="/interview-evaluation" element={<InterviewEvaluationPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
