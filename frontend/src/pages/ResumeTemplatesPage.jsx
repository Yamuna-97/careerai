import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import ResumePreview from '../components/ResumePreview';

// Official 9 LaTeX templates configuration matching backend
const DEFAULT_TEMPLATES_CONFIG = [
  { id: '1', name: 'AltaCV Template', category: 'Creative', ats: 'ATS Friendly', desc: 'Elegant two-column layout with sidebar icons, skill rating bars, and modern typography.' },
  { id: '2', name: 'CurVe Academic CV', category: 'Academic', ats: 'Standard', desc: 'Comprehensive modular academic CV layout with separate rubric sections.' },
  { id: '3', name: 'MBZUAI Clean Resume', category: 'Modern', ats: 'ATS Friendly', desc: 'Single-column clean research and developer layout with accented blue headings.' },
  { id: '4', name: 'Harshibar Developer Resume', category: 'Tech', ats: 'ATS Friendly', desc: 'High-impact single-column software engineer format optimized for technical ATS parsers.' },
  { id: '5', name: 'SixtySeconds Modern CV', category: 'Creative', ats: 'Standard', desc: 'Dense modern two-column sidebar layout with profile badges and structured timeline.' },
  { id: '6', name: 'IIIT Vadodara Placement CV', category: 'Business', ats: 'ATS Friendly', desc: 'Structured single-column institutional format with project and achievement highlights.' },
  { id: '7', name: 'Intern Fair Corporate CV', category: 'Business', ats: 'ATS Friendly', desc: 'Tabular multi-section layout ideal for enterprise and campus recruiting.' },
  { id: '8', name: 'Olico Timeline Resume', category: 'Modern', ats: 'ATS Friendly', desc: 'Clean timeline-based single-column layout with skills categorization and highlights.' },
  { id: '9', name: 'TCCV Compact Two-Column', category: 'Compact', ats: 'Standard', desc: 'Compact two-column timeline design based on the classic tccv document class.' }
];
/* ─── Responsive A4 Card Preview Wrapper ───────────────────────────── */
function TemplatePreviewWrapper({ templateId, resumeData, onClick }) {
  const containerRef = React.useRef(null);
  const [scale, setScale] = useState(0.25);
  const [containerHeight, setContainerHeight] = useState(280);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const containerWidth = containerRef.current.offsetWidth;
      const targetWidth = containerWidth * 0.85;
      const finalWidth = Math.min(targetWidth, 320);
      const newScale = finalWidth / 800;
      setScale(newScale);

      const calculatedHeight = finalWidth * 1.414;
      setContainerHeight(Math.round(calculatedHeight + 32));
    };

    updateSize();
    const timer = setTimeout(updateSize, 50);

    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className="w-full bg-slate-100 overflow-hidden relative border-b border-outline-variant/30 flex justify-center items-center cursor-pointer transition-all duration-300"
      style={{ height: `${containerHeight}px` }}
    >
      <div
        className="transition-transform duration-300 group-hover:scale-[1.03]"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0
        }}
      >
        <div
          className="shadow-md transition-shadow duration-300 group-hover:shadow-lg pointer-events-none"
          style={{
            width: '800px',
            height: '1131px',
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            flexShrink: 0
          }}
        >
          <ResumePreview resumeData={resumeData} templateId={templateId} scale={100} useTemplateMock={true} />
        </div>
      </div>
    </div>
  );
}

/* ─── High-Fidelity A4 Modal Preview Wrapper (LaTeX PDF) ──────────────────────────── */
function ModalPreviewWrapper({ templateId }) {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    apiClient.get(`/latex/templates/${templateId}/preview`)
      .then(res => {
        if (res.data && res.data.success && res.data.pdf) {
          setPdfData(res.data.pdf);
        } else {
          setError('Failed to compile PDF template.');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Error connecting to compiler service.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [templateId]);

  return (
    <div className="flex-1 overflow-hidden p-4 bg-slate-100 flex flex-col justify-center items-center min-h-[500px]">
      {loading && (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-on-surface-variant font-semibold">Compiling LaTeX template...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center p-6 space-y-3 bg-white rounded-xl border border-red-200 max-w-md shadow-sm">
          <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
          <h4 className="font-bold text-sm text-on-surface">Preview Failed</h4>
          <p className="text-xs text-on-surface-variant">{error}</p>
        </div>
      )}

      {!loading && !error && pdfData && (
        <iframe
          src={`data:application/pdf;base64,${pdfData}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full min-h-[550px] rounded-lg shadow-lg border border-outline-variant/30"
          title="LaTeX Resume Template Preview"
        />
      )}
    </div>
  );
}


export default function ResumeTemplatesPage() {
  const navigate = useNavigate();
  
  // Selection states
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES_CONFIG);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('Recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewTpl, setActivePreviewTpl] = useState(null);
  
  // Loaded user resume data to render in the thumbnails
  const [userResumeData, setUserResumeData] = useState(null);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  useEffect(() => {
    // 1. Fetch official templates from backend
    apiClient.get('/templates')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTemplates(res.data.map(t => ({
            ...t,
            ats: t.category === 'Tech' || t.category === 'Business' || t.category === 'Modern' ? 'ATS Friendly' : 'Standard'
          })));
        }
      })
      .catch(() => {
        // Fallback to local default
        setTemplates(DEFAULT_TEMPLATES_CONFIG);
      });

    // 2. Fetch active user resume data from backend / database first
    apiClient.get('/resumes')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const active = res.data[0];
          setUserResumeData(active);
          setHasLoadedData(true);
          // Sync to cache
          localStorage.setItem('careerai_resume_data', JSON.stringify(active));
          return;
        }
        throw new Error('No backend resume');
      })
      .catch(() => {
        // Fallback to local storage cache if available
        const saved = localStorage.getItem('careerai_resume_data');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && (parsed.personal?.fullName || parsed.fullName || parsed.title)) {
              setUserResumeData(parsed);
              setHasLoadedData(true);
            }
          } catch (e) {
            console.error(e);
          }
        }
      });
  }, []);

  const handleUseTemplate = (templateId) => {
    localStorage.setItem('careerai_template_id', templateId);
    navigate('/resume/builder');
  };

  // Filter & sort logic
  const filteredTemplates = templates.filter(tpl => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory || (selectedCategory === 'ATS Friendly' && tpl.ats === 'ATS Friendly');
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || (tpl.desc || tpl.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortOption === 'ATS Friendly') {
      return a.ats === 'ATS Friendly' ? -1 : 1;
    }
    return 0;
  });

  const categories = ['All', 'ATS Friendly', 'Tech', 'Business', 'Creative', 'Academic', 'Modern', 'Compact'];

  const hasResume = Boolean(userResumeData && (userResumeData.personal?.fullName || userResumeData.fullName || userResumeData.email));

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1200px] mx-auto w-full flex flex-col gap-6 pb-20 md:pb-8">

      {/* Header Banner if no resume is uploaded yet */}
      {!hasResume && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-2xl mt-0.5">info</span>
            <div>
              <h3 className="font-bold text-on-surface text-sm">Personalize Your Previews</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                No resume data available yet. Upload your resume or create one in the Resume Editor to generate personalized previews across all templates.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => navigate('/resume/ai')}
              className="flex-1 sm:flex-initial bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Upload Resume
            </button>
            <button
              onClick={() => navigate('/resume/builder')}
              className="flex-1 sm:flex-initial border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-xs font-bold hover:bg-surface-container transition-colors"
            >
              Open Editor
            </button>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-surface p-4 border border-outline-variant/40 rounded-xl shadow-sm space-y-4">
        
        {/* Category selection */}
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                  : 'border-outline-variant/35 text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-outline-variant/20 pt-4">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">search</span>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-on-surface-variant font-semibold">Sort By:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-surface border border-outline-variant rounded px-2 py-1 text-xs cursor-pointer focus:outline-none"
            >
              <option value="Recommended">Recommended</option>
              <option value="ATS Friendly">ATS Friendly First</option>
              <option value="Newest">Newest</option>
            </select>
          </div>
        </div>

      </div>

      {/* Grid Layout of Templates (1 through 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTemplates.map(tpl => (
          <div
            key={tpl.id}
            className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
          >
            
            {/* Visual Thumbnail */}
            <div className="relative overflow-hidden border-b border-outline-variant/30">
              <TemplatePreviewWrapper
                resumeData={userResumeData}
                templateId={tpl.id}
                onClick={() => setActivePreviewTpl(tpl.id)}
              />
              
              {/* Overlay for quick action */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 pointer-events-none">
                <button
                  onClick={(e) => { e.stopPropagation(); setActivePreviewTpl(tpl.id); }}
                  className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer pointer-events-auto"
                >
                  Preview Large
                </button>
              </div>
            </div>

            {/* Info and Actions */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-on-surface text-sm">{tpl.name}</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-2">{tpl.desc || tpl.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="bg-surface-container-high px-2 py-0.5 rounded text-[9px] font-bold text-on-surface-variant">
                  {tpl.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  tpl.ats === 'ATS Friendly' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
                  {tpl.ats}
                </span>
              </div>

              <div className="flex gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  onClick={() => setActivePreviewTpl(tpl.id)}
                  className="flex-1 border border-outline-variant/35 text-on-surface-variant text-center py-2 rounded-lg text-[10px] font-bold hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Preview Layout
                </button>
                <button
                  onClick={() => handleUseTemplate(tpl.id)}
                  className="flex-1 bg-primary text-on-primary text-center py-2 rounded-lg text-[10px] font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Use Template
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Large Modal Overlay Preview */}
      {activePreviewTpl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col border border-outline-variant shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/40 shrink-0">
              <div>
                <h3 className="font-bold text-on-surface text-base">
                  Previewing: {templates.find(t => t.id === activePreviewTpl)?.name}
                </h3>
                <p className="text-xs text-on-surface-variant">Click Use This Template to activate this design</p>
              </div>
              <button
                onClick={() => setActivePreviewTpl(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scrollable Preview Canvas */}
            <ModalPreviewWrapper templateId={activePreviewTpl} />

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-outline-variant/40 shrink-0 bg-surface">
              <button
                onClick={() => setActivePreviewTpl(null)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleUseTemplate(activePreviewTpl);
                  setActivePreviewTpl(null);
                }}
                className="bg-primary text-on-primary px-6 py-2 rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Use This Template
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
