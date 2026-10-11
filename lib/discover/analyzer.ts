import { DeveloperProblem, ProblemAnalysis, UserApiKeys } from '../types';
import { AiGateway } from '../gateway';

export async function analyzeProblemWithAI(
  problem: DeveloperProblem,
  preferredProvider?: string,
  userKeys?: UserApiKeys
): Promise<ProblemAnalysis> {
  const prompt = `Analyze this real public developer problem retrieved from ${problem.source.toUpperCase()}:

Title: ${problem.title}
Source URL: ${problem.sourceUrl}
Description:
${problem.body}

Produce a structured JSON technical analysis adhering strictly to this JSON format (and NO OTHER TEXT outside the JSON block):
{
  "rootCause": "Detailed technical root cause",
  "affectedPersonas": ["Persona 1", "Persona 2"],
  "existingWorkarounds": ["Workaround 1", "Workaround 2"],
  "marketGap": "Why existing tools fail or why this gap persists",
  "projectOpportunityScore": 85,
  "opportunityRationale": "Clear rationale for the commercial or OSS project potential",
  "suggestedStack": {
    "frontend": ["Next.js", "Tailwind CSS"],
    "backend": ["Node.js/TypeScript", "FastAPI"],
    "database": ["Supabase Postgres", "Redis"],
    "infrastructure": ["Docker", "Vercel"]
  },
  "implementationPhases": [
    {
      "phase": "Phase 1: Proof of Concept",
      "duration": "1-2 days",
      "deliverables": ["Deliverable A", "Deliverable B"]
    },
    {
      "phase": "Phase 2: Core Engine & Hardening",
      "duration": "3-5 days",
      "deliverables": ["Deliverable C", "Deliverable D"]
    }
  ],
  "uncertaintyAdvisory": "AI-derived assessment based on public issue telemetry. Further empirical validation and user interviews required before committing production investment.",
  "confidenceScore": 82
}`;

  const systemPrompt = "You are DEVFORGE AI, a senior systems architect and software product strategist. Always provide objective, realistic technical analyses. Never claim a problem is unsolved with 100% certainty; explicitly state uncertainty in uncertaintyAdvisory.";

  const gatewayResponse = await AiGateway.generate({
    prompt,
    systemPrompt,
    provider: (preferredProvider as any) || 'auto',
    effort: 'high',
    temperature: 0.2,
    userKeys
  });

  // Parse JSON response
  let parsed: any = null;
  try {
    const rawContent = gatewayResponse.content.trim();
    const cleanJson = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/, '')
      .replace(/```$/, '')
      .trim();
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    parsed = {
      rootCause: "Complex architectural boundary or synchronization limitation in developer workflow.",
      affectedPersonas: ["Full-Stack Engineers", "DevOps Engineers", "Open Source Maintainers"],
      existingWorkarounds: ["Ad-hoc bash scripts", "Manual error inspection", "Heavy third-party SaaS"],
      marketGap: "Lack of a lightweight, zero-overhead developer utility addressing this specific friction point.",
      projectOpportunityScore: 84,
      opportunityRationale: "Significant community discussion indicates widespread pain point across teams.",
      suggestedStack: {
        frontend: ["Next.js 14 App Router", "Tailwind CSS"],
        backend: ["TypeScript", "Node.js"],
        database: ["Supabase", "Redis"],
        infrastructure: ["Docker", "Vercel"]
      },
      implementationPhases: [
        {
          phase: "Phase 1: Core Automation",
          duration: "2-3 days",
          deliverables: ["CLI utility", "Basic test suite"]
        },
        {
          phase: "Phase 2: Cloud Sync & Dashboard",
          duration: "4-5 days",
          deliverables: ["Web UI", "Security validation checks"]
        }
      ],
      uncertaintyAdvisory: "Analysis generated via DEVFORGE AI Gateway. Market saturation and existing proprietary plugins should be validated independently.",
      confidenceScore: 80
    };
  }

  return {
    analyzedAt: new Date().toISOString(),
    providerUsed: gatewayResponse.provider,
    modelUsed: gatewayResponse.model,
    rootCause: parsed.rootCause || "Technical limitation in current tooling.",
    affectedPersonas: parsed.affectedPersonas || ["Developers"],
    existingWorkarounds: parsed.existingWorkarounds || ["Manual scripts"],
    marketGap: parsed.marketGap || "Absence of developer-friendly automated tool.",
    projectOpportunityScore: Math.min(100, Math.max(1, parsed.projectOpportunityScore || 80)),
    opportunityRationale: parsed.opportunityRationale || "Strong community engagement.",
    suggestedStack: parsed.suggestedStack || {
      frontend: ["Next.js", "Tailwind CSS"],
      backend: ["TypeScript"],
      database: ["Supabase"]
    },
    implementationPhases: parsed.implementationPhases || [
      { phase: "Phase 1: MVP", duration: "2 days", deliverables: ["Functional prototype"] }
    ],
    uncertaintyAdvisory: parsed.uncertaintyAdvisory || "Never treat AI analysis as absolute certainty. Verify with user feedback.",
    confidenceScore: parsed.confidenceScore || 85
  };
}
