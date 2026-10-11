import { ParsedDependency } from './manifestParser';
import { SecurityFinding } from '../types';

export async function queryOsvVulnerabilities(deps: ParsedDependency[]): Promise<SecurityFinding[]> {
  if (deps.length === 0) return [];

  // Limit querybatch to 80 packages to prevent timeout
  const batch = deps.slice(0, 80);
  const payload = {
    queries: batch.map(d => ({
      package: {
        name: d.name,
        ecosystem: d.ecosystem
      },
      version: d.version
    }))
  };

  try {
    const res = await fetch('https://api.osv.dev/v1/querybatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      next: { revalidate: 300 }
    });

    if (!res.ok) {
      console.warn(`OSV querybatch failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const results = data.results || [];
    const findings: SecurityFinding[] = [];

    for (let i = 0; i < results.length; i++) {
      const vulns = results[i].vulns || [];
      const dep = batch[i];

      for (const vuln of vulns) {
        // Find fixed version if available in ranges
        let fixedVersion = 'Latest patched version';
        if (vuln.affected && Array.isArray(vuln.affected)) {
          for (const aff of vuln.affected) {
            for (const range of aff.ranges || []) {
              for (const event of range.events || []) {
                if (event.fixed) {
                  fixedVersion = event.fixed;
                  break;
                }
              }
            }
          }
        }

        const cve = (vuln.aliases || []).find((a: string) => a.startsWith('CVE-')) || vuln.id;
        const severity = calculateOsvSeverity(vuln);

        findings.push({
          id: `osv_${vuln.id}_${dep.name}`,
          category: 'dependency',
          severity,
          title: vuln.summary || `Vulnerability in ${dep.name} (${cve})`,
          description: vuln.details ? vuln.details.slice(0, 300) + '...' : `Advisory ${vuln.id} affects package ${dep.name} version ${dep.version}.`,
          affectedTarget: `${dep.name}@${dep.version}`,
          currentVersion: dep.version,
          fixedVersion,
          cveReference: cve,
          advisoryUrl: `https://osv.dev/vulnerability/${vuln.id}`,
          evidence: `${dep.manifestFile} -> "${dep.name}": "${dep.version}"`,
          remediation: `Upgrade ${dep.name} to ${fixedVersion} or run npm/pip audit fix to update dependencies.`,
          scanner: 'OSV.dev Vulnerability DB'
        });
      }
    }

    return findings;
  } catch (err) {
    console.error("OSV batch lookup error:", err);
    return [];
  }
}

function calculateOsvSeverity(vuln: any): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (vuln.database_specific?.severity) {
    const s = vuln.database_specific.severity.toUpperCase();
    if (s.includes('CRITICAL')) return 'CRITICAL';
    if (s.includes('HIGH')) return 'HIGH';
    if (s.includes('MODERATE') || s.includes('MEDIUM')) return 'MEDIUM';
    if (s.includes('LOW')) return 'LOW';
  }

  // Check CVSS score if present
  if (vuln.severity && Array.isArray(vuln.severity)) {
    for (const sev of vuln.severity) {
      if (sev.score) {
        // e.g. CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H or numeric score
        const numericMatch = sev.score.match(/([0-9]+\.[0-9]+)/);
        if (numericMatch) {
          const score = parseFloat(numericMatch[1]);
          if (score >= 9.0) return 'CRITICAL';
          if (score >= 7.0) return 'HIGH';
          if (score >= 4.0) return 'MEDIUM';
          return 'LOW';
        }
      }
    }
  }

  // Check title or summary keywords
  const text = ((vuln.summary || '') + ' ' + (vuln.details || '')).toLowerCase();
  if (text.includes('remote code execution') || text.includes('rce') || text.includes('arbitrary code')) return 'CRITICAL';
  if (text.includes('denial of service') || text.includes('bypass') || text.includes('injection') || text.includes('privilege escalation')) return 'HIGH';
  if (text.includes('information disclosure') || text.includes('xss') || text.includes('prototype pollution')) return 'MEDIUM';
  return 'LOW';
}
