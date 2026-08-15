import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { SlideTabs } from './ui/slide-tabs';
import { Brain, Search, Bell, User, Settings, LogOut, ChevronDown, Menu } from 'lucide-react';

export default function Header({ onToggleMobileSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profile, setProfile] = useState(null);
  const [roleTitle, setRoleTitle] = useState('Career Profile');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userRes = await fetch("http://localhost:8000/api/v1/users/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile(userData);
        }

        const jobRes = await fetch("http://localhost:8000/api/v1/jobs/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (jobRes.ok) {
          const jobData = await jobRes.json();
          if (jobData.profile_exists && jobData.profile?.current_title) {
            setRoleTitle(jobData.profile.current_title);
          } else if (jobData.extracted_draft?.current_title) {
            setRoleTitle(jobData.extracted_draft.current_title);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile in header:", err);
      }
    }

    loadUserProfile();
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  };

  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = profile ? getInitials(profile.full_name) : '';
  const displayName = profile ? profile.full_name : '';

  // Primary navigation setup
  const primaryTabs = ['Dashboard', 'Resume', 'Interview', 'Jobs'];
  const getSelectedIndex = (pathname) => {
    if (pathname.startsWith('/dashboard')) return 0;
    if (pathname.startsWith('/resume') || pathname.startsWith('/resume-editor')) return 1;
    if (pathname.startsWith('/interview')) return 2;
    if (pathname.startsWith('/jobs')) return 3;
    return 0;
  };

  const activeIndex = getSelectedIndex(location.pathname);

  const handleSelectTab = (index) => {
    const paths = ['/dashboard', '/resume', '/interview', '/jobs'];
    navigate(paths[index]);
  };

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col shrink-0 bg-surface/90 backdrop-blur-md border-b border-outline-variant">
      {/* Top Navbar */}
      <header className="relative flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 w-full max-w-container-max mx-auto">
        {/* Brand Logo & Mobile Sidebar Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden p-1.5 text-on-surface-variant hover:bg-surface-container rounded-lg"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
              <Brain className="w-5 h-5 fill-current" />
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="font-headline-sm text-sm font-extrabold text-primary tracking-tight">CareerAI</h1>
              <p className="text-[10px] text-on-surface-variant font-semibold">Smart Platform</p>
            </div>
          </Link>
        </div>

        {/* Primary Animated Navigation */}
        <div className="flex-1 max-w-md mx-auto hidden md:flex justify-center">
          <SlideTabs
            tabs={primaryTabs}
            selected={activeIndex}
            onSelect={handleSelectTab}
          />
        </div>

        {/* Right User Area */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Search bar inside header (only visible when not in active search pages) */}
          {!location.pathname.startsWith('/jobs') && (
            <div className="relative hidden xl:block w-48">
              <Search className="w-4 h-4 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-9 pr-4 py-1.5 bg-surface-container border border-outline-variant/60 rounded-full text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Notifications */}
          <button className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
          </button>

          {/* User profile dropdown */}
          <div className="relative pl-2 border-l border-outline-variant">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer text-left focus:outline-none"
            >
              {profile ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs select-none">
                    {initials}
                  </div>
                  <div className="hidden lg:flex items-center gap-1">
                    <div className="text-left">
                      <p className="font-label-sm text-xs font-semibold text-on-surface leading-tight truncate max-w-[100px]">
                        {displayName}
                      </p>
                      <p className="text-[9px] text-on-surface-variant leading-none mt-0.5 max-w-[90px] truncate">
                        {roleTitle}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse"></div>
                  <div className="hidden lg:block space-y-1">
                    <div className="w-16 h-3 bg-outline-variant/30 animate-pulse rounded"></div>
                    <div className="w-12 h-2 bg-outline-variant/30 animate-pulse rounded"></div>
                  </div>
                </>
              )}
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-surface border border-outline-variant rounded-xl shadow-lg py-1.5 z-50 animate-fade-in-up">
                {profile && (
                  <div className="px-4 py-2 border-b border-outline-variant/50 mb-1">
                    <p className="font-label-md text-xs font-bold text-on-surface truncate">{profile.full_name}</p>
                    <p className="text-[10px] text-on-surface-variant truncate">{profile.email}</p>
                  </div>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-error hover:bg-error/10 transition-colors text-left border-t border-outline-variant/50 mt-1 pt-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Primary Mobile Navigation (only visible on mobile screens) */}
      <div className="md:hidden flex justify-center pb-3 px-margin-mobile">
        <SlideTabs 
          tabs={primaryTabs} 
          selected={activeIndex} 
          onSelect={handleSelectTab} 
        />
      </div>
    </div>
  );
}

