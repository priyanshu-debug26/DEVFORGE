export interface ParsedDependency {
  name: string;
  version: string;
  ecosystem: 'npm' | 'PyPI' | 'Go' | 'crates.io' | 'Maven';
  manifestFile: string;
}

export function parsePackageJson(content: string, manifestFile: string = 'package.json'): ParsedDependency[] {
  try {
    const pkg = JSON.parse(content);
    const deps: ParsedDependency[] = [];

    const collect = (dict: Record<string, string> | undefined) => {
      if (!dict) return;
      for (const [name, rawVer] of Object.entries(dict)) {
        // Strip ^, ~, >=, v prefixes to get base version for OSV lookup
        const cleanVer = rawVer.replace(/[\^~>=<v]/g, '').trim();
        if (cleanVer && /^[0-9]/.test(cleanVer)) {
          deps.push({
            name,
            version: cleanVer,
            ecosystem: 'npm',
            manifestFile
          });
        }
      }
    };

    collect(pkg.dependencies);
    collect(pkg.devDependencies);
    return deps;
  } catch {
    return [];
  }
}

export function parseRequirementsTxt(content: string, manifestFile: string = 'requirements.txt'): ParsedDependency[] {
  const deps: ParsedDependency[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // match e.g. requests==2.28.1 or flask>=2.0.0
    const match = trimmed.match(/^([a-zA-Z0-9_\-]+)\s*(?:==|>=|~=)\s*([0-9\.]+)/);
    if (match) {
      deps.push({
        name: match[1],
        version: match[2],
        ecosystem: 'PyPI',
        manifestFile
      });
    }
  }

  return deps;
}

export function parseGoMod(content: string, manifestFile: string = 'go.mod'): ParsedDependency[] {
  const deps: ParsedDependency[] = [];
  const lines = content.split('\n');
  let inRequire = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('require (')) {
      inRequire = true;
      continue;
    }
    if (inRequire && trimmed.startsWith(')')) {
      inRequire = false;
      continue;
    }

    if (inRequire || trimmed.startsWith('require ')) {
      const parts = trimmed.replace(/^require\s+/, '').split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[0];
        const ver = parts[1].replace(/^v/, '');
        deps.push({
          name,
          version: ver,
          ecosystem: 'Go',
          manifestFile
        });
      }
    }
  }

  return deps;
}

export function parseCargoToml(content: string, manifestFile: string = 'Cargo.toml'): ParsedDependency[] {
  const deps: ParsedDependency[] = [];
  const lines = content.split('\n');
  let inDeps = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '[dependencies]' || trimmed === '[dev-dependencies]') {
      inDeps = true;
      continue;
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      inDeps = false;
      continue;
    }

    if (inDeps && trimmed.includes('=')) {
      const [namePart, verPart] = trimmed.split('=').map(s => s.trim());
      const verMatch = verPart.match(/["']([0-9\.]+)["']/);
      if (verMatch) {
        deps.push({
          name: namePart,
          version: verMatch[1],
          ecosystem: 'crates.io',
          manifestFile
        });
      }
    }
  }

  return deps;
}
