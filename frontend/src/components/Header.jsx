import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { SlideTabs } from './ui/slide-tabs';
import { Brain, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import apiClient from '../api/client';
import ProfileModal from './ProfileModal';

export default function Header({ onToggleMobileSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [profile, setProfile] = useState(null);
  const [roleTitle, setRoleTitle] = useState('Career Profile');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const [userRes, jobRes] = await Promise.allSettled([
          apiClient.get('/users/me'),
          apiClient.get('/jobs/profile')
        ]);

        if (userRes.status === 'fulfilled' && userRes.value?.data) {
          setProfile(userRes.value.data);
          if (userRes.value.data.title) {
            setRoleTitle(userRes.value.data.title);
          }
        }

        if (jobRes.status === 'fulfilled') {
          const jobData = jobRes.value.data;
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

    // Listen for custom profile update events
    const handleProfileUpdate = (e) => {
      if (e.detail) {
        setProfile(prev => ({ ...prev, ...e.detail }));
        if (e.detail.title) setRoleTitle(e.detail.title);
      }
    };
    window.addEventListener('careerai:profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('careerai:profile-updated', handleProfileUpdate);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('careerai_token');
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
    <>
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                <Brain className="w-5 h-5 fill-current" />
              </div>
              <div className="hidden sm:block text-left">
                <h1 className="font-headline-sm text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] tracking-tight">CareerAI</h1>
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
          <div className="flex items-center gap-3 shrink-0">
            {/* User profile dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer text-left focus:outline-none"
              >
                {profile ? (
                  <>
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover border border-primary shadow-sm select-none"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs select-none">
                        {initials}
                      </div>
                    )}
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
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-outline-variant rounded-xl shadow-lg py-1.5 z-50 animate-fade-in-up">
                  {profile && (
                    <div className="px-4 py-2.5 border-b border-outline-variant/50 mb-1 flex items-center gap-2.5">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || 'User'}
                          className="w-9 h-9 rounded-full object-cover border border-primary shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#EC4899] to-[#FF8A3D] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-xs font-bold text-on-surface truncate">{profile.full_name || 'CareerAI User'}</p>
                        <p className="text-[10px] text-on-surface-variant truncate">{profile.email}</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer"
                  >
                    <User className="w-4 h-4 text-primary" />
                    Profile Details
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left border-t border-outline-variant/50 mt-1 cursor-pointer"
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

      {/* Profile Details & Photo Upload Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updated) => {
          setProfile(updated);
          if (updated.title) setRoleTitle(updated.title);
        }}
      />
    </>
  );
}
