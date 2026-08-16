import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import apiClient from '../api/client';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    terms: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name
          }
        }
      });

      if (error) {
        console.error("Supabase signup error:", error);
        
        const isRateLimit = error.status === 429 || 
                            (error.message && error.message.toLowerCase().includes("rate limit")) ||
                            (error.message && error.message.toLowerCase().includes("too many requests"));
                            
        if (isRateLimit) {
          setErrorMsg("Email verification is temporarily rate-limited. Please wait and try again later.");
        } else {
          setErrorMsg(error.message);
        }
        setIsSubmitting(false);
        return;
      }

      const session = data.session;
      const user = data.user;

      if (user) {
        if (session) {
          localStorage.setItem('access_token', session.access_token);
          localStorage.setItem('token', session.access_token);
          
          // Sync real profile data to local DB using the verified JWT via apiClient
          await apiClient.post('/auth/sync', {
            id: user.id,
            email: user.email,
            full_name: formData.name.trim()
          });

          navigate('/dashboard');
        } else {
          setErrorMsg("Account created! Please check your email to confirm registration, then log in.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Empty' };
    if (pass.length < 6) return { score: 1, text: 'Weak' };
    if (pass.length < 10) return { score: 2, text: 'Medium' };
    return { score: 4, text: 'Strong' };
  };

  const strength = getStrength(formData.password);

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased min-h-screen flex flex-col md:flex-row selection:bg-primary-container selection:text-on-primary">
      {/* Left Column: Form Canvas */}
      <main className="flex-1 flex flex-col justify-center px-margin-mobile sm:px-12 md:px-margin-desktop py-stack-xl max-w-2xl mx-auto w-full z-10">
        {/* Brand Header */}
        <div className="mb-stack-lg">
          <Link to="/" className="inline-flex items-center gap-3 text-primary mb-stack-md group">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined icon-filled text-[24px]">work</span>
            </div>
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">CareerAI</span>
          </Link>
          <h1 className="font-headline-lg text-headline-lg md:text-[36px] text-on-surface font-bold">Create your account</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-stack-xs">
            Start optimizing your career trajectory with AI-driven guidance.
          </p>
          {errorMsg && (
            <p className="text-xs text-error font-bold mt-2 bg-error-container/20 p-2 rounded">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-stack-md">
          {/* Social Sign Up Options */}
          <div className="grid grid-cols-2 gap-stack-sm mb-stack-md">
            <button
              onClick={() => navigate('/dashboard')}
              type="button"
              className="flex items-center justify-center gap-2 h-12 rounded-[10px] border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors duration-200 font-label-md text-label-md text-on-surface shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Google
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              type="button"
              className="flex items-center justify-center gap-2 h-12 rounded-[10px] border border-outline-variant bg-surface-container-lowest hover:bg-surface-container transition-colors duration-200 font-label-md text-label-md text-on-surface shadow-sm"
            >
              <svg className="w-5 h-5 fill-[#0077B5]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c-.92 0-1.67-.75-1.67-1.67s.75-1.67 1.67-1.67 1.67.75 1.67 1.67-.75 1.67-1.67 1.67M5.07 18.5h2.79v-8.37H5.07v8.37z"></path>
              </svg>
              LinkedIn
            </button>
          </div>

          <div className="relative flex items-center justify-center my-stack-md">
            <div className="border-t border-outline-variant w-full"></div>
            <span className="bg-surface px-4 font-label-sm text-label-sm text-outline uppercase tracking-wider absolute">
              Or continue with email
            </span>
          </div>

          {/* Full Name */}
          <div className="space-y-stack-xs">
            <label className="font-label-sm text-label-sm text-on-surface block" htmlFor="full-name">
              Full Name
            </label>
            <input
              className="w-full h-12 px-4 rounded-[10px] border border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none input-focus-ring transition-all duration-200"
              id="full-name"
              placeholder="Jane Doe"
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="space-y-stack-xs">
            <label className="font-label-sm text-label-sm text-on-surface block" htmlFor="email">
              Work Email
            </label>
            <input
              className="w-full h-12 px-4 rounded-[10px] border border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none input-focus-ring transition-all duration-200"
              id="email"
              placeholder="jane@example.com"
              required
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="space-y-stack-xs">
            <label className="font-label-sm text-label-sm text-on-surface block" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full h-12 pl-4 pr-10 rounded-[10px] border border-outline-variant bg-surface-container-lowest text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none input-focus-ring transition-all duration-200"
                id="password"
                placeholder="••••••••"
                required
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                aria-label="Toggle password visibility"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>

            {/* Strength Indicator */}
            <div className="flex items-center gap-1 mt-2">
              <div className={`h-1 flex-1 rounded-full ${strength.score >= 1 ? 'bg-primary-container' : 'bg-surface-variant'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${strength.score >= 2 ? 'bg-primary-container' : 'bg-surface-variant'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${strength.score >= 3 ? 'bg-primary-container' : 'bg-surface-variant'}`}></div>
              <div className={`h-1 flex-1 rounded-full ${strength.score >= 4 ? 'bg-primary-container' : 'bg-surface-variant'}`}></div>
              <span className="ml-2 font-label-sm text-label-sm text-on-surface-variant text-[10px] uppercase tracking-wider">
                {strength.text}
              </span>
            </div>
          </div>

          {/* Checkbox */}
          <div className="flex items-start gap-3 pt-stack-sm pb-stack-sm">
            <div className="flex items-center h-5 mt-0.5">
              <input
                className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container focus:ring-offset-surface bg-surface-container-lowest cursor-pointer"
                id="terms"
                required
                type="checkbox"
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
              />
            </div>
            <label className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="terms">
              I agree to the{' '}
              <a className="text-primary hover:text-primary-fixed-variant underline underline-offset-2 transition-colors" href="#">
                Terms of Service
              </a>{' '}
              and{' '}
              <a className="text-primary hover:text-primary-fixed-variant underline underline-offset-2 transition-colors" href="#">
                Privacy Policy
              </a>.
            </label>
          </div>

          {/* Submit Action */}
          <button
            className="w-full h-12 text-white rounded-[10px] font-label-md text-label-md shadow-md hover:-translate-y-[1px] hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-90"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Get Started'}
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </form>

        {/* Footer Link */}
        <p className="mt-stack-lg text-center font-body-sm text-body-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link className="font-label-md text-label-md text-primary hover:text-primary-fixed-variant transition-colors ml-1" to="/login">
            Log in
          </Link>
        </p>
      </main>

      {/* Right Column: Visual & Benefits Context */}
      <aside className="hidden md:flex flex-1 relative bg-surface-container overflow-hidden items-center justify-center p-stack-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-surface/80 via-surface-container-low/90 to-surface-container/80 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-lg">
          <h2 className="font-display-lg text-display-lg text-on-surface mb-stack-md">
            Why join<br />
            <span className="text-primary">CareerAI?</span>
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-xl max-w-md">
            Elevate your professional trajectory with intelligent tools designed to optimize every stage of your job search.
          </p>

          {/* Bento Benefits List */}
          <div className="grid gap-stack-md">
            <div className="bg-surface/90 backdrop-blur-md border border-surface-variant rounded-xl p-stack-md flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-200 group">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined icon-filled">description</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">AI Resume Builder</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Generate ATS-optimized resumes tailored to specific job descriptions instantly.
                </p>
              </div>
            </div>

            <div className="bg-surface/90 backdrop-blur-md border border-surface-variant rounded-xl p-stack-md flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-200 group ml-8">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-secondary flex items-center justify-center shrink-0 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                <span className="material-symbols-outlined icon-filled">mic</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Mock Interviews</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Practice with our conversational AI and receive real-time feedback on your responses.
                </p>
              </div>
            </div>

            <div className="bg-surface/90 backdrop-blur-md border border-surface-variant rounded-xl p-stack-md flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-200 group">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high text-tertiary flex items-center justify-center shrink-0 group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                <span className="material-symbols-outlined icon-filled">work</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Smart Job Matching</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Discover opportunities aligned with your unique skill graph and career aspirations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric AI Orb Elements */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-secondary/10 rounded-full blur-[60px] pointer-events-none"></div>
      </aside>
    </div>
  );
}
