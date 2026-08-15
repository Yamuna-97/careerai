import React, { useState } from 'react';

const SUGGESTED_ROLES = [
  'Software Engineer', 'Machine Learning Engineer', 'AI Engineer',
  'Data Scientist', 'Data Analyst', 'Backend Developer',
  'Frontend Developer', 'Full Stack Developer', 'Python Developer',
  'Computer Vision Engineer'
];

const SUGGESTED_LOCATIONS = [
  'Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Erode',
  'Pune', 'Mumbai', 'Delhi', 'Remote'
];

const WORK_MODES = [
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
  { value: 'any', label: 'Any Mode' }
];

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
  { value: 'any', label: 'Any Type' }
];

const EXPERIENCE_LEVELS = [
  { value: 'internship', label: 'Internship' },
  { value: 'entry', label: 'Entry Level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'any', label: 'Any Level' }
];

export default function JobSearchSetup({ initialData, onComplete }) {
  const [step, setStep] = useState(1);
  
  // Setup Profile State
  const [targetRoles, setTargetRoles] = useState(initialData?.target_roles || []);
  const [customRole, setCustomRole] = useState('');
  const [skills, setSkills] = useState(initialData?.skills || []);
  const [customSkill, setCustomSkill] = useState('');
  const [keywords, setKeywords] = useState(initialData?.keywords || []);
  const [customKeyword, setCustomKeyword] = useState('');
  
  const [locations, setLocations] = useState(initialData?.locations || ['Remote']);
  const [customLocation, setCustomLocation] = useState('');
  
  const [workModes, setWorkModes] = useState(initialData?.work_modes || ['remote', 'hybrid']);
  const [employmentTypes, setEmploymentTypes] = useState(initialData?.employment_types || ['full_time']);
  const [experienceLevel, setExperienceLevel] = useState(initialData?.experience_level || 'entry');
  
  const [salaryMin, setSalaryMin] = useState(initialData?.salary_min || '');
  const [salaryMax, setSalaryMax] = useState(initialData?.salary_max || '');
  const [skipSalary, setSkipSalary] = useState(!initialData?.salary_min);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper toggle functions
  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleAddCustom = (value, setValue, list, setList) => {
    if (value.trim() && !list.includes(value.trim())) {
      setList([...list, value.trim()]);
      setValue('');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const profilePayload = {
      target_roles: targetRoles,
      skills: skills,
      keywords: keywords,
      experience_level: experienceLevel,
      locations: locations,
      work_modes: workModes,
      employment_types: employmentTypes,
      salary_min: skipSalary ? null : (parseInt(salaryMin) || null),
      salary_max: skipSalary ? null : (parseInt(salaryMax) || null)
    };

    try {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8000/api/v1/jobs/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profilePayload)
      });
      if (res.ok) {
        onComplete();
      } else {
        // Attempt PUT if POST failed (profile exists)
        const putRes = await fetch("http://localhost:8000/api/v1/jobs/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(profilePayload)
        });
        if (putRes.ok) onComplete();
      }
    } catch (e) {
      console.error("Failed to save job search profile:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-surface border border-outline-variant/60 rounded-2xl p-6 md:p-8 shadow-xl mt-6">
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase mb-2">
          <span>Step {step} of 8</span>
          <span>{Math.round((step / 8) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className="bg-primary h-full transition-all duration-300" style={{ width: `${(step / 8) * 100}%` }}></div>
        </div>
      </div>

      {/* STEP 1: Career Information (Resume Sync check) */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Confirm Career Profile</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We extracted these core details from your CareerAI Resume. Ensure they match your expectations.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Initial Skills</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {skills.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-lg flex items-center gap-1">
                    {s}
                    <button onClick={() => setSkills(skills.filter(i => i !== s))} className="hover:text-error text-[10px]">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add custom skill"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="bg-slate-50 border border-outline-variant rounded-lg p-2 text-xs flex-1 focus:outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleAddCustom(customSkill, setCustomSkill, skills, setSkills)}
                  className="bg-slate-100 hover:bg-slate-200 px-3 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Preferred Roles */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Preferred Job Roles</h3>
            <p className="text-xs text-on-surface-variant">Which target roles are you looking to apply for?</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_ROLES.map(role => {
              const active = targetRoles.includes(role);
              return (
                <button
                  key={role}
                  onClick={() => toggleItem(targetRoles, setTargetRoles, role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
                    active
                      ? 'bg-primary border-primary text-on-primary shadow-sm'
                      : 'border-outline-variant text-on-surface-variant hover:bg-slate-50'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Enter another title..."
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              className="bg-slate-50 border border-outline-variant rounded-lg p-2 text-xs flex-1 focus:outline-none"
            />
            <button
              onClick={() => handleAddCustom(customRole, setCustomRole, targetRoles, setTargetRoles)}
              className="bg-slate-150 px-4 text-xs font-bold rounded-lg cursor-pointer"
            >
              Add Role
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Location */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Target Locations</h3>
            <p className="text-xs text-on-surface-variant">Where would you prefer to work? Select multiple if open.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_LOCATIONS.map(loc => {
              const active = locations.includes(loc);
              return (
                <button
                  key={loc}
                  onClick={() => toggleItem(locations, setLocations, loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${
                    active
                      ? 'bg-primary border-primary text-on-primary shadow-sm'
                      : 'border-outline-variant text-on-surface-variant hover:bg-slate-50'
                  }`}
                >
                  {loc}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="e.g. Pune, Hyderabad..."
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              className="bg-slate-50 border border-outline-variant rounded-lg p-2 text-xs flex-1 focus:outline-none"
            />
            <button
              onClick={() => handleAddCustom(customLocation, setCustomLocation, locations, setLocations)}
              className="bg-slate-150 px-4 text-xs font-bold rounded-lg cursor-pointer"
            >
              Add Location
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Work Mode */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Preferred Work Mode</h3>
            <p className="text-xs text-on-surface-variant">Select all workplace environments you are comfortable with.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {WORK_MODES.map(mode => {
              const active = workModes.includes(mode.value);
              return (
                <button
                  key={mode.value}
                  onClick={() => toggleItem(workModes, setWorkModes, mode.value)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    active ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-sm">{mode.label}</span>
                  <span className="text-[10px] text-on-surface-variant mt-1">
                    {mode.value === 'remote' ? 'Work from anywhere' : mode.value === 'hybrid' ? 'Mix of office and remote' : 'Regular office presence'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: Employment Type */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Employment Type</h3>
            <p className="text-xs text-on-surface-variant">What kind of job contracts are you targeting?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {EMPLOYMENT_TYPES.map(type => {
              const active = employmentTypes.includes(type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => toggleItem(employmentTypes, setEmploymentTypes, type.value)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    active ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-sm">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 6: Experience Level */}
      {step === 6 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Target Experience Level</h3>
            <p className="text-xs text-on-surface-variant">Select the career ladder stage fitting your credentials.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {EXPERIENCE_LEVELS.map(level => {
              const active = experienceLevel === level.value;
              return (
                <button
                  key={level.value}
                  onClick={() => setExperienceLevel(level.value)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    active ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-sm">{level.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 7: Salary Preferences */}
      {step === 7 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Salary Expectations</h3>
            <p className="text-xs text-on-surface-variant">Optionally specify your target salary expectations.</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipSalary}
                onChange={(e) => setSkipSalary(e.target.checked)}
                className="rounded text-primary cursor-pointer"
              />
              <span className="text-xs font-semibold">I don't want to specify salary requirements.</span>
            </label>
          </div>

          {!skipSalary && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold">Minimum Annual Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 600000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold">Maximum Annual Salary (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1200000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant rounded-lg p-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 8: Search Keywords & Confirmation */}
      {step === 8 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Confirm Search Profile</h3>
            <p className="text-xs text-on-surface-variant">Review your preferences before we launch the Adzuna search engine.</p>
          </div>

          <div className="space-y-3 bg-slate-50/50 p-4 border border-outline-variant/30 rounded-xl text-xs">
            <p><strong>Target Roles:</strong> {targetRoles.join(', ') || 'Any'}</p>
            <p><strong>Skills:</strong> {skills.slice(0, 5).join(', ') || 'Any'}</p>
            <p><strong>Locations:</strong> {locations.join(', ')}</p>
            <p><strong>Work Modes:</strong> {workModes.join(', ')}</p>
            <p><strong>Employment Types:</strong> {employmentTypes.join(', ')}</p>
            <p><strong>Experience level:</strong> <span className="capitalize">{experienceLevel}</span></p>
            <p><strong>Salary Range:</strong> {skipSalary ? 'Not specified' : `₹${parseInt(salaryMin)/100000}L - ₹${parseInt(salaryMax)/100000}L`}</p>
          </div>

          <div>
            <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Search Keywords</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {keywords.map(k => (
                <span key={k} className="px-2.5 py-1 bg-amber-500/10 text-amber-700 text-xs font-bold rounded-lg flex items-center gap-1">
                  {k}
                  <button onClick={() => setKeywords(keywords.filter(i => i !== k))} className="hover:text-error text-[10px]">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add custom keyword (e.g. LLMs, Cloud)"
                value={customKeyword}
                onChange={(e) => setCustomKeyword(e.target.value)}
                className="bg-slate-50 border border-outline-variant rounded-lg p-2 text-xs flex-1 focus:outline-none"
              />
              <button
                onClick={() => handleAddCustom(customKeyword, setCustomKeyword, keywords, setKeywords)}
                className="bg-slate-100 hover:bg-slate-200 px-3 text-xs font-bold rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Button Controls */}
      <div className="flex justify-between items-center pt-6 border-t border-outline-variant/30 mt-8">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            Back
          </button>
        ) : (
          <div></div>
        )}

        {step < 8 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 2 && targetRoles.length === 0}
            className="bg-primary text-on-primary px-5 py-2 rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-xs font-bold hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? 'Saving Profile...' : 'Find Jobs'}
            <span className="material-symbols-outlined text-sm">search</span>
          </button>
        )}
      </div>

    </div>
  );
}
