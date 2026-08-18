import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import ProfileModal from './ProfileModal';

export default function Sidebar() {
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Resume Hub', path: '/resume', icon: 'description' },
    { name: 'Interview Prep', path: '/interview', icon: 'mic' },
    { name: 'Find Jobs', path: '/jobs', icon: 'work' },
    { name: 'Interview Results', path: '/interview-evaluation', icon: 'insights' },
    { name: 'Saved Jobs', path: '/jobs?tab=saved', icon: 'bookmark' },
  ];

  // Helper to check if location is in resume workflows
  const isResumePath = location.pathname.startsWith('/resume');

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-[260px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface flex-col py-stack-lg z-50">
        {/* Brand Logo */}
        <div className="px-stack-lg mb-stack-xl flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform ring-1 ring-primary/20">
              <img src="/favicon.png" alt="CareerAI" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#EC4899] to-[#8B5CF6]">CareerAI</h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant">AI-Driven Career Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-1 px-stack-sm flex-grow">
          {navItems.map((item) => {
            const currentFull = location.pathname + location.search;
            const isActive = item.path === '/resume'
              ? isResumePath
              : item.path.includes('?')
                ? currentFull === item.path
                : location.pathname === item.path && !location.search;
            return (
              <li key={item.name + item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low scale-[0.98]'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">{item.name}</span>
                </Link>

                {/* Submenu for Resume feature */}
                {item.name === 'Resume Hub' && isResumePath && (
                  <ul className="pl-9 pr-2 py-1 space-y-1 bg-surface-container-lowest/50 rounded-lg my-1 animate-fade-in">
                    <li>
                      <Link
                        to="/resume/builder"
                        className={`block py-1 text-[11px] font-semibold ${
                          location.pathname === '/resume/builder' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        • Resume Editor
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/resume/ai-studio"
                        className={`block py-1 text-[11px] font-semibold ${
                          location.pathname.startsWith('/resume/ai-studio') ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        • AI Studio
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/resume/templates"
                        className={`block py-1 text-[11px] font-semibold ${
                          location.pathname === '/resume/templates' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        • Template Gallery
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {/* Bottom User Area */}
        <div className="px-stack-sm mt-auto border-t border-outline-variant pt-stack-md flex flex-col gap-1">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md text-label-md font-semibold">Profile Details</span>
          </button>
          <Link
            to="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md font-semibold">Sign Out</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 px-2 py-2 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.slice(0, 5).map((item) => {
          const isActive = item.path === '/resume' ? isResumePath : location.pathname === item.path;
          return (
            <Link
              key={item.name + item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-label-sm ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${isActive ? 'icon-filled' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Profile Details Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
