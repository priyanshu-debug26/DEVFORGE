import { SecurityFinding } from '../types';

export function scanCodeHeuristics(filePath: string, content: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check 1: Permissive CORS with credentials
    if (line.includes('Access-Control-Allow-Origin') && line.includes('*')) {
      findings.push({
        id: `heuristic_cors_wildcard_${lineNum}`,
        category: 'heuristic_api',
        severity: 'HIGH',
        title: 'Permissive CORS Wildcard Header Detected',
        description: 'Using `Access-Control-Allow-Origin: *` allows any third-party domain to read API responses.',
        affectedTarget: `${filePath}:${lineNum}`,
        evidence: line.trim(),
        remediation: 'Specify an explicit list of trusted origin domains or validate the request Origin header against a whitelist.',
        scanner: 'Heuristic API Security Audit'
      });
    }

    // Check 2: Dynamic eval
    if (/\beval\s*\(/.test(line) && !line.includes('//') && !line.includes('/*')) {
      findings.push({
        id: `heuristic_eval_${lineNum}`,
        category: 'heuristic_api',
        severity: 'HIGH',
        title: 'Unsafe Dynamic Code Evaluation (eval)',
        description: 'Use of eval() introduces severe arbitrary code execution vulnerabilities when user input is parsed.',
        affectedTarget: `${filePath}:${lineNum}`,
        evidence: line.trim(),
        remediation: 'Refactor code to use JSON.parse() or structured logic rather than arbitrary code execution.',
        scanner: 'Heuristic API Security Audit'
      });
    }

    // Check 3: Insecure JWT algorithms: ['none']
    if (/algorithms\s*:\s*\[.*['"]none['"].*\]/i.test(line)) {
      findings.push({
        id: `heuristic_jwt_none_${lineNum}`,
        category: 'heuristic_api',
        severity: 'CRITICAL',
        title: 'Insecure JWT Verification Allowing "none" Algorithm',
        description: 'Allowing the "none" algorithm permits attackers to forge administrative authentication tokens without a signature.',
        affectedTarget: `${filePath}:${lineNum}`,
        evidence: line.trim(),
        remediation: 'Restrict algorithms strictly to asymmetric or HMAC types (e.g. `algorithms: ["RS256"]` or `["HS256"]`).',
        scanner: 'Heuristic API Security Audit'
      });
    }

    // Check 4: child_process.exec without sanitization
    if (/\b(?:child_process|cp)\.exec\s*\(/.test(line)) {
      findings.push({
        id: `heuristic_cp_exec_${lineNum}`,
        category: 'heuristic_api',
        severity: 'HIGH',
        title: 'Command Execution with exec()',
        description: '`exec()` spawns an underlying shell, making it susceptible to shell command injection. `execFile` or `spawn` without shell is safer.',
        affectedTarget: `${filePath}:${lineNum}`,
        evidence: line.trim(),
        remediation: 'Use `child_process.execFile` or `child_process.spawn` with `{ shell: false }` and pass arguments as an array.',
        scanner: 'Heuristic API Security Audit'
      });
    }
  }

  return findings;
}
