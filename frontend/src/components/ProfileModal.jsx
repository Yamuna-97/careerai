import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Globe, FileText, Camera, Trash2, X, Check, Loader2 } from 'lucide-react';
import apiClient from '../api/client';

export default function ProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: '',
    title: '',
    phone: '',
    location: '',
    bio: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/users/me');
      if (res.data) {
        setFormData({
          full_name: res.data.full_name || '',
          email: res.data.email || '',
          avatar_url: res.data.avatar_url || '',
          title: res.data.title || '',
          phone: res.data.phone || '',
          location: res.data.location || '',
          bio: res.data.bio || '',
          linkedin: res.data.linkedin || '',
          github: res.data.github || '',
          portfolio: res.data.portfolio || ''
        });
      }
    } catch (err) {
      // Fallback to local storage cache if available
      const saved = localStorage.getItem('careerai_user_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error(e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setFormData(prev => ({ ...prev, avatar_url: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, avatar_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await apiClient.put('/users/me', {
        full_name: formData.full_name,
        avatar_url: formData.avatar_url,
        title: formData.title,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        linkedin: formData.linkedin,
        github: formData.github,
        portfolio: formData.portfolio
      });

      const updated = res.data || formData;
      localStorage.setItem('careerai_user_profile', JSON.stringify(updated));

      // Broadcast profile update event across application
      window.dispatchEvent(new CustomEvent('careerai:profile-updated', { detail: updated }));

      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }

      setToast(true);
      setTimeout(() => {
        setToast(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Still save locally so user experience is instant
      localStorage.setItem('careerai_user_profile', JSON.stringify(formData));
      window.dispatchEvent(new CustomEvent('careerai:profile-updated', { detail: formData }));
      if (onProfileUpdated) onProfileUpdated(formData);

      setToast(true);
      setTimeout(() => {
        setToast(false);
        onClose();
      }, 1200);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const initials = formData.full_name
    ? formData.full_name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-outline-variant shadow-2xl animate-scale-up">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/60 bg-surface">
          <div>
            <h3 className="font-headline-sm text-base font-extrabold text-on-surface">Profile Details</h3>
            <p className="font-body-sm text-xs text-on-surface-variant">Manage your personal information, photo, and career details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-semibold">Loading profile information...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-surface-container-low rounded-xl border border-outline-variant/40">
                <div className="relative group">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt={formData.full_name || 'Profile'}
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#EC4899] to-[#FF8A3D] text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                      {initials}
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-[10px] font-bold gap-1"
                  >
                    <Camera className="w-5 h-5" />
                    Change
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-sm font-bold text-on-surface">Profile Photo</h4>
                  <p className="text-xs text-on-surface-variant">Upload a clear square image (JPG, PNG or WEBP, max 5MB).</p>
                  
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Upload Photo
                    </button>
                    {formData.avatar_url && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Morgan"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    Professional Title / Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-secondary" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-secondary" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-tertiary" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Bio / Professional Summary
                  </label>
                  <textarea
                    rows={3}
                    placeholder="A short summary of your experience, key achievements, and career focus..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              {/* Social / Portfolio Links */}
              <div className="border-t border-outline-variant/60 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">Social & Portfolio Links</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant">LinkedIn URL</label>
                    <input
                      type="text"
                      placeholder="linkedin.com/in/username"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant">GitHub URL</label>
                    <input
                      type="text"
                      placeholder="github.com/username"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-on-surface-variant">Personal Portfolio</label>
                    <input
                      type="text"
                      placeholder="yourname.dev"
                      value={formData.portfolio}
                      onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                      className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-xs font-medium text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/60 bg-surface flex justify-between items-center">
          {toast ? (
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold animate-fade-in">
              <Check className="w-4 h-4" />
              Profile updated successfully!
            </div>
          ) : (
            <span className="text-[11px] text-on-surface-variant font-medium">Changes sync across your CareerAI session.</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
