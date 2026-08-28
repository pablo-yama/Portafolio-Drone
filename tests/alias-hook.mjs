/**
 * Module resolution hook that teaches Node's test runner the `@/*` path alias
 * declared in tsconfig.json. Node does not read tsconfig `paths`, and the
 * library code under test imports `@/lib/...` the same way the app does.
 */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const SRC = path.resolve(fileURLToPath(new URL('../src', import.meta.url)));
const EXTENSIONS = ['', '.ts', '.tsx', '.mts', '.js', '/index.ts', '/index.tsx'];

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const base = path.join(SRC, specifier.slice(2));
    for (const extension of EXTENSIONS) {
      const candidate = base + extension;
      if (existsSync(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    throw new Error(`Cannot resolve path alias "${specifier}" under ${SRC}`);
  }
  return nextResolve(specifier, context);
}
