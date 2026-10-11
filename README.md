# DEVFORGE
> **“From real problems to secure software.”**

DEVFORGE is an autonomous developer acceleration platform engineered for high-velocity software engineering. It bridges the critical divide between identifying real developer friction in open-source ecosystems, architecting production solutions using a multi-provider AI Gateway, and auditing codebases with live CVE databases and security linters.

---

## Key Modules & Capabilities

### 1. DISCOVER — Find Real Developer Problems
- **Live Ingestion**: Mines public developer problems from **GitHub Issues API** and **Hacker News Algolia Search API**.
- **Search & Filter**: Real-time search query filtering, tag categorizations (`#bug`, `#security`, `#performance`, `#docker`), and deduplication across sources.
- **Deep AI Analysis**:
  - Technical root cause breakdown.
  - Affected user personas & developer impact.
  - Existing workarounds and why they fail.
  - Solution gap & project opportunity scoring (1-100).
  - Recommended tech stack and phased milestone roadmap.
  - **Uncertainty Advisory**: Explicitly communicates confidence limitations—never asserting 100% certainty from AI telemetry alone.
- **One-Click Promotion**: Instantly promote any discovered problem into a live Project Workspace.

### 2. BUILD — Unified Multi-Provider AI Gateway
- **Single Endpoint**: `/api/gateway/generate` provides a standardized interface for all text generation tasks.
- **Multi-Provider Adapters**:
  - **Google Gemini** (`gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`)
  - **Groq LPU** (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`)
  - **Cerebras Inference** (`llama3.1-70b`, `llama3.1-8b`)
  - **DEVFORGE Fallback Simulator** (ensures authentic demo responses even if external provider quotas are exceeded)
- **Automatic Failover & Routing**:
  - Automatically reroutes on 429 rate limits, 5xx server errors, or timeouts.
  - Effort-based routing: `Low` (instant speed), `Medium` (balanced), `High` (deep reasoning).
  - Live execution trace inspection detailing attempted providers, latencies, and statuses.
  - Interactive "Simulate Primary 429 Rate Limit" toggle for live hackathon presentations.

### 3. PROTECT — Repository Security Center
- **Strict Validation**: Enforces GitHub repository URL formats (`https://github.com/:owner/:repo`) and prevents SSRF or unsafe paths.
- **Live OSV.dev Database Audit**:
  - Queries Google's Open Source Vulnerability index (`https://api.osv.dev/v1/querybatch`).
  - Audits `package.json`, `requirements.txt`, `go.mod`, and `Cargo.toml`.
  - Pinpoints exact CVE/GHSA IDs, severity, affected packages, and fixed versions.
- **Gitleaks Pattern Engine**:
  - Redacted detection of AWS Access Keys, GitHub Tokens, Private Keys, Slack Webhooks, Stripe keys, and JWTs.
  - Secrets are automatically masked (e.g. `AKIA************1234`) to protect credentials.
- **Dockerfile Misconfiguration Linter**:
  - Identifies root user execution, unpinned `:latest` tags, `ADD` instructions, and hardcoded secrets in `ENV`.
- **Heuristic API Flaw Scanner**:
  - Flags permissive CORS wildcards with credentials, insecure JWT `none` algorithm verification, and unescaped command execution.
- **Executive Security Scoring**: Generates an overall 0-100 score and security grade (`A+` through `F`) with exportable JSON audit reports.

### 4. PROJECTS — Unified Lifecycle Tracking
- Connects the entire developer trajectory:
  1. **Discovered Problem**: Original context, author, comments, and public link.
  2. **AI Architecture Plan**: Generated technical specification with phased milestones.
  3. **Repository Security Audit**: Live scan results, executive score, and remediation steps.
- **Dual-Mode Persistence**:
  - Automatically syncs to **Supabase** if configured.
  - Resilient local JSON database (`data/devforge_db.json`) fallback with pre-seeded projects.

---

## Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested on Node.js 20 & 26)
- npm 9+

### 1. Installation
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*Note: DEVFORGE works immediately out-of-the-box! Public APIs (OSV.dev & Hacker News) and the built-in AI Gateway Simulator operate without any API keys required.*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build Verification
```bash
npm run build
npm start
```

---

## Vercel Deployment

Deploying DEVFORGE to Vercel requires zero complex configuration:
1. Push repository to GitHub.
2. Import project in Vercel.
3. (Optional) Set `GEMINI_API_KEY` and `GROQ_API_KEY` in Vercel Environment Variables.
4. Deploy!

---

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Cyberpunk Dark Palette)
- **Icons**: Lucide React
- **Security Sources**: OSV.dev REST API, Gitleaks Regex Engine
- **Problem Sources**: GitHub Issues API, Hacker News Algolia API
- **AI Providers**: Google Gemini, Groq, Cerebras, DEVFORGE Simulator
- **Database**: Supabase / Resilient Local JSON Engine
