// DEVFORGE Core Types

export interface UserApiKeys {
  geminiKey?: string;
  groqKey?: string;
  cerebrasKey?: string;
  githubToken?: string;
}

export type ProblemSource = 'github' | 'hackernews' | 'manual';

export interface DeveloperProblem {
  id: string;
  source: ProblemSource;
  sourceUrl: string;
  sourceId: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  commentsCount: number;
  upvotesCount: number;
  tags: string[];
  ecosystem?: string;
  analysis?: ProblemAnalysis;
}

export interface ProblemAnalysis {
  analyzedAt: string;
  providerUsed: string;
  modelUsed: string;
  rootCause: string;
  affectedPersonas: string[];
  existingWorkarounds: string[];
  marketGap: string;
  projectOpportunityScore: number; // 1-100
  opportunityRationale: string;
  suggestedStack: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    infrastructure?: string[];
  };
  implementationPhases: {
    phase: string;
    duration: string;
    deliverables: string[];
  }[];
  uncertaintyAdvisory: string; // Explicit statement communicating analysis uncertainty
  confidenceScore: number; // 0-100
}

export type GatewayProvider = 'gemini' | 'groq' | 'cerebras' | 'mock';
export type GatewayEffort = 'low' | 'medium' | 'high';

export interface GatewayRequest {
  prompt: string;
  systemPrompt?: string;
  provider?: GatewayProvider | 'auto';
  preferredProviders?: GatewayProvider[];
  effort?: GatewayEffort;
  maxTokens?: number;
  temperature?: number;
  simulateRateLimit?: boolean; // For testing failover in demo
  userKeys?: UserApiKeys;
}

export interface GatewayTraceStep {
  provider: GatewayProvider;
  attemptedAt: string;
  status: 'success' | 'failed' | 'timeout' | 'skipped';
  latencyMs: number;
  error?: string;
  model: string;
}

export interface GatewayResponse {
  success: boolean;
  content: string;
  provider: GatewayProvider;
  model: string;
  latencyMs: number;
  failoverOccurred: boolean;
  trace: GatewayTraceStep[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  effort: GatewayEffort;
  timestamp: string;
}

export interface ProviderHealth {
  provider: GatewayProvider;
  name: string;
  configured: boolean;
  status: 'online' | 'degraded' | 'offline' | 'unconfigured';
  latencyMs?: number;
  model: string;
  lastChecked: string;
  supportedModels: string[];
}

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type ScannerCategory = 'dependency' | 'secret' | 'dockerfile' | 'heuristic_api';

export interface SecurityFinding {
  id: string;
  category: ScannerCategory;
  severity: VulnerabilitySeverity;
  title: string;
  description: string;
  affectedTarget: string; // package name or file path
  currentVersion?: string;
  fixedVersion?: string;
  cveReference?: string;
  advisoryUrl?: string;
  evidence?: string;
  remediation: string;
  scanner: string; // e.g. "OSV.dev API", "Gitleaks Engine", "DEVFORGE Dockerfile Linter", "Heuristic API Audit"
}

export interface SecurityScanResult {
  id: string;
  repoUrl: string;
  owner: string;
  repo: string;
  scannedAt: string;
  scanDurationMs: number;
  executiveScore: number; // 0-100
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  totalFindings: number;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  scannersRun: {
    name: string;
    status: 'completed' | 'failed' | 'unavailable';
    findingsCount: number;
    note?: string;
  }[];
  findings: SecurityFinding[];
  dependenciesAudited: number;
  filesInspected: string[];
}

export type ProjectLifecycleStage = 'discovered' | 'architected' | 'in_progress' | 'audited' | 'secured';

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  stage: ProjectLifecycleStage;
  createdAt: string;
  updatedAt: string;
  problemId?: string;
  originalProblem?: DeveloperProblem;
  techStack: string[];
  buildPlan?: {
    summary: string;
    architectureNotes: string;
    gatewayMetadata?: {
      provider: string;
      model: string;
      latencyMs: number;
    };
    phases: {
      title: string;
      tasks: string[];
      status: 'pending' | 'in_progress' | 'completed';
    }[];
  };
  repositoryUrl?: string;
  latestScan?: SecurityScanResult;
  tags: string[];
}

export interface SystemStats {
  problemsDiscovered: number;
  problemsAnalyzed: number;
  totalGatewayRequests: number;
  averageGatewayLatencyMs: number;
  totalScans: number;
  vulnerabilitiesFound: number;
  projectsCount: number;
  storageMode: 'supabase' | 'local_file';
  providerStatuses: ProviderHealth[];
}
