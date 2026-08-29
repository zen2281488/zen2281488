/**
 * Renders the Signal card as a self-hosted SVG.
 *
 * Generated from an authenticated GraphQL query so private repositories are
 * counted. Off-the-shelf stat widgets only read public repos, which here is
 * about 1% of the work, and they reported a language split from old practice
 * projects as a result.
 */

const THEMES = {
  dark: {
    text: "#E6EDF3",
    muted: "#768390",
    faint: "#636E7B",
    accent: "#F0883E",
    rule: "#30363D",
    track: "#21262D",
  },
  light: {
    text: "#1F2328",
    muted: "#59636E",
    faint: "#818B98",
    accent: "#BC4C00",
    rule: "#D1D9E0",
    track: "#EAEEF2",
  },
};

/** GitHub's own language colours, so the bar reads the way the rest of the site does. */
const LANG_COLORS = {
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  Python: "#3572A5",
  Kotlin: "#A97BFF",
  Java: "#B07219",
  HTML: "#E34C26",
  CSS: "#663399",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Shell: "#89E051",
  C: "#555555",
  "C#": "#178600",
  "C++": "#F34B7D",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Dart: "#00B4AB",
  Vue: "#41B883",
  Svelte: "#FF3E00",
  Dockerfile: "#384D54",
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fmt = (n) => n.toLocaleString("en-US");

const colorFor = (name, i, accent) =>
  LANG_COLORS[name] ?? [accent, "#8B949E", "#6E7681", "#484F58"][i % 4];

/**
 * @param {{
 *   total:number, private:number, share:string, peak:{date:string,contributionCount:number},
 *   streak:number, languages:{name:string, pct:number}[], asOf:string
 * }} d
 * @param {"dark"|"light"} themeName
 */
export function renderCard(d, themeName) {
  const t = THEMES[themeName];
  const W = 880;
  const H = 186;
  const PAD = 4;
  const BAR_W = W - PAD * 2;

  const stats = [
    { value: fmt(d.total), label: "contributions, 12 months" },
    { value: `${d.share}%`, label: "private" },
    { value: fmt(d.peak.contributionCount), label: `busiest day, ${d.peak.date}` },
    { value: `${d.streak}d`, label: "current streak" },
  ];

  const statCols = stats
    .map((s, i) => {
      const x = PAD + i * 218;
      return `
  <g class="fade d${i + 1}">
    <text class="stat" x="${x}" y="48">${esc(s.value)}</text>
    <text class="lbl" x="${x}" y="68">${esc(s.label)}</text>
  </g>`;
    })
    .join("");

  // One stacked bar across the full width, the way GitHub renders a repo's
  // language breakdown. Segments below 1% are still drawn so the bar sums to
  // the same total the legend describes.
  let cursor = PAD;
  const segments = d.languages
    .map((l, i) => {
      const w = (l.pct / 100) * BAR_W;
      const seg = `
    <rect class="seg s${i + 1}" x="${cursor.toFixed(1)}" y="0" width="${w.toFixed(1)}" height="10" fill="${colorFor(l.name, i, t.accent)}" />`;
      cursor += w;
      return seg;
    })
    .join("");

  const rest = W - PAD - cursor;
  const restSeg =
    rest > 0.5
      ? `
    <rect class="seg s0" x="${cursor.toFixed(1)}" y="0" width="${rest.toFixed(1)}" height="10" fill="${t.track}" />`
      : "";

  let lx = PAD;
  const legend = d.languages
    .map((l, i) => {
      const label = `${l.name} ${l.pct.toFixed(1)}%`;
      // 6.15px per character at 12px in this stack, plus dot, gap and padding
      const w = label.length * 6.15 + 34;
      const item = `
  <g class="fade g${i + 1}">
    <circle cx="${(lx + 5).toFixed(1)}" cy="${-4}" r="5" fill="${colorFor(l.name, i, t.accent)}" />
    <text class="leg" x="${(lx + 17).toFixed(1)}" y="0">${esc(label)}</text>
  </g>`;
      lx += w;
      return item;
    })
    .join("");

  const barKeyframes = d.languages
    .map((l, i) => {
      const w = ((l.pct / 100) * BAR_W).toFixed(1);
      return `@keyframes grow${i + 1} { from { width: 0 } to { width: ${w}px } }
    .s${i + 1} { animation: grow${i + 1} .8s cubic-bezier(.16,1,.3,1) ${(0.3 + i * 0.07).toFixed(2)}s backwards }`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Contribution statistics and language breakdown, private repositories included">
  <style>
    .stat { font: 700 32px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: ${t.text}; letter-spacing: -1px }
    .lbl  { font: 400 11.5px system-ui, -apple-system, "Segoe UI", sans-serif; fill: ${t.muted} }
    .leg  { font: 400 12px system-ui, -apple-system, "Segoe UI", sans-serif; fill: ${t.muted} }
    .foot { font: 400 10.5px system-ui, -apple-system, "Segoe UI", sans-serif; fill: ${t.faint} }

    .fade { opacity: 0; animation: fade .55s cubic-bezier(.16,1,.3,1) forwards }
    .d1 { animation-delay: .04s } .d2 { animation-delay: .11s } .d3 { animation-delay: .18s } .d4 { animation-delay: .25s }
    .g1 { animation-delay: .60s } .g2 { animation-delay: .66s } .g3 { animation-delay: .72s }
    .g4 { animation-delay: .78s } .g5 { animation-delay: .84s } .g6 { animation-delay: .90s }
    @keyframes fade { from { opacity: 0; transform: translateY(5px) } to { opacity: 1 } }

    ${barKeyframes}

    @media (prefers-reduced-motion: reduce) {
      .fade { opacity: 1; animation: none }
      .seg { animation: none }
    }
  </style>
${statCols}

  <line x1="${PAD}" y1="94" x2="${W - PAD}" y2="94" stroke="${t.rule}" stroke-width="1" />

  <g transform="translate(0,122)" clip-path="inset(0 round 5)">${segments}${restSeg}
  </g>

  <g transform="translate(0,158)">${legend}
  </g>

  <text class="foot" x="${W - PAD}" y="68" text-anchor="end">private repositories included</text>
</svg>
`;
}
