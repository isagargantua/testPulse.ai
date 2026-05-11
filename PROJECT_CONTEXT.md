# PROJECT OVERVIEW

You are building a production-grade SaaS platform called:

# TestPulse AI

An AI-powered Test Reliability Platform for automation teams.

This is NOT a generic AI chatbot.

The platform helps QA/SDET teams:

- analyze failed automation tests
- identify flaky test root causes
- generate fix recommendations
- improve locator stability
- track automation reliability
- reduce debugging effort
- provide AI-powered failure intelligence

The platform must feel like:

- Linear
- GitHub
- Datadog
- modern enterprise SaaS

NOT like a toy chatbot app.

---

# CORE PRODUCT FEATURES

## MVP FEATURES

### 1. Authentication

Users can:

- signup
- login
- logout
- use Google OAuth

Use:

- Supabase Auth

---

### 2. Dashboard

Dashboard should include:

- recent failures
- project cards
- analytics cards
- flaky test counts
- reliability metrics
- AI analysis summaries

Design:

- dark enterprise UI
- clean spacing
- modern SaaS feel
- responsive layout

---

### 3. Failure Upload System

Users can upload:

- Playwright logs
- Selenium logs
- screenshots
- stacktraces
- trace files
- HTML snippets

Requirements:

- drag and drop uploads
- upload progress
- file validation
- secure storage

Use:

- Supabase Storage

---

### 4. AI Failure Analysis Engine

Core feature of the platform.

User uploads automation failure artifacts.

AI should:

- identify probable root cause
- classify failure type
- detect flaky behavior
- suggest fixes
- generate corrected locators/code
- provide confidence score
- explain issue clearly

Possible categories:

- synchronization issue
- overlay issue
- iframe issue
- stale element
- locator instability
- timeout issue
- backend/API failure
- network issue

Output must be:

- structured
- professional
- easy to scan

---

### 5. Failure History

Users should:

- view historical failures
- search failures
- filter by project
- filter by framework
- view recurring patterns

---

### 6. AI Recommendations

Platform should provide:

- stable locator suggestions
- Playwright fixes
- Selenium fixes
- retry recommendations
- best practice suggestions

---

# LONG TERM VISION

Future roadmap:

- CI/CD integrations
- GitHub Actions integration
- Jenkins integration
- auto-healing locators
- DOM comparison engine
- PR generation
- automated reruns
- team collaboration
- observability dashboards
- reliability scoring

Architecture should support future expansion.

---

# TECH STACK

Frontend:

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:

- Next.js API routes
- modular service architecture

Database:

- PostgreSQL via Supabase

Authentication:

- Supabase Auth

Storage:

- Supabase Storage

AI:

- OpenRouter APIs

Hosting:

- Vercel

---

# ARCHITECTURE RULES

Follow production-grade architecture.

Requirements:

- scalable
- modular
- maintainable
- reusable
- enterprise-ready

Avoid:

- monolithic files
- duplicated logic
- tightly coupled code
- tutorial-style architecture

---

# FRONTEND RULES

Use:

- reusable components
- responsive layouts
- dark mode
- accessible UI
- modern animations
- enterprise design patterns

UI should feel:

- premium
- polished
- fast
- minimal

Avoid:

- excessive colors
- childish UI
- cluttered layouts

---

# BACKEND RULES

Use:

- service layer architecture
- controllers/services separation
- reusable utilities
- centralized error handling
- async/await
- proper logging
- TypeScript types everywhere

---

# AI SYSTEM RULES

The platform is NOT a chatbot wrapper.

AI should be:

- workflow-driven
- tool-driven
- structured
- optimized

Implement:

- AI tool execution system
- prompt templates
- structured outputs
- modular AI services

Possible AI tools:

- analyze-failure
- generate-locator-fix
- generate-testcase
- suggest-retry-strategy

---

# PERFORMANCE RULES

Optimize for:

- low token usage
- fast rendering
- efficient API calls
- scalable architecture

Avoid:

- sending full chat history
- unnecessary rerenders
- huge payloads

---

# SECURITY RULES

Never expose:

- API keys
- secrets
- service role keys

Implement:

- server-side validation
- upload validation
- rate limiting
- secure auth flows
- secure API routes

---

# DATABASE REQUIREMENTS

Design scalable schema for:

- users
- projects
- uploads
- failure analyses
- AI reports
- usage tracking

Use:

- proper relationships
- indexing
- optimized queries

---

# CODE QUALITY RULES

Always generate:

- production-level code
- scalable implementations
- reusable logic
- proper TypeScript typing
- modular folder structure
- maintainable architecture

Never generate:

- beginner tutorial code
- fake mock implementations
- unnecessary comments
- low-quality patterns

---

# DEVELOPMENT APPROACH

Build feature-by-feature.

For every feature:

1. Explain architecture
2. Explain folder structure
3. Generate implementation plan
4. Generate scalable code
5. Suggest optimizations
6. Suggest future scalability improvements

---

# DESIGN INSPIRATION

Use inspiration from:

- Vercel
- Linear
- GitHub
- Datadog
- Notion

The platform should feel:

- modern
- technical
- enterprise-grade
- developer-focused

---

# FINAL GOAL

Build a real SaaS platform that:

- solves automation reliability problems
- helps QA teams reduce flaky test debugging
- automates failure analysis workflows
- scales to enterprise usage
- is not just another AI project
