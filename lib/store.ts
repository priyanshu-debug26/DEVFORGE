import fs from 'fs';
import path from 'path';
import { Project, DeveloperProblem, SecurityScanResult, SystemStats, ProviderHealth } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'devforge_db.json');

interface LocalDatabase {
  projects: Project[];
  problems: DeveloperProblem[];
  scans: SecurityScanResult[];
  gatewayLogs: {
    id: string;
    timestamp: string;
    provider: string;
    model: string;
    latencyMs: number;
    failoverOccurred: boolean;
    totalTokens: number;
  }[];
}

const DEFAULT_SEEDS: LocalDatabase = {
  projects: [
    {
      id: "proj_auth_guard",
      title: "AuthGuard: Next.js Multi-Tenant CSRF & Session Isolation",
      slug: "auth-guard-csrf",
      description: "Unified edge middleware solving cross-tenant session leaks and missing CSRF headers in server actions.",
      stage: "audited",
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      problemId: "prob_gh_102",
      techStack: ["Next.js 14", "TypeScript", "Jose JWT", "Redis", "Tailwind CSS"],
      repositoryUrl: "https://github.com/expressjs/express",
      tags: ["Security", "Authentication", "Edge Middleware", "Next.js"],
      buildPlan: {
        summary: "Zero-dependency Edge Session & CSRF Validator with Sub-10ms Cryptographic Verification",
        architectureNotes: "Implements Double-Submit Cookie pattern with HMAC tokens verified directly in Next.js Edge Middleware. Prevents server action execution unless state matches.",
        gatewayMetadata: {
          provider: "gemini",
          model: "gemini-1.5-pro",
          latencyMs: 840
        },
        phases: [
          {
            title: "Phase 1: Edge Cryptographic Primitives",
            tasks: ["Construct HMAC-SHA256 signature utility for edge runtime", "Implement secure cookie rotation with Partitioned/CHIPS headers"],
            status: "completed"
          },
          {
            title: "Phase 2: Server Action Wrapper & Interceptor",
            tasks: ["Create type-safe safeAction() wrapper checking CSRF token", "Handle Next.js App Router streaming revalidation hooks"],
            status: "completed"
          },
          {
            title: "Phase 3: Automated Security Audit & OSV Verification",
            tasks: ["Execute DEVFORGE OSV scan on dependency graph", "Mitigate prototype pollution and insecure cookie options"],
            status: "completed"
          }
        ]
      },
      latestScan: {
        id: "scan_seed_1",
        repoUrl: "https://github.com/expressjs/express",
        owner: "expressjs",
        repo: "express",
        scannedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        scanDurationMs: 1240,
        executiveScore: 78,
        securityGrade: "C",
        totalFindings: 3,
        severityBreakdown: {
          critical: 1,
          high: 1,
          medium: 1,
          low: 0,
          info: 0
        },
        scannersRun: [
          { name: "OSV.dev Vulnerability DB", status: "completed", findingsCount: 2 },
          { name: "Gitleaks Regex Engine", status: "completed", findingsCount: 0 },
          { name: "DEVFORGE Dockerfile Linter", status: "completed", findingsCount: 0 },
          { name: "Heuristic API Security Audit", status: "completed", findingsCount: 1 }
        ],
        dependenciesAudited: 31,
        filesInspected: ["package.json", "index.js", "lib/express.js"],
        findings: [
          {
            id: "fnd_qs_rce",
            category: "dependency",
            severity: "CRITICAL",
            title: "Prototype Pollution in 'qs' / body-parser dependency",
            description: "Extended query parser vulnerable to prototype pollution when parsing nested queries.",
            affectedTarget: "qs@6.11.0",
            currentVersion: "6.11.0",
            fixedVersion: "6.11.2",
            cveReference: "CVE-2024-41110",
            advisoryUrl: "https://osv.dev/vulnerability/GHSA-hrpp-h998-j3pp",
            evidence: "\"qs\": \"6.11.0\" in package.json",
            remediation: "Upgrade qs to >= 6.11.2 or configure app.set('query parser', 'simple');",
            scanner: "OSV.dev API"
          },
          {
            id: "fnd_cors_wildcard",
            category: "heuristic_api",
            severity: "HIGH",
            title: "Permissive CORS Wildcard with Credentials Detected",
            description: "Server config allows Access-Control-Allow-Origin: * while accepting session credentials, allowing cross-origin credential theft.",
            affectedTarget: "lib/middleware.js",
            evidence: "res.setHeader('Access-Control-Allow-Origin', '*');",
            remediation: "Specify explicit trusted origins in CORS header and validate incoming Origin header against whitelist.",
            scanner: "Heuristic API Audit"
          },
          {
            id: "fnd_send_path_traversal",
            category: "dependency",
            severity: "MEDIUM",
            title: "Path Traversal vulnerability in 'send' module",
            description: "Root path bypass via encoded URI segments in static file handler.",
            affectedTarget: "send@0.18.0",
            currentVersion: "0.18.0",
            fixedVersion: "0.19.0",
            cveReference: "CVE-2024-43796",
            advisoryUrl: "https://osv.dev/vulnerability/GHSA-m6fv-jmc8-4pc4",
            evidence: "\"send\": \"0.18.0\" in package.json",
            remediation: "Bump dependency send to version 0.19.0 or higher.",
            scanner: "OSV.dev API"
          }
        ]
      }
    },
    {
      id: "proj_osv_sync",
      title: "FastSync: Ephemeral Vector DB for Microservices",
      slug: "fastsync-vector-db",
      description: "Low-memory embedded vector index for high-throughput microservices that cannot afford full Pinecone or Milvus cloud latencies.",
      stage: "in_progress",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      problemId: "prob_hn_204",
      techStack: ["Rust", "WASM", "TypeScript", "Node.js", "Docker"],
      repositoryUrl: "https://github.com/torvalds/linux",
      tags: ["Vector DB", "Performance", "Caches", "AI"],
      buildPlan: {
        summary: "In-memory HNSW indexing engine compiled to WASM with disk-backed snapshotting",
        architectureNotes: "Combines zero-copy memory maps with SIMD-accelerated cosine distance computations.",
        gatewayMetadata: {
          provider: "groq",
          model: "llama-3.3-70b-versatile",
          latencyMs: 310
        },
        phases: [
          {
            title: "Core SIMD Vector Math Module",
            tasks: ["Implement dot product and Euclidean distance in AVX2/NEON", "Benchmark against BLAS"],
            status: "completed"
          },
          {
            title: "Node.js Addon & Next.js Bindings",
            tasks: ["Create N-API / napi-rs interface", "Implement LRU vector cache"],
            status: "in_progress"
          }
        ]
      }
    }
  ],
  problems: [
    {
      id: "prob_gh_102",
      source: "github",
      sourceUrl: "https://github.com/vercel/next.js/issues/54210",
      sourceId: "vercel/next.js#54210",
      title: "Server Actions missing CSRF token validation when invoked via raw fetch()",
      body: "When invoking Next.js App Router server actions via client fetch requests with specific headers, anti-CSRF token verification is bypassed if the Origin header is forged or missing in specific reverse proxy configurations. Developers building multi-tenant SaaS applications need an edge-level middleware guard to strictly enforce request authenticity.",
      author: "sec-researcher-42",
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      commentsCount: 68,
      upvotesCount: 142,
      tags: ["Security", "CSRF", "App Router", "Next.js"],
      ecosystem: "npm"
    },
    {
      id: "prob_hn_204",
      source: "hackernews",
      sourceUrl: "https://news.ycombinator.com/item?id=39120488",
      sourceId: "hn_39120488",
      title: "Ask HN: Why is local vector search in microservices still so painful?",
      body: "We are running hundreds of ephemeral container workers that need to do small KNN lookups (5k-10k items) for semantic deduplication. Cloud vector databases add 80-150ms round-trip latency and cost hundreds of dollars/month. Chroma and LanceDB are improving but still heavy for quick in-memory microservice restarts. Anyone built a lightweight embedded alternative?",
      author: "vector_dev",
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      commentsCount: 114,
      upvotesCount: 289,
      tags: ["Ask HN", "Vector Search", "Latency", "Microservices"],
      ecosystem: "pypi"
    },
    {
      id: "prob_gh_308",
      source: "github",
      sourceUrl: "https://github.com/kubernetes/kubernetes/issues/119820",
      sourceId: "kubernetes/kubernetes#119820",
      title: "ConfigMap drift detection without heavy gitops controllers",
      body: "Small dev teams running k8s without ArgoCD or Flux lack a lightweight CLI or sidecar that simply alerts when running pod environment variables drift from the repository source of truth. Existing solutions require cluster-admin operator privileges and high memory overhead.",
      author: "cloudnative_sam",
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      commentsCount: 42,
      upvotesCount: 89,
      tags: ["Kubernetes", "DevOps", "Drift Detection", "CLI"],
      ecosystem: "go"
    }
  ],
  scans: [],
  gatewayLogs: [
    {
      id: "gw_log_1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      provider: "gemini",
      model: "gemini-1.5-pro",
      latencyMs: 840,
      failoverOccurred: false,
      totalTokens: 1240
    },
    {
      id: "gw_log_2",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      provider: "groq",
      model: "llama-3.3-70b-versatile",
      latencyMs: 310,
      failoverOccurred: false,
      totalTokens: 980
    }
  ]
};

function ensureDbFile(): LocalDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_SEEDS, null, 2), 'utf-8');
      return DEFAULT_SEEDS;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Local DB read error, using defaults:", err);
    return DEFAULT_SEEDS;
  }
}

function writeDb(data: LocalDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error("Local DB write error:", err);
  }
}

export class DataStore {
  static isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
  }

  static getStorageMode(): 'supabase' | 'local_file' {
    return this.isSupabaseConfigured() ? 'supabase' : 'local_file';
  }

  // PROJECTS
  static getProjects(): Project[] {
    const db = ensureDbFile();
    return db.projects || [];
  }

  static getProjectById(id: string): Project | undefined {
    const db = ensureDbFile();
    return db.projects.find(p => p.id === id || p.slug === id);
  }

  static saveProject(project: Project): Project {
    const db = ensureDbFile();
    const existingIdx = db.projects.findIndex(p => p.id === project.id);
    if (existingIdx >= 0) {
      db.projects[existingIdx] = {
        ...project,
        updatedAt: new Date().toISOString()
      };
    } else {
      db.projects.unshift(project);
    }
    writeDb(db);
    return project;
  }

  static deleteProject(id: string): boolean {
    const db = ensureDbFile();
    const initialLen = db.projects.length;
    db.projects = db.projects.filter(p => p.id !== id);
    if (db.projects.length !== initialLen) {
      writeDb(db);
      return true;
    }
    return false;
  }

  // PROBLEMS
  static getProblems(): DeveloperProblem[] {
    const db = ensureDbFile();
    return db.problems || [];
  }

  static getProblemById(id: string): DeveloperProblem | undefined {
    const db = ensureDbFile();
    return db.problems.find(p => p.id === id);
  }

  static saveProblem(problem: DeveloperProblem): DeveloperProblem {
    const db = ensureDbFile();
    const existingIdx = db.problems.findIndex(p => p.id === problem.id);
    if (existingIdx >= 0) {
      db.problems[existingIdx] = problem;
    } else {
      db.problems.unshift(problem);
    }
    writeDb(db);
    return problem;
  }

  // SCANS
  static getScans(): SecurityScanResult[] {
    const db = ensureDbFile();
    return db.scans || [];
  }

  static saveScan(scan: SecurityScanResult): SecurityScanResult {
    const db = ensureDbFile();
    db.scans.unshift(scan);
    // Also if scan matches a project repositoryUrl, update project's latestScan
    const matchingProject = db.projects.find(p => p.repositoryUrl && p.repositoryUrl.toLowerCase() === scan.repoUrl.toLowerCase());
    if (matchingProject) {
      matchingProject.latestScan = scan;
      matchingProject.stage = scan.executiveScore > 85 ? 'secured' : 'audited';
      matchingProject.updatedAt = new Date().toISOString();
    }
    writeDb(db);
    return scan;
  }

  // GATEWAY LOGS
  static logGatewayRequest(entry: {
    provider: string;
    model: string;
    latencyMs: number;
    failoverOccurred: boolean;
    totalTokens: number;
  }): void {
    const db = ensureDbFile();
    db.gatewayLogs.unshift({
      id: `gw_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...entry
    });
    if (db.gatewayLogs.length > 100) {
      db.gatewayLogs = db.gatewayLogs.slice(0, 100);
    }
    writeDb(db);
  }

  static getGatewayLogs() {
    const db = ensureDbFile();
    return db.gatewayLogs || [];
  }

  // SYSTEM STATS
  static getSystemStats(providerStatuses: ProviderHealth[]): SystemStats {
    const db = ensureDbFile();
    const totalRequests = db.gatewayLogs.length;
    const avgLatency = totalRequests > 0 
      ? Math.round(db.gatewayLogs.reduce((acc, l) => acc + l.latencyMs, 0) / totalRequests)
      : 240;

    const analyzedCount = db.problems.filter(p => !!p.analysis).length;
    const totalScans = db.scans.length + (db.projects.filter(p => !!p.latestScan).length);
    const vulnFound = db.projects.reduce((acc, p) => acc + (p.latestScan?.totalFindings || 0), 0) +
      db.scans.reduce((acc, s) => acc + s.totalFindings, 0);

    return {
      problemsDiscovered: db.problems.length,
      problemsAnalyzed: analyzedCount,
      totalGatewayRequests: totalRequests,
      averageGatewayLatencyMs: avgLatency,
      totalScans: totalScans,
      vulnerabilitiesFound: vulnFound,
      projectsCount: db.projects.length,
      storageMode: this.getStorageMode(),
      providerStatuses
    };
  }
}
