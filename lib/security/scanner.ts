import { SecurityScanResult, SecurityFinding, VulnerabilitySeverity } from '../types';
import { parsePackageJson, parseRequirementsTxt, parseGoMod, parseCargoToml, ParsedDependency } from './manifestParser';
import { queryOsvVulnerabilities } from './osv';
import { scanFileForSecrets } from './secretsScanner';
import { scanDockerfile } from './dockerfileScanner';
import { scanCodeHeuristics } from './heuristicsScanner';
import { DataStore } from '../store';

export function normalizeGitHubUrl(input: string): { owner: string; repo: string; cleanUrl: string } {
  let trimmed = input.trim();
  // Strip trailing slashes or .git
  trimmed = trimmed.replace(/\/+$/, '').replace(/\.git$/, '');

  // Case 1: owner/repo
  if (/^[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+$/.test(trimmed)) {
    const [owner, repo] = trimmed.split('/');
    return { owner, repo, cleanUrl: `https://github.com/${owner}/${repo}` };
  }

  // Case 2: github.com/owner/repo
  const noProto = trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  if (noProto.startsWith('github.com/')) {
    const parts = noProto.replace(/^github\.com\//, '').split('/');
    if (parts.length >= 2) {
      const owner = parts[0];
      const repo = parts[1];
      return { owner, repo, cleanUrl: `https://github.com/${owner}/${repo}` };
    }
  }

  // Case 3: https://github.com/owner/repo
  const urlMatch = trimmed.match(/^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2], cleanUrl: `https://github.com/${urlMatch[1]}/${urlMatch[2]}` };
  }

  throw new Error("Invalid GitHub repository format. Please provide 'owner/repo' or 'https://github.com/owner/repo'");
}

interface RepoFile {
  path: string;
  content: string;
}

export async function runRepositorySecurityScan(repoUrl: string): Promise<SecurityScanResult> {
  const startTime = Date.now();

  const { owner, repo, cleanUrl: cleanRepoUrl } = normalizeGitHubUrl(repoUrl);

  const filesInspected: string[] = [];
  const allFindings: SecurityFinding[] = [];
  const scannedFiles: RepoFile[] = [];
  let dependenciesAudited = 0;

  // Track status of scanners
  const scannersRun: SecurityScanResult['scannersRun'] = [
    { name: 'OSV.dev Vulnerability DB', status: 'completed', findingsCount: 0 },
    { name: 'Gitleaks Pattern Engine', status: 'completed', findingsCount: 0 },
    { name: 'DEVFORGE Dockerfile Linter', status: 'completed', findingsCount: 0 },
    { name: 'Heuristic API Security Audit', status: 'completed', findingsCount: 0 }
  ];

  // Fetch candidate files from GitHub raw API
  const candidatePaths = [
    'package.json',
    'requirements.txt',
    'go.mod',
    'Cargo.toml',
    'Dockerfile',
    'docker-compose.yml',
    'index.js',
    'server.js',
    'src/index.ts',
    'src/server.ts',
    'api/index.js',
    '.env.example'
  ];

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3.raw',
    'User-Agent': 'DEVFORGE-SecurityScanner/1.0'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  // Fetch candidate files concurrently
  await Promise.all(
    candidatePaths.map(async (filePath) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filePath}`;
        const res = await fetch(rawUrl, { headers });
        if (res.ok) {
          const content = await res.text();
          if (content && content.length < 500000) {
            scannedFiles.push({ path: filePath, content });
            filesInspected.push(filePath);
          }
        }
      } catch {
        // file not present in repo, expected
      }
    })
  );

  // If no files could be fetched, check if repo actually exists
  if (scannedFiles.length === 0) {
    const repoCheckUrl = `https://api.github.com/repos/${owner}/${repo}`;
    try {
      const checkRes = await fetch(repoCheckUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DEVFORGE-SecurityScanner/1.0',
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {})
        }
      });
      if (checkRes.status === 404) {
        throw new Error(`Repository ${owner}/${repo} does not exist or is private.`);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('does not exist')) {
        throw err;
      }
    }
  }

  // 1. Dependency Vulnerability Audit with OSV.dev
  const parsedDeps: ParsedDependency[] = [];
  for (const file of scannedFiles) {
    if (file.path === 'package.json') {
      parsedDeps.push(...parsePackageJson(file.content, file.path));
    } else if (file.path === 'requirements.txt') {
      parsedDeps.push(...parseRequirementsTxt(file.content, file.path));
    } else if (file.path === 'go.mod') {
      parsedDeps.push(...parseGoMod(file.content, file.path));
    } else if (file.path === 'Cargo.toml') {
      parsedDeps.push(...parseCargoToml(file.content, file.path));
    }
  }

  dependenciesAudited = parsedDeps.length;

  if (parsedDeps.length > 0) {
    const osvFindings = await queryOsvVulnerabilities(parsedDeps);
    allFindings.push(...osvFindings);
    const osvScanner = scannersRun.find(s => s.name.includes('OSV'));
    if (osvScanner) osvScanner.findingsCount = osvFindings.length;
  }

  // 2. Secrets Scan
  let secretFindingsCount = 0;
  for (const file of scannedFiles) {
    const f = scanFileForSecrets(file.path, file.content);
    allFindings.push(...f);
    secretFindingsCount += f.length;
  }
  const secretScanner = scannersRun.find(s => s.name.includes('Gitleaks'));
  if (secretScanner) secretScanner.findingsCount = secretFindingsCount;

  // 3. Dockerfile Misconfiguration Scan
  let dockerFindingsCount = 0;
  const dockerfile = scannedFiles.find(f => f.path.toLowerCase().includes('dockerfile'));
  if (dockerfile) {
    const df = scanDockerfile(dockerfile.path, dockerfile.content);
    allFindings.push(...df);
    dockerFindingsCount = df.length;
  } else {
    const dfScanner = scannersRun.find(s => s.name.includes('Dockerfile'));
    if (dfScanner) {
      dfScanner.status = 'completed';
      dfScanner.note = 'No Dockerfile present in repository root';
    }
  }
  const dfScanner = scannersRun.find(s => s.name.includes('Dockerfile'));
  if (dfScanner && dockerfile) dfScanner.findingsCount = dockerFindingsCount;

  // 4. Heuristic Code & API Security Audit
  let heuristicFindingsCount = 0;
  for (const file of scannedFiles) {
    if (file.path.endsWith('.js') || file.path.endsWith('.ts')) {
      const hf = scanCodeHeuristics(file.path, file.content);
      allFindings.push(...hf);
      heuristicFindingsCount += hf.length;
    }
  }
  const hScanner = scannersRun.find(s => s.name.includes('Heuristic'));
  if (hScanner) hScanner.findingsCount = heuristicFindingsCount;

  // Calculate severity breakdown
  const breakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0
  };

  for (const finding of allFindings) {
    const sev = finding.severity.toLowerCase() as keyof typeof breakdown;
    if (breakdown[sev] !== undefined) {
      breakdown[sev]++;
    }
  }

  // Calculate executive score
  let score = 100;
  score -= breakdown.critical * 25;
  score -= breakdown.high * 12;
  score -= breakdown.medium * 5;
  score -= breakdown.low * 2;
  score = Math.max(10, Math.min(100, score));

  // Determine Grade
  let grade: SecurityScanResult['securityGrade'] = 'A';
  if (score >= 95) grade = 'A+';
  else if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  const scanDurationMs = Date.now() - startTime;

  const result: SecurityScanResult = {
    id: `scan_${Date.now()}`,
    repoUrl: cleanRepoUrl,
    owner,
    repo,
    scannedAt: new Date().toISOString(),
    scanDurationMs,
    executiveScore: score,
    securityGrade: grade,
    totalFindings: allFindings.length,
    severityBreakdown: breakdown,
    scannersRun,
    findings: allFindings,
    dependenciesAudited,
    filesInspected: filesInspected.length > 0 ? filesInspected : ['(No supported manifests identified in repo root)']
  };

  DataStore.saveScan(result);

  return result;
}
