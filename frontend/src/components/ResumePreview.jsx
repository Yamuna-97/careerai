import React from 'react';

export default function ResumePreview({ resumeData, templateId = 'Modern', scale = 100 }) {
  const data = resumeData || {};
  const tpl = templateId.toLowerCase();

  // Dynamic schema normalization to support both Manual Builder and AI Studio formats
  const fullName = data.fullName || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : '') || 'Your Name';
  const title = data.title || 'Job Title';

  // Normalize education
  const rawEdu = data.education || [];
  const education = Array.isArray(rawEdu) ? rawEdu : (rawEdu.school || rawEdu.degree ? [rawEdu] : []);

  // Normalize experience
  const experience = data.experience || data.experiences || [];

  // Normalize skills
  let skills = [];
  if (Array.isArray(data.skills)) {
    skills = data.skills;
  } else if (data.skills && typeof data.skills === 'object') {
    if (data.skills.design) {
      skills.push(...data.skills.design.split(',').map(s => ({ id: Math.random().toString(), name: s.trim(), category: 'Design Skills' })));
    }
    if (data.skills.tools) {
      skills.push(...data.skills.tools.split(',').map(s => ({ id: Math.random().toString(), name: s.trim(), category: 'Tools & Tech' })));
    }
    if (data.skills.research) {
      skills.push(...data.skills.research.split(',').map(s => ({ id: Math.random().toString(), name: s.trim(), category: 'Research' })));
    }
  }

  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const achievements = data.achievements || [];
  const languages = data.languages || [];

  // Theme styling helpers based on template
  const getThemeStyles = () => {
    switch (tpl) {
      case 'modern':
        return { font: 'font-sans', text: 'text-slate-800', primary: 'text-indigo-600', border: 'border-indigo-100', headerBg: 'bg-indigo-50/50' };
      case 'professional':
        return { font: 'font-serif', text: 'text-zinc-800', primary: 'text-blue-900', border: 'border-zinc-200', headerBg: '' };
      case 'minimal':
        return { font: 'font-mono', text: 'text-neutral-800', primary: 'text-neutral-900', border: 'border-neutral-200', headerBg: '' };
      case 'ats pro':
        return { font: 'font-sans', text: 'text-black', primary: 'text-black', border: 'border-black', headerBg: '' };
      case 'creative':
        return { font: 'font-sans', text: 'text-stone-800', primary: 'text-purple-700', border: 'border-purple-100', headerBg: 'bg-purple-50/30' };
      case 'executive':
        return { font: 'font-serif', text: 'text-slate-900', primary: 'text-cyan-950', border: 'border-slate-300', headerBg: '' };
      case 'tech stack':
        return { font: 'font-mono', text: 'text-teal-950', primary: 'text-teal-700', border: 'border-teal-100', headerBg: 'bg-teal-50/10' };
      case 'elegant':
        return { font: 'font-serif', text: 'text-gray-800', primary: 'text-emerald-800', border: 'border-emerald-100', headerBg: '' };
      case 'classic':
        return { font: 'font-serif', text: 'text-stone-900', primary: 'text-red-900', border: 'border-stone-300', headerBg: '' };
      case 'compact':
        return { font: 'font-sans text-[11px]', text: 'text-slate-900', primary: 'text-indigo-900', border: 'border-slate-200', headerBg: '' };
      case 'sidebar':
        return { font: 'font-sans', text: 'text-slate-800', primary: 'text-violet-700', border: 'border-violet-100', headerBg: '' };
      case 'timeline':
        return { font: 'font-sans', text: 'text-gray-800', primary: 'text-amber-800', border: 'border-amber-100', headerBg: '' };
      case 'academic':
        return { font: 'font-serif', text: 'text-neutral-900', primary: 'text-neutral-950', border: 'border-neutral-400', headerBg: '' };
      case 'portfolio':
        return { font: 'font-sans', text: 'text-rose-950', primary: 'text-rose-600', border: 'border-rose-100', headerBg: '' };
      case 'bold':
        return { font: 'font-sans font-medium', text: 'text-slate-900', primary: 'text-sky-700', border: 'border-sky-200', headerBg: '' };
      case 'clean grid':
        return { font: 'font-sans', text: 'text-slate-800', primary: 'text-indigo-600', border: 'border-indigo-100', headerBg: '' };
      case 'startup':
        return { font: 'font-sans', text: 'text-slate-900', primary: 'text-fuchsia-700', border: 'border-fuchsia-100', headerBg: '' };
      case 'data scientist':
        return { font: 'font-mono', text: 'text-cyan-950', primary: 'text-cyan-600', border: 'border-cyan-100', headerBg: '' };
      case 'consulting':
        return { font: 'font-serif', text: 'text-slate-800', primary: 'text-sky-900', border: 'border-sky-100', headerBg: '' };
      case 'one page pro':
        return { font: 'font-sans text-[11px]', text: 'text-stone-900', primary: 'text-orange-850', border: 'border-stone-200', headerBg: '' };
      default:
        return { font: 'font-sans', text: 'text-slate-800', primary: 'text-indigo-600', border: 'border-indigo-100', headerBg: '' };
    }
  };

  const theme = getThemeStyles();
  const skillCategories = ['Programming Languages', 'Frameworks', 'Databases', 'Machine Learning', 'Tools', 'Tools & Tech', 'Research', 'Design Skills', 'Other'];

  const renderSectionHeader = (titleText) => {
    if (tpl === 'ats pro') {
      return (
        <h2 className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2 mt-4 text-black">
          {titleText}
        </h2>
      );
    }
    if (tpl === 'minimal') {
      return (
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest border-b border-neutral-300 pb-1 mb-3 text-neutral-900">
          // {titleText}
        </h2>
      );
    }
    return (
      <h2 className={`text-xs font-bold uppercase tracking-wider border-b ${theme.border} pb-1 mb-3 ${theme.primary}`}>
        {titleText}
      </h2>
    );
  };

  // Layout A: Sidebar (Double column split)
  const renderSidebarLayout = () => {
    return (
      <div className="grid grid-cols-12 gap-6 min-h-[1000px]">
        {/* Left Column */}
        <div className="col-span-4 bg-slate-50 p-6 rounded-lg border border-slate-100 space-y-6">
          <div className="text-center">
            {data.profileImage && (
              <img src={data.profileImage} alt="Profile" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-indigo-500 mb-3" />
            )}
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">{fullName}</h1>
            <p className="text-xs font-semibold text-indigo-600 mt-1 uppercase tracking-wider">{title}</p>
          </div>

          <div className="space-y-3 text-[10px] text-slate-600 border-t border-slate-200 pt-4">
            <h3 className="font-bold uppercase text-slate-700 tracking-wider">Contact</h3>
            {data.email && <div className="truncate"><span className="font-semibold">Email:</span> {data.email}</div>}
            {data.phone && <div><span className="font-semibold">Phone:</span> {data.phone}</div>}
            {data.location && <div><span className="font-semibold">Location:</span> {data.location}</div>}
            {data.linkedin && <div className="truncate"><span className="font-semibold">LinkedIn:</span> {data.linkedin}</div>}
            {data.github && <div className="truncate"><span className="font-semibold">GitHub:</span> {data.github}</div>}
            {data.portfolio && <div className="truncate"><span className="font-semibold">Web:</span> {data.portfolio}</div>}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">Skills</h3>
              <div className="space-y-2 text-[10px]">
                {skillCategories.map(cat => {
                  const catSkills = skills.filter(s => s.category === cat);
                  if (catSkills.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h4 className="font-bold text-slate-800">{cat}</h4>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{catSkills.map(s => s.name).join(', ')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-8 space-y-6">
          {data.summary && (
            <section>
              {renderSectionHeader('Profile Summary')}
              <p className="text-xs leading-relaxed text-slate-700">{data.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              {renderSectionHeader('Professional Experience')}
              {experience.map((exp, idx) => {
                const pos = exp.position || exp.role || '';
                const companyName = exp.company || '';
                const loc = exp.location || '';
                const per = exp.period || (exp.startDate ? `${exp.startDate} – ${exp.currentlyWorking ? 'Present' : exp.endDate}` : '');
                
                return (
                  <div key={exp.id || idx} className="mb-4 text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">{pos}</h3>
                      <span className="text-[10px] text-slate-500 font-semibold">{per}</span>
                    </div>
                    <p className="text-xs text-indigo-600 font-semibold mb-1">{companyName} {loc ? `| ${loc}` : ''}</p>
                    {exp.bullets ? (
                      <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-slate-700">
                        {exp.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                      </ul>
                    ) : (
                      <p className="text-slate-700 leading-relaxed pl-1 whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {projects.length > 0 && (
            <section>
              {renderSectionHeader('Projects')}
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="mb-4 text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-slate-900 text-sm">{proj.name}</h3>
                    <span className="text-[10px] text-slate-500 font-semibold">{proj.startDate} – {proj.endDate}</span>
                  </div>
                  {proj.technologies && (
                    <p className="text-[10px] text-indigo-600 font-semibold mb-1 uppercase tracking-wide">Tech Stack: {proj.technologies}</p>
                  )}
                  <p className="text-slate-700 leading-relaxed mb-1">{proj.description}</p>
                </div>
              ))}
            </section>
          )}

          {education.length > 0 && (
            <section>
              {renderSectionHeader('Education')}
              {education.map((edu, idx) => {
                const school = edu.institution || edu.school || '';
                const deg = edu.degree || '';
                const field = edu.fieldOfStudy || '';
                const per = edu.period || (edu.startDate ? `${edu.startDate} – ${edu.endDate}` : '');
                
                return (
                  <div key={edu.id || idx} className="mb-3 text-xs">
                    <h3 className="font-bold text-slate-900">{deg} {field ? `in ${field}` : ''}</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5">{school}</p>
                    <div className="flex justify-between mt-0.5 text-[10px] text-slate-500">
                      <span>{per}</span>
                      {edu.grade && <span className="font-bold text-indigo-600">Grade: {edu.grade}</span>}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </div>
    );
  };

  // Layout B: Standard/Timeline/Single Column
  const renderStandardLayout = () => {
    const isCreative = tpl === 'creative' || tpl === 'portfolio';
    const mainCols = isCreative ? 'col-span-8 space-y-6' : 'space-y-6';
    const rightCols = isCreative ? 'col-span-4 space-y-6 border-l border-gray-200 pl-4' : 'space-y-6';

    return (
      <div className="space-y-6">
        {/* Header Block */}
        <header className={`border-b-2 ${theme.border} pb-6 mb-4 flex justify-between items-center ${tpl === 'executive' ? 'text-center flex-col gap-3' : 'text-left'}`}>
          <div className="flex-grow">
            <h1 className={`text-4xl font-extrabold tracking-tight uppercase ${theme.primary}`}>
              {fullName}
            </h1>
            <p className="text-xl font-bold mt-1 uppercase tracking-widest text-slate-600">{title}</p>
            <div className={`flex flex-wrap gap-4 mt-4 text-xs text-slate-500 ${tpl === 'executive' ? 'justify-center' : 'justify-start'}`}>
              {data.email && <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">mail</span>{data.email}</div>}
              {data.phone && <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">phone</span>{data.phone}</div>}
              {data.location && <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span>{data.location}</div>}
              {data.linkedin && <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">link</span>{data.linkedin}</div>}
              {data.github && <div className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">link</span>{data.github}</div>}
            </div>
          </div>
          {data.profileImage && tpl !== 'executive' && (
            <img src={data.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-slate-200 ml-4 shrink-0 shadow-sm" />
          )}
        </header>

        {/* Profile Summary */}
        {data.summary && (
          <section className={theme.headerBg + " p-3 rounded-lg"}>
            {renderSectionHeader('Professional Summary')}
            <p className="text-xs leading-relaxed text-slate-700">{data.summary}</p>
          </section>
        )}

        <div className={`grid ${isCreative ? 'grid-cols-12' : 'grid-cols-1'} gap-6`}>
          {/* Main sections column */}
          <div className={mainCols}>
            {/* Experience timeline / standard */}
            {experience.length > 0 && (
              <section>
                {renderSectionHeader('Experience')}
                <div className="space-y-4">
                  {experience.map((exp, idx) => {
                    const pos = exp.position || exp.role || '';
                    const companyName = exp.company || '';
                    const loc = exp.location || '';
                    const per = exp.period || (exp.startDate ? `${exp.startDate} – ${exp.currentlyWorking ? 'Present' : exp.endDate}` : '');
                    
                    return (
                      <div key={exp.id || idx} className="text-xs relative pl-3 border-l-2 border-slate-100 hover:border-indigo-400 transition-colors">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900 text-[13px]">{pos}</h3>
                          <span className="text-[10px] text-slate-500 font-semibold">{per}</span>
                        </div>
                        <p className="text-xs text-indigo-600 font-semibold mb-1">{companyName} {loc ? `| ${loc}` : ''}</p>
                        {exp.bullets ? (
                          <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                            {exp.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                          </ul>
                        ) : (
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                {renderSectionHeader('Projects')}
                <div className="space-y-4">
                  {projects.map((proj, idx) => (
                    <div key={proj.id || idx} className="text-xs">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-[13px]">{proj.name}</h3>
                        <span className="text-[10px] text-slate-500 font-semibold">{proj.startDate} – {proj.endDate}</span>
                      </div>
                      {proj.technologies && (
                        <p className="text-[10px] text-indigo-600 font-bold mb-1 uppercase tracking-wide">Tech Stack: {proj.technologies}</p>
                      )}
                      <p className="text-slate-700 leading-relaxed mb-1">{proj.description}</p>
                      <div className="flex gap-3 text-[10px] text-gray-500 font-semibold">
                        {proj.githubUrl && <span>GitHub: {proj.githubUrl}</span>}
                        {proj.liveUrl && <span>Live Demo: {proj.liveUrl}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Secondary side columns (Only on Creative layout, otherwise inline at bottom) */}
          <div className={rightCols}>
            {/* Skills */}
            {skills.length > 0 && (
              <section>
                {renderSectionHeader('Skills')}
                <div className="space-y-2 text-xs">
                  {skillCategories.map(cat => {
                    const catSkills = skills.filter(s => s.category === cat);
                    if (catSkills.length === 0) return null;
                    return (
                      <div key={cat}>
                        <h4 className="font-bold text-slate-800 text-[11px]">{cat}</h4>
                        <p className="text-gray-600 mt-0.5 leading-relaxed">{catSkills.map(s => s.name).join(', ')}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section>
                {renderSectionHeader('Education')}
                {education.map((edu, idx) => {
                  const school = edu.institution || edu.school || '';
                  const deg = edu.degree || '';
                  const field = edu.fieldOfStudy || '';
                  const per = edu.period || (edu.startDate ? `${edu.startDate} – ${edu.endDate}` : '');
                  
                  return (
                    <div key={edu.id || idx} className="mb-3 text-xs">
                      <h3 className="font-bold text-slate-900 text-[13px]">{deg} {field ? `in ${field}` : ''}</h3>
                      <p className="text-[11px] text-gray-600 mt-0.5">{school}</p>
                      <div className="flex justify-between mt-0.5 text-[10px] text-gray-500">
                        <span>{per}</span>
                        {edu.grade && <span className="font-bold text-indigo-600">Grade: {edu.grade}</span>}
                      </div>
                      {edu.description && <p className="text-slate-500 text-[10px] mt-1 italic">{edu.description}</p>}
                    </div>
                  );
                })}
              </section>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <section>
                {renderSectionHeader('Certifications')}
                {certifications.map((cert, idx) => (
                  <div key={cert.id || idx} className="mb-2 text-xs">
                    <h3 className="font-bold text-slate-900 text-[12px]">{cert.name}</h3>
                    <p className="text-[11px] text-gray-600 mt-0.5">{cert.issuer} {cert.issueDate ? `| ${cert.issueDate}` : ''}</p>
                  </div>
                ))}
              </section>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <section>
                {renderSectionHeader('Achievements')}
                {achievements.map((ach, idx) => (
                  <div key={ach.id || idx} className="mb-3 text-xs">
                    <h3 className="font-bold text-slate-900 text-[12px]">{ach.title}</h3>
                    <p className="text-[11px] text-gray-600 mt-0.5">{ach.organization} {ach.date ? `| ${ach.date}` : ''}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`w-full max-w-[800px] bg-white text-gray-900 shadow-xl rounded-sm p-10 flex flex-col border border-outline-variant mx-auto transition-transform origin-top ${theme.font} ${theme.text}`}
      style={{ transform: `scale(${scale / 100})`, minHeight: '1000px' }}
    >
      {tpl === 'sidebar' ? renderSidebarLayout() : renderStandardLayout()}
    </div>
  );
}
