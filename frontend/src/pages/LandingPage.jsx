import React from 'react';
import { Link } from 'react-router-dom';
import ShaderHero from '../components/ShaderHero';

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 flex items-center px-margin-mobile md:px-margin-desktop justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-extrabold">
          <span className="material-symbols-outlined text-primary icon-filled">insights</span>
          CareerAI
        </Link>
        <div className="hidden md:flex items-center gap-gutter">
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#features">
            Features
          </a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#how-it-works">
            How It Works
          </a>
          <Link className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" to="/dashboard">
            Live Platform
          </Link>
        </div>
        <div className="flex items-center gap-stack-md">
          <Link
            to="/login"
            className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors px-4 py-2 inline-flex items-center"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2 rounded-[10px] hover:bg-[#4338CA] transition-colors shadow-sm inline-flex items-center"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop py-stack-xl md:py-24 grid md:grid-cols-2 gap-gutter items-center">
          <div className="flex flex-col gap-stack-lg">
            <h1 className="font-display-lg text-display-lg text-on-background">
              Build Your Career.<br />
              <span className="text-primary-container">Powered by AI.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Elevate your professional journey with personalized AI coaching, intelligent resume building, and smart job matching designed for modern professionals.
            </p>
            <div className="flex items-center gap-stack-md pt-stack-sm">
              <Link
                to="/signup"
                className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-[10px] hover:bg-[#4338CA] transition-colors shadow-md transform hover:-translate-y-1 inline-flex items-center"
              >
                Get Started
              </Link>
              <a
                href="#features"
                className="border border-outline-variant text-on-surface font-label-md text-label-md px-6 py-3 rounded-[10px] hover:bg-surface-container transition-colors shadow-sm transform hover:-translate-y-1 inline-flex items-center"
              >
                Explore Features
              </a>
            </div>
          </div>

          {/* WebGL Canvas Hero Animation */}
          <ShaderHero />
        </section>

        {/* Features Grid */}
        <section className="bg-surface-container-lowest py-stack-xl md:py-24 border-y border-outline-variant" id="features">
          <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-headline-lg text-center mb-stack-xl">Intelligent Tools for Growth</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-stack-lg">
              {/* Feature 1 */}
              <Link
                to="/resume-editor"
                className="bg-surface p-stack-md rounded-xl shadow-md border border-outline-variant hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex flex-col gap-stack-sm group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-2 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined icon-filled">description</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">Resume Builder</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">AI-crafted resumes optimized for modern ATS systems.</p>
              </Link>

              {/* Feature 2 */}
              <Link
                to="/interview-session"
                className="bg-surface p-stack-md rounded-xl shadow-md border border-outline-variant hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex flex-col gap-stack-sm group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-2 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined icon-filled">mic</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors">AI Interview Coach</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time feedback on mock interviews to perfect your delivery.</p>
              </Link>

              {/* Feature 3 */}
              <Link
                to="/jobs"
                className="bg-surface p-stack-md rounded-xl shadow-md border border-outline-variant hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex flex-col gap-stack-sm group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-2 group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                  <span className="material-symbols-outlined icon-filled">work</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-tertiary transition-colors">Smart Job Search</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Curated opportunities matching your unique skill profile.</p>
              </Link>

              {/* Feature 4 */}
              <Link
                to="/dashboard"
                className="bg-surface p-stack-md rounded-xl shadow-md border border-outline-variant hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex flex-col gap-stack-sm group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-2 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined icon-filled">smart_toy</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">AI Career Assistant</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">24/7 guidance on career moves and negotiation strategies.</p>
              </Link>

              {/* Feature 5 */}
              <Link
                to="/interview-evaluation"
                className="bg-surface p-stack-md rounded-xl shadow-md border border-outline-variant hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex flex-col gap-stack-sm group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-2 group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                  <span className="material-symbols-outlined icon-filled">analytics</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-secondary transition-colors">Skill Gap Analysis</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Identify and bridge the skills needed for your target role.</p>
              </Link>

              {/* Feature 6 */}
              <Link
                to="/dashboard"
                className="bg-surface p-stack-md rounded-xl shadow-md border border-outline-variant hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex flex-col gap-stack-sm group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-2 group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                  <span className="material-symbols-outlined icon-filled">insights</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-tertiary transition-colors">Career Insights</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Data-driven trends on salary, demand, and industry growth.</p>
              </Link>

              {/* Feature 7 */}
              <Link
                to="/jobs"
                className="bg-surface p-stack-md rounded-xl shadow-md border border-outline-variant hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex flex-col gap-stack-sm xl:col-span-2 group"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container mb-2 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined icon-filled">verified</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">AI Match Scoring</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Instant compatibility scores for every application.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-stack-xl md:py-24" id="how-it-works">
          <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
            <h2 className="font-headline-lg text-headline-lg text-center mb-stack-xl">Your Path to Success</h2>
            <div className="flex flex-col md:flex-row gap-stack-lg justify-between relative">
              {/* Line connecting steps (desktop) */}
              <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-outline-variant z-0"></div>

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center gap-stack-sm relative z-10 flex-1">
                <div className="w-16 h-16 rounded-full bg-surface shadow-md border border-primary-container flex items-center justify-center text-primary-container font-headline-md mb-2">
                  1
                </div>
                <h3 className="font-headline-sm text-headline-sm">Profile Setup</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Sync your history and goals.</p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center gap-stack-sm relative z-10 flex-1">
                <div className="w-16 h-16 rounded-full bg-surface shadow-md border border-primary-container flex items-center justify-center text-primary-container font-headline-md mb-2">
                  2
                </div>
                <h3 className="font-headline-sm text-headline-sm">AI Analysis</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Engine assesses strengths and gaps.</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center gap-stack-sm relative z-10 flex-1">
                <div className="w-16 h-16 rounded-full bg-surface shadow-md border border-primary-container flex items-center justify-center text-primary-container font-headline-md mb-2">
                  3
                </div>
                <h3 className="font-headline-sm text-headline-sm">Action Plan</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Receive personalized coaching steps.</p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center gap-stack-sm relative z-10 flex-1">
                <div className="w-16 h-16 rounded-full bg-primary-container shadow-md border border-primary-container flex items-center justify-center text-on-primary font-headline-md mb-2">
                  4
                </div>
                <h3 className="font-headline-sm text-headline-sm">Land the Job</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Apply with confidence and ace interviews.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant py-stack-lg">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-stack-md">
          <div className="flex items-center gap-2 text-primary font-headline-sm text-headline-sm font-extrabold">
            <span className="material-symbols-outlined text-primary icon-filled">insights</span>
            CareerAI
          </div>
          <div className="text-on-surface-variant font-body-sm text-body-sm">
            © 2026 CareerAI. All rights reserved.
          </div>
          <div className="flex gap-stack-md text-on-surface-variant font-label-sm text-label-sm">
            <a className="hover:text-primary transition-colors" href="#">
              Privacy
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
