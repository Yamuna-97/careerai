import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import apiClient from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setErrorMsg(error.message);
        setIsSubmitting(false);
        return;
      }

      const session = data.session;
      if (session) {
        // Save the access token for API requests under unified key
        localStorage.setItem('access_token', session.access_token);
        localStorage.setItem('token', session.access_token);
        
        // Sync user profile to backend local database using centralized API client
        await apiClient.post('/auth/sync', {
          id: session.user.id,
          email: session.user.email,
          full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0]
        });

        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.detail || "Could not sync user profile with database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop">
      <main className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-lg p-stack-xl animate-fade-in-up border border-outline-variant/30">
        <header className="text-center mb-stack-lg">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-surface-container-highest text-primary mb-stack-sm hover:scale-105 transition-transform">
            <span className="material-symbols-outlined icon-filled text-[28px]">work</span>
          </Link>
          <h1 className="font-headline-lg text-headline-lg md:font-headline-lg md:text-headline-lg text-on-surface">
            <Link to="/" className="hover:text-primary transition-colors">CareerAI</Link>
          </h1>
          {errorMsg && (
            <p className="text-xs text-error font-bold mt-2 bg-error-container/20 p-2 rounded">
              {errorMsg}
            </p>
          )}
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-stack-xs">
            Welcome back. Please enter your details.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-stack-md">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-stack-xs" htmlFor="email">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-outline-variant text-on-surface bg-surface-container-lowest px-4 py-3 focus:outline-none input-focus-ring font-body-md text-body-md transition-shadow"
              id="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-stack-xs" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-outline-variant/50 text-on-surface bg-surface-container-lowest px-4 py-3 focus:outline-none input-focus-ring font-body-md text-body-md transition-shadow pr-12"
                id="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-stack-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                className="rounded border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-lowest w-4 h-4 cursor-pointer"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="font-body-sm text-body-sm text-on-surface-variant select-none">Remember me</span>
            </label>
            <a className="font-label-md text-label-md text-primary hover:text-primary-fixed-variant transition-colors" href="#">
              Forgot password?
            </a>
          </div>

          <button
            className="w-full text-white rounded-lg py-3 font-label-md text-label-md shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50 bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] hover:opacity-90 transition-all"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="relative my-stack-lg">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/30"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface-container-lowest text-on-surface-variant font-body-sm text-body-sm">
              Or continue with
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center justify-center gap-2 bg-surface-container text-on-surface rounded-lg py-3 font-label-md text-label-md hover:bg-surface-container-high transition-colors shadow-sm active:scale-[0.98] border border-outline-variant/20 cursor-pointer"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
          </svg>
          Google
        </button>

        <p className="mt-stack-lg text-center font-body-sm text-body-sm text-on-surface-variant">
          Don't have an account?{' '}
          <Link className="font-label-md text-label-md text-primary hover:text-primary-fixed-variant transition-colors ml-1" to="/signup">
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
