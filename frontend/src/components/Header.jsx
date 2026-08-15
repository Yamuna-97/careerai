import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Header({ title = 'Dashboard', subtitle }) {
  const [profile, setProfile] = useState(null);
  const [roleTitle, setRoleTitle] = useState('Career Profile');

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch user from /api/v1/users/me
        const userRes = await fetch("http://localhost:8000/api/v1/users/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData = await userRes.json();
          setProfile(userData);
        }

        // Fetch target title from /api/v1/jobs/profile
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

  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 right-0 left-0 z-40 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 border-b border-outline-variant">
      <div>
        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h2>
        {subtitle && <p className="font-body-sm text-body-sm text-on-surface-variant hidden sm:block">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-stack-md">
        {/* Search */}
        <div className="relative hidden sm:block w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search resources, jobs..."
            className="w-full pl-10 pr-4 py-1.5 bg-surface-container-lowest border border-outline-variant/50 rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none input-focus-ring"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-lg transition-colors">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant">
          {profile ? (
            <>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <p className="font-label-sm text-label-sm font-semibold text-on-surface leading-tight">
                  {displayName}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {roleTitle}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse"></div>
              <div className="hidden lg:block text-left space-y-1">
                <div className="w-20 h-3 bg-outline-variant/30 animate-pulse rounded"></div>
                <div className="w-16 h-2 bg-outline-variant/30 animate-pulse rounded"></div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
