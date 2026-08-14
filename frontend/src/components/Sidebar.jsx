import React from 'react';
import { NavLink, Link } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Resume', path: '/resume-editor', icon: 'description' },
    { name: 'Interview', path: '/interview-session', icon: 'mic' },
    { name: 'Jobs', path: '/jobs', icon: 'work' },
    { name: 'Career Insights', path: '/interview-evaluation', icon: 'insights' },
    { name: 'Saved Jobs', path: '/jobs', icon: 'bookmark' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-[260px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface flex-col py-stack-lg z-50">
        {/* Brand Logo */}
        <div className="px-stack-lg mb-stack-xl flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg ai-gradient flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-on-primary icon-filled">psychology</span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary">CareerAI</h1>
              <p className="font-label-sm text-label-sm text-on-surface-variant">AI-Driven Career Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col gap-1 px-stack-sm flex-grow">
          {navItems.map((item) => (
            <li key={item.name + item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'text-primary font-bold border-l-4 border-primary bg-surface-container-low scale-[0.98]'
                      : 'text-on-surface-variant hover:bg-surface-container border-l-4 border-transparent hover:border-outline-variant'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`material-symbols-outlined ${isActive ? 'icon-filled' : ''}`}>
                      {item.icon}
                    </span>
                    <span className="font-label-md text-label-md">{item.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom User Area */}
        <div className="px-stack-sm mt-auto border-t border-outline-variant pt-stack-md flex flex-col gap-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">person</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Sign Out</span>
          </Link>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline-variant z-50 px-2 py-2 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.name + item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-xs font-label-sm ${
                isActive ? 'text-primary font-bold' : 'text-on-surface-variant'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'icon-filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[10px]">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
