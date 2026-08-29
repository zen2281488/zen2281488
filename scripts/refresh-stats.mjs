#!/usr/bin/env node
/**
 * Regenerates every number and stat card on the profile from the GitHub API.
 *
 * Two problems this solves:
 *
 * 1. Prose numbers do not update themselves. Anything stated in prose has to be
 *    either a closed period (permanently true) or regenerated. This owns the
 *    second kind, between <!-- stats:start --> markers.
 *
 * 2. Third-party stat widgets only see public repositories. With ~99% of the
 *    work private they reported a Java/Python/C# profile built out of old
 *    practice repos, contradicting the rest of the page. The Signal card is
 *    rendered here instead, from an authenticated query that counts private
 *    repositories.
 *
 * Usage:  GITHUB_TOKEN=$(gh auth token) node scripts/refresh-stats.mjs
 *         add --check to report drift without writing (exit 1 if stale)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { renderCard } from "./render-card.mjs";

const USER = "zen2281488";
const README = "README.md";
const HARNESS = "engineering/agent-harness.md";
const CARD_DARK = "assets/signal-dark.svg";
const CARD_LIGHT = "assets/signal-light.svg";

const TOKEN = process.env.GITHUB_TOKEN;
const CHECK_ONLY = process.argv.includes("--check");

if (!TOKEN) {
  console.error("GITHUB_TOKEN is not set. Try: GITHUB_TOKEN=$(gh auth token) node scripts/refresh-stats.mjs");
  process.exit(1);
}

/**
 * `baseline` is the hand-driven period, before the harness existed. `harness`
 * is everything after. Both are queried rather than hardcoded so the comparison
 * cannot silently rot.
 */
const BASELINE_FROM = "2026-01-01T00:00:00Z";
const BASELINE_TO = "2026-07-31T23:59:59Z";
const HARNESS_FROM = "2026-08-01T00:00:00Z";

const query = `
  query($user: String!, $to: DateTime!, $bFrom: DateTime!, $bTo: DateTime!, $hFrom: DateTime!) {
    user(login: $user) {
      publicRepos: repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
      allRepos: repositories(ownerAffiliations: OWNER) { totalCount }

      # no date range: GitHub returns the trailing 12 months, which is the same
      # window as the calendar rendered under the profile README
      contributionsCollection {
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

      langs: repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
        nodes {
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges { size node { name } }
          }
        }
      }
    }
  }`;

const now = new Date();

const res = await fetch("https://api.github.com/graphql", {
  method: "POST",
  headers: { authorization: `bearer ${TOKEN}`, "content-type": "application/json" },
  body: JSON.stringify({
    query,
    variables: {
      user: USER,
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
const privateRepos = allRepos - user.publicRepos.totalCount;
const share = ((priv / total) * 100).toFixed(1);

const today = now.toISOString().slice(0, 10);
const days = cc.contributionCalendar.weeks
  .flatMap((w) => w.contributionDays)
  .filter((d) => d.date <= today);
const peak = days.reduce((a, b) => (b.contributionCount > a.contributionCount ? b : a), days[0]);

/**
 * Current streak, counted backwards from the most recent day. An empty day at
 * the very end is skipped, so a morning run does not report a broken streak
 * that has merely not started yet.
 */
let streak = 0;
for (let i = days.length - 1; i >= 0; i--) {
  if (days[i].contributionCount > 0) streak++;
  else if (i !== days.length - 1) break;
}

const byLang = new Map();
for (const repo of user.langs.nodes) {
  for (const edge of repo.languages.edges) {
    byLang.set(edge.node.name, (byLang.get(edge.node.name) ?? 0) + edge.size);
  }
}
const totalBytes = [...byLang.values()].reduce((a, b) => a + b, 0);
const languages = [...byLang.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 6)
  .map(([name, bytes]) => ({ name, pct: (bytes / totalBytes) * 100 }));

const baseline = user.baseline.contributionCalendar.totalContributions;
const harness = user.harness.contributionCalendar.totalContributions;
const baselinePerMonth = Math.round(baseline / 7);
const harnessMonths = Math.max(1, (now - new Date(HARNESS_FROM)) / (1000 * 60 * 60 * 24 * 30.44));
const harnessPerMonth = Math.round(harness / harnessMonths);
const multiple = Math.round(harnessPerMonth / baselinePerMonth);

const fmt = (n) => n.toLocaleString("en-US").replace(/,/g, " ");
const asOf = today;

const card = { total, private: priv, share, peak, streak, languages, asOf };

const readmeBlock =
  `Of **${fmt(total)}** contributions in the last 12 months, **${fmt(priv)}** (${share}%) landed in private repositories, ` +
  `across roughly ${privateRepos} of my ${allRepos} repos. Those are my own projects rather than employer work: ` +
  `the harness, the 3D client and the tooling around them. What is public here is test automation and side projects.` +
  `\n\n<sub>Card and figures regenerated ${asOf} by [scripts/refresh-stats.mjs](scripts/refresh-stats.mjs), ` +
  `counting private repositories. Off-the-shelf widgets cannot see them.</sub>`;

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
  { file: README, replace: (s) => s.replace(pattern, `${START}\n${readmeBlock}\n${END}`), marker: true },
  { file: HARNESS, replace: (s) => s.replace(pattern, `${START}\n${harnessBlock}\n${END}`), marker: true },
  { file: CARD_DARK, replace: () => renderCard(card, "dark") },
  { file: CARD_LIGHT, replace: () => renderCard(card, "light") },
];

let stale = false;

for (const { file, replace, marker } of targets) {
  let current = "";
  try {
    current = readFileSync(file, "utf8");
  } catch {
    current = "";
  }
  if (marker && !pattern.test(current)) {
    console.error(`Could not find the ${START} ... ${END} markers in ${file}.`);
    process.exit(1);
  }
  const next = replace(current);
  if (next === current) {
    console.log(`${file}: up to date.`);
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
  `${fmt(total)} total (12mo), ${fmt(priv)} private (${share}%), peak ${fmt(peak.contributionCount)} on ${peak.date}, ` +
    `streak ${streak}d, baseline ${fmt(baselinePerMonth)}/mo vs harness ${fmt(harnessPerMonth)}/mo (about ${multiple}x). ` +
    `Languages: ${languages.map((l) => `${l.name} ${l.pct.toFixed(1)}%`).join(", ")}.`,
);
