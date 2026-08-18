import React from 'react';

const DEFAULT_SHOWCASE = {
  fullName: "Sarah Jenkins",
  title: "Staff Distributed Systems Architect",
  email: "sarah.jenkins@cloudscale.io",
  phone: "+1 (555) 438-9210",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/sarahjenkins-cloud",
  github: "github.com/sarahjenkins",
  portfolio: "sarahjenkins.dev",
  summary: "Staff Systems Architect with 8+ years specializing in distributed cloud infrastructure, high-throughput microservices, and AI-accelerated backends. Proven track record scaling systems to 25M+ daily requests with 99.999% reliability.",
  experience: [
    {
      id: "1",
      role: "Staff Cloud Infrastructure Architect",
      company: "Apex Cloud Innovations",
      location: "San Francisco, CA",
      period: "2022 – Present",
      bullets: [
        "Architected multi-region Kubernetes platform across AWS and GCP, handling 25M+ daily API requests with 99.999% SLA.",
        "Engineered distributed caching and query optimization layers in Go and Redis, slashing p99 latency from 140ms to 18ms.",
        "Led cross-functional team of 12 cloud and backend engineers, driving zero-downtime microservices migration for Fortune 500 clients."
      ]
    },
    {
      id: "2",
      role: "Senior Distributed Systems Engineer",
      company: "Vanguard Scale Systems",
      location: "New York, NY",
      period: "2019 – 2022",
      bullets: [
        "Constructed real-time event streaming pipeline processing 12TB+ daily telemetry data using Apache Kafka and Python FastAPI.",
        "Automated continuous delivery pipelines with ArgoCD and Terraform, reducing release cycle time by 65%."
      ]
    }
  ],
  education: [
    {
      id: "1",
      degree: "M.S. in Computer Science",
      school: "University of California, Berkeley",
      period: "2017 – 2019",
      grade: "3.94 GPA"
    },
    {
      id: "2",
      degree: "B.S. in Computer Engineering",
      school: "University of Washington",
      period: "2013 – 2017",
      grade: "3.88 GPA"
    }
  ],
  skills: [
    { id: "1", name: "Go & Python", category: "Programming Languages" },
    { id: "2", name: "TypeScript & Rust", category: "Programming Languages" },
    { id: "3", name: "Kubernetes & Docker", category: "Tools & Tech" },
    { id: "4", name: "AWS & Google Cloud Platform", category: "Tools & Tech" },
    { id: "5", name: "Apache Kafka & Redis", category: "Databases" },
    { id: "6", name: "PostgreSQL & ScyllaDB", category: "Databases" },
    { id: "7", name: "Distributed Consensus (Raft)", category: "Other" },
    { id: "8", name: "Terraform & Helm", category: "Tools & Tech" }
  ],
  projects: [
    {
      id: "1",
      name: "High-Throughput Global Event Mesh",
      technologies: "Go, gRPC, Kafka, Kubernetes, Envoy",
      startDate: "2023",
      endDate: "2024",
      description: "Open-source distributed event bus capable of routing 500k messages/sec with sub-millisecond serialization latency."
    }
  ]
};

const TEMPLATE_SHOWCASES = {
  '1': {
    fullName: "Dr. Aris Vance",
    title: "Principal AI Research Scientist",
    email: "aris.vance@stanford.alumni.edu",
    phone: "+1 (555) 782-1904",
    location: "Palo Alto, CA",
    linkedin: "linkedin.com/in/arisvance-ai",
    github: "github.com/arisvance",
    portfolio: "arisvance.ai",
    summary: "Principal AI Scientist with 7+ years researching multi-modal foundation models, LLM alignment, and reinforcement learning with human feedback (RLHF). Published 14 peer-reviewed papers across NeurIPS, ICML, and ICLR.",
    experience: [
      {
        id: "1",
        role: "Lead Foundation Model Researcher",
        company: "Nexus AI Laboratories",
        period: "2022 – Present",
        location: "Palo Alto, CA",
        bullets: [
          "Co-authored core architectural modifications for 70B parameter multi-modal transformer, reducing inference KV-cache memory by 38%.",
          "Engineered distributed RLHF alignment pipeline scaling across 512 H100 GPUs with 94% linear throughput efficiency.",
          "Supervised a research group of 6 PhD scientists developing self-supervised reasoning mechanisms for complex code generation."
        ]
      },
      {
        id: "2",
        role: "Senior Machine Learning Scientist",
        company: "DeepScale Dynamics",
        period: "2019 – 2022",
        location: "Mountain View, CA",
        bullets: [
          "Developed sparse-mixture-of-experts (MoE) routing algorithm improving token prediction accuracy by 14.2% on STEM benchmarks.",
          "Optimized PyTorch FlashAttention kernels delivering a 2.4x speedup on long-context sequence processing."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Ph.D. in Artificial Intelligence & Computer Science",
        school: "Stanford University",
        period: "2015 – 2019",
        grade: "Distinction"
      }
    ],
    skills: [
      { id: "1", name: "PyTorch & JAX", category: "Programming Languages" },
      { id: "2", name: "CUDA & Triton Kernels", category: "Programming Languages" },
      { id: "3", name: "DeepSpeed & Megatron-LM", category: "Frameworks" },
      { id: "4", name: "LLM Alignment & RLHF", category: "Machine Learning" },
      { id: "5", name: "Distributed GPU Clusters", category: "Tools & Tech" }
    ],
    projects: [
      {
        id: "1",
        name: "FlashAlign: Open Source RLHF Engine",
        technologies: "JAX, PyTorch, Ray Distributed, Weights & Biases",
        description: "High-throughput preference optimization library enabling 3x faster reward modeling on multi-node GPU clusters."
      }
    ]
  },
  '2': {
    fullName: "Dr. Elena Rostova, Ph.D.",
    title: "Lead Computational & Quantum Physicist",
    email: "elena.rostova@quantum-cern.org",
    phone: "+41 22 767 1100",
    location: "Geneva, Switzerland",
    linkedin: "linkedin.com/in/elena-rostova-phd",
    github: "github.com/erostova-quantum",
    portfolio: "rostova-research.org",
    summary: "Senior Computational Physicist specializing in variational quantum algorithms, high-energy particle simulations, and quantum error mitigation on noisy intermediate-scale quantum (NISQ) devices.",
    experience: [
      {
        id: "1",
        role: "Senior Quantum Algorithms Researcher",
        company: "European Organization for Nuclear Research (CERN)",
        period: "2021 – Present",
        bullets: [
          "Formulated hybrid quantum-classical algorithms (VQE/QAOA) simulating quantum many-body dynamics on 127-qubit superconducting hardware.",
          "Parallelized lattice quantum chromodynamics (LQCD) calculations on EuroHPC supercomputers, accelerating converge time by 4x."
        ]
      },
      {
        id: "2",
        role: "Postdoctoral Research Fellow",
        company: "MIT Quantum Engineering Center",
        period: "2018 – 2021",
        bullets: [
          "Implemented novel tensor network simulation algorithms in C++ and Julia, modeling 60-qubit entangled states with 99.8% fidelity."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Ph.D. in Theoretical & Quantum Physics",
        school: "ETH Zurich",
        period: "2014 – 2018"
      }
    ],
    skills: [
      { id: "1", name: "Python, Julia, C++", category: "Programming Languages" },
      { id: "2", name: "Qiskit, Cirq, PennyLane", category: "Frameworks" },
      { id: "3", name: "HPC MPI / OpenMP", category: "Tools & Tech" }
    ],
    projects: []
  },
  '3': {
    fullName: "Marcus Chen",
    title: "Lead Robotics & Autonomous Systems Engineer",
    email: "marcus.chen@autonomy-labs.io",
    phone: "+1 (412) 555-0182",
    location: "Pittsburgh, PA",
    linkedin: "linkedin.com/in/marcus-chen-robotics",
    github: "github.com/marcuschen-robotics",
    portfolio: "marcuschen.me",
    summary: "Autonomous systems engineer specializing in Vision-Language-Action (VLA) foundation models, real-time spatial SLAM, and embedded ROS 2 control systems for industrial manipulators and mobile robots.",
    experience: [
      {
        id: "1",
        role: "Lead Robotics Software Engineer",
        company: "Veritas Robotics & Automation",
        period: "2022 – Present",
        bullets: [
          "Engineered end-to-end teleoperation and reinforcement learning pipeline for 7-DOF robotic arms, achieving 98.4% pick-and-place task success.",
          "Integrated real-time LiDAR-inertial odometry and 3D Gaussian Splatting for sub-centimeter warehouse navigation in dynamic environments.",
          "Optimized C++ control loops on NVIDIA Jetson Orin compute modules running at 500Hz deterministic frequency."
        ]
      },
      {
        id: "2",
        role: "Robotics Perception Engineer",
        company: "Carnegie Autonomy Systems",
        period: "2019 – 2022",
        bullets: [
          "Developed multi-camera sensor fusion pipeline for autonomous forklifts, reducing blind-spot obstacles false-positives by 72%."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "M.S. in Robotic Systems Development",
        school: "Carnegie Mellon University",
        period: "2017 – 2019",
        grade: "3.92 GPA"
      }
    ],
    skills: [
      { id: "1", name: "C++20, Python, Rust", category: "Programming Languages" },
      { id: "2", name: "ROS 2, MoveIt, Gazebo", category: "Frameworks" },
      { id: "3", name: "TensorRT & CUDA", category: "Tools & Tech" },
      { id: "4", name: "Spatial SLAM & Point Clouds", category: "Other" }
    ],
    projects: []
  },
  '4': {
    fullName: "Sarah Jenkins",
    title: "Staff Distributed Systems & Cloud Architect",
    email: "sarah.jenkins@cloudscale.io",
    phone: "+1 (555) 438-9210",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/sarahjenkins-cloud",
    github: "github.com/sarahjenkins",
    portfolio: "sarahjenkins.dev",
    summary: "Staff Systems Architect with 8+ years specializing in distributed cloud infrastructure, high-throughput microservices, and AI-accelerated backends. Scaled architectures to 25M+ daily requests with 99.999% reliability.",
    experience: [
      {
        id: "1",
        role: "Staff Cloud Infrastructure Architect",
        company: "Apex Cloud Innovations",
        period: "2022 – Present",
        location: "San Francisco, CA",
        bullets: [
          "Architected multi-region Kubernetes platform across AWS and GCP, handling 25M+ daily API requests with 99.999% SLA.",
          "Engineered distributed caching and query optimization layers in Go and Redis, slashing p99 latency from 140ms to 18ms.",
          "Led cross-functional team of 12 cloud and backend engineers, driving zero-downtime microservices migration for Fortune 500 clients."
        ]
      },
      {
        id: "2",
        role: "Senior Full Stack Engineer",
        company: "Stripe Infrastructure Partner",
        period: "2019 – 2022",
        location: "San Francisco, CA",
        bullets: [
          "Constructed real-time telemetry processing pipeline ingesting 12TB+ daily transaction data using Kafka and FastAPI.",
          "Automated infrastructure-as-code delivery pipelines with ArgoCD and Terraform, reducing release turnaround by 65%."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "B.S. in Computer Science & Engineering",
        school: "University of California, Berkeley",
        period: "2015 – 2019",
        grade: "3.90 GPA"
      }
    ],
    skills: [
      { id: "1", name: "Go, Python, TypeScript", category: "Programming Languages" },
      { id: "2", name: "React, FastAPI, Next.js", category: "Frameworks" },
      { id: "3", name: "Kubernetes, Docker, Terraform", category: "Tools & Tech" },
      { id: "4", name: "PostgreSQL, Redis, Kafka", category: "Databases" }
    ],
    projects: []
  },
  '5': {
    fullName: "Dr. Devraj Mukherjee",
    title: "Principal Quantitative Data Scientist",
    email: "devraj.mukherjee@quantedge.com",
    phone: "+1 (212) 555-8930",
    location: "New York, NY",
    linkedin: "linkedin.com/in/devraj-mukherjee-quant",
    github: "github.com/devrajmukherjee",
    portfolio: "devrajquant.io",
    summary: "Quantitative Researcher and ML Systems Lead with 9+ years architecting algorithmic trading strategies, high-frequency feature pipelines, and deep neural pricing models across global equity and derivative markets.",
    experience: [
      {
        id: "1",
        role: "Head of Quantitative Machine Learning",
        company: "Vanguard Alpha Capital",
        period: "2021 – Present",
        bullets: [
          "Engineered statistical arbitrage predictive alpha model managing $180M AUM, achieving a 2.45 Sharpe ratio over 3 years.",
          "Built ultra-low latency feature store streaming 500,000 tick updates/sec with sub-millisecond feature compute overhead."
        ]
      },
      {
        id: "2",
        role: "Senior Quantitative Researcher",
        company: "Citadel Technology Partners",
        period: "2017 – 2021",
        bullets: [
          "Developed deep reinforcement learning market-making agents, improving execution capture on fragmented exchanges by 22 bps."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "Ph.D. in Financial Engineering & Machine Learning",
        school: "Columbia University",
        period: "2013 – 2017"
      }
    ],
    skills: [
      { id: "1", name: "Python, C++, R", category: "Programming Languages" },
      { id: "2", name: "PyTorch, Ray, Polars", category: "Frameworks" },
      { id: "3", name: "Time Series & Stochastic Calculus", category: "Other" }
    ],
    projects: []
  },
  '6': {
    fullName: "Priya Sharma",
    title: "Lead Cloud Security & Solutions Architect",
    email: "priya.sharma@cyberdefense.in",
    phone: "+91 98201 45678",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/priyasharma-sec",
    github: "github.com/priyasharma-cloud",
    portfolio: "priyasharma.cloud",
    summary: "Cloud Security Architect with 8+ years leading enterprise cloud transformations, zero-trust infrastructure, SOC 2 / ISO 27001 compliance, and automated DevSecOps guardrails across large-scale AWS ecosystems.",
    experience: [
      {
        id: "1",
        role: "Principal Cloud Security Architect",
        company: "Infosys Cloud Security Labs",
        period: "2021 – Present",
        bullets: [
          "Designed and enforced automated Zero-Trust architecture across 140+ AWS enterprise accounts protecting $2B in fintech assets.",
          "Built real-time automated threat-detection pipeline integrating AWS GuardDuty, Security Hub, and custom serverless remediations."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "B.Tech in Computer Science & Engineering",
        school: "Indian Institute of Technology (IIT Bombay)",
        period: "2015 – 2019",
        grade: "9.4 CGPA"
      }
    ],
    skills: [
      { id: "1", name: "Python, Go, Bash", category: "Programming Languages" },
      { id: "2", name: "AWS Security & Terraform", category: "Tools & Tech" },
      { id: "3", name: "Kubernetes Security (Falco, OPA)", category: "Other" }
    ],
    projects: []
  },
  '7': {
    fullName: "David K. Reynolds",
    title: "Senior Product Engineering Lead",
    email: "david.reynolds@saasplatform.com",
    phone: "+1 (617) 555-0144",
    location: "Boston, MA",
    linkedin: "linkedin.com/in/davidkreynolds",
    github: "github.com/davidreynolds-dev",
    portfolio: "davidreynolds.tech",
    summary: "Product Engineering Lead with 7+ years driving full-lifecycle SaaS product architecture, rapid experimentation, and AI workflow integration. Grew B2B SaaS revenue from $1.5M to $18M ARR.",
    experience: [
      {
        id: "1",
        role: "Director of Product Engineering",
        company: "Acumen SaaS Technologies",
        period: "2021 – Present",
        bullets: [
          "Led 18 engineers across 3 cross-functional product squads delivering generative AI workflow features that boosted user retention by 34%.",
          "Re-architected core frontend and GraphQL APIs, improving core web vitals and reducing page render times by 55%."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "B.S. in Computer Science",
        school: "Harvard University",
        period: "2014 – 2018",
        grade: "Magna Cum Laude"
      }
    ],
    skills: [
      { id: "1", name: "TypeScript, React, Next.js", category: "Programming Languages" },
      { id: "2", name: "Node.js, GraphQL, PostgreSQL", category: "Frameworks" },
      { id: "3", name: "Product Analytics & Growth", category: "Other" }
    ],
    projects: []
  },
  '8': {
    fullName: "Claire Moreau",
    title: "Management & AI Strategy Consultant",
    email: "claire.moreau@instrategy.eu",
    phone: "+33 1 42 68 55 00",
    location: "Paris, France",
    linkedin: "linkedin.com/in/clairemoreau-strategy",
    github: "github.com/clairemoreau",
    portfolio: "moreau-advisory.com",
    summary: "Management Consultant specializing in Enterprise AI adoption, digital operating models, and technology modernization for Fortune 500 industrial and banking corporations.",
    experience: [
      {
        id: "1",
        role: "Senior Strategy Manager – AI & Technology",
        company: "McKinsey & Company Practice Partner",
        period: "2020 – Present",
        bullets: [
          "Orchestrated generative AI roadmap for European multinational bank, unlocking €45M in annual operational efficiency.",
          "Advised C-suite leadership on AI governance, regulatory risk compliance (EU AI Act), and data platform re-architecture."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "MBA in Strategy & Technology",
        school: "INSEAD",
        period: "2018 – 2020"
      }
    ],
    skills: [
      { id: "1", name: "Enterprise AI Strategy", category: "Other" },
      { id: "2", name: "Digital Transformation & M&A", category: "Other" },
      { id: "3", name: "Financial Modeling & Valuation", category: "Other" }
    ],
    projects: []
  },
  '9': {
    fullName: "Nicola Alessi",
    title: "Principal UI Systems & WebGL Engineer",
    email: "nicola.alessi@creativecode.it",
    phone: "+39 02 8739 4411",
    location: "Milan, Italy",
    linkedin: "linkedin.com/in/nicolaalessi-ui",
    github: "github.com/nicolaalessi",
    portfolio: "alessi.design",
    summary: "Frontend systems engineer with 8+ years crafting interactive 3D WebGL graphics, design systems, and sub-60fps web applications for luxury and tech innovators.",
    experience: [
      {
        id: "1",
        role: "Principal Frontend Architect",
        company: "Studio Alessi Digital",
        period: "2020 – Present",
        bullets: [
          "Engineered high-performance WebGL 3D configuration engine in Three.js and React Three Fiber with zero dropped frames.",
          "Designed multi-brand unified design system adopted by 40+ production web applications."
        ]
      }
    ],
    education: [
      {
        id: "1",
        degree: "M.Sc. in Computer Science & Interaction Design",
        school: "Politecnico di Milano",
        period: "2014 – 2017"
      }
    ],
    skills: [
      { id: "1", name: "JavaScript / TypeScript", category: "Programming Languages" },
      { id: "2", name: "Three.js & WebGL / WebGPU", category: "Frameworks" },
      { id: "3", name: "React, Tailwind, Canvas", category: "Frameworks" }
    ],
    projects: []
  }
};

export default function ResumePreview({ resumeData, templateId = 'Modern', scale = 100, useTemplateMock = false }) {
  const rawTplId = templateId.toString();
  const mockData = TEMPLATE_SHOWCASES[rawTplId] || DEFAULT_SHOWCASE;

  const data = (useTemplateMock || !resumeData || Object.keys(resumeData).length === 0) ? mockData : resumeData;
  
  // Check if user has entered real content
  const hasUserExp = (data.experience && data.experience.length > 0) || (data.experiences && data.experiences.length > 0);
  const hasUserEdu = (data.education && ((Array.isArray(data.education) && data.education.length > 0) || Boolean(data.education.school || data.education.degree || data.education.institution)));
  const hasUserSkills = (data.skills && ((Array.isArray(data.skills) && data.skills.length > 0) || (typeof data.skills === 'object' && Object.values(data.skills).some(v => Boolean(v)))));
  const hasUserSummary = Boolean(data.summary || (data.personal && data.personal.summary));
  const hasUserName = Boolean(data.fullName || data.firstName || data.lastName || (data.personal && (data.personal.fullName || data.personal.firstName)));
  const hasUserContact = Boolean(data.email || data.phone || data.location || (data.personal && (data.personal.email || data.personal.phone)));

  // If live data has ANY field filled by user, honor user's data; else fallback to mockData
  const isDataEmpty = !useTemplateMock && !hasUserExp && !hasUserEdu && !hasUserSkills && !hasUserSummary && !hasUserName && !hasUserContact;

  const finalData = (useTemplateMock || isDataEmpty) ? mockData : data;

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
