import React from 'react';

const DEFAULT_SHOWCASE = {
  fullName: "Alex Morgan",
  title: "Senior Software Engineer",
  email: "alex.morgan@example.com",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  portfolio: "alexmorgan.dev",
  summary: "Results-driven Software Engineer with 6+ years of experience designing, architecting, and scaling high-performance web applications, distributed systems, and modern cloud architectures.",
  experience: [
    {
      id: "1",
      role: "Lead Software Engineer",
      company: "Apex Tech Innovations",
      location: "San Francisco, CA",
      period: "2021 – Present",
      bullets: [
        "Architected and deployed microservices handling 10M+ daily API requests with 99.99% uptime.",
        "Led a cross-functional engineering team of 8 engineers across frontend, backend, and cloud infra.",
        "Optimized PostgreSQL queries and Redis caching, reducing p99 latency by 35%."
      ]
    },
    {
      id: "2",
      role: "Full Stack Developer",
      company: "Vanguard Digital Systems",
      location: "New York, NY",
      period: "2018 – 2021",
      bullets: [
        "Engineered responsive React web interfaces and scalable RESTful APIs in Python and FastAPI.",
        "Integrated automated CI/CD pipelines reducing deployment friction and release turnaround by 50%."
      ]
    }
  ],
  education: [
    {
      id: "1",
      degree: "B.S. in Computer Science",
      school: "University of California, Berkeley",
      period: "2014 – 2018",
      grade: "3.85 GPA"
    }
  ],
  skills: [
    { id: "1", name: "Python", category: "Programming Languages" },
    { id: "2", name: "JavaScript / TypeScript", category: "Programming Languages" },
    { id: "3", name: "React", category: "Frameworks" },
    { id: "4", name: "FastAPI", category: "Frameworks" },
    { id: "5", name: "PostgreSQL", category: "Databases" },
    { id: "6", name: "Docker", category: "Tools & Tech" },
    { id: "7", name: "AWS", category: "Tools & Tech" },
    { id: "8", name: "Git", category: "Tools & Tech" },
    { id: "9", name: "Redis", category: "Tools & Tech" },
    { id: "10", name: "System Architecture", category: "Other" }
  ],
  projects: [
    {
      id: "1",
      name: "Cloud-Scale Telemetry Engine",
      technologies: "FastAPI, React, Docker, Redis",
      startDate: "2023",
      endDate: "2024",
      description: "Real-time telemetry and metrics analytics dashboard processing distributed container logs."
    }
  ]
};

const TEMPLATE_SHOWCASES = {
  '1': {
    fullName: "Your Name Here",
    title: "Your Position or Tagline Here",
    email: "your_name@email.com",
    phone: "000-00-0000",
    location: "Location, COUNTRY",
    linkedin: "your_id",
    github: "your_id",
    portfolio: "www.homepage.com",
    summary: "",
    experience: [
      {
        id: "1",
        role: "Job Title 1",
        company: "Company 1",
        period: "Month 20XX -- Ongoing",
        location: "Location",
        bullets: ["Job description 1", "Job description 2"]
      },
      {
        id: "2",
        role: "Job Title 2",
        company: "Company 2",
        period: "Month 20XX -- Ongoing",
        location: "Location",
        bullets: ["Job description 1", "Job description 2"]
      }
    ],
    education: [
      {
        id: "1",
        degree: "PhD",
        school: "Some University",
        period: "2010 -- 2014"
      }
    ],
    skills: [
      { id: "1", name: "Python", category: "Programming Languages" },
      { id: "2", name: "LaTeX", category: "Programming Languages" },
      { id: "3", name: "Data Analysis", category: "Other" }
    ],
    projects: [
      {
        id: "1",
        name: "Project 1",
        technologies: "Funding agency/institution",
        description: "Details"
      },
      {
        id: "2",
        name: "Project 2",
        technologies: "Funding agency/institution",
        description: "Project duration"
      }
    ]
  },
  '2': {
    fullName: "Your Name Here, Ph.D.",
    title: "Physicist",
    email: "example@gmail.com",
    phone: "",
    location: "",
    linkedin: "example",
    github: "overleaf_example",
    portfolio: "http://example.example.org/",
    summary: "",
    experience: [
      {
        id: "1",
        role: "Job Title 1",
        company: "Company 1",
        period: "Month 20XX -- Ongoing",
        bullets: ["Job description 1", "Job description 2"]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Ph.D. in Physics",
        school: "Unseen University",
        period: "1999"
      }
    ],
    skills: [
      { id: "1", name: "Physics", category: "Programming Languages" }
    ],
    projects: []
  },
  '3': {
    fullName: "Your Name",
    title: "Robotics Researcher",
    email: "your.email@example.com",
    phone: "+00 00 000 0000",
    location: "City, Country",
    linkedin: "xxx.com/in/yourprofile",
    github: "xxx.com/yourusername",
    portfolio: "Scholar Profile",
    summary: "Robotics researcher specializing in Vision-Language-Action (VLA) models and robot learning for complex manipulation. I build end-to-end systems across simulation and hardware.",
    experience: [
      {
        id: "1",
        role: "Robotics Research Intern",
        company: "Tech Company or Research Lab",
        period: "May 2025 -- Aug 2025",
        bullets: [
          "Engineered a VR-integrated teleoperation suite for industrial manipulators to facilitate large-scale VLA data collection.",
          "Benchmarked deployment performance of state-of-the-art foundation models on physical hardware.",
          "Investigated novel techniques for in-context policy adaptation in unstructured environments."
        ]
      },
      {
        id: "2",
        role: "Software Engineering Intern",
        company: "Tech Company, Location",
        period: "Sept 2023 -- May 2024",
        bullets: [
          "Programmed C# and C++ middleware for automated hardware validation systems.",
          "Optimized legacy GUI modules, resulting in improved system response times during testing.",
          "Collaborated with the systems team to integrate firmware updates for semiconductor equipment."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "MSc in Robotics",
        school: "University Name, Location",
        period: "2024 -- 2026",
        grade: "3.88 GPA"
      },
      {
        id: "2",
        degree: "B.Eng in Electrical Engineering",
        school: "University Name, Location",
        period: "2019 -- 2023",
        grade: "3.92 GPA"
      }
    ],
    skills: [
      { id: "1", name: "Robot Learning", category: "Programming Languages" },
      { id: "2", name: "Geometric Computer Vision", category: "Programming Languages" },
      { id: "3", name: "Teleoperation", category: "Other" }
    ],
    projects: []
  },
  '4': {
    fullName: "Harshibar",
    title: "Software Engineer",
    email: "hello@email.com",
    phone: "555.555.5555",
    location: "U.S. Citizen",
    linkedin: "harshibar",
    github: "harshibar",
    portfolio: "",
    summary: "",
    experience: [
      {
        id: "1",
        role: "Creator",
        company: "YouTube",
        period: "Aug. 2019 -- Present",
        location: "San Francisco, CA",
        bullets: [
          "Grew channel to 60k subscribers in 1.5 years; created 80+ videos on tech and productivity",
          "Conducted A/B testing on titles and thumbnails; increased video impressions by 2.5M in 3 months",
          "Designed a Notion workflow to streamline video production and roadmapping; boosted productivity by 20%"
        ]
      },
      {
        id: "2",
        role: "Software Engineer",
        company: "Google Verily",
        period: "Aug. 2018 -- Sept. 2019",
        location: "San Francisco, CA",
        bullets: [
          "Led front-end development of a dashboard to process 50k blood samples and detect early-stage cancer",
          "Rebuilt a Quality Control product with input from 20 cross-functional stakeholders, saving $1M annually"
        ]
      }
    ],
    education: [],
    skills: [],
    projects: []
  },
  '5': {
    fullName: "Raging Bull",
    title: "Data Scientist & Tiger of the Year",
    email: "mail@dot.com",
    phone: "+1 212 355 3000",
    location: "301 Park Ave, New-York, NY, USA",
    linkedin: "laguer.github.io/sixtysecondscv",
    github: "LaGuer/SixtySecondsCV",
    portfolio: "",
    summary: "The giant panda is a terrestrial animal and primarily spends its life roaming and feeding in the bamboo forests of the Qinling Mountains.",
    experience: [
      {
        id: "1",
        role: "CEO The Panda Way",
        company: "Start Up",
        period: "currently",
        bullets: [
          "Chief executive officer, Head developer and yoga ambassador of 'The Panda Way' - A company from pandas for pandas."
        ]
      },
      {
        id: "2",
        role: "Data Scientist",
        company: "Amis University",
        period: "2018 -- 2019",
        bullets: [
          "Researching the impact of adequate AMIS nutrition compared to conventional feeding methods."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Post-Doc Panda Studies",
        school: "Panda Academy",
        period: "2009 -- 2010",
        description: "In-depth studies on the impact of bamboo nutrition for young pandas."
      },
      {
        id: "2",
        degree: "Master Studies Panda Science",
        school: "Panda Academy",
        period: "2006 -- 2008",
        description: "Focus: Advanced rice hat studies and nouveau rain-reflecting cover materials."
      }
    ],
    skills: [
      { id: "1", name: "Wearing asian rice hats", category: "Programming Languages" },
      { id: "2", name: "Playing Chess", category: "Programming Languages" },
      { id: "3", name: "Playing the bamboo stick", category: "Other" }
    ],
    projects: []
  },
  '6': {
    fullName: "Your Name",
    title: "Your Program",
    email: "youremail@email.com",
    phone: "xxxxxxxxxx",
    location: "Indian Institute Of Information Technology, Vadodara",
    linkedin: "LinkedIn Profile",
    github: "GitHub Profile",
    portfolio: "",
    summary: "",
    experience: [
      {
        id: "1",
        role: "Your Position",
        company: "Your Company",
        period: "Year",
        bullets: ["Detail description of work done in this position or organization"]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Your Degree and Course name",
        school: "Indian Institute of Information Technology, Vadodara",
        period: "Year",
        grade: "CGPA/Percentage: xxx"
      }
    ],
    skills: [
      { id: "1", name: "Your Skill 1", category: "Programming Languages" }
    ],
    projects: []
  },
  '7': {
    fullName: "Students Name",
    title: "B.Tech Student",
    email: "something@example.com",
    phone: "XXXXXXXXX",
    location: "Indian Institute Of Technology, Guwahati",
    linkedin: "LINKEDINUSERID",
    github: "USERID",
    portfolio: "https://example.com",
    summary: "",
    experience: [
      {
        id: "1",
        role: "Project Intern",
        company: "Tech Labs",
        period: "2018 -- Present",
        bullets: [
          "Developed features for automated verification",
          "Iterated on core models"
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "B.Tech. Major",
        school: "Indian Institute of Technology, Guwahati",
        period: "2016-Present",
        grade: "0.00 (Current)"
      }
    ],
    skills: [
      { id: "1", name: "Computer Science", category: "Programming Languages" }
    ],
    projects: []
  },
  '8': {
    fullName: "MY NAME",
    title: "Curriculum vitae",
    email: "email@email.email",
    phone: "(123)~ 456-7890",
    location: "Ville, Province, Pays",
    linkedin: "thelink",
    github: "GitHub",
    portfolio: "",
    summary: "I am a self-motivated professional with extensive domain expertise.",
    experience: [
      {
        id: "1",
        role: "Job 1",
        company: "My employer",
        period: "2000 - present",
        bullets: ["My job was to ..."]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Master's degree",
        school: "University XXX",
        period: "1997 - Expected 2025",
        grade: "5.50/4.33"
      }
    ],
    skills: [
      { id: "1", name: "Deserving a job", category: "Programming Languages" },
      { id: "2", name: "Cooking", category: "Other" }
    ],
    projects: []
  },
  '9': {
    fullName: "Nicola Alessi",
    title: "Web Developer",
    email: "alessi@gmail.com",
    phone: "+39 123 456 789",
    location: "Rome, Italy",
    linkedin: "nicolaalessi",
    github: "nicolaalessi",
    portfolio: "",
    summary: "",
    experience: [
      {
        id: "1",
        role: "Web Developer",
        company: "Alessi S.r.l.",
        period: "2012 -- Present",
        bullets: ["Designed and developed responsive websites and web applications."]
      }
    ],
    education: [
      {
        id: "1",
        degree: "B.Sc. in Computer Science",
        school: "Sapienza University of Rome",
        period: "2008 -- 2011"
      }
    ],
    skills: [
      { id: "1", name: "PHP", category: "Programming Languages" },
      { id: "2", name: "JavaScript", category: "Programming Languages" }
    ],
    projects: []
  }
};

export default function ResumePreview({ resumeData, templateId = 'Modern', scale = 100, useTemplateMock = false }) {
  const rawTplId = templateId.toString();
  const mockData = TEMPLATE_SHOWCASES[rawTplId] || DEFAULT_SHOWCASE;

  const data = (useTemplateMock || !resumeData || Object.keys(resumeData).length === 0) ? mockData : resumeData;
  
  // Check if data is completely empty/unpopulated
  const hasUserExp = (data.experience && data.experience.length > 0) || (data.experiences && data.experiences.length > 0);
  const hasUserEdu = (data.education && ((Array.isArray(data.education) && data.education.length > 0) || Boolean(data.education.school || data.education.degree || data.education.institution)));
  const hasUserSkills = (data.skills && ((Array.isArray(data.skills) && data.skills.length > 0) || Object.values(data.skills).some(v => Boolean(v))));
  const hasUserSummary = Boolean(data.summary || (data.personal && data.personal.summary));
  const isDataEmpty = !hasUserExp && !hasUserEdu && !hasUserSkills && !hasUserSummary;

  const finalData = isDataEmpty ? mockData : data;

  // Map numeric LaTeX template IDs to visual HTML equivalents for preview
  const tplMapping = {
    '1': 'sidebar',
    '2': 'timeline',
    '3': 'professional',
    '4': 'tech stack',
    '5': 'portfolio',
    '6': 'academic',
    '7': 'compact',
    '8': 'consulting',
    '9': 'one page pro'
  };
  
  const rawTpl = templateId.toString().toLowerCase();
  const tpl = tplMapping[rawTpl] || rawTpl;

  const personal = finalData.personal || {};
  const fullName = 
    finalData.fullName || 
    (finalData.firstName && finalData.lastName ? `${finalData.firstName} ${finalData.lastName}`.trim() : '') || 
    personal.fullName || 
    (personal.firstName && personal.lastName ? `${personal.firstName} ${personal.lastName}`.trim() : '') || 
    'Your Name';

  const title = 
    finalData.title || 
    personal.title || 
    'Professional Title';
  
  // Attach normalized fields onto data object for sub-renderers
  finalData.email = finalData.email || personal.email || '';
  finalData.phone = finalData.phone || personal.phone || '';
  finalData.location = finalData.location || personal.location || '';
  finalData.linkedin = finalData.linkedin || personal.linkedin || '';
  finalData.github = finalData.github || personal.github || '';
  finalData.portfolio = finalData.portfolio || personal.portfolio || '';
  finalData.summary = finalData.summary || personal.summary || '';

  // Normalize education
  const rawEdu = finalData.education || [];
  const rawEduArr = Array.isArray(rawEdu) ? rawEdu : (rawEdu.school || rawEdu.degree || rawEdu.institution ? [rawEdu] : []);
  const education = rawEduArr.map(edu => ({
    ...edu,
    institution: edu.institution || edu.school || '',
    degree: edu.degree || '',
    fieldOfStudy: edu.fieldOfStudy || '',
    startDate: edu.startDate || '',
    endDate: edu.endDate || '',
    grade: edu.grade || ''
  }));

  // Normalize experience
  const rawExp = finalData.experience || finalData.experiences || [];
  const experience = rawExp.map(e => ({
    ...e,
    role: e.role || e.position || '',
    company: e.company || '',
    location: e.location || '',
    period: e.period || (e.startDate && e.endDate ? `${e.startDate} - ${e.endDate}` : (e.startDate || '')),
    bullets: e.bullets || (e.description ? e.description.split('\n').map(b => b.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean) : [])
  }));

  // Normalize skills
  let skills = [];
  const rawSkills = finalData.skills || [];
  if (Array.isArray(rawSkills)) {
    skills = rawSkills.map(s => typeof s === 'object' ? s : { id: Math.random().toString(), name: s, category: 'Technical' });
  } else if (rawSkills && typeof rawSkills === 'object') {
    if (rawSkills.technical) {
      skills.push(...rawSkills.technical.split(',').map(s => ({ id: Math.random().toString(), name: s.trim(), category: 'Technical Skills' })));
    }
    if (rawSkills.frameworks) {
      skills.push(...rawSkills.frameworks.split(',').map(s => ({ id: Math.random().toString(), name: s.trim(), category: 'Frameworks' })));
    }
    if (rawSkills.design) {
      skills.push(...rawSkills.design.split(',').map(s => ({ id: Math.random().toString(), name: s.trim(), category: 'Design Skills' })));
    }
    if (rawSkills.tools) {
      skills.push(...rawSkills.tools.split(',').map(s => ({ id: Math.random().toString(), name: s.trim(), category: 'Tools & Tech' })));
    }
    if (rawSkills.research) {
      skills.push(...rawSkills.research.split(',').map(s => ({ id: Math.random().toString(), name: s.trim(), category: 'Research' })));
    }
  }

  const projects = finalData.projects || [];
  const certifications = finalData.certifications || [];
  const achievements = finalData.achievements || [];
  const languages = finalData.languages || [];

  // Theme styling helpers based on template
  const getThemeStyles = () => {
    switch (tpl) {
      case 'modern':
        return { font: 'font-sans', text: 'text-slate-800', primary: 'text-[#EC4899]', border: 'border-[#EC4899]/20', headerBg: 'bg-[#EC4899]/5' };
      case 'professional':
        return { font: 'font-serif', text: 'text-zinc-800', primary: 'text-rose-900', border: 'border-zinc-200', headerBg: '' };
      case 'minimal':
        return { font: 'font-mono', text: 'text-neutral-800', primary: 'text-neutral-900', border: 'border-neutral-200', headerBg: '' };
      case 'ats pro':
        return { font: 'font-sans', text: 'text-black', primary: 'text-black', border: 'border-black', headerBg: '' };
      case 'creative':
        return { font: 'font-sans', text: 'text-stone-800', primary: 'text-purple-700', border: 'border-purple-100', headerBg: 'bg-purple-50/30' };
      case 'executive':
        return { font: 'font-serif', text: 'text-slate-900', primary: 'text-rose-950', border: 'border-slate-300', headerBg: '' };
      case 'tech stack':
        return { font: 'font-mono', text: 'text-teal-950', primary: 'text-teal-700', border: 'border-teal-100', headerBg: 'bg-teal-50/10' };
      case 'elegant':
        return { font: 'font-serif', text: 'text-gray-800', primary: 'text-emerald-800', border: 'border-emerald-100', headerBg: '' };
      case 'classic':
        return { font: 'font-serif', text: 'text-stone-900', primary: 'text-red-900', border: 'border-stone-300', headerBg: '' };
      case 'compact':
        return { font: 'font-sans text-[11px]', text: 'text-slate-900', primary: 'text-[#EC4899]', border: 'border-slate-200', headerBg: '' };
      case 'sidebar':
        return { font: 'font-sans', text: 'text-slate-800', primary: 'text-violet-700', border: 'border-violet-100', headerBg: '' };
      case 'timeline':
        return { font: 'font-sans', text: 'text-gray-800', primary: 'text-amber-800', border: 'border-amber-100', headerBg: '' };
      case 'academic':
        return { font: 'font-serif', text: 'text-neutral-900', primary: 'text-neutral-950', border: 'border-neutral-400', headerBg: '' };
      case 'portfolio':
        return { font: 'font-sans', text: 'text-rose-950', primary: 'text-rose-600', border: 'border-rose-100', headerBg: '' };
      case 'bold':
        return { font: 'font-sans font-medium', text: 'text-slate-900', primary: 'text-[#FF8A3D]', border: 'border-[#FF8A3D]/30', headerBg: '' };
      case 'clean grid':
        return { font: 'font-sans', text: 'text-slate-800', primary: 'text-[#EC4899]', border: 'border-[#EC4899]/20', headerBg: '' };
      case 'startup':
        return { font: 'font-sans', text: 'text-slate-900', primary: 'text-fuchsia-700', border: 'border-fuchsia-100', headerBg: '' };
      case 'data scientist':
        return { font: 'font-mono', text: 'text-slate-900', primary: 'text-[#FF8A3D]', border: 'border-[#FF8A3D]/20', headerBg: '' };
      case 'consulting':
        return { font: 'font-serif', text: 'text-slate-800', primary: 'text-rose-900', border: 'border-rose-100', headerBg: '' };
      case 'one page pro':
        return { font: 'font-sans text-[11px]', text: 'text-stone-900', primary: 'text-orange-850', border: 'border-stone-200', headerBg: '' };
      default:
        return { font: 'font-sans', text: 'text-slate-800', primary: 'text-[#EC4899]', border: 'border-[#EC4899]/20', headerBg: '' };
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
              <img src={data.profileImage} alt="Profile" className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-[#EC4899] mb-3" />
            )}
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">{fullName}</h1>
            <p className="text-xs font-semibold text-[#EC4899] mt-1 uppercase tracking-wider">{title}</p>
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
                    <p className="text-xs text-[#EC4899] font-semibold mb-1">{companyName} {loc ? `| ${loc}` : ''}</p>
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
                    <p className="text-[10px] text-[#FF8A3D] font-semibold mb-1 uppercase tracking-wide">Tech Stack: {proj.technologies}</p>
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
                      {edu.grade && <span className="font-bold text-[#EC4899]">Grade: {edu.grade}</span>}
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
                      <div key={exp.id || idx} className="text-xs relative pl-3 border-l-2 border-slate-100 hover:border-[#EC4899]/50 transition-colors">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900 text-[13px]">{pos}</h3>
                          <span className="text-[10px] text-slate-500 font-semibold">{per}</span>
                        </div>
                        <p className="text-xs text-[#EC4899] font-semibold mb-1">{companyName} {loc ? `| ${loc}` : ''}</p>
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
                        <p className="text-[10px] text-[#FF8A3D] font-bold mb-1 uppercase tracking-wide">Tech Stack: {proj.technologies}</p>
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
                        {edu.grade && <span className="font-bold text-[#EC4899]">Grade: {edu.grade}</span>}
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

  const renderIsabel = () => {
    return (
      <div className="space-y-6 font-serif">
        <header className="border-b border-zinc-300 pb-4 mb-4">
          <h1 className="text-3xl font-bold tracking-wide text-zinc-900">{fullName}</h1>
          <p className="text-base text-zinc-650 mt-1 italic uppercase tracking-wider">{title}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-500 font-sans">
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
            {data.linkedin && <div>{data.linkedin}</div>}
          </div>
        </header>

        {data.summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider border-l-4 border-zinc-700 pl-2 mb-3 text-zinc-800">Professional Summary</h2>
            <p className="text-xs leading-relaxed text-zinc-700 font-sans">{data.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider border-l-4 border-zinc-700 pl-2 mb-3 text-zinc-800">Work Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="text-xs font-sans">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-zinc-900 text-sm font-serif">{exp.position || exp.role}</h3>
                    <span className="text-[10px] text-zinc-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-xs text-zinc-700 font-semibold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                  <p className="text-zinc-650 leading-relaxed pl-1 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider border-l-4 border-zinc-700 pl-2 mb-3 text-zinc-800">Education</h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-xs font-sans">
                  <h3 className="font-bold text-zinc-900 font-serif">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                  <p className="text-zinc-650">{edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{edu.startDate} – {edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-wider border-l-4 border-zinc-700 pl-2 mb-3 text-zinc-800">Skills</h2>
            <div className="flex flex-wrap gap-2 text-xs font-sans">
              {skills.map((s, idx) => (
                <span key={s.id || idx} className="bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded text-zinc-700">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderMichael = () => {
    return (
      <div className="grid grid-cols-12 min-h-[1000px] font-sans">
        {/* Left Column (Dark Slate) */}
        <div className="col-span-4 bg-[#1e1e24] text-zinc-100 p-8 space-y-6 flex flex-col">
          <div className="text-center">
            <img
              src={data.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white mb-4 shadow-md"
            />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#FF8A3D]">{title}</h2>
          </div>

          <div className="space-y-3 text-xs border-t border-zinc-700 pt-4">
            <h3 className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">Contact</h3>
            {data.email && <div className="truncate"><span className="font-semibold text-zinc-300">Email:</span> {data.email}</div>}
            {data.phone && <div><span className="font-semibold text-zinc-300">Phone:</span> {data.phone}</div>}
            {data.location && <div><span className="font-semibold text-zinc-300">Location:</span> {data.location}</div>}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3 border-t border-zinc-700 pt-4">
              <h3 className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">Skills</h3>
              <div className="space-y-1 text-xs">
                {skills.map((s, idx) => (
                  <div key={s.id || idx} className="text-zinc-300">• {s.name}</div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div className="space-y-3 border-t border-zinc-700 pt-4">
              <h3 className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">Education</h3>
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-[11px] space-y-0.5">
                  <div className="font-bold text-white">{edu.degree}</div>
                  <div className="text-zinc-300">{edu.institution}</div>
                  <div className="text-zinc-400">{edu.startDate} – {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (Light) */}
        <div className="col-span-8 p-8 space-y-6 bg-white text-zinc-850">
          <div className="border-4 border-zinc-950 p-6 text-center relative mb-4">
            <h1 className="text-3xl font-extrabold uppercase tracking-widest text-zinc-900">{fullName}</h1>
            <p className="text-xs uppercase tracking-widest text-[#FF8A3D] mt-2 font-bold">{title}</p>
          </div>

          {data.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-zinc-950 pb-1 mb-3 text-zinc-900">Profile</h2>
              <p className="text-xs leading-relaxed text-zinc-700">{data.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-zinc-950 pb-1 mb-3 text-zinc-900">Work Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-zinc-900 text-sm">{exp.position || exp.role}</h3>
                      <span className="text-[10px] text-zinc-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-xs text-[#FF8A3D] font-bold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                    <p className="text-zinc-650 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-zinc-950 pb-1 mb-3 text-zinc-900">Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={proj.id || idx} className="text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-zinc-900 text-sm">{proj.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-semibold">{proj.startDate} – {proj.endDate}</span>
                    </div>
                    <p className="text-zinc-650 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderAnaisha = () => {
    return (
      <div className="space-y-6 font-sans">
        <header className="text-center border-b border-zinc-205 pb-6 mb-4">
          <h1 className="text-4xl font-light uppercase tracking-widest text-zinc-900">{fullName}</h1>
          <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2 font-bold">{title}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px] text-zinc-500 tracking-wider">
            {data.email && <div>EMAIL: {data.email}</div>}
            {data.phone && <div>TEL: {data.phone}</div>}
            {data.location && <div>LOC: {data.location}</div>}
          </div>
        </header>

        {data.summary && (
          <div className="border border-zinc-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-100 pb-1.5 mb-3 text-zinc-800">About Me</h2>
            <p className="text-xs leading-relaxed text-zinc-600">{data.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="border border-zinc-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-100 pb-1.5 mb-3 text-zinc-800">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-zinc-900 text-sm">{exp.position || exp.role}</h3>
                    <span className="text-[10px] text-zinc-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-xs text-zinc-500 font-semibold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                  <p className="text-zinc-650 leading-relaxed pl-1 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="border border-zinc-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-100 pb-1.5 mb-3 text-zinc-800">Education</h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-xs">
                  <h3 className="font-bold text-zinc-950">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                  <p className="text-zinc-500">{edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{edu.startDate} – {edu.endDate}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div className="border border-zinc-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-100 pb-1.5 mb-3 text-zinc-800">Skills</h2>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {skills.map((s, idx) => (
                <span key={s.id || idx} className="bg-zinc-55 border border-zinc-200 px-2 py-0.5 rounded text-zinc-700 text-[10px]">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOlivia = () => {
    return (
      <div className="grid grid-cols-12 min-h-[1000px] font-sans">
        {/* Left Column (Teal) */}
        <div className="col-span-4 bg-[#3b7a7a] text-white p-8 space-y-6 flex flex-col">
          <div className="text-center">
            <img
              src={data.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white mb-4 shadow-md"
            />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#f4ebe1]">{title}</h2>
          </div>

          <div className="space-y-3 text-xs border-t border-[#488e8e] pt-4">
            <h3 className="font-bold uppercase tracking-wider text-[#f4ebe1] text-[10px]">Contact</h3>
            {data.email && <div className="truncate"><span className="font-semibold text-teal-100">Email:</span> {data.email}</div>}
            {data.phone && <div><span className="font-semibold text-teal-100">Phone:</span> {data.phone}</div>}
            {data.location && <div><span className="font-semibold text-teal-100">Location:</span> {data.location}</div>}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3 border-t border-[#488e8e] pt-4">
              <h3 className="font-bold uppercase tracking-wider text-[#f4ebe1] text-[10px]">Skills</h3>
              <div className="flex flex-wrap gap-1">
                {skills.map((s, idx) => (
                  <span key={s.id || idx} className="bg-[#488e8e] px-2 py-0.5 rounded text-[10px] text-white border border-teal-600">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Warm Peach) */}
        <div className="col-span-8 p-8 space-y-6 bg-[#f4ebe1] text-stone-850">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-wide text-[#3b7a7a]">{fullName}</h1>
            <p className="text-xs uppercase tracking-widest text-stone-500 mt-2 font-bold">{title}</p>
          </div>

          {data.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#3b7a7a]/30 pb-1 mb-3 text-[#3b7a7a]">Profile</h2>
              <p className="text-xs leading-relaxed text-stone-700">{data.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#3b7a7a]/30 pb-1 mb-3 text-[#3b7a7a]">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-stone-900 text-sm">{exp.position || exp.role}</h3>
                      <span className="text-[10px] text-stone-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-xs text-[#3b7a7a] font-bold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                    <p className="text-stone-605 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#3b7a7a]/30 pb-1 mb-3 text-[#3b7a7a]">Education</h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-xs">
                    <h3 className="font-bold text-stone-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                    <p className="text-stone-600">{edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">{edu.startDate} – {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderSebastian = () => {
    return (
      <div className="space-y-6 font-sans">
        <header className="text-center border-b-2 border-stone-800 pb-4 mb-4">
          <h1 className="text-3xl font-extrabold uppercase tracking-widest text-stone-900">{fullName}</h1>
          <p className="text-sm uppercase tracking-widest text-stone-500 mt-1 font-semibold">{title}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs text-stone-500">
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
          </div>
        </header>

        {data.summary && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-stone-800 pb-1 mb-2 text-stone-900">About Me</h2>
            <p className="text-xs leading-relaxed text-stone-700">{data.summary}</p>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-stone-800 pb-1 mb-2 text-stone-900">Experience</h2>
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="text-xs">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-stone-900 text-sm">{exp.position || exp.role}</h3>
                    <span className="text-[10px] text-stone-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                  </div>
                  <p className="text-xs text-stone-600 font-bold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                  <p className="text-stone-700 leading-relaxed pl-1 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-stone-800 pb-1 mb-2 text-stone-900">Education</h2>
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="text-xs">
                  <h3 className="font-bold text-stone-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                  <p className="text-stone-600">{edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">{edu.startDate} – {edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest border-b border-stone-800 pb-1 mb-2 text-stone-900">Skills</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {skills.map((s, idx) => (
                <span key={s.id || idx} className="bg-stone-100 border border-stone-200 px-2 py-1 rounded text-stone-750 text-[10px]">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderAdeline = () => {
    return (
      <div className="grid grid-cols-12 min-h-[1000px] font-sans relative">
        {/* Top Right blue accent shape */}
        <div className="absolute top-0 right-0 w-32 h-6 bg-[#0f4c81] transform skew-x-12 -mr-8 -mt-4 opacity-90"></div>

        {/* Left Column (Light gray sidebar) */}
        <div className="col-span-4 bg-slate-50 border-r border-slate-100 p-8 space-y-6 flex flex-col">
          <div className="text-center">
            <img
              src={data.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-[#0f4c81] mb-4 shadow-md"
            />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#0f4c81]">{title}</h2>
          </div>

          <div className="space-y-3 text-xs border-t border-slate-200 pt-4">
            <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Contact</h3>
            {data.email && <div className="truncate"><span className="font-semibold text-slate-700">Email:</span> {data.email}</div>}
            {data.phone && <div><span className="font-semibold text-slate-700">Phone:</span> {data.phone}</div>}
            {data.location && <div><span className="font-semibold text-slate-700">Location:</span> {data.location}</div>}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <h3 className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">Skills</h3>
              <div className="space-y-1 text-xs">
                {skills.map((s, idx) => (
                  <div key={s.id || idx} className="text-slate-605">• {s.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-8 p-8 space-y-6 bg-white text-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">{fullName}</h1>
            <p className="text-xs uppercase tracking-widest text-[#0f4c81] mt-2 font-bold">{title}</p>
          </div>

          {data.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#0f4c81]/30 pb-1 mb-3 text-[#0f4c81]">About Me</h2>
              <p className="text-xs leading-relaxed text-slate-750">{data.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#0f4c81]/30 pb-1 mb-3 text-[#0f4c81]">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900 text-sm">{exp.position || exp.role}</h3>
                      <span className="text-[10px] text-slate-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-xs text-[#0f4c81] font-bold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                    <p className="text-slate-600 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#0f4c81]/30 pb-1 mb-3 text-[#0f4c81]">Education</h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-xs">
                    <h3 className="font-bold text-slate-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                    <p className="text-slate-600">{edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{edu.startDate} – {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderDonna = () => {
    return (
      <div className="grid grid-cols-12 min-h-[1000px] font-sans">
        {/* Left Column (Dark Taupe) */}
        <div className="col-span-4 bg-[#7a6a5f] text-stone-100 p-8 space-y-6 flex flex-col">
          <div className="text-center">
            <img
              src={data.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white mb-4 shadow-md"
            />
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#fbf9f6]">{title}</h2>
          </div>

          <div className="space-y-3 text-xs border-t border-[#8e7e73] pt-4">
            <h3 className="font-bold uppercase tracking-wider text-[#fbf9f6] text-[10px]">Contact</h3>
            {data.email && <div className="truncate"><span className="font-semibold text-stone-200">Email:</span> {data.email}</div>}
            {data.phone && <div><span className="font-semibold text-stone-200">Phone:</span> {data.phone}</div>}
            {data.location && <div><span className="font-semibold text-stone-200">Location:</span> {data.location}</div>}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3 border-t border-[#8e7e73] pt-4">
              <h3 className="font-bold uppercase tracking-wider text-[#fbf9f6] text-[10px]">Skills</h3>
              <div className="flex flex-wrap gap-1">
                {skills.map((s, idx) => (
                  <span key={s.id || idx} className="bg-[#8e7e73] px-2 py-0.5 rounded text-[10px] text-white border border-stone-605">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Light Beige) */}
        <div className="col-span-8 p-8 space-y-6 bg-[#fbf9f6] text-stone-850">
          <div>
            <h1 className="text-3xl font-extrabold uppercase tracking-wide text-[#7a6a5f]">{fullName}</h1>
            <p className="text-xs uppercase tracking-widest text-stone-500 mt-2 font-bold">{title}</p>
          </div>

          {data.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#7a6a5f]/30 pb-1 mb-3 text-[#7a6a5f]">Profile</h2>
              <p className="text-xs leading-relaxed text-stone-700">{data.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#7a6a5f]/30 pb-1 mb-3 text-[#7a6a5f]">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-stone-900 text-sm">{exp.position || exp.role}</h3>
                      <span className="text-[10px] text-stone-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-xs text-[#7a6a5f] font-bold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                    <p className="text-stone-605 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b border-[#7a6a5f]/30 pb-1 mb-3 text-[#7a6a5f]">Education</h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-xs">
                    <h3 className="font-bold text-stone-900">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                    <p className="text-stone-600">{edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5">{edu.startDate} – {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderCahaya = () => {
    return (
      <div className="grid grid-cols-12 min-h-[1000px] font-sans border-2 border-zinc-950">
        {/* Left Column (Black) */}
        <div className="col-span-4 bg-zinc-950 text-white p-8 space-y-6 flex flex-col">
          <div className="text-center border-b border-zinc-800 pb-6">
            <img
              src={data.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white mb-4 shadow-md filter grayscale"
            />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF8A3D]">{title}</h2>
          </div>

          <div className="space-y-3 text-xs pt-2">
            <h3 className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">Contact</h3>
            {data.email && <div className="truncate"><span className="font-semibold text-zinc-300">Email:</span> {data.email}</div>}
            {data.phone && <div><span className="font-semibold text-zinc-300">Phone:</span> {data.phone}</div>}
            {data.location && <div><span className="font-semibold text-zinc-300">Location:</span> {data.location}</div>}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3 border-t border-zinc-800 pt-4">
              <h3 className="font-bold uppercase tracking-wider text-zinc-400 text-[10px]">Skills</h3>
              <div className="space-y-1 text-xs">
                {skills.map((s, idx) => (
                  <div key={s.id || idx} className="text-zinc-300">• {s.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (White) */}
        <div className="col-span-8 p-8 space-y-6 bg-white text-zinc-900">
          <div>
            <h1 className="text-4xl font-extrabold uppercase tracking-wide text-zinc-950">{fullName}</h1>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mt-2 font-bold">{title}</p>
          </div>

          {data.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-zinc-950 pb-1 mb-3 text-zinc-950">About Me</h2>
              <p className="text-xs leading-relaxed text-zinc-700">{data.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-zinc-950 pb-1 mb-3 text-zinc-950">Work Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-zinc-950 text-sm">{exp.position || exp.role}</h3>
                      <span className="text-[10px] text-zinc-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-xs text-zinc-600 font-bold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                    <p className="text-zinc-705 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-zinc-950 pb-1 mb-3 text-zinc-950">Education</h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-xs">
                    <h3 className="font-bold text-zinc-955">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                    <p className="text-zinc-600">{edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{edu.startDate} – {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderRichard = () => {
    return (
      <div className="grid grid-cols-12 min-h-[1000px] font-sans">
        {/* Left Column (Navy Blue) */}
        <div className="col-span-4 bg-[#0f2a4a] text-white p-8 space-y-6 flex flex-col">
          <div className="text-center border-b border-[#1d3d63] pb-6">
            <img
              src={data.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white mb-4 shadow-md"
            />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#FF8A3D]">{title}</h2>
          </div>

          <div className="space-y-3 text-xs pt-2">
            <h3 className="font-bold uppercase tracking-wider text-zinc-300 text-[10px]">Contact</h3>
            {data.email && <div className="truncate"><span className="font-semibold text-zinc-300">Email:</span> {data.email}</div>}
            {data.phone && <div><span className="font-semibold text-zinc-300">Phone:</span> {data.phone}</div>}
            {data.location && <div><span className="font-semibold text-zinc-300">Location:</span> {data.location}</div>}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3 border-t border-[#1d3d63] pt-4">
              <h3 className="font-bold uppercase tracking-wider text-zinc-300 text-[10px]">Skills</h3>
              <div className="space-y-1 text-xs">
                {skills.map((s, idx) => (
                  <div key={s.id || idx} className="text-zinc-200">• {s.name}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (White) */}
        <div className="col-span-8 p-8 space-y-6 bg-white text-[#0f2a4a]">
          <div>
            <h1 className="text-4xl font-extrabold uppercase tracking-wide text-[#0f2a4a]">{fullName}</h1>
            <p className="text-xs uppercase tracking-widest text-zinc-550 mt-2 font-bold">{title}</p>
          </div>

          {data.summary && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#0f2a4a] pb-1 mb-3 text-[#0f2a4a]">Profile</h2>
              <p className="text-xs leading-relaxed text-zinc-700">{data.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#0f2a4a] pb-1 mb-3 text-[#0f2a4a]">Work Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="text-xs">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[#0f2a4a] text-sm">{exp.position || exp.role}</h3>
                      <span className="text-[10px] text-zinc-500 font-semibold">{exp.startDate} – {exp.currentlyWorking ? 'Present' : exp.endDate}</span>
                    </div>
                    <p className="text-xs text-[#FF8A3D] font-bold mb-1">{exp.company} {exp.location ? `| ${exp.location}` : ''}</p>
                    <p className="text-zinc-650 leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#0f2a4a] pb-1 mb-3 text-[#0f2a4a]">Education</h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx} className="text-xs">
                    <h3 className="font-bold text-[#0f2a4a]">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</h3>
                    <p className="text-zinc-600">{edu.institution} {edu.grade ? `| Grade: ${edu.grade}` : ''}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{edu.startDate} – {edu.endDate}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  };

  const renderLayout = () => {
    switch (tpl) {
      case 'isabel':
        return renderIsabel();
      case 'michael':
        return renderMichael();
      case 'anaisha':
        return renderAnaisha();
      case 'olivia':
        return renderOlivia();
      case 'sebastian':
        return renderSebastian();
      case 'adeline':
        return renderAdeline();
      case 'donna':
        return renderDonna();
      case 'cahaya':
        return renderCahaya();
      case 'richard':
        return renderRichard();
      default:
        return tpl === 'sidebar' ? renderSidebarLayout() : renderStandardLayout();
    }
  };

  const isFullBleed = ['olivia', 'donna', 'cahaya', 'michael', 'richard'].includes(tpl);

  return (
    <div
      className={`print-resume print-container w-full max-w-[800px] bg-white text-gray-900 shadow-xl rounded-sm flex flex-col border border-outline-variant mx-auto transition-transform origin-top ${theme.font} ${theme.text} ${isFullBleed ? 'p-0' : 'p-10'}`}
      style={{ transform: `scale(${scale / 100})`, minHeight: '1000px' }}
    >
      {renderLayout()}
    </div>
  );
}
