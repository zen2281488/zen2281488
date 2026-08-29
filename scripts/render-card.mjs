/**
 * Renders the Signal card as a self-hosted SVG.
 *
 * Third-party stat widgets only see public repositories. With 99% of the work
 * in private repos they reported a Java/Python/C# profile built from old
 * practice projects, which contradicts everything else on the page. This card
 * is generated from the GraphQL API with a user token, so private repositories
 * are counted and the numbers agree with the contribution calendar.
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

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fmt = (n) => n.toLocaleString("en-US").replace(/,/g, " ");

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
  const H = 300;

  const stats = [
    { value: fmt(d.total), label: "contributions, last 12 months" },
    { value: `${d.share}%`, label: "in private repositories" },
    { value: fmt(d.peak.contributionCount), label: `busiest day (${d.peak.date})` },
    { value: `${d.streak}d`, label: "current streak" },
  ];

  const statCols = stats
    .map((s, i) => {
      const x = 4 + i * 214;
      return `
  <g class="fade d${i + 1}">
    <text class="stat" x="${x}" y="52">${esc(s.value)}</text>
    <text class="lbl" x="${x}" y="74">${esc(s.label)}</text>
  </g>`;
    })
    .join("");

  const barW = 872;
  const langRows = d.languages
    .map((l, i) => {
      const y = 134 + i * 24;
      const w = Math.max(2, Math.round((l.pct / 100) * 300));
      return `
  <g class="fade l${i + 1}">
    <text class="lang" x="4" y="${y + 4}">${esc(l.name)}</text>
    <rect class="track" x="150" y="${y - 7}" width="300" height="10" rx="5" />
    <rect class="bar b${i + 1}" x="150" y="${y - 7}" width="${w}" height="10" rx="5" />
    <text class="pct" x="462" y="${y + 4}">${l.pct.toFixed(1)}%</text>
  </g>`;
    })
    .join("");

  const barKeyframes = d.languages
    .map((l, i) => {
      const w = Math.max(2, Math.round((l.pct / 100) * 300));
      return `@keyframes grow${i + 1} { from { width: 0 } to { width: ${w}px } }
    .b${i + 1} { animation: grow${i + 1} .9s cubic-bezier(.16,1,.3,1) ${0.35 + i * 0.08}s backwards }`;
    })
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Contribution and language statistics including private repositories">
  <style>
    .stat { font: 700 30px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: ${t.text}; letter-spacing: -.5px }
    .lbl  { font: 400 11px system-ui, -apple-system, "Segoe UI", sans-serif; fill: ${t.muted} }
    .head { font: 500 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: ${t.muted}; letter-spacing: 1.2px }
    .lang { font: 500 12px system-ui, -apple-system, "Segoe UI", sans-serif; fill: ${t.text} }
    .pct  { font: 400 11px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: ${t.muted} }
    .foot { font: 400 10.5px system-ui, -apple-system, "Segoe UI", sans-serif; fill: ${t.faint} }
    .track { fill: ${t.track} }
    .bar { fill: ${t.accent} }

    .fade { opacity: 0; animation: fade .6s cubic-bezier(.16,1,.3,1) forwards }
    .d1 { animation-delay: .05s } .d2 { animation-delay: .13s } .d3 { animation-delay: .21s } .d4 { animation-delay: .29s }
    .l1 { animation-delay: .35s } .l2 { animation-delay: .43s } .l3 { animation-delay: .51s }
    .l4 { animation-delay: .59s } .l5 { animation-delay: .67s } .l6 { animation-delay: .75s }
    @keyframes fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 1 } }

    ${barKeyframes}

    @media (prefers-reduced-motion: reduce) {
      .fade { opacity: 1; animation: none }
      .bar { animation: none }
    }
  </style>
${statCols}

  <line x1="4" y1="98" x2="${barW}" y2="98" stroke="${t.rule}" stroke-width="1" />
  <text class="head fade d4" x="4" y="116">LANGUAGES BY VOLUME, PRIVATE REPOSITORIES INCLUDED</text>
${langRows}

  <text class="foot" x="4" y="${H - 8}">Generated ${esc(d.asOf)} from the GitHub API. Third-party widgets see public repos only, which is about 1% of this work.</text>
</svg>
`;
}
