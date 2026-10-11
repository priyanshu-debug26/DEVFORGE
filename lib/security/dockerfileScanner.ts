import { SecurityFinding } from '../types';

export function scanDockerfile(filePath: string, content: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const lines = content.split('\n');

  let hasUserDirective = false;
  let hasHealthcheck = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNum = i + 1;

    if (line.startsWith('#')) continue;

    // Check 1: FROM latest or untagged
    if (line.toUpperCase().startsWith('FROM ')) {
      const imagePart = line.split(/\s+/)[1] || '';
      if (imagePart.includes(':latest') || (!imagePart.includes(':') && !imagePart.includes('@sha256:'))) {
        findings.push({
          id: `docker_latest_${lineNum}`,
          category: 'dockerfile',
          severity: 'MEDIUM',
          title: 'Unpinned Base Image (:latest tag)',
          description: `Base image '${imagePart}' uses the mutable :latest tag or omits a tag version, leading to non-reproducible builds and unexpected supply-chain updates.`,
          affectedTarget: `${filePath}:${lineNum}`,
          evidence: line,
          remediation: `Pin the base image to an explicit version or digest (e.g. node:20.11-alpine or @sha256:...).`,
          scanner: 'DEVFORGE Dockerfile Linter'
        });
      }
    }

    // Check 2: USER directive
    if (line.toUpperCase().startsWith('USER ')) {
      const user = line.split(/\s+/)[1] || '';
      if (user.toLowerCase() === 'root' || user === '0') {
        findings.push({
          id: `docker_user_root_${lineNum}`,
          category: 'dockerfile',
          severity: 'HIGH',
          title: 'Container Explicitly Configured to Run as Root',
          description: 'Running containers as root grants attackers host-level container breakout capabilities if a vulnerability is exploited.',
          affectedTarget: `${filePath}:${lineNum}`,
          evidence: line,
          remediation: 'Create a non-privileged user and switch with `USER nonroot` or `USER 10001:10001`.',
          scanner: 'DEVFORGE Dockerfile Linter'
        });
      } else {
        hasUserDirective = true;
      }
    }

    // Check 3: ADD instead of COPY
    if (line.toUpperCase().startsWith('ADD ') && !line.includes('.tar.') && !line.includes('http://') && !line.includes('https://')) {
      findings.push({
        id: `docker_add_directive_${lineNum}`,
        category: 'dockerfile',
        severity: 'LOW',
        title: 'Use of ADD Instead of COPY',
        description: 'ADD directive has implicit decompression and URL fetch side effects. COPY is safer and more predictable.',
        affectedTarget: `${filePath}:${lineNum}`,
        evidence: line,
        remediation: 'Replace `ADD` with `COPY` unless automated tar extraction is explicitly required.',
        scanner: 'DEVFORGE Dockerfile Linter'
      });
    }

    // Check 4: Secrets in ENV or ARG
    if (line.toUpperCase().startsWith('ENV ') || line.toUpperCase().startsWith('ARG ')) {
      const lower = line.toLowerCase();
      if (lower.includes('secret') || lower.includes('password') || lower.includes('token') || lower.includes('apikey')) {
        findings.push({
          id: `docker_env_secret_${lineNum}`,
          category: 'dockerfile',
          severity: 'HIGH',
          title: 'Potential Hardcoded Secret in ENV/ARG Instruction',
          description: 'Environment variables declared in Dockerfiles are baked into the image metadata and accessible to anyone with image pull permissions.',
          affectedTarget: `${filePath}:${lineNum}`,
          evidence: line.slice(0, 50) + '...',
          remediation: 'Pass secrets at runtime or use BuildKit secret mounts (`--mount=type=secret`).',
          scanner: 'DEVFORGE Dockerfile Linter'
        });
      }
    }

    // Check 5: Sensitive ports
    if (line.toUpperCase().startsWith('EXPOSE ')) {
      const port = line.split(/\s+/)[1] || '';
      if (port === '22' || port === '23' || port === '3389') {
        findings.push({
          id: `docker_sensitive_port_${lineNum}`,
          category: 'dockerfile',
          severity: 'HIGH',
          title: `Insecure Port Exposed (${port})`,
          description: `Exposing administrative or unencrypted management ports (${port}) increases the container attack surface.`,
          affectedTarget: `${filePath}:${lineNum}`,
          evidence: line,
          remediation: `Remove EXPOSE ${port} and access containers via orchestration tooling or SSH bastion outside the container.`,
          scanner: 'DEVFORGE Dockerfile Linter'
        });
      }
    }

    if (line.toUpperCase().startsWith('HEALTHCHECK ')) {
      hasHealthcheck = true;
    }
  }

  // Check 6: Missing USER directive at end of file
  if (!hasUserDirective) {
    findings.push({
      id: 'docker_missing_user',
      category: 'dockerfile',
      severity: 'HIGH',
      title: 'Missing Non-Root USER Instruction',
      description: 'The Dockerfile does not specify a non-root USER directive, causing the container process to run as default root.',
      affectedTarget: filePath,
      evidence: 'No `USER <username>` directive found in Dockerfile',
      remediation: 'Add `USER appuser` before the ENTRYPOINT or CMD directive.',
      scanner: 'DEVFORGE Dockerfile Linter'
    });
  }

  // Check 7: Missing HEALTHCHECK
  if (!hasHealthcheck) {
    findings.push({
      id: 'docker_missing_healthcheck',
      category: 'dockerfile',
      severity: 'LOW',
      title: 'Missing HEALTHCHECK Directive',
      description: 'Without a HEALTHCHECK, container orchestrators cannot detect if the internal application process has deadlocked.',
      affectedTarget: filePath,
      evidence: 'No HEALTHCHECK defined',
      remediation: 'Define a HEALTHCHECK instruction, e.g., `HEALTHCHECK --interval=30s CMD curl -f http://localhost:8080/health || exit 1`.',
      scanner: 'DEVFORGE Dockerfile Linter'
    });
  }

  return findings;
}
