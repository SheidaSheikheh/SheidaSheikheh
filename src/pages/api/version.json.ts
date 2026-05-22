import type { APIRoute } from 'astro';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Static endpoint: rendered once at build time into /api/version.json.
const pkg = JSON.parse(
  readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8')
) as { name: string; version: string };

function commit(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

export const GET: APIRoute = () => {
  const sha = commit();
  const data = {
    name: pkg.name,
    version: pkg.version,
    commit: sha,
    commitShort: sha.slice(0, 7),
    builtAt: new Date().toISOString(),
    repository: 'https://github.com/SheidaSheikheh/SheidaSheikheh',
  };
  return new Response(JSON.stringify(data, null, 2) + '\n', {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
};
