import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ResumePreview from '../components/ResumePreview';

// Define the 20 templates configuration
const TEMPLATES_CONFIG = [
  { id: 'Modern', name: 'Modern Style', category: 'Technology', ats: 'ATS Friendly', desc: 'Left accent bar, modern two-column design.' },
  { id: 'Professional', name: 'Professional Pro', category: 'Business', ats: 'ATS Friendly', desc: 'Classic single column serif typography.' },
  { id: 'Minimal', name: 'Minimalist Clean', category: 'ATS Friendly', ats: 'ATS Friendly', desc: 'Ultra-clean sans-serif single column design.' },
  { id: 'ATS Pro', name: 'ATS Premium', category: 'ATS Friendly', ats: 'ATS Friendly', desc: 'Text-only layout optimized for scanning parsers.' },
  { id: 'Creative', name: 'Creative Designer', category: 'Creative', ats: 'Standard', desc: 'Bold headers with high contrast split layout.' },
  { id: 'Executive', name: 'Executive Leader', category: 'Business', ats: 'Standard', desc: 'Centered header and formal serif layout.' },
  { id: 'Tech Stack', name: 'Tech Stack Dev', category: 'Technology', ats: 'ATS Friendly', desc: 'Code monospaced accents, timeline highlights.' },
  { id: 'Elegant', name: 'Elegant Journal', category: 'Business', ats: 'Standard', desc: 'Emerald accents and detailed project blocks.' },
  { id: 'Classic', name: 'Classic Scholars', category: 'Academic', ats: 'ATS Friendly', desc: 'Traditional red-accent dense layout.' },
  { id: 'Compact', name: 'Compact One Page', category: 'ATS Friendly', ats: 'ATS Friendly', desc: 'Tight vertical grids, ideal for short resumes.' },
  { id: 'Sidebar', name: 'Sidebar Focus', category: 'Creative', ats: 'Standard', desc: 'Bold full-length left colored sidebar column.' },
  { id: 'Timeline', name: 'Timeline Career', category: 'Experienced', ats: 'ATS Friendly', desc: 'Chronological timeline flow for work history.' },
  { id: 'Academic', name: 'Academic Scholar', category: 'Academic', ats: 'Standard', desc: 'Formal multi-column publications structure.' },
  { id: 'Portfolio', name: 'Portfolio Showcase', category: 'Creative', ats: 'Standard', desc: 'Grid block design optimized for project-first views.' },
  { id: 'Bold', name: 'Bold Impact', category: 'Creative', ats: 'Standard', desc: 'Cyan headers, strong bold highlights throughout.' },
  { id: 'Clean Grid', name: 'Clean Grid', category: 'Technology', ats: 'ATS Friendly', desc: 'Geometric blocks and clear visual sections.' },
  { id: 'Startup', name: 'Startup Growth', category: 'Technology', ats: 'ATS Friendly', desc: 'Fast-growing tech style, clean spacing.' },
  { id: 'Data Scientist', name: 'Data Scientist Pro', category: 'Technology', ats: 'ATS Friendly', desc: 'Structured matrix for skills and algorithms.' },
  { id: 'Consulting', name: 'Consulting Expert', category: 'Business', ats: 'ATS Friendly', desc: 'High-density achievements-first consulting layout.' },
  { id: 'One Page Pro', name: 'One Page Pro', category: 'ATS Friendly', ats: 'ATS Friendly', desc: 'Compressed layout for 1-page constraints.' }
];

export default function ResumeTemplatesPage() {
  const navigate = useNavigate();
  
  // Selection states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('Recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePreviewTpl, setActivePreviewTpl] = useState(null); // template ID for large modal preview
  
  // Loaded user resume data to render in the thumbnails
  const [userResumeData, setUserResumeData] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('careerai_resume_data');
    if (saved) {
      try {
        setUserResumeData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleUseTemplate = (templateId) => {
    localStorage.setItem('careerai_template_id', templateId);
    // Navigate to builder
    navigate('/resume/builder?step=preview');
  };

  // Filter & sort logic
  const filteredTemplates = TEMPLATES_CONFIG.filter(tpl => {
    const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory || (selectedCategory === 'ATS Friendly' && tpl.ats === 'ATS Friendly');
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) || tpl.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortOption === 'ATS Friendly') {
      return a.ats === 'ATS Friendly' ? -1 : 1;
    }
    return 0; // Default Recommended / Newest is alphabetical/natural config order
  });

  const categories = ['All', 'ATS Friendly', 'Technology', 'Business', 'Creative', 'Academic', 'Experienced'];

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex pb-20 md:pb-8">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-[260px] min-h-screen w-full relative">
        <Header title="Choose Your Resume Template" subtitle="Select a design layout that matches your target role and career seniority" />

        <main className="flex-grow px-margin-mobile md:px-margin-desktop py-stack-lg max-w-[1200px] mx-auto w-full flex flex-col gap-6">
          
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

          {/* Grid Layout of Templates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                className="bg-surface border border-outline-variant/40 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
              >
                
                {/* Visual Thumbnail (Live Preview box rendered inside a scaled wrapper to avoid placeholders) */}
                <div className="h-64 bg-slate-100 overflow-hidden relative border-b border-outline-variant/30 flex justify-center items-start pt-4 cursor-pointer" onClick={() => setActivePreviewTpl(tpl.id)}>
                  <div className="origin-top scale-[0.25] transition-transform duration-300 group-hover:scale-[0.27] shadow-lg pointer-events-none">
                    <ResumePreview resumeData={userResumeData} templateId={tpl.id} scale={100} />
                  </div>
                  
                  {/* Overlay for quick action */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActivePreviewTpl(tpl.id); }}
                      className="bg-white text-slate-900 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:scale-105 transition-transform cursor-pointer"
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
                      <p className="text-[10px] text-on-surface-variant">{tpl.desc}</p>
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

        </main>
      </div>

      {/* Large Modal Overlay Preview */}
      {activePreviewTpl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-[850px] max-h-[90vh] overflow-hidden flex flex-col border border-outline-variant shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/40 shrink-0">
              <div>
                <h3 className="font-bold text-on-surface text-base">
                  Previewing: {TEMPLATES_CONFIG.find(t => t.id === activePreviewTpl)?.name}
                </h3>
                <p className="text-xs text-on-surface-variant">Press Use Template to activate this design layout</p>
              </div>
              <button
                onClick={() => setActivePreviewTpl(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Scrollable Preview Canvas */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-100 flex justify-center items-start">
              <div className="shadow-lg">
                <ResumePreview resumeData={userResumeData} templateId={activePreviewTpl} scale={90} />
              </div>
            </div>

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
