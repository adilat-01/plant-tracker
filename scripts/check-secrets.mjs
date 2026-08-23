#!/usr/bin/env node
/**
 * Scans tracked files for patterns that look like real API keys.
 * Run before pushing: npm run check-secrets
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const PATTERNS = [
  { name: "Gemini API key", regex: /AIza[0-9A-Za-z_-]{30,}/ },
  { name: "Supabase service role (JWT)", regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  { name: "Resend API key", regex: /re_[A-Za-z0-9]{20,}/ },
  { name: "Generic secret assignment", regex: /(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"]?[A-Za-z0-9_\-]{20,}/i },
];

const FORBIDDEN_FILES = [".env", ".env.local", ".env.production", "credentials.json"];

let failed = false;

for (const file of FORBIDDEN_FILES) {
  if (existsSync(file)) {
    try {
      const tracked = execSync(`git ls-files --error-unmatch "${file}" 2>nul`, { encoding: "utf8" });
      if (tracked.trim()) {
        console.error(`❌ ${file} is tracked by git — remove it immediately!`);
        failed = true;
      }
    } catch {
      // not tracked — good
    }
  }
}

let files;
try {
  files = execSync("git ls-files", { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
} catch {
  console.log("Not a git repo yet — skipping file scan.");
  process.exit(0);
}

for (const file of files) {
  if (file.endsWith(".example") || file.includes("check-secrets")) continue;
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const { name, regex } of PATTERNS) {
    if (regex.test(content)) {
      console.error(`❌ Possible ${name} found in: ${file}`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("\n🛑 Secret scan failed. Fix issues before pushing to GitHub.");
  process.exit(1);
}

console.log("✅ No obvious secrets detected in tracked files.");
