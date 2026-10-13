# DEVFORGE
**“From Real Problems to Secure Software.”**

## 1. Project Overview

- **Project Title:** DEVFORGE – Autonomous Developer Acceleration Platform
- **Team Members:** 
  - [Member Name] – [Roll Number]
  - [Member Name] – [Roll Number]
- **Technology Stack:** Next.js 14, TypeScript, Tailwind CSS, Node.js, Supabase, Google Gemini, Groq, Cerebras, OSV.dev, GitHub Issues API, Hacker News Algolia API.
- **Project Guide/Mentor:** [Guide/Mentor Name]
- **Project Objective:** To develop an autonomous developer acceleration platform that discovers real-world problems from open-source communities, generates AI-powered technical implementation plans, and audits repositories for security vulnerabilities. DEVFORGE connects problem discovery, AI-assisted development, and security analysis in a unified workflow.

## 2. Problem Statement

Developers frequently struggle to identify meaningful project ideas, understand unresolved issues in open-source repositories, plan technical implementations, and ensure that their code is secure.

Existing workflows often require developers to switch between multiple tools for discovering problems, generating architectural plans, managing projects, and identifying vulnerabilities. This fragmented process increases development time and makes it difficult to maintain a consistent workflow from problem identification to secure implementation.

DEVFORGE addresses these challenges by integrating open-source problem discovery, multi-provider AI generation, repository security auditing, and project lifecycle tracking into a single platform.

The platform uses public developer discussions and issue trackers to identify potential opportunities, AI models to analyze problems and propose implementation roadmaps, and security tools to detect vulnerable dependencies, exposed secrets, and common code misconfigurations.

## 3. Features

### 3.1 DISCOVER — Open-Source Problem Discovery

- Fetches public developer issues through the GitHub Issues API and Hacker News Algolia Search API.
- Supports real-time search, categorization, and filtering.
- Categorizes issues using tags such as `#bug`, `#security`, `#performance`, and `#docker`.
- Removes duplicate problems collected from different sources.
- Uses AI to analyze technical root causes, affected users, existing workarounds, and potential solution gaps.
- Generates project opportunity scores, recommended technology stacks, and phased implementation roadmaps.
- Communicates AI uncertainty and confidence limitations.
- Allows discovered problems to be promoted directly into project workspaces.

### 3.2 BUILD — Multi-Provider AI Gateway

- Provides a unified generation endpoint: `/api/gateway/generate`.
- Integrates multiple AI inference providers:
  - Google Gemini
  - Groq
  - Cerebras
- Supports effort-based routing with Low, Medium, and High processing levels.
- Automatically attempts alternative providers when rate limits, server errors, or timeouts occur.
- Displays execution traces containing attempted providers, response latency, and request status.
- Includes a built-in DEVFORGE fallback simulator for demonstrations when external AI providers are unavailable or exceed their quotas.
- Provides a rate-limit simulation toggle for demonstrating automatic failover.

### 3.3 PROTECT — Repository Security Center

- Validates GitHub repository URLs and applies safeguards against unsafe paths and server-side request forgery (SSRF).
- Audits dependencies using the OSV.dev vulnerability database.
- Supports dependency analysis for:
  - `package.json`
  - `requirements.txt`
  - `go.mod`
  - `Cargo.toml`
- Identifies vulnerability identifiers, affected packages, severity information, and available fixed versions when provided by the data source.
- Detects potential exposed secrets using Gitleaks-style pattern matching, including API tokens, AWS access keys, private keys, Slack webhooks, and JWTs.
- Masks detected credentials in reports.
- Analyzes Dockerfiles for common misconfigurations, including root execution, unpinned `:latest` images, `ADD` instructions, and hardcoded secrets in `ENV` declarations.
- Uses heuristic checks to identify potential API security issues, such as permissive CORS configurations, insecure JWT algorithm handling, and unsafe command execution patterns.
- Generates an overall security score, a grade from A+ to F, and exportable JSON audit reports with remediation recommendations.

*Note: The security score and heuristic findings are intended as development aids and do not replace a comprehensive security assessment.*

### 3.4 PROJECTS — Unified Project Lifecycle Management

- Connects discovered problems with AI-generated architecture plans and repository security audits.
- Stores the original problem context, author information, comments, and public source links.
- Maintains technical specifications and phased implementation milestones.
- Associates repository audit results, security scores, and remediation steps with projects.
- Supports Supabase persistence when configured.
- Provides a local JSON database fallback at `data/devforge_db.json`.
- Includes pre-seeded project data for demonstrations.

## 4. Technology Stack

| Category | Technologies |
|---|---|
| Frontend Framework | Next.js 14, React |
| Programming Languages | TypeScript, JavaScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Backend and API | Next.js App Router, API routes |
| AI Providers | Google Gemini, Groq, Cerebras |
| AI Fallback | DEVFORGE Simulator |
| Problem Discovery | GitHub Issues API, Hacker News Algolia Search API |
| Security Intelligence | OSV.dev REST API |
| Secret Detection | Gitleaks-style pattern engine |
| Database | Supabase, local JSON persistence |
| Security Analysis | Dependency auditing, Dockerfile linting, heuristic API checks |
| Development Tools | Node.js, npm, Git, GitHub |
| Deployment | Vercel |

## 5. Project Structure

The following is a logical overview of the major components. The exact directory structure may vary depending on the implementation.

```text
DEVFORGE/
├── app/
│   ├── api/
│   │   ├── gateway/
│   │   │   └── generate/
│   │   ├── discover/
│   │   ├── protect/
│   │   └── projects/
│   ├── discover/
│   ├── protect/
│   ├── projects/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── discover/
│   ├── gateway/
│   ├── security/
│   └── projects/
├── lib/
│   ├── ai/
│   ├── security/
│   ├── discovery/
│   └── database/
├── data/
│   └── devforge_db.json
├── public/
├── .env.example
├── .env.local
├── package.json
├── package-lock.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

*The structure above is illustrative. Update it to match the actual files and folders in the repository.*

## 6. Installation and Execution

### Prerequisites

Ensure the following are installed:

- Node.js 18 or later
- npm 9 or later
- Git
- A modern web browser

### Step 1: Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd DEVFORGE
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the actual GitHub repository URL.

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a local environment configuration file:

```bash
cp .env.example .env.local
```

Configure the required variables according to the integrations enabled in your project. For example:

```env
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
CEREBRAS_API_KEY=your_cerebras_api_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use only the variables expected by your actual implementation. API keys must remain server-side and must never be exposed through client-side code or committed to Git.

DEVFORGE is designed to support a demonstration mode without external AI credentials, using public data sources and its built-in fallback simulator where supported. Supabase is optional when local JSON persistence is enabled.

### Step 4: Start the Development Server

```bash
npm run dev
```

Open the following URL in your browser:

```text
http://localhost:3000
```

### Step 5: Verify the Production Build

```bash
npm run build
npm start
```

Ensure that the production build completes successfully before deployment.

### Step 6: Deploy to Vercel

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables in the Vercel project settings.
4. Deploy the application.
5. Verify the discovery, AI gateway, security auditing, and project management workflows.

## 7. Screenshots / Output

Add screenshots of the implemented application to demonstrate its functionality.

### 7.1 Main Dashboard

<!-- Replace with the actual dashboard screenshot. -->

![DEVFORGE Dashboard](screenshots/dashboard.png)

### 7.2 Problem Discovery Module

<!-- Replace with the actual discovery screenshot. -->

![Problem Discovery](screenshots/discover.png)

### 7.3 AI Gateway and Execution Trace

<!-- Replace with the actual AI gateway screenshot. -->

![AI Gateway](screenshots/ai-gateway.png)

### 7.4 Repository Security Audit

<!-- Replace with the actual security audit screenshot. -->

![Security Center](screenshots/security-center.png)

### 7.5 Project Workspace

<!-- Replace with the actual project workspace screenshot. -->

![Project Workspace](screenshots/project-workspace.png)

Create a `screenshots/` directory in the repository and add the corresponding images. Replace these example paths with the actual screenshot filenames.

## 8. DSA Concepts Used

DEVFORGE incorporates several fundamental data structures and algorithmic techniques to process developer issues, coordinate AI provider requests, and analyze repository data.

### 8.1 Arrays and Strings

- Processing API responses containing issues, dependencies, and scan findings.
- Parsing and validating repository URLs and source metadata.
- Handling textual content for secret-pattern detection.

### 8.2 Searching and Filtering

- Filtering discovered issues based on search queries and category tags.
- Searching through issue metadata and repository findings.
- Matching dependency information against vulnerability records.

### 8.3 Sorting and Ranking

- Ranking potential project opportunities using generated scores.
- Ordering security findings by severity or priority, where implemented.
- Organizing discovered problems for easier review.

### 8.4 Hashing and Deduplication

- Using unique identifiers or hash-based collections to avoid duplicate issues.
- Associating package names and versions with vulnerability records.
- Managing unique project and scan references.

### 8.5 Pattern Matching

- Applying regular expressions and string-matching techniques to detect potentially exposed secrets.
- Recognizing suspicious Dockerfile instructions and common insecure code patterns.

### 8.6 Error Handling and Retry Logic

- Implementing provider fallback and retry behavior for rate limits, timeouts, and server errors.
- Tracking provider attempts and execution statuses.
- Handling unsuccessful external API requests.

### 8.7 Time and Space Complexity

- Evaluating the cost of filtering, deduplication, pattern matching, and processing API responses.
- Designing data-processing workflows to remain responsive as the number of issues and scan findings grows.

*Only retain the concepts that are actually implemented in your source code. Framework capabilities alone do not establish that a specific DSA concept was implemented.*

## 9. Learning Outcomes

Developing DEVFORGE provides practical experience in the following areas:

- Building full-stack web applications using Next.js, React, and TypeScript.
- Designing API endpoints and integrating external REST APIs.
- Integrating multiple AI providers through a unified gateway.
- Implementing error handling, provider fallback, and request execution tracing.
- Working with vulnerability databases and dependency security auditing.
- Applying regular expressions and heuristic techniques to identify potential security issues.
- Validating external input and implementing SSRF-related safeguards.
- Managing application persistence using Supabase and local JSON storage.
- Generating structured technical plans and managing project milestones.
- Preparing applications for production builds and Vercel deployment.
- Understanding the limitations of automated security analysis and AI-generated recommendations.

## 10. Future Scope

Potential improvements to DEVFORGE include:

- **Expanded Repository Support:** Add more package ecosystems and dependency manifest formats.
- **Deeper Code Analysis:** Integrate static application security testing (SAST) tools and language-aware analysis.
- **Automated Remediation:** Generate patches for selected vulnerabilities and allow developers to review changes before applying them.
- **Continuous Security Monitoring:** Re-scan repositories periodically and notify users when new vulnerabilities are discovered.
- **Pull Request Integration:** Connect GitHub pull requests with security reports and AI-generated implementation plans.
- **Advanced AI Routing:** Optimize provider selection based on cost, latency, model capability, and availability.
- **Persistent Execution History:** Store historical scans, gateway traces, and remediation progress.
- **Team Collaboration:** Introduce user authentication, shared workspaces, roles, and project-level permissions.
- **Improved Opportunity Ranking:** Incorporate issue activity, repository health, community engagement, and implementation effort into project opportunity scoring.
- **Enhanced Reporting:** Provide downloadable PDF reports, remediation dashboards, and trend analysis.
- **Automated Testing:** Add unit tests, integration tests, and security-focused regression tests.
- **Improved Secret Detection:** Integrate dedicated secret-scanning tools and reduce false positives.

## 11. References

1. **Next.js Documentation:** https://nextjs.org/docs
2. **TypeScript Documentation:** https://www.typescriptlang.org/docs/
3. **React Documentation:** https://react.dev/
4. **Tailwind CSS Documentation:** https://tailwindcss.com/docs
5. **GitHub REST API — Issues:** https://docs.github.com/en/rest/issues
6. **Hacker News Algolia Search API:** https://hn.algolia.com/api
7. **OSV.dev API Documentation:** https://google.github.io/osv.dev/api/
8. **Google Gemini API Documentation:** https://ai.google.dev/gemini-api/docs
9. **Groq API Documentation:** https://console.groq.com/docs
10. **Cerebras Inference Documentation:** https://inference-docs.cerebras.ai/
11. **Supabase Documentation:** https://supabase.com/docs
12. **Gitleaks Documentation:** https://github.com/gitleaks/gitleaks
13. **Docker Documentation:** https://docs.docker.com/
14. **Vercel Documentation:** https://vercel.com/docs

## 12. License

The project's license has not yet been specified.
