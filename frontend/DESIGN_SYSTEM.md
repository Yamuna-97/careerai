# CareerAI Unified Design System

## Overview
This design system embodies a **Modern Editorial SaaS** aesthetic, tailored for a high-trust, AI-driven career platform. The personality is professional yet visionary—combining the reliability of executive recruitment with the innovative edge of machine learning.

The style leverages a **Modern / Minimalist** approach with a "Flat-Soft" execution. It avoids heavy skeuomorphism in favor of single-direction elevation (top-down lighting), generous whitespace, and precise typographic hierarchies. Visual interest is driven by **Pillar Accents** that help users mentally categorize different toolsets (Resume, Interview, Jobs) without breaking the cohesive brand experience.

---

## 🎨 Color Palette

### Core Tokens
- **Background**: `#FAF8FF`
- **Surface**: `#FAF8FF`
- **Surface Container Lowest**: `#FFFFFF`
- **Surface Container Low**: `#F2F3FF`
- **Surface Container**: `#EAEDFF`
- **Surface Container High**: `#E2E7FF`
- **Surface Container Highest**: `#DAE2FD`
- **Surface Dim**: `#D2D9F4`
- **Surface Bright**: `#FAF8FF`
- **Surface Tint**: `#4D44E3`

### Text & Neutral Tokens
- **On-Surface (Primary Text)**: `#131B2E`
- **On-Surface-Variant (Muted Text)**: `#464555`
- **Outline**: `#777587`
- **Outline-Variant**: `#C7C4D8`
- **Inverse Surface**: `#283044`
- **Inverse On-Surface**: `#EEF0FF`

### Brand & Accents
- **Primary (Indigo)**: `#3525CD` / Primary Container: `#4F46E5` / On-Primary: `#FFFFFF`
- **Secondary (Violet)**: `#712AE2` / Secondary Container: `#8A4CFC` / On-Secondary: `#FFFFFF`
- **Tertiary (Emerald)**: `#005338` / Tertiary Container: `#006E4C` / On-Tertiary: `#FFFFFF`
- **Error (Red)**: `#BA1A1A` / Error Container: `#FFDAD6` / On-Error: `#FFFFFF`

### Pillar Color Mapping
- **Resume Tools**: Indigo / Blue (`#4F46E5` / `#3525CD`)
- **Interview Prep**: Violet / Purple (`#712AE2` / `#8A4CFC`)
- **Job Discovery & Matching**: Emerald (`#006E4C` / `#005338`)
- **AI Accent**: Linear gradient from `#4F46E5` to `#8A4CFC` at 135°

---

## ✍️ Typography

- **Headlines**: `Manrope` (Geometric, refined, high-impact)
- **Body & UI**: `Inter` (Utilitarian, clean, maximum legibility)

| Token | Font Family | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `display-lg` | Manrope | 48px | 800 | 56px | -0.02em |
| `headline-lg` | Manrope | 32px | 700 | 40px | -0.01em |
| `headline-lg-mobile` | Manrope | 24px | 700 | 32px | default |
| `headline-md` | Manrope | 24px | 600 | 32px | default |
| `headline-sm` | Manrope | 20px | 600 | 28px | default |
| `body-lg` | Inter | 18px | 400 | 28px | default |
| `body-md` | Inter | 16px | 400 | 24px | default |
| `body-sm` | Inter | 14px | 400 | 20px | default |
| `label-md` | Inter | 14px | 600 | 16px | +0.01em |
| `label-sm` | Inter | 12px | 600 | 14px | +0.02em |

---

## 📐 Layout & Spacing

- **Container Max Width**: `1280px`
- **Gutter**: `24px`
- **Margin Desktop**: `32px`
- **Margin Mobile**: `16px`
- **Sidebar Width**: `260px` (Fixed on desktop, collapsing on mobile)
- **Border Radius**:
  - `sm`: `0.25rem` (4px)
  - `DEFAULT`: `0.5rem` (8px)
  - `md`: `0.75rem` (12px)
  - `lg`: `1rem` (16px) - Standard Card Radius
  - `xl`: `1.5rem` (24px) - Modals & Highlight Containers
  - `full`: `9999px` - Badges, Pills, Status Rings

---

## 🖥️ Screen Directory

| File | Screen Title | Description |
|---|---|---|
| [`index.html`](file:///d:/careerai/frontend/index.html) | Landing Page (Animated Hero) | Public landing page featuring dynamic WebGL interactive hero shader and feature highlights |
| [`landing-static.html`](file:///d:/careerai/frontend/landing-static.html) | Landing Page (Static) | Alternative static hero landing page |
| [`login.html`](file:///d:/careerai/frontend/login.html) | Login | Authentication screen with social and email sign in |
| [`signup.html`](file:///d:/careerai/frontend/signup.html) | Sign Up | Registration screen with value proposition bento card |
| [`dashboard.html`](file:///d:/careerai/frontend/dashboard.html) | Dashboard (CareerAI Hub) | Main dashboard overviewing readiness score, upcoming interviews, and recent applications |
| [`resume-editor.html`](file:///d:/careerai/frontend/resume-editor.html) | Resume Editor | Interactive ATS resume builder with real-time AI suggestions |
| [`interview-session.html`](file:///d:/careerai/frontend/interview-session.html) | Interview Session (Coach) | Live AI conversational mock interview interface |
| [`interview-evaluation.html`](file:///d:/careerai/frontend/interview-evaluation.html) | Interview Evaluation | Detailed scorecard, question breakdown, and actionable feedback |
| [`jobs.html`](file:///d:/careerai/frontend/jobs.html) | Job Discovery | AI job matching, filtering, and 1-click tailored application flow |
