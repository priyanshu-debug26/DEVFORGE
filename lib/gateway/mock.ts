import { GatewayEffort } from '../types';
import { ProviderCallResult } from './gemini';

export async function callMock(
  prompt: string,
  systemPrompt?: string,
  effort: GatewayEffort = 'medium',
  maxTokens: number = 2048,
  temperature: number = 0.7,
  timeoutMs: number = 20000,
  simulateFailure: boolean = false
): Promise<ProviderCallResult> {
  const startTime = Date.now();
  // Simulate network latency (250ms - 600ms)
  const delay = effort === 'low' ? 220 : effort === 'medium' ? 450 : 750;
  await new Promise(r => setTimeout(r, delay));

  if (simulateFailure) {
    const err: any = new Error("Simulated 429 Too Many Requests (Rate limit reached)");
    err.isRetryable = true;
    err.status = 429;
    throw err;
  }

  // Generate an intelligent architectural response based on the prompt
  let responseText = "";
  const lower = prompt.toLowerCase();

  if (lower.includes("problem") || lower.includes("analyze") || lower.includes("opportunity")) {
    responseText = `### DEVFORGE Architectural Analysis

**1. Root Cause Breakdown**
The identified issue stems from architectural fragmentation between edge compute runtimes and stateful middleware. Modern microservices frequently assume monolithic synchronization, leading to race conditions and unvalidated trust boundaries.

**2. Affected Personas**
- Senior Full-Stack Engineers building microservices
- DevOps and Platform Engineers configuring API gateways
- Security Engineers auditing session and CORS integrity

**3. Existing Workarounds & Deficiencies**
- *Custom Lua/Nginx plugins*: Brittle and lack deep TypeScript schema validation.
- *Heavyweight distributed locks (e.g. ZooKeeper)*: Add 60-120ms round-trip latency to each critical path request.

**4. The Market & Project Opportunity**
There is a clear gap for an embedded, zero-dependency utility with sub-10ms verification. Project viability is rated **88/100 (High)**.

**5. Suggested Stack**
- **Runtime**: Next.js 14 App Router, TypeScript
- **Security**: OSV vulnerability checks, Jose JWT, Web Crypto API
- **Persistence**: Supabase / Redis cache

**6. Implementation Milestones**
- Phase 1 (Hours 0-4): Cryptographic boundary definition & unit tests.
- Phase 2 (Hours 4-8): Middleware wrapper & Next.js App Router hooks.
- Phase 3 (Hours 8-12): Automated security scanning with OSV and gitleaks pattern checks.`;
  } else if (lower.includes("plan") || lower.includes("build") || lower.includes("implement")) {
    responseText = `### DEVFORGE Technical Build Specification

**Executive Overview**
This project delivers a high-performance, hardened implementation designed to run in modern serverless and edge container environments.

**Phase 1: Core Primitives & Security Boundaries (Days 1-2)**
- Implement zero-dependency cryptographic token validation.
- Enforce strict typing with Zod schemas for all ingress payloads.
- Integrate automated OSV dependency auditing in CI.

**Phase 2: API Gateway & Service Orchestration (Days 3-4)**
- Configure multi-provider failover routing with automatic latency tracking.
- Set up distributed rate limiting with sliding window Redis counters.
- Enforce CORS policy restrictions and sanitization middleware.

**Phase 3: Production Hardening & Security Audit (Day 5)**
- Execute Gitleaks pattern sweep across repository commit history.
- Run Dockerfile misconfiguration audit to remove root execution.
- Final benchmark verification: target < 15ms p99 latency.`;
  } else {
    responseText = `### DEVFORGE Gateway Response

**Request Processed Successfully**
- **Mode**: Local Gateway Engine (Production Ready)
- **Input Tokens**: ~${Math.round(prompt.length / 4)}
- **Context Depth**: High

**Key Takeaways**:
1. Architecture meets security best practices with explicit boundary checking.
2. Dependencies mapped against OSV.dev vulnerability index.
3. Ready for integration into the DEVFORGE project lifecycle.`;
  }

  const latencyMs = Date.now() - startTime;
  return {
    content: responseText,
    model: 'devforge-gateway-simulator',
    latencyMs,
    promptTokens: Math.round(prompt.length / 4),
    completionTokens: Math.round(responseText.length / 4)
  };
}
