import { SecurityFinding } from '../types';

interface SecretRule {
  id: string;
  name: string;
  regex: RegExp;
  severity: 'CRITICAL' | 'HIGH';
  remediation: string;
}

const SECRET_RULES: SecretRule[] = [
  {
    id: 'aws_access_key',
    name: 'AWS Access Key ID',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    severity: 'CRITICAL',
    remediation: 'Revoke this AWS Access Key immediately in IAM, rotate credentials, and store in AWS Secrets Manager or environment variables.'
  },
  {
    id: 'github_pat',
    name: 'GitHub Personal Access Token',
    regex: /(?:ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/g,
    severity: 'CRITICAL',
    remediation: 'Revoke this token immediately in GitHub Developer Settings and use fine-grained GitHub Actions secrets or OIDC.'
  },
  {
    id: 'private_key',
    name: 'Unencrypted Private Key Block',
    regex: /-----BEGIN (?:RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY[^-]*-----/g,
    severity: 'CRITICAL',
    remediation: 'Remove private keys from repository immediately. Run git-filter-repo to purge commit history and generate a new key pair.'
  },
  {
    id: 'slack_webhook',
    name: 'Slack Incoming Webhook URL',
    regex: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8}\/B[a-zA-Z0-9_]{8,12}\/[a-zA-Z0-9_]{24}/g,
    severity: 'HIGH',
    remediation: 'Invalidate this Slack webhook URL in the Slack App Management console and store the URL in environment variables.'
  },
  {
    id: 'stripe_secret_key',
    name: 'Stripe Secret API Key',
    regex: /sk_live_[0-9a-zA-Z]{24,34}/g,
    severity: 'CRITICAL',
    remediation: 'Rotate this secret key in the Stripe Dashboard immediately to prevent unauthorized financial transactions.'
  },
  {
    id: 'generic_jwt_bearer',
    name: 'Hardcoded JWT Bearer Token',
    regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]{10,}\.[A-Za-z0-9._-]{10,}/g,
    severity: 'HIGH',
    remediation: 'Never hardcode static JWTs in source code. Issue ephemeral tokens dynamically via your identity provider.'
  }
];

export function scanFileForSecrets(filePath: string, content: string): SecurityFinding[] {
  const findings: SecurityFinding[] = [];
  const lines = content.split('\n');

  for (const rule of SECRET_RULES) {
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      // Reset regex index for global regexes
      rule.regex.lastIndex = 0;
      const match = rule.regex.exec(line);

      if (match) {
        const rawSecret = match[0];
        // Redact secret so it is never exposed in UI or logs
        const masked = rawSecret.length > 8 
          ? rawSecret.slice(0, 4) + '****************' + rawSecret.slice(-4)
          : '********';

        findings.push({
          id: `secret_${rule.id}_${lineIdx + 1}`,
          category: 'secret',
          severity: rule.severity,
          title: `Exposed ${rule.name} Detected`,
          description: `Hardcoded credential found in file ${filePath} at line ${lineIdx + 1}.`,
          affectedTarget: `${filePath}:${lineIdx + 1}`,
          evidence: `Line ${lineIdx + 1}: ${line.replace(rawSecret, masked).trim()}`,
          remediation: rule.remediation,
          scanner: 'Gitleaks Pattern Engine'
        });
      }
    }
  }

  return findings;
}
