#!/usr/bin/env node
/**
 * Refreshes the contribution numbers embedded in README.md.
 *
 * The widgets in the Signal section update themselves. Prose numbers do not,
 * so anything stated in prose has to be either a closed period (permanently
 * true) or regenerated from the API. This script owns the second kind.
 *
 * Usage:  GITHUB_TOKEN=$(gh auth token) node scripts/refresh-stats.mjs
 *         add --check to fail instead of writing (useful in CI)
 */

import { readFileSync, writeFileSync } from "node:fs";

const USER = "zen2281488";
const README = "README.md";
const HARNESS = "engineering/agent-harness.md";
const TOKEN = process.env.GITHUB_TOKEN;
const CHECK_ONLY = process.argv.includes("--check");

if (!TOKEN) {
  console.error("GITHUB_TOKEN is not set. Try: GITHUB_TOKEN=$(gh auth token) node scripts/refresh-stats.mjs");
  process.exit(1);
}

/**
 * `baseline` is the hand-driven period: agent sessions run one conversation at
 * a time, before the harness existed. `harness` is the period after it. Both
 * are queried rather than hardcoded so the comparison cannot silently rot.
 */
const BASELINE_FROM = "2026-01-01T00:00:00Z";
const BASELINE_TO = "2026-07-31T23:59:59Z";
const HARNESS_FROM = "2026-08-01T00:00:00Z";

const query = `
  query($user: String!, $from: DateTime!, $to: DateTime!, $bFrom: DateTime!, $bTo: DateTime!, $hFrom: DateTime!) {
    user(login: $user) {
      repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
      allRepos: repositories(ownerAffiliations: OWNER) { totalCount }
      contributionsCollection(from: $from, to: $to) {
        restrictedContributionsCount
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
      baseline: contributionsCollection(from: $bFrom, to: $bTo) {
        contributionCalendar { totalContributions }
      }
      harness: contributionsCollection(from: $hFrom, to: $to) {
        contributionCalendar { totalContributions }
      }
    }
  }`;

const now = new Date();
const year = now.getUTCFullYear();

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { authorization: `bearer ${TOKEN}`, "content-type": "application/json" },
  body: JSON.stringify({
    query,
    variables: {
      user: USER,
      from: `${year}-01-01T00:00:00Z`,
      to: now.toISOString(),
      bFrom: BASELINE_FROM,
      bTo: BASELINE_TO,
      hFrom: HARNESS_FROM,
    },
  }),
});

if (!res.ok) {
  console.error(`GraphQL request failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}

const body = await res.json();
if (body.errors) {
  console.error("GraphQL errors:", JSON.stringify(body.errors, null, 2));
  process.exit(1);
}

const user = body.data.user;
const cc = user.contributionsCollection;
const total = cc.contributionCalendar.totalContributions;
const priv = cc.restrictedContributionsCount;
const allRepos = user.allRepos.totalCount;
const publicRepos = user.repositories.totalCount;
const privateRepos = allRepos - publicRepos;
const share = ((priv / total) * 100).toFixed(1);

const days = cc.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
const peak = days.reduce((a, b) => (b.contributionCount > a.contributionCount ? b : a), days[0]);

const fmt = (n) => n.toLocaleString("en-US").replace(/,/g, " ");
const asOf = now.toISOString().slice(0, 10);

const block = [
  `Of **${fmt(total)}** contributions so far in ${year}, **${fmt(priv)}** (${share}%) landed in private repositories, `,
  `across roughly ${privateRepos} of my ${allRepos} repos. Those are my own projects rather than employer work: `,
  `the harness, the 3D client and the tooling around them. What is public here is test automation and side projects. `,
  `Busiest single day so far: **${fmt(peak.contributionCount)}** on ${peak.date}.`,
  `\n\n<sub>Numbers refreshed ${asOf} by [scripts/refresh-stats.mjs](scripts/refresh-stats.mjs).</sub>`,
].join("");

const baseline = user.baseline.contributionCalendar.totalContributions;
const harness = user.harness.contributionCalendar.totalContributions;
const baselineMonths = 7;
const baselinePerMonth = Math.round(baseline / baselineMonths);
const harnessMonths = Math.max(
  1,
  (now - new Date(HARNESS_FROM)) / (1000 * 60 * 60 * 24 * 30.44),
);
const harnessPerMonth = Math.round(harness / harnessMonths);
const multiple = Math.round(harnessPerMonth / baselinePerMonth);

const harnessBlock = [
  "| | Hand-driven sessions | Harness loop |",
  "| --- | --- | --- |",
  "| Period | Jan to Jul 2026 | Aug 2026 onward |",
  `| Contributions | ${fmt(baseline)} | ${fmt(harness)} |`,
  `| Per month | about ${fmt(baselinePerMonth)} | about ${fmt(harnessPerMonth)} |`,
  `| Peak day | | ${fmt(peak.contributionCount)} |`,
  "",
  `<sub>Regenerated from the GitHub API on ${asOf}. Multiple: about ${multiple}x per month.</sub>`,
].join("\n");

const START = "<!-- stats:start -->";
const END = "<!-- stats:end -->";
const pattern = new RegExp(`${START}[\\s\\S]*?${END}`);

const targets = [
  { file: README, content: block },
  { file: HARNESS, content: harnessBlock },
];

let stale = false;

for (const { file, content } of targets) {
  const current = readFileSync(file, "utf8");
  if (!pattern.test(current)) {
    console.error(`Could not find the ${START} ... ${END} markers in ${file}.`);
    process.exit(1);
  }
  const next = current.replace(pattern, `${START}\n${content}\n${END}`);
  if (next === current) {
    console.log(`${file}: already up to date.`);
    continue;
  }
  stale = true;
  if (CHECK_ONLY) {
    console.log(`${file}: stale, would be rewritten.`);
    continue;
  }
  writeFileSync(file, next);
  console.log(`${file}: updated.`);
}

if (CHECK_ONLY && stale) {
  console.error("Numbers are stale. Run without --check to update.");
  process.exitCode = 1;
}

console.log(
  `${fmt(total)} total, ${fmt(priv)} private (${share}%), peak ${fmt(peak.contributionCount)} on ${peak.date}, ` +
    `baseline ${fmt(baselinePerMonth)}/mo vs harness ${fmt(harnessPerMonth)}/mo (about ${multiple}x).`,
);
