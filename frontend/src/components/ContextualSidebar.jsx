import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FilePen,
  LayoutTemplate,
  Sparkles,
  Code2,
  MessageSquareText,
  ClipboardList,
  BarChart2,
  BriefcaseBusiness,
  BookmarkCheck,
  ChevronRight,
  Menu,
  X,
  FileText,
  Mic,
  Briefcase,
} from 'lucide-react';

// ─── Sidebar Configuration for Sections ──────────────────────────────────────
export const SIDEBAR_SECTIONS = {
  resume: {
    label: 'RESUME',
    shortLabel: 'RES',
    headerGradient: 'from-primary to-secondary',
    accentColor: 'text-primary',
    accentBg: 'bg-primary/10',
    activeBorder: 'border-primary',
    icon: FileText,
    items: [
      { name: 'Resume Hub',    path: '/resume',              icon: LayoutDashboard },
      { name: 'Resume Editor', path: '/resume/builder',      icon: FilePen         },
      { name: 'Templates',     path: '/resume/templates',    icon: LayoutTemplate  },
      { name: 'AI Studio',     path: '/resume/ai-studio',    icon: Sparkles        },
      { name: 'LaTeX Editor',  path: '/resume/latex-editor', icon: Code2           },
    ],
  },
  interview: {
    label: 'INTERVIEW',
    shortLabel: 'INT',
    headerGradient: 'from-sky-500 to-blue-600',
    accentColor: 'text-sky-600',
    accentBg: 'bg-sky-500/10',
    activeBorder: 'border-sky-500',
    icon: Mic,
    items: [
      { name: 'Prep Coach',        path: '/interview',            icon: MessageSquareText },
      { name: 'Mock Setup',        path: '/interview-setup',      icon: ClipboardList     },
      { name: 'Evaluation Report', path: '/interview-evaluation', icon: BarChart2         },
    ],
  },
  jobs: {
    label: 'JOB SEARCH',
    shortLabel: 'JOB',
    headerGradient: 'from-emerald-500 to-teal-600',
    accentColor: 'text-emerald-600',
    accentBg: 'bg-emerald-500/10',
    activeBorder: 'border-emerald-500',
    icon: Briefcase,
    items: [
      { name: 'Explore Jobs', path: '/jobs',           icon: BriefcaseBusiness },
      { name: 'Saved Jobs',   path: '/jobs?tab=saved', icon: BookmarkCheck     },
    ],
  },
};

// Helper to determine active section from pathname
export function getActiveSection(pathname) {
  if (pathname.startsWith('/resume') || pathname.startsWith('/resume-editor')) return 'resume';
  if (pathname.startsWith('/interview')) return 'interview';
  if (pathname.startsWith('/jobs')) return 'jobs';
  return null; // Dashboard or other pages have NO contextual sidebar
}

export default function ContextualSidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation();
  const sectionKey = getActiveSection(location.pathname);
  const config = sectionKey ? SIDEBAR_SECTIONS[sectionKey] : null;

  const [isHovered, setIsHovered] = useState(false);
  const closeTimerRef = useRef(null);

  // Hover expansion logic with 200ms grace period to avoid flicker
  const handleMouseEnter = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  }, []);

  // Reset hover state when changing routes
  useEffect(() => {
    setIsHovered(false);
  }, [location.pathname]);

  if (!config) return null;

  const SectionIcon = config.icon;

  const isItemActive = (item) => {
    const currentFull = location.pathname + location.search;
    if (item.path.includes('?')) return currentFull === item.path;

    // Direct match or child route match
    if (location.pathname === item.path) return true;
    if (
      item.path !== '/resume' &&
      item.path !== '/interview' &&
      item.path !== '/jobs' &&
      location.pathname.startsWith(item.path)
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* ── Desktop Persistent Left Sidebar ───────────────────────────────────── */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:block relative z-30 shrink-0 select-none"
      >
        {/* Animated outer container changing width between 68px (collapsed) and 250px (expanded) */}
        <motion.div
          animate={{ width: isHovered ? 250 : 68 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          className="h-full min-h-[calc(100vh-4rem)] bg-surface border-r border-outline-variant/40 flex flex-col shadow-sm overflow-hidden sticky top-16"
        >
          {/* Section Header Banner */}
          <div
            className={`px-4 py-3.5 bg-gradient-to-r ${config.headerGradient} text-white flex items-center justify-between shrink-0 overflow-hidden`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <SectionIcon className="w-4 h-4 text-white" />
              </div>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-black text-xs tracking-wider uppercase truncate whitespace-nowrap"
                >
                  {config.label}
                </motion.span>
              )}
            </div>

            {isHovered && (
              <ChevronRight className="w-4 h-4 text-white/70 shrink-0 transform rotate-180" />
            )}
          </div>

          {/* Navigation Items List */}
          <nav className="p-2 flex flex-col gap-1.5 flex-1 overflow-y-auto scrollbar-none">
            {config.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer
                    ${active
                      ? `${config.accentBg} ${config.accentColor} font-bold shadow-sm border-l-4 ${config.activeBorder}`
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface border-l-4 border-transparent'
                    }
                  `}
                  title={!isHovered ? item.name : undefined}
                >
                  <div
                    className={`
                      w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150
                      ${active
                        ? 'bg-white shadow-sm'
                        : 'bg-surface-container-high/60 group-hover:bg-white group-hover:shadow-sm'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                  </div>

                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xs font-label-md whitespace-nowrap truncate flex-1"
                    >
                      {item.name}
                    </motion.span>
                  )}

                  {active && isHovered && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-2 h-2 rounded-full ${config.accentColor} bg-current shrink-0 ml-auto opacity-70`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Hover Hint */}
          <div className="p-3 border-t border-outline-variant/30 text-center shrink-0">
            <p className="text-[10px] text-on-surface-variant font-medium tracking-tight whitespace-nowrap truncate">
              {isHovered ? '‹ Hover out to collapse' : 'Hover ›'}
            </p>
          </div>
        </motion.div>
      </aside>

      {/* ── Mobile Slide-Out Drawer (Only on screens < 768px) ─────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
            />

            {/* Slide-out Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="md:hidden fixed inset-y-0 left-0 w-72 bg-surface z-50 border-r border-outline-variant shadow-2xl flex flex-col"
            >
              {/* Mobile Drawer Header */}
              <div className={`px-5 py-4 bg-gradient-to-r ${config.headerGradient} text-white flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <SectionIcon className="w-5 h-5 text-white" />
                  <span className="font-black text-sm tracking-wider uppercase">{config.label}</span>
                </div>
                <button
                  onClick={onMobileClose}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Mobile Items List */}
              <nav className="p-3 flex flex-col gap-2 flex-1 overflow-y-auto">
                {config.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onMobileClose}
                      className={`
                        flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all cursor-pointer
                        ${active
                          ? `${config.accentBg} ${config.accentColor} font-bold shadow-sm border-l-4 ${config.activeBorder}`
                          : 'text-on-surface-variant hover:bg-surface-container'
                        }
                      `}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? 'bg-white shadow-sm' : 'bg-surface-container'}`}>
                        <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                      </div>
                      <span className="text-sm font-label-md">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
