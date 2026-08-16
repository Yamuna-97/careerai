import React, { useState } from 'react';
import apiClient from '../../api/client';

const SUGGESTED_ROLES = [
  'Full Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'Machine Learning Engineer',
  'Python Developer',
  'Data Scientist',
  'DevOps Engineer',
  'Product Manager'
];

const SUGGESTED_LOCATIONS = [
  'Remote',
  'Bangalore',
  'Mumbai',
  'Delhi NCR',
  'Hyderabad',
  'Chennai',
  'Pune',
  'San Francisco, CA'
];

const WORK_MODES = [
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'on_site', label: 'On-site' }
];

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' }
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level (0-2 yrs)' },
  { value: 'mid', label: 'Mid Level (2-5 yrs)' },
  { value: 'senior', label: 'Senior (5+ yrs)' },
  { value: 'any', label: 'Any Level' }
];

export default function JobSearchSetup({ initialData, onComplete }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [targetRoles, setTargetRoles] = useState(initialData?.target_roles || []);
  const [customRoleInput, setCustomRoleInput] = useState('');

  const [preferredLocations, setPreferredLocations] = useState(initialData?.preferred_locations || ['Remote']);
  const [customLocationInput, setCustomLocationInput] = useState('');

  const [workModes, setWorkModes] = useState(initialData?.work_modes || ['remote', 'hybrid']);
  const [employmentTypes, setEmploymentTypes] = useState(initialData?.employment_types || ['full_time']);
  const [experienceLevel, setExperienceLevel] = useState(initialData?.experience_level || 'mid');

  const [salaryMin, setSalaryMin] = useState(initialData?.salary_min || '');
  const [salaryMax, setSalaryMax] = useState(initialData?.salary_max || '');
  const [skipSalary, setSkipSalary] = useState(!initialData?.salary_min);

  const [skillTags, setSkillTags] = useState(initialData?.skill_tags || ['React', 'Python', 'FastAPI', 'JavaScript']);
  const [customSkillInput, setCustomSkillInput] = useState('');

  const [searchKeywords, setSearchKeywords] = useState(initialData?.search_keywords || ['Software Engineer', 'Full Stack']);
  const [customKeywordInput, setCustomKeywordInput] = useState('');

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
      skill_tags: skillTags,
      search_keywords: searchKeywords,
      experience_level: experienceLevel,
      preferred_locations: preferredLocations,
      work_modes: workModes,
      employment_types: employmentTypes,
      salary_min: skipSalary ? null : (parseInt(salaryMin) || null),
      salary_max: skipSalary ? null : (parseInt(salaryMax) || null)
    };

    try {
      await apiClient.post("/jobs/profile", profilePayload);
      onComplete();
    } catch (e) {
      try {
        await apiClient.put("/jobs/profile", profilePayload);
        onComplete();
      } catch (err) {
        console.error("Failed to save job search profile:", err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline-variant/30 p-6 md:p-8 max-w-2xl mx-auto shadow-xl">

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/30">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#EC4899]">Step {step} of 7</span>
          <h2 className="text-xl font-bold text-on-surface">Job Search Preferences</h2>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${s === step
                  ? 'w-6 bg-gradient-to-r from-[#EC4899] to-[#FF8A3D]'
                  : s < step
                    ? 'w-2 bg-[#EC4899]/40'
                    : 'w-2 bg-slate-200'
                }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Skills Review */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-on-surface">Initial Skills Profile</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We extracted these core technical skills from your profile. Ensure they match your job target.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Skills Tags</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {skillTags.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-[#EC4899]/10 text-[#EC4899] text-xs font-bold rounded-lg flex items-center gap-1">
                    {s}
                    <button onClick={() => setSkillTags(skillTags.filter(i => i !== s))} className="hover:text-red-500 text-[10px]">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Add custom skill..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  className="bg-slate-50 border border-outline-variant rounded-lg p-2 text-xs flex-1 focus:outline-none focus:border-[#EC4899]"
                />
                <button
                  onClick={() => handleAddCustom(customSkillInput, setCustomSkillInput, skillTags, setSkillTags)}
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
            <h3 className="font-bold text-lg text-on-surface">Target Job Roles</h3>
            <p className="text-xs text-on-surface-variant">Which job roles are you actively looking to apply for?</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_ROLES.map(role => {
              const active = targetRoles.includes(role);
              return (
                <button
                  key={role}
                  onClick={() => toggleItem(targetRoles, setTargetRoles, role)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${active
                      ? 'bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white border-transparent shadow-sm'
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
              value={customRoleInput}
              onChange={(e) => setCustomRoleInput(e.target.value)}
              className="bg-slate-50 border border-outline-variant rounded-lg p-2 text-xs flex-1 focus:outline-none focus:border-[#EC4899]"
            />
            <button
              onClick={() => handleAddCustom(customRoleInput, setCustomRoleInput, targetRoles, setTargetRoles)}
              className="bg-slate-100 hover:bg-slate-200 px-4 text-xs font-bold rounded-lg cursor-pointer"
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
            <h3 className="font-bold text-lg text-on-surface">Target Locations</h3>
            <p className="text-xs text-on-surface-variant">Where would you prefer to work? Select multiple if open.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_LOCATIONS.map(loc => {
              const active = preferredLocations.includes(loc);
              return (
                <button
                  key={loc}
                  onClick={() => toggleItem(preferredLocations, setPreferredLocations, loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all ${active
                      ? 'bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white border-transparent shadow-sm'
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
              value={customLocationInput}
              onChange={(e) => setCustomLocationInput(e.target.value)}
              className="bg-slate-50 border border-outline-variant rounded-lg p-2 text-xs flex-1 focus:outline-none focus:border-[#EC4899]"
            />
            <button
              onClick={() => handleAddCustom(customLocationInput, setCustomLocationInput, preferredLocations, setPreferredLocations)}
              className="bg-slate-100 hover:bg-slate-200 px-4 text-xs font-bold rounded-lg cursor-pointer"
            >
              Add Location
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Work Mode & Contract */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-on-surface">Workplace & Employment Type</h3>
            <p className="text-xs text-on-surface-variant">Select all work environments and contract types you accept.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-2">Work Modes</label>
              <div className="grid grid-cols-3 gap-3">
                {WORK_MODES.map(mode => {
                  const active = workModes.includes(mode.value);
                  return (
                    <button
                      key={mode.value}
                      onClick={() => toggleItem(workModes, setWorkModes, mode.value)}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${active ? 'border-[#EC4899] bg-[#EC4899]/5 text-[#EC4899] font-bold' : 'border-outline-variant hover:bg-slate-50 text-on-surface'
                        }`}
                    >
                      <span className="text-xs">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-2">Contract Types</label>
              <div className="grid grid-cols-2 gap-3">
                {EMPLOYMENT_TYPES.map(type => {
                  const active = employmentTypes.includes(type.value);
                  return (
                    <button
                      key={type.value}
                      onClick={() => toggleItem(employmentTypes, setEmploymentTypes, type.value)}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${active ? 'border-[#EC4899] bg-[#EC4899]/5 text-[#EC4899] font-bold' : 'border-outline-variant hover:bg-slate-50 text-on-surface'
                        }`}
                    >
                      <span className="text-xs">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Experience Level */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-on-surface">Target Experience Level</h3>
            <p className="text-xs text-on-surface-variant">Select the seniority level fitting your credentials.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {EXPERIENCE_LEVELS.map(level => {
              const active = experienceLevel === level.value;
              return (
                <button
                  key={level.value}
                  onClick={() => setExperienceLevel(level.value)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${active ? 'border-[#EC4899] bg-[#EC4899]/5 text-[#EC4899] font-bold' : 'border-outline-variant hover:bg-slate-50 text-on-surface'
                    }`}
                >
                  <span className="font-bold text-sm block">{level.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 6: Salary Expectations */}
      {step === 6 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-on-surface">Salary Expectations</h3>
            <p className="text-xs text-on-surface-variant">Optionally specify your target annual salary expectations.</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipSalary}
                onChange={(e) => setSkipSalary(e.target.checked)}
                className="rounded text-[#EC4899] cursor-pointer"
              />
              <span className="text-xs font-semibold">I don't want to specify salary requirements.</span>
            </label>
          </div>

          {!skipSalary && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold">Minimum Salary (₹/yr)</label>
                <input
                  type="number"
                  placeholder="e.g. 600000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#EC4899]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold">Maximum Salary (₹/yr)</label>
                <input
                  type="number"
                  placeholder="e.g. 1200000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full bg-slate-50 border border-outline-variant rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#EC4899]"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 7: Confirmation & Search Keywords */}
      {step === 7 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-on-surface">Confirm Search Profile</h3>
            <p className="text-xs text-on-surface-variant">Review your target parameters before launching job matching.</p>
          </div>

          <div className="space-y-2.5 bg-slate-50 p-4 border border-outline-variant/30 rounded-xl text-xs">
            <p><strong>Target Roles:</strong> {targetRoles.join(', ') || 'Any'}</p>
            <p><strong>Skills:</strong> {skillTags.slice(0, 6).join(', ') || 'Any'}</p>
            <p><strong>Locations:</strong> {preferredLocations.join(', ')}</p>
            <p><strong>Work Modes:</strong> {workModes.join(', ')}</p>
            <p><strong>Employment Types:</strong> {employmentTypes.join(', ')}</p>
            <p><strong>Experience Level:</strong> <span className="capitalize">{experienceLevel}</span></p>
            <p><strong>Salary Range:</strong> {skipSalary || !salaryMin ? 'Not specified' : `₹${parseInt(salaryMin) / 100000}L - ₹${parseInt(salaryMax) / 100000}L`}</p>
          </div>

          <div>
            <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block mb-1.5">Search Keywords</label>
            <div className="flex flex-wrap gap-1.5">
              {searchKeywords.map(k => (
                <span key={k} className="px-2.5 py-1 bg-[#FF8A3D]/10 text-[#FF8A3D] text-xs font-bold rounded-lg flex items-center gap-1">
                  {k}
                  <button onClick={() => setSearchKeywords(searchKeywords.filter(i => i !== k))} className="hover:text-red-500 text-[10px]">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add custom keyword (e.g. PyTorch, Cloud)"
                value={customKeywordInput}
                onChange={(e) => setCustomKeywordInput(e.target.value)}
                className="bg-slate-50 border border-outline-variant rounded-lg p-2 text-xs flex-1 focus:outline-none focus:border-[#FF8A3D]"
              />
              <button
                onClick={() => handleAddCustom(customKeywordInput, setCustomKeywordInput, searchKeywords, setSearchKeywords)}
                className="bg-slate-100 hover:bg-slate-200 px-3 text-xs font-bold rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
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

        {step < 7 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={step === 2 && targetRoles.length === 0}
            className="bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white px-6 py-2 rounded-lg text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-[#EC4899] to-[#FF8A3D] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-md hover:opacity-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {isSubmitting ? 'Saving Profile...' : 'Find Matching Jobs'}
          </button>
        )}
      </div>

    </div>
  );
}
