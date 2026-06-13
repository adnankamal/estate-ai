"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "../../lib/supabaseClient"; 
import jsPDF from "jspdf";
import { createClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{user.email}</p>
    </div>
  );
}

const ReactMarkdown: any = dynamic(() => import("react-markdown"), { ssr: false });
const remarkGfm: any = dynamic(() => import("remark-gfm"), { ssr: false });

const SatelliteMap = dynamic(() => import("../components/SatelliteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center text-xs tracking-widest animate-pulse"
      style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,255,163,0.1)", borderRadius: 8, color: "rgba(0,255,163,0.4)", fontFamily: "monospace" }}>
      [CONNECTING_TO_SATELLITE_UPLINK...]
    </div>
  ),
});

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,wght@0,400;1,400&family=Inter:wght@400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --bg:        #03050E;
    --bg2:       #060D1A;
    --bg3:       #0A1120;
    --border:    rgba(0,255,163,0.10);
    --border-md: rgba(0,255,163,0.20);
    --border-hi: rgba(0,255,163,0.45);
    --em:        #00FFA3;
    --em-dim:    rgba(0,255,163,0.35);
    --em-glow:   rgba(0,255,163,0.15);
    --danger:    #FF4D2E;
    --warn:      #FFB800;
    --ok:        #00C853;
    --text:      #D6F0E4;
    --text-dim:  rgba(214,240,228,0.45);
    --text-faint:rgba(214,240,228,0.22);
    --mono:      'IBM Plex Mono', monospace;
    --display:   'Space Grotesk', sans-serif;
    --serif:     'Newsreader', serif;
  }

  @keyframes aurora-drift-a {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(40px,-25px) scale(1.06); }
  }
  @keyframes aurora-drift-b {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(-45px,30px) scale(1.04); }
  }
  @keyframes aurora-drift-c {
    0%,100% { transform: translate(0,0); }
    50%      { transform: translate(25px,18px); }
  }
  @keyframes scan-sweep {
    0%   { top:0%;   opacity: 0.55; }
    60%  { top:100%; opacity: 0.2;  }
    100% { top:0%;   opacity: 0;    }
  }
  @keyframes cursor-blink {
    0%,49%  { opacity: 1; }
    50%,100%{ opacity: 0; }
  }
  @keyframes stamp-in {
    0%   { transform: scale(2.2) rotate(-12deg); opacity: 0; }
    100% { transform: scale(1)   rotate(-12deg); opacity: 0.85; }
  }
  @keyframes fadeup {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes card-appear {
    from { opacity:0; transform:translateY(18px) scale(0.97); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }
  @keyframes ring-pulse {
    0%,100% { transform:scale(1);    opacity:.3; }
    50%     { transform:scale(1.09); opacity:.08; }
  }
  @keyframes dot-pulse {
    0%,100% { box-shadow: 0 0 5px var(--em); }
    50%     { box-shadow: 0 0 14px var(--em); }
  }
  @keyframes metric-count {
    from { transform:translateY(6px); opacity:0; }
    to   { transform:translateY(0);   opacity:1; }
  }
  @keyframes border-flow {
    0%   { border-color: var(--border); }
    50%  { border-color: var(--border-md); }
    100% { border-color: var(--border); }
  }

  .ea-root { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; }

  /* Grid background */
  .ea-grid-bg {
    background-image:
      linear-gradient(to right,  rgba(0,255,163,0.035) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0,255,163,0.035) 1px, transparent 1px);
    background-size: 52px 52px;
  }

  /* Aurora orbs */
  .ea-aurora { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
  .ea-orb {
    position:absolute; border-radius:50%;
    filter:blur(60px); pointer-events:none;
  }
  .ea-orb-a { width:420px;height:320px; top:5%;  left:8%;  background:radial-gradient(circle,rgba(0,255,163,0.07),transparent 70%); animation:aurora-drift-a 20s ease-in-out infinite; }
  .ea-orb-b { width:360px;height:280px; bottom:5%;right:6%; background:radial-gradient(circle,rgba(0,255,163,0.055),transparent 70%); animation:aurora-drift-b 26s ease-in-out infinite; }
  .ea-orb-c { width:240px;height:200px; top:10%; right:25%; background:radial-gradient(circle,rgba(0,207,255,0.045),transparent 70%); animation:aurora-drift-c 16s ease-in-out infinite; }

  /* Hex corner brackets */
  .ea-panel { position:relative; }
  .ea-panel::before, .ea-panel::after,
  .ea-panel > .ea-corner-b::before,
  .ea-panel > .ea-corner-b::after {
    content:''; position:absolute; width:14px; height:14px; pointer-events:none;
    border-color: var(--em-dim); border-style:solid;
  }
  .ea-panel::before           { top:0;    left:0;  border-width:1.5px 0 0 1.5px; }
  .ea-panel::after            { top:0;    right:0; border-width:1.5px 1.5px 0 0; }
  .ea-panel > .ea-corner-b::before { bottom:0; left:0;  border-width:0 0 1.5px 1.5px; position:absolute; content:''; width:14px;height:14px; border-color:var(--em-dim); border-style:solid; pointer-events:none; }
  .ea-panel > .ea-corner-b::after  { bottom:0; right:0; border-width:0 1.5px 1.5px 0; position:absolute; content:''; width:14px;height:14px; border-color:var(--em-dim); border-style:solid; pointer-events:none; }

  /* Scan line */
  .ea-scan-line {
    position:absolute; left:0; right:0; height:1px;
    background:linear-gradient(to right,transparent,var(--em) 30%,var(--em) 70%,transparent);
    opacity:0;
  }
  .ea-scan-active { opacity:.45; animation:scan-sweep 2.2s ease-in-out infinite; }

  /* Card glass */
  .ea-glass {
    background:rgba(6,13,26,0.75);
    backdrop-filter:blur(20px);
    -webkit-backdrop-filter:blur(20px);
    border:1px solid var(--border);
    border-radius:12px;
    transition:border-color .3s, box-shadow .3s;
  }
  .ea-glass:hover { border-color:var(--border-md); }
  .ea-glass-focus { border-color:var(--border-hi) !important; box-shadow:0 0 0 3px var(--em-glow); }

  /* Input */
  .ea-input {
    width:100%; background:rgba(0,0,0,0.45);
    border:1px solid rgba(0,255,163,0.12);
    border-radius:7px; padding:10px 14px;
    color:var(--em); font-family:var(--mono); font-size:12px;
    letter-spacing:.04em; outline:none;
    transition:border-color .25s, box-shadow .25s;
  }
  .ea-input::placeholder { color:rgba(0,255,163,0.2); }
  .ea-input:focus {
    border-color:rgba(0,255,163,0.5);
    box-shadow:0 0 0 3px var(--em-glow), inset 0 0 16px rgba(0,255,163,0.03);
  }

  /* Buttons */
  .ea-btn-primary {
    background:linear-gradient(135deg,rgba(0,175,107,.9),rgba(0,255,163,.8));
    color:var(--bg); font-family:var(--display); font-weight:700;
    font-size:10px; letter-spacing:.2em; text-transform:uppercase;
    border:1px solid rgba(0,255,163,.35); border-radius:7px;
    padding:11px 18px; cursor:pointer;
    transition:all .25s;
    box-shadow:0 0 22px rgba(0,255,163,.18);
  }
  .ea-btn-primary:hover { box-shadow:0 0 38px rgba(0,255,163,.35); }
  .ea-btn-primary:active { transform:scale(.99); }
  .ea-btn-primary:disabled { opacity:.35; cursor:not-allowed; }

  .ea-btn-ghost {
    background:rgba(0,255,163,0.06); color:rgba(0,255,163,0.55);
    border:1px solid var(--border); border-radius:7px;
    font-family:var(--mono); font-size:9px; letter-spacing:.2em; text-transform:uppercase;
    padding:8px 14px; cursor:pointer; transition:all .2s;
  }
  .ea-btn-ghost:hover { background:rgba(0,255,163,0.11); border-color:var(--border-md); color:var(--em); }
  .ea-btn-ghost:disabled { opacity:.3; cursor:not-allowed; }

  .ea-btn-danger {
    background:rgba(255,77,46,0.08); color:rgba(255,77,46,0.7);
    border:1px solid rgba(255,77,46,0.25); border-radius:7px;
    font-family:var(--mono); font-size:9px; letter-spacing:.2em; text-transform:uppercase;
    padding:8px 14px; cursor:pointer; transition:all .2s;
  }
  .ea-btn-danger:hover { background:rgba(255,77,46,0.16); color:#FF4D2E; border-color:rgba(255,77,46,.5); }

  /* Labels */
  .ea-label {
    font-family:var(--mono); font-size:8.5px; letter-spacing:.28em;
    text-transform:uppercase; color:var(--text-faint);
  }

  /* Sidebar nav */
  .ea-nav-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 14px; border-left:2px solid transparent;
    cursor:pointer; transition:all .2s; border-radius:0 6px 6px 0;
    font-family:var(--display); font-size:10px; font-weight:700;
    letter-spacing:.12em; text-transform:uppercase;
    color:var(--text-faint); width:100%; text-align:left;
  }
  .ea-nav-item:hover  { color:var(--text-dim); background:rgba(0,255,163,0.04); border-left-color:var(--border); }
  .ea-nav-item.active { color:var(--em); background:rgba(0,255,163,0.07); border-left-color:var(--em); }
  .ea-nav-icon { font-size:13px; opacity:.6; }

  /* Metric cards */
  .ea-metric {
    display:flex; flex-direction:column; padding:14px 16px;
    border-right:1px solid var(--border);
    transition:background .2s; cursor:default;
  }
  .ea-metric:last-child { border-right:none; }
  .ea-metric:hover { background:rgba(0,255,163,0.04); }
  .ea-metric-value {
    font-family:var(--mono); font-size:22px; font-weight:700;
    line-height:1; animation:metric-count .4s ease-out;
  }

  /* Terminal log */
  .ea-terminal-line {
    font-family:var(--mono); font-size:8px; letter-spacing:.05em;
    border-left:1px solid var(--border); padding:.25rem .5rem;
    color:var(--text-faint); transition:color .2s;
  }
  .ea-terminal-line:hover { color:var(--text-dim); }
  .ea-terminal-time { color:var(--em-dim); }

  /* Message prose */
  .ea-prose h3 { color:var(--text); font-family:var(--display); font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:.08em; border-left:2px solid var(--em); padding-left:.5rem; margin:1rem 0 .5rem; }
  .ea-prose p  { color:var(--text); opacity:.7; font-family:var(--serif); font-size:12px; line-height:1.65; margin-bottom:.7rem; }
  .ea-prose strong { color:var(--em); font-family:var(--display); font-weight:700; }
  .ea-prose ul { list-style:none; padding-left:0; }
  .ea-prose li { padding-left:1rem; position:relative; margin-bottom:.25rem; font-size:11px; opacity:.65; font-family:var(--mono); }
  .ea-prose li::before { content:"▸"; position:absolute; left:0; color:var(--em); opacity:.6; }

  /* Score bar */
  .ea-score-bar { height:3px; background:rgba(0,255,163,0.1); border-radius:2px; position:relative; }
  .ea-score-fill { position:absolute; height:100%; border-radius:2px; background:linear-gradient(to right,var(--ok),var(--warn),var(--danger)); transition:width .8s cubic-bezier(.22,1,.36,1); }

  /* Signal bars */
  .ea-signal { display:flex; align-items:flex-end; gap:3px; height:14px; }
  .ea-signal-bar { width:4px; border-radius:2px; background:rgba(0,255,163,0.15); transition:background .3s, height .3s; }

  /* Status dot */
  .ea-dot { width:6px; height:6px; border-radius:50%; background:var(--em); animation:dot-pulse 2s ease-in-out infinite; }
  .ea-dot-warn { background:var(--warn); }
  .ea-dot-danger { background:var(--danger); }

  /* Stamp */
  @keyframes stamp-drop { 0%{transform:scale(2) rotate(-12deg);opacity:0} 100%{transform:scale(1) rotate(-12deg);opacity:.82} }
  .ea-stamp-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; z-index:50; }
  .ea-stamp { border:3px dashed currentColor; padding:10px 22px; font-weight:700; letter-spacing:.12em; font-size:18px; text-transform:uppercase; font-family:var(--display); animation:stamp-drop .35s cubic-bezier(.34,1.56,.64,1) both; }

  /* Dark pool card */
  .ea-dp-card { border-radius:10px; overflow:hidden; transition:border-color .2s; }
  .ea-dp-card:hover { border-color:rgba(255,77,46,0.5) !important; }

  /* Scrollbar */
  .ea-scroll::-webkit-scrollbar { width:3px; }
  .ea-scroll::-webkit-scrollbar-track { background:transparent; }
  .ea-scroll::-webkit-scrollbar-thumb { background:rgba(0,255,163,0.15); border-radius:2px; }
  .ea-scroll-none::-webkit-scrollbar { display:none; }

  /* Collapse animation */
  .ea-fadeup { animation:fadeup .5s ease-out both; }
  .ea-card-appear { animation:card-appear .55s cubic-bezier(.22,1,.36,1) both; }

  /* Origin badge variants */
  .ea-origin-verified { background:rgba(0,200,83,0.1); color:#00C853; border-color:rgba(0,200,83,0.35); }
  .ea-origin-web      { background:rgba(255,184,0,0.1);  color:#FFB800; border-color:rgba(255,184,0,0.35); }
  .ea-origin-ai       { background:rgba(255,77,46,0.1);  color:#FF4D2E; border-color:rgba(255,77,46,0.35); }
  .ea-origin-demo     { background:rgba(130,80,255,0.1); color:#9B59FF; border-color:rgba(130,80,255,0.35); }
  .ea-origin-none     { background:rgba(100,100,100,0.1);color:#888;    border-color:rgba(150,150,150,0.25); }
`;

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface DataOrigin {
  source: "LOCAL_REGISTRY" | "HYBRID_WEB_SCRAPE" | "AI_ESTIMATE" | "DEMO_MODE" | "INSUFFICIENT";
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  sourcesCount: number;
  lastUpdated: string;
  isDemoMode: boolean;
  fallbackReason?: string;
}

const ORIGIN_CONFIG: Record<string, { cls: string; icon: string; label: string }> = {
  LOCAL_REGISTRY:    { cls: "ea-origin-verified", icon: "✓", label: "VERIFIED DATA" },
  HYBRID_WEB_SCRAPE: { cls: "ea-origin-web",      icon: "⚠", label: "WEB SOURCES"  },
  AI_ESTIMATE:       { cls: "ea-origin-ai",        icon: "✗", label: "AI ESTIMATE"  },
  DEMO_MODE:         { cls: "ea-origin-demo",       icon: "◈", label: "DEMO DATA"   },
  INSUFFICIENT:      { cls: "ea-origin-none",       icon: "?", label: "NO DATA"     },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function useClientOnly() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

function getScoreColor(v: number | string): string {
  if (v === "N/A") return "#FFB800";
  if (typeof v !== "number") return "#FF4D2E";
  return v >= 7 ? "#00C853" : v >= 4 ? "#FFB800" : "#FF4D2E";
}
function getVarianceColor(v: number | string): string {
  if (v === "N/A" || typeof v !== "number") return "#FFB800";
  return v < 0 ? "#FF4D2E" : v > 0 ? "#00C853" : "#D6F0E4";
}

// ─── AURORA BACKGROUND ───────────────────────────────────────────────────────
function AuroraBg() {
  return (
    <div className="ea-aurora ea-grid-bg" style={{ position: "fixed", inset: 0, zIndex: 0 }}>
      <div className="ea-orb ea-orb-a" />
      <div className="ea-orb ea-orb-b" />
      <div className="ea-orb ea-orb-c" />
      {/* vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #03050E 100%)" }} />
    </div>
  );
}

// ─── DATA ORIGIN BADGE ───────────────────────────────────────────────────────
function DataOriginBadge({ origin }: { origin: DataOrigin }) {
  const cfg = ORIGIN_CONFIG[origin.source] || ORIGIN_CONFIG.INSUFFICIENT;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border ${cfg.cls}`}
      style={{ fontFamily: "var(--mono)", fontSize: 9, letterSpacing: ".18em" }}>
      <span>{cfg.icon}</span>
      <span style={{ fontWeight: 700 }}>{cfg.label}</span>
      <span style={{ opacity: .4 }}>|</span>
      <span>{origin.confidence} CONFIDENCE</span>
      {origin.sourcesCount > 0 && <><span style={{ opacity: .4 }}>|</span><span>{origin.sourcesCount} sources</span></>}
      {origin.isDemoMode && <span style={{ color: "#9B59FF", fontWeight: 700 }}>[DEMO]</span>}
    </div>
  );
}

// ─── STAMP OVERLAY ───────────────────────────────────────────────────────────
function StampOverlay({ verdict, visible }: { verdict: string; visible: boolean }) {
  if (!visible) return null;
  const MAP: Record<string, { text: string; color: string }> = {
    PRIME_ASSET:       { text: "PRIME ASSET // VERIFIED", color: "#FFB800" },
    HIGH_YIELD:        { text: "HIGH YIELD // CONFIRMED", color: "#00C853" },
    REJECT:            { text: "REJECT // RISK ALERT",    color: "#FF4D2E" },
    HOLD:              { text: "HOLD // PENDING REVIEW",  color: "#888"    },
    INSUFFICIENT_DATA: { text: "NO DATA // VERIFY",       color: "#FF4D2E" },
  };
  const s = MAP[verdict] || MAP.HOLD;
  return (
    <div className="ea-stamp-overlay">
      <div className="ea-stamp" style={{ color: s.color, borderColor: s.color }}>{s.text}</div>
    </div>
  );
}

// ─── EVIDENCE CARD ───────────────────────────────────────────────────────────
function EvidenceCard({ title, children, stamp, style = {} }: {
  title: string; children: React.ReactNode; stamp?: string; style?: React.CSSProperties;
}) {
  const [showStamp, setShowStamp] = useState(false);
  useEffect(() => {
    if (stamp && stamp !== "HOLD" && stamp !== "INSUFFICIENT_DATA") {
      setShowStamp(true);
      const t = setTimeout(() => setShowStamp(false), 2500);
      return () => clearTimeout(t);
    }
  }, [stamp]);
  return (
    <div className="ea-glass ea-panel ea-card-appear" style={{ overflow: "hidden", position: "relative", ...style }}>
      <div className="ea-corner-b" />
      {/* header */}
      <div style={{ padding: "10px 14px 10px", borderBottom: "1px solid rgba(0,255,163,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="ea-label" style={{ fontSize: 8, letterSpacing: ".22em" }}>{title}</span>
        <div className="ea-dot" style={{ width: 5, height: 5 }} />
      </div>
      <div style={{ padding: "14px" }}>{children}</div>
      <StampOverlay verdict={stamp || ""} visible={showStamp} />
    </div>
  );
}

// ─── METRIC COUNTER ──────────────────────────────────────────────────────────
function MetricCounter({ label, value, suffix = "", color = "var(--text)", isNA = false }: {
  label: string; value: string | number; suffix?: string; color?: string; isNA?: boolean;
}) {
  const [display, setDisplay] = useState("—");
  const mounted = useClientOnly();
  useEffect(() => {
    if (!mounted) return;
    if (isNA || value === "N/A" || value === null || value === undefined) { setDisplay("—"); return; }
    const target = parseFloat(value.toString().replace(/[^0-9.-]/g, "")) || 0;
    const dur = 1100; const start = performance.now();
    const run = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 4);
      const cur = target * e;
      setDisplay(Number.isInteger(target) ? Math.round(cur).toString() : cur.toFixed(1));
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [value, mounted, isNA]);

  return (
    <div className="ea-metric">
      <span className="ea-label" style={{ marginBottom: 6, display: "block", fontSize: 8 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span className="ea-metric-value" style={{ color: isNA ? "#FFB800" : color }}>
          {mounted ? display : "—"}
        </span>
        {suffix && !isNA && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 9, color, opacity: .4 }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── SIGNAL BARS ─────────────────────────────────────────────────────────────
function SignalBars({ active }: { active: boolean }) {
  const heights = [4, 6, 9, 12];
  return (
    <div className="ea-signal">
      {heights.map((h, i) => (
        <div key={i} className="ea-signal-bar" style={{
          height: h,
          background: active ? (i < 3 ? "var(--em)" : "rgba(0,255,163,0.3)") : "rgba(0,255,163,0.15)",
          transitionDelay: active ? `${i * 55}ms` : "0ms",
        }} />
      ))}
    </div>
  );
}

// ─── TERMINAL LOG ────────────────────────────────────────────────────────────
function TerminalLog({ logs }: { logs: string[] }) {
  const mounted = useClientOnly();
  return (
    <div className="ea-scroll-none" style={{ height: 110, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
      {logs.map((log, i) => (
        <div key={i} className="ea-terminal-line">
          <span className="ea-terminal-time">
            {mounted ? `[${new Date().toLocaleTimeString("en-US", { hour12: false })}]` : "[--:--:--]"}
          </span>{" "}{log}
        </div>
      ))}
    </div>
  );
}

// ─── SCAN LINE ───────────────────────────────────────────────────────────────
function ScanLine({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 40, overflow: "hidden" }}>
      <div style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: "linear-gradient(to right, transparent, rgba(0,255,163,0.6) 30%, rgba(0,255,163,0.6) 70%, transparent)",
        animation: "scan-sweep 2.2s ease-in-out infinite",
      }} />
    </div>
  );
}

// ─── FUTURE SCORE CARD ───────────────────────────────────────────────────────
function FutureScoreCard({ currentScore, futureScore, verdict }: {
  currentScore: number | string; futureScore: number | string; verdict: string;
}) {
  const cur = typeof currentScore === "number" ? currentScore : 0;
  const fut = typeof futureScore === "number" ? futureScore : 0;
  const decay = cur - fut;
  const vCol = verdict.includes("LEGACY") ? "#00C853"
    : verdict.includes("CONDITIONAL") ? "#FFB800"
    : verdict.includes("EXIT")        ? "#FF6B00"
    : verdict.includes("TOXIC")       ? "#FF4D2E" : "#8B0000";
  return (
    <div style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span className="ea-label" style={{ color: "rgba(255,77,46,0.7)", fontSize: 8 }}>20-Year Decay Forecast</span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, color: decay > 3 ? "#FF4D2E" : "#FFB800" }}>
          {decay > 0 ? `-${decay.toFixed(1)} PTS` : "STABLE"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: getScoreColor(cur) }}>{cur.toFixed(1)}</div>
          <div className="ea-label" style={{ marginTop: 3, fontSize: 7 }}>TODAY</div>
        </div>
        <div className="ea-score-bar" style={{ flex: 1 }}>
          <div className="ea-score-fill" style={{ width: `${(fut / 10) * 100}%` }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: getScoreColor(fut) }}>{fut.toFixed(1)}</div>
          <div className="ea-label" style={{ marginTop: 3, fontSize: 7 }}>2046</div>
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: vCol }}>{verdict}</span>
        {decay > 4 && <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#FF4D2E", animation: "dot-pulse 1.5s infinite" }}>⚠ CRITICAL DECAY</span>}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
  const router = useRouter();
  const scrollRef = useRef<any>(null);
  const mounted = useClientOnly();

  const [activeTab, setActiveTab] = useState("description");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [status, setStatus] = useState("SYSTEM_IDLE");
  const [chatInput, setChatInput] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "[INITIALIZING] Sentinel Core v3.3",
    "[OK] Encryption Layer Verified",
  ]);

  const [scoreState, setScoreState] = useState<number | string>(0);
  const [varianceState, setVarianceState] = useState<number | string>(0);
  const [yieldState, setYieldState] = useState<number>(0);
  const [verdictState, setVerdictState] = useState("HOLD");
  const [isFaultActive, setIsFaultActive] = useState(false);
  const [lastStamp, setLastStamp] = useState("");
  const [dataOrigin, setDataOrigin] = useState<DataOrigin | null>(null);
  const [hasRealData, setHasRealData] = useState(false);
  const [darkPoolDeals, setDarkPoolDeals] = useState<any[]>([]);
  const [darkPoolLoading, setDarkPoolLoading] = useState(false);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);
  const [portfolioJson, setPortfolioJson] = useState("");
  const [futureScoreState, setFutureScoreState] = useState<number | null>(null);
  const [futureVerdictState, setFutureVerdictState] = useState("UNKNOWN");
  const [futureEvents, setFutureEvents] = useState<Array<{ year: number; event: string; severity: string }>>([]);

  const [property, setProperty] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);

  const [messages, setMessages] = useState([
    { role: "assistant", content: "### ESTATE AI // SENTINEL CORE\nUplink Established. Provide asset parameters for forensic investment audit." },
  ]);

  // auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/");
      else { setUserEmail(user.email ?? null); setUserId(user.id); }
    });
  }, [router]);

  const addLog = useCallback((msg: string) => {
    const stamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setSystemLogs((p) => [`[${stamp}] ${msg}`, ...p].slice(0, 20));
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    const { data: hist } = await supabase.from("ai_history").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setHistory(hist || []);
    const { data: lds } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(lds || []);
  }, [userId]);

  const fetchDarkPool = useCallback(async () => {
    if (!location) return;
    setDarkPoolLoading(true);
    try {
      const res = await fetch("/api/dark-pool", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location, propertyType: property, investorProfile: "AGGRESSIVE" }) });
      if (res.ok) { const d = await res.json(); setDarkPoolDeals(d.deals || []); addLog(`DARK_POOL_SCAN: ${d.matchesFound} opportunities`); }
    } catch { addLog("DARK_POOL_SCAN_FAILED"); } finally { setDarkPoolLoading(false); }
  }, [location, property, addLog]);

  const handlePortfolioUpload = async () => {
    if (!portfolioJson.trim()) return;
    try {
      const assets = JSON.parse(portfolioJson);
      const res = await fetch("/api/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assets }) });
      if (res.ok) { const d = await res.json(); setPortfolioAnalysis(d); addLog("PORTFOLIO_ANALYSIS_COMPLETE"); }
    } catch { addLog("PORTFOLIO_UPLOAD_ERROR"); }
  };

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading]);

  const generatePDF = useCallback((content: string) => {
    const doc = new jsPDF();
    const id = `AUDIT-${Math.random().toString(36).toUpperCase().slice(2, 9)}`;
    doc.setFillColor(3, 5, 14); doc.rect(0, 0, 210, 297, "F");
    doc.setTextColor(214, 240, 228); doc.setFont("helvetica", "bold"); doc.setFontSize(18);
    doc.text("ESTATE.AI // FORENSIC AUDIT REPORT", 20, 30);
    doc.setDrawColor(0, 255, 163); doc.setLineWidth(0.6); doc.line(20, 37, 190, 37);
    doc.setFontSize(8); doc.setTextColor(0, 255, 163);
    doc.text(`REF: ${id}`, 20, 46); doc.text(`OPERATOR: ${userId?.slice(0, 12) || "ANON"}`, 20, 52);
    doc.setTextColor(214, 240, 228); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text(doc.splitTextToSize(content, 170), 20, 65);
    doc.save(`${id}_REPORT.pdf`);
  }, [userId]);

  const handleAction = async (directPrompt?: string, forceLive = false, event?: any, execType = "AUDIT") => {
    if (event) event.preventDefault();
    const input = directPrompt || chatInput;
    if (!input && !property) return;
    if (loading) return;
    setMessages((p) => [...p, { role: "user", content: input || `Audit: ${property} | ${location} | ${price}` }]);
    setChatInput("");
    setLoading(true);
    setIsFaultActive(false);
    const steps = ["EVIDENCE_GATHERING", "MARKET_CROSS_REF", "VARIANCE_CALCULATION", "YIELD_SIMULATION", "FINAL_VERDICT"];
    let step = 0;
    const iv = setInterval(() => {
      if (step < steps.length) { setStatus(`[${step + 1}/5] ${steps[step]}`); addLog(`PROTOCOL_${steps[step]}`); step++; }
    }, 1500);
    try {
      const res = await fetch("/api/audit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: { propertyType: property, price, location, message: input, userId, forceLive, type: execType, beds, baths } }),
      });
      const rd = await res.json();
      clearInterval(iv);
      if (res.ok) {
        setMessages((p) => [...p, { role: "assistant", content: rd.data }]);
        setStatus("ANALYSIS_VERIFIED"); addLog("FORENSIC_AUDIT_COMPLETE");
        const m = rd?.telemetryMetrics || {};
        const safeScore = m.systemScoreOverride === "N/A" ? "N/A" : parseFloat(m.systemScoreOverride) || 0;
        const safeVar = m.variance === "N/A" ? "N/A" : parseFloat(m.variance) || 0;
        setScoreState(safeScore); setVarianceState(safeVar); setYieldState(parseFloat(m.projectedYield) || 0);
        setVerdictState(m.verdict || "HOLD"); setLastStamp(m.verdict || "HOLD");
        setDataOrigin(rd.dataOrigin || null); setHasRealData(rd.hasRealData || false);
        try {
          const fr = await fetch("/api/future", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location, propertyType: property, price, beds, baths, holdPeriodYears: 20 }) });
          if (fr.ok) { const fd = await fr.json(); setFutureScoreState(fd.futureScore); setFutureVerdictState(fd.futureVerdict); setFutureEvents(fd.criticalEvents || []); addLog(`FUTURE_AUDIT: ${fd.futureVerdict}`); if (fd.futureScore < 4) setIsFaultActive(true); }
        } catch { addLog("FUTURE_AUDIT_UNAVAILABLE"); }
        if ((safeScore !== "N/A" && (safeScore as number) <= 3) || m.verdict === "REJECT") { setIsFaultActive(true); addLog("CRITICAL_RISK_DETECTED"); }
        await fetchData(); fetchDarkPool().catch(console.error);
      } else throw new Error(rd.error || "SERVER_ERROR");
    } catch (err: any) {
      clearInterval(iv); setStatus("UPLINK_CRITICAL_FAILURE"); addLog(`ERROR: ${err.message}`);
    } finally { setLoading(false); }
  };

  const formatVariance = (v: number | string) => {
    if (v === "N/A" || v === null) return "N/A";
    const n = parseFloat(v as string);
    if (isNaN(n)) return "N/A";
    if (Math.abs(n) > 999) return n > 0 ? "+999.9%" : "-999.9%";
    return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
  };

  const evidencePts = hasRealData ? (dataOrigin?.sourcesCount || 0) * 12 + Math.round(((scoreState !== "N/A" ? scoreState : 0) as number) * 2) : 0;

  if (!mounted) {
    return (
      <div style={{ display: "flex", height: "100vh", background: "#03050E", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--mono)", color: "var(--em)", fontSize: 11, letterSpacing: ".25em", animation: "dot-pulse 1.5s infinite" }}>INITIALIZING SENTINEL CORE...</span>
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: "description", label: "Evidence Board",       icon: "◈" },
    { id: "lead",        label: "Acquisition Targets",  icon: "◉" },
    { id: "contract",    label: "Smart Contracts",      icon: "◆" },
    { id: "history",     label: "Case Archive",         icon: "◊" },
    { id: "darkpool",    label: "Dark Pool",            icon: "◉" },
    { id: "portfolio",   label: "Portfolio Intel",      icon: "◆" },
  ];

  // ─ SHARED INPUT STYLE ─
  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,255,163,0.12)",
    borderRadius: 7, padding: "10px 13px", color: "var(--em)", fontFamily: "var(--mono)",
    fontSize: 11, letterSpacing: ".04em", outline: "none",
    transition: "border-color .25s, box-shadow .25s",
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <div className="ea-root" style={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative" }}>
        <AuroraBg />

        {/* global scan line while loading */}
        <ScanLine active={loading} />

        {/* ─────────────────── SIDEBAR ─────────────────── */}
        <aside style={{
          width: 220, flexShrink: 0, position: "relative", zIndex: 20,
          display: "flex", flexDirection: "column",
          background: "rgba(3,5,14,0.85)", backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(0,255,163,0.10)",
        }}>
          {/* logo */}
          <div style={{ padding: "20px 18px 18px", borderBottom: "1px solid rgba(0,255,163,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 3, height: 32, background: "var(--em)", borderRadius: 2, boxShadow: "0 0 10px var(--em)" }} />
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: 17, fontWeight: 700, letterSpacing: ".06em" }}>
                  estate<span style={{ color: "var(--em)" }}>.</span>ai
                </div>
                <div className="ea-label" style={{ fontSize: 7, marginTop: 2 }}>Forensic Intelligence</div>
              </div>
            </div>
          </div>

          {/* nav */}
          <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV_ITEMS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`ea-nav-item${activeTab === t.id ? " active" : ""}`}>
                <span className="ea-nav-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>

          {/* terminal + signout */}
          <div style={{ padding: 12, borderTop: "1px solid rgba(0,255,163,0.08)" }}>
            <div className="ea-glass" style={{ padding: "10px 12px", marginBottom: 10, background: "rgba(0,0,0,0.35)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <div className="ea-dot" style={{ width: 5, height: 5 }} />
                <span className="ea-label" style={{ fontSize: 7, color: "rgba(0,255,163,0.55)" }}>Core Telemetry</span>
              </div>
              <TerminalLog logs={systemLogs} />
            </div>
            <button className="ea-btn-danger" style={{ width: "100%", textAlign: "center" }}
              onClick={() => supabase.auth.signOut().then(() => router.push("/"))}>
              Terminate Session
            </button>
          </div>
        </aside>

        {/* ─────────────────── MAIN ─────────────────── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 10 }}>

          {/* ── HEADER ── */}
          <header style={{
            height: 60, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 24px", borderBottom: "1px solid rgba(0,255,163,0.09)",
            background: "rgba(3,5,14,0.8)", backdropFilter: "blur(16px)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ borderLeft: "2px solid var(--em)", paddingLeft: 12 }}>
                <div className="ea-label" style={{ fontSize: 7, marginBottom: 3 }}>Protocol Status</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: loading ? "#FFB800" : "var(--ok)" }}>
                  <div className="ea-dot" style={{ width: 5, height: 5, background: loading ? "#FFB800" : "var(--ok)" }} />
                  {status}
                </div>
              </div>
              <div style={{ borderLeft: "1px solid rgba(0,255,163,0.1)", paddingLeft: 20 }}>
                <div className="ea-label" style={{ fontSize: 7, marginBottom: 3 }}>Engine</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: ".06em" }}>LLAMA_3.3_FORENSIC</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <SignalBars active={loading} />
              <div style={{ textAlign: "right" }}>
                <div className="ea-label" style={{ fontSize: 7, marginBottom: 2 }}>Operator</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, opacity: .65 }}>{userEmail || "PENDING..."}</div>
              </div>
              <div style={{
                width: 32, height: 32, background: "rgba(0,255,163,0.08)", border: "1px solid rgba(0,255,163,0.2)",
                borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--display)", fontSize: 10, fontWeight: 700, color: "var(--em)",
              }}>S3</div>
            </div>
          </header>

          {/* ── METRICS STRIP ── */}
          <div style={{ flexShrink: 0, display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "rgba(3,5,14,0.75)", borderBottom: "1px solid rgba(0,255,163,0.09)" }}>
            <MetricCounter label="Evidence Points"   value={evidencePts}    suffix="pts"  color="var(--text)"                isNA={!hasRealData} />
            <MetricCounter label="Acquisition Targets" value={leads.length} suffix="active" color="var(--ok)" />
            <MetricCounter label="Forensic Score"    value={scoreState}     suffix="/10"  color={getScoreColor(scoreState)}  isNA={scoreState === "N/A"} />
            <MetricCounter label="Variance Delta"    value={varianceState}  suffix=""     color={getVarianceColor(varianceState)} isNA={varianceState === "N/A"} />
          </div>

          {/* future score banner */}
          {futureScoreState !== null && (
            <div style={{ flexShrink: 0, borderBottom: "1px solid rgba(255,77,46,0.18)", background: "rgba(255,77,46,0.05)" }}>
              <FutureScoreCard currentScore={scoreState} futureScore={futureScoreState} verdict={futureVerdictState} />
            </div>
          )}

          {/* critical events */}
          {futureEvents.length > 0 && (
            <div style={{ flexShrink: 0, padding: "10px 20px", borderBottom: "1px solid rgba(0,255,163,0.09)", background: "rgba(3,5,14,0.7)" }}>
              <div className="ea-label" style={{ fontSize: 7.5, color: "rgba(255,77,46,0.7)", marginBottom: 8 }}>Critical Events Timeline</div>
              <div style={{ display: "flex", gap: 8, overflowX: "auto" }} className="ea-scroll-none">
                {futureEvents.map((e, i) => (
                  <div key={i} className="ea-glass" style={{ flexShrink: 0, padding: "8px 12px", minWidth: 110 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--em)" }}>{e.year}</div>
                    <div style={{ fontSize: 8, opacity: .55, marginTop: 2, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--mono)" }}>{e.event}</div>
                    <div style={{ fontSize: 7.5, fontWeight: 700, marginTop: 4, fontFamily: "var(--mono)", color: e.severity === "CRITICAL" ? "#FF4D2E" : e.severity === "HIGH" ? "#FF6B00" : "#FFB800" }}>{e.severity}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CONTENT SPLIT ── */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

            {/* left panel — only on description tab */}
            {activeTab === "description" && (
              <div style={{
                width: 280, flexShrink: 0, display: "flex", flexDirection: "column",
                borderRight: "1px solid rgba(0,255,163,0.09)",
                background: "rgba(3,5,14,0.7)", backdropFilter: "blur(12px)",
              }}>
                <div className="ea-scroll-none" style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>

                  <EvidenceCard title="Asset Parameters" stamp={lastStamp}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { l: "Asset Classification", v: property, s: setProperty, p: "Villa, Apartment…" },
                        { l: "Capital Valuation",    v: price,    s: setPrice,    p: "AED 13,199,000"   },
                        { l: "Geo Coordinates",      v: location, s: setLocation, p: "Jumeirah Park, Dubai" },
                      ].map((inp, i) => (
                        <div key={i}>
                          <label className="ea-label" style={{ display: "block", marginBottom: 5, fontSize: 7.5 }}>{inp.l}</label>
                          <input
                            className="ea-input" placeholder={inp.p} value={inp.v}
                            onChange={(e) => inp.s(e.target.value)}
                          />
                        </div>
                      ))}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[["Beds", beds, setBeds], ["Baths", baths, setBaths]].map(([lbl, val, set]: any) => (
                          <div key={lbl as string}>
                            <label className="ea-label" style={{ display: "block", marginBottom: 5, fontSize: 7.5 }}>{lbl as string}</label>
                            <input type="number" className="ea-input" value={val as number} onChange={(e) => set(Number(e.target.value) || 1)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </EvidenceCard>

                  {dataOrigin && (
                    <div className="ea-glass" style={{ padding: "10px 12px" }}>
                      <div className="ea-label" style={{ fontSize: 7.5, marginBottom: 6 }}>Data Origin</div>
                      <DataOriginBadge origin={dataOrigin} />
                      {dataOrigin.fallbackReason && (
                        <div style={{ fontFamily: "var(--mono)", fontSize: 8, opacity: .3, marginTop: 6 }}>{dataOrigin.fallbackReason}</div>
                      )}
                    </div>
                  )}

                  <button className="ea-btn-primary" style={{ width: "100%" }}
                    onClick={(e) => handleAction(undefined, false, e, "AUDIT")} disabled={loading}>
                    {loading ? "◉ ANALYSIS RUNNING..." : "◉ INITIATE AUDIT"}
                  </button>

                  {verdictState === "PRIME_ASSET" && (
                    <div className="ea-glass" style={{ padding: "12px", textAlign: "center", borderColor: "rgba(255,184,0,0.3)", background: "rgba(255,184,0,0.05)" }}>
                      <div className="ea-label" style={{ color: "#FFB800", fontSize: 8, marginBottom: 8 }}>Prime Asset Detected</div>
                      <button className="ea-btn-primary" style={{ background: "linear-gradient(135deg,#CC9400,#FFB800)", width: "100%", fontSize: 9 }}
                        onClick={() => setActiveTab("lead")}>Route to Acquisition</button>
                    </div>
                  )}
                </div>

                {/* reality check */}
                <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(0,255,163,0.08)" }}>
                  <div className="ea-label" style={{ color: "rgba(255,77,46,0.65)", marginBottom: 4, fontSize: 7.5, display: "flex", alignItems: "center", gap: 5 }}>
                    <span>◉</span> Reality Check Protocol
                  </div>
                  <p style={{ fontFamily: "var(--serif)", fontSize: 10, opacity: .35, lineHeight: 1.5, marginBottom: 8 }}>
                    Enforce strict discrepancy scans over current evaluation matrices.
                  </p>
                  <button className="ea-btn-danger" style={{ width: "100%" }}
                    onClick={(e) => handleAction("Conduct a mandatory investment reality check. Identify all risks, tax discrepancies, and overpayment flags.", true, e, "REALITY_CHECK")}>
                    ACTIVATE RISK MITIGATION
                  </button>
                </div>
              </div>
            )}

            {/* ── RIGHT / MAIN CONTENT ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div ref={scrollRef} className="ea-scroll" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

                {/* ── EVIDENCE BOARD ── */}
                {activeTab === "description" && (
                  <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
                    {dataOrigin && messages.length > 1 && (
                      <div className="ea-fadeup" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 14, borderBottom: "1px solid rgba(0,255,163,0.08)" }}>
                        <DataOriginBadge origin={dataOrigin} />
                        <span style={{ fontFamily: "var(--mono)", fontSize: 9, opacity: .35 }}>{new Date(dataOrigin.lastUpdated).toLocaleString()}</span>
                      </div>
                    )}

                    {messages.map((m, i) => (
                      <div key={i} className="ea-fadeup" style={{ animationDelay: `${i * 0.08}s`, maxWidth: m.role === "user" ? 560 : 760, marginLeft: m.role === "user" ? "auto" : 0 }}>
                        <div className="ea-glass" style={{
                          padding: "16px 18px", position: "relative",
                          borderColor: m.role === "user" ? "rgba(0,255,163,0.08)" : "rgba(0,255,163,0.12)",
                          background: m.role === "user" ? "rgba(0,0,0,0.35)" : "rgba(6,13,26,0.8)",
                        }}>
                          {m.role === "assistant" && i > 0 && (
                            <div style={{ position: "absolute", top: -6, left: -6, width: 13, height: 13, background: "var(--em)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 7, color: "var(--bg)", fontWeight: 700 }}>!</span>
                            </div>
                          )}
                          <div className="ea-prose">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                          </div>
                          {m.role === "assistant" && i > 0 && (
                            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(0,255,163,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span className="ea-label" style={{ fontSize: 7.5 }}>Sentinel_v3.3 // Verified</span>
                              <button className="ea-btn-ghost" onClick={() => generatePDF(m.content)}>Export PDF</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {loading && (
                      <div className="ea-glass" style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                        {[100, 85, 65].map((w, i) => (
                          <div key={i} style={{ height: 8, background: "rgba(0,255,163,0.08)", borderRadius: 4, width: `${w}%`, animation: `dot-pulse 1.5s ${i * 0.1}s infinite` }} />
                        ))}
                        <span className="ea-label" style={{ fontSize: 7.5, color: "rgba(0,255,163,0.5)", marginTop: 4, animation: "dot-pulse 1.5s infinite" }}>Forensic analysis in progress...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── ACQUISITION TARGETS ── */}
                {activeTab === "lead" && (
                  <div style={{ maxWidth: 860, margin: "0 auto" }}>
                    <h2 style={{ fontFamily: "var(--display)", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", borderLeft: "2px solid var(--ok)", paddingLeft: 12, marginBottom: 20, color: "var(--ok)" }}>
                      Acquisition Targets ({leads.length})
                    </h2>
                    {!leads.length ? (
                      <div className="ea-glass" style={{ padding: "32px", textAlign: "center" }}>
                        <p className="ea-label" style={{ fontSize: 9 }}>No acquisition targets in system pool.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {leads.map((l, i) => (
                          <div key={i} className="ea-glass ea-fadeup" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", animationDelay: `${i * 0.06}s` }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,200,83,0.3)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,255,163,0.10)")}>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ok)", boxShadow: "0 0 10px var(--ok)" }} />
                              <div>
                                <p style={{ fontFamily: "var(--mono)", fontSize: 8.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ok)", marginBottom: 3 }}>{l.audit_verdict}</p>
                                <p style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700 }}>{l.location_data} — <span style={{ opacity: .4 }}>{l.target_value}</span></p>
                              </div>
                            </div>
                            <button className="ea-btn-ghost" onClick={() => generatePDF(l.output_text || "")}>Extract</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── SMART CONTRACTS ── */}
                {activeTab === "contract" && (
                  <div style={{ maxWidth: 860, margin: "0 auto" }}>
                    <h2 style={{ fontFamily: "var(--display)", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", borderLeft: "2px solid var(--em)", paddingLeft: 12, marginBottom: 20 }}>
                      Smart Contract Protocols
                    </h2>
                    <div className="ea-glass" style={{ padding: "20px", borderColor: "rgba(0,255,163,0.2)", background: "rgba(0,255,163,0.04)" }}>
                      <span className="ea-label" style={{ fontSize: 8.5, color: "var(--em)", display: "block", marginBottom: 8 }}>Escrow Engine Status</span>
                      <p style={{ fontFamily: "var(--serif)", fontSize: 12, opacity: .5, lineHeight: 1.6 }}>
                        System awaiting formal parameter extraction confirmation to allocate smart pipeline escrow deployments.
                      </p>
                    </div>
                  </div>
                )}

                {/* ── CASE ARCHIVE ── */}
                {activeTab === "history" && (
                  <div style={{ maxWidth: 860, margin: "0 auto" }}>
                    <h2 style={{ fontFamily: "var(--display)", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", borderLeft: "2px solid rgba(214,240,228,0.4)", paddingLeft: 12, marginBottom: 20 }}>
                      Case Archive ({history.length})
                    </h2>
                    {!history.length ? (
                      <div className="ea-glass" style={{ padding: 32, textAlign: "center" }}>
                        <p className="ea-label" style={{ fontSize: 9 }}>Historical query stack is empty.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {history.map((h, i) => (
                          <div key={i} className="ea-glass ea-fadeup" style={{ padding: "18px", position: "relative", animationDelay: `${i * 0.05}s` }}>
                            <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 12, alignItems: "center" }}>
                              <span style={{ fontFamily: "var(--mono)", fontSize: 8.5, opacity: .3 }}>{new Date(h.created_at).toLocaleDateString()}</span>
                              <button className="ea-btn-ghost" onClick={() => generatePDF(h.output_text)}>Download</button>
                            </div>
                            <div className="ea-prose" style={{ marginTop: 4 }}>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{h.output_text}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── DARK POOL ── */}
                {activeTab === "darkpool" && (
                  <div style={{ maxWidth: 860, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <h2 style={{ fontFamily: "var(--display)", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", borderLeft: "2px solid #FF4D2E", paddingLeft: 12, color: "#FF4D2E" }}>
                        Dark Pool ({darkPoolDeals.length})
                      </h2>
                      <button className="ea-btn-danger" onClick={fetchDarkPool} disabled={darkPoolLoading}>
                        {darkPoolLoading ? "SCANNING..." : "◉ RE-SCAN"}
                      </button>
                    </div>
                    {!darkPoolDeals.length ? (
                      <div className="ea-glass" style={{ padding: 40, textAlign: "center" }}>
                        <div style={{ fontSize: 36, opacity: .15, marginBottom: 12 }}>🔒</div>
                        <p className="ea-label" style={{ fontSize: 9, marginBottom: 6 }}>No off-market opportunities detected.</p>
                        <p className="ea-label" style={{ fontSize: 8, opacity: .5 }}>Enter location to scan developer CRMs, court auctions, and broker networks.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {darkPoolDeals.map((deal, i) => (
                          <div key={deal.id} className="ea-glass ea-dp-card ea-fadeup" style={{ border: "1px solid rgba(255,77,46,0.2)", background: "rgba(255,77,46,0.04)", animationDelay: `${i * 0.07}s`, position: "relative" }}>
                            <div style={{ position: "absolute", top: 0, right: 0, padding: "5px 12px", background: "#FF4D2E", borderRadius: "0 10px 0 6px", fontFamily: "var(--mono)", fontSize: 8, fontWeight: 700, color: "var(--bg)", letterSpacing: ".15em" }}>
                              {deal.type}
                            </div>
                            <div style={{ padding: "16px" }}>
                              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                                <div style={{ width: 40, height: 40, background: "rgba(255,77,46,0.1)", border: "1px solid rgba(255,77,46,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                                  {deal.type === "PRE_LAUNCH" ? "🚀" : deal.type === "DISTRESSED" ? "⚡" : "🔥"}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontFamily: "var(--mono)", fontSize: 8.5, fontWeight: 700, color: "#FF4D2E", letterSpacing: ".1em" }}>{deal.id}</span>
                                    <span style={{ opacity: .25, fontSize: 8 }}>|</span>
                                    <span style={{ fontFamily: "var(--mono)", fontSize: 8, opacity: .3, textTransform: "uppercase" }}>{deal.source}</span>
                                  </div>
                                  <p style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {deal.location} — <span style={{ opacity: .4 }}>{deal.propertyType}</span>
                                  </p>
                                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                    <span style={{ padding: "4px 10px", background: "#FF4D2E", color: "var(--bg)", fontFamily: "var(--mono)", fontSize: 9.5, fontWeight: 700, borderRadius: 5 }}>
                                      {deal.discount}% OFF MARKET
                                    </span>
                                    {deal.minInvestment && <span style={{ fontFamily: "var(--mono)", fontSize: 8.5, opacity: .5 }}>Min: {deal.minInvestment}</span>}
                                  </div>
                                  {deal.reason && <p style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#FF4D2E", opacity: .8 }}>{deal.reason}</p>}
                                  {deal.expiresAt && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
                                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF4D2E", animation: "dot-pulse 1.5s infinite" }} />
                                      <span style={{ fontFamily: "var(--mono)", fontSize: 8, color: "#FF4D2E", fontWeight: 700 }}>
                                        Expires {new Date(deal.expiresAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(255,77,46,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
                              <span className="ea-label" style={{ fontSize: 7 }}>Off-Market Access Required</span>
                              <button className="ea-btn-danger" style={{ padding: "5px 12px", fontSize: 8 }}>REQUEST ACCESS</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── PORTFOLIO INTEL ── */}
                {activeTab === "portfolio" && (
                  <div style={{ maxWidth: 860, margin: "0 auto" }}>
                    <h2 style={{ fontFamily: "var(--display)", fontSize: 12, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", borderLeft: "2px solid var(--ok)", paddingLeft: 12, marginBottom: 20, color: "var(--ok)" }}>
                      Portfolio Intelligence
                    </h2>
                    {!portfolioAnalysis ? (
                      <div className="ea-glass" style={{ padding: 28 }}>
                        <p className="ea-label" style={{ fontSize: 8.5, marginBottom: 12 }}>Upload portfolio JSON for analysis</p>
                        <textarea
                          value={portfolioJson}
                          onChange={(e) => setPortfolioJson(e.target.value)}
                          placeholder='[{"id":"V1","location":"dubai","propertyType":"villa","currentValue":5000000,"purchasePrice":4000000,"yield":5.5,"riskScore":4}]'
                          rows={5}
                          style={{
                            ...inputStyle, height: "auto", resize: "vertical", marginBottom: 12,
                            color: "var(--text)", background: "rgba(0,0,0,0.5)", fontSize: 10, lineHeight: 1.5,
                          }}
                        />
                        <button className="ea-btn-primary" onClick={handlePortfolioUpload}>ANALYZE PORTFOLIO</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {/* metrics grid */}
                        <div className="ea-glass" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", overflow: "hidden" }}>
                          {[
                            { l: "Total Value", v: `$${(portfolioAnalysis.portfolioMetrics.totalValue / 1e6).toFixed(1)}M`, c: "var(--text)" },
                            { l: "Avg Yield",   v: `${portfolioAnalysis.portfolioMetrics.avgYield.toFixed(1)}%`, c: "var(--ok)" },
                            { l: "Risk Score",  v: `${portfolioAnalysis.portfolioMetrics.avgRisk.toFixed(1)}/10`, c: portfolioAnalysis.portfolioMetrics.avgRisk > 6 ? "#FF4D2E" : "#FFB800" },
                            { l: "Diversification", v: `${portfolioAnalysis.portfolioMetrics.diversificationScore.toFixed(1)}/10`, c: "var(--ok)" },
                          ].map((m, i) => (
                            <div key={i} style={{ padding: "14px 16px", borderRight: i < 3 ? "1px solid rgba(0,255,163,0.1)" : "none" }}>
                              <div className="ea-label" style={{ fontSize: 7.5, marginBottom: 6 }}>{m.l}</div>
                              <div style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: m.c }}>{m.v}</div>
                            </div>
                          ))}
                        </div>
                        {/* rebalance signals */}
                        {portfolioAnalysis.rebalanceSignals.length > 0 && (
                          <div className="ea-glass" style={{ borderColor: "rgba(255,77,46,0.2)", background: "rgba(255,77,46,0.04)", padding: "14px 16px" }}>
                            <div className="ea-label" style={{ fontSize: 8, color: "rgba(255,77,46,0.7)", marginBottom: 10 }}>
                              Rebalance Signals ({portfolioAnalysis.rebalanceSignals.length})
                            </div>
                            {portfolioAnalysis.rebalanceSignals.map((sig: any, i: number) => (
                              <div key={i} className="ea-glass" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 6, background: "rgba(0,0,0,0.3)" }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: sig.action === "SELL" ? "#FF4D2E" : sig.action === "REDUCE" ? "#FF6B00" : "#FFB800", flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", gap: 6, marginBottom: 2 }}>
                                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, fontWeight: 700, textTransform: "uppercase" }}>{sig.action}</span>
                                    <span style={{ fontFamily: "var(--mono)", fontSize: 8, opacity: .35 }}>{sig.assetId}</span>
                                  </div>
                                  <p style={{ fontFamily: "var(--mono)", fontSize: 8, opacity: .5 }}>{sig.reason}</p>
                                </div>
                                <span style={{ padding: "3px 8px", borderRadius: 4, fontFamily: "var(--mono)", fontSize: 7.5, fontWeight: 700, background: sig.urgency === "IMMEDIATE" ? "#FF4D2E" : sig.urgency === "30_DAYS" ? "#FF6B00" : "#FFB800", color: "var(--bg)" }}>
                                  {sig.urgency}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── CHAT INPUT ── */}
              {activeTab === "description" && (
                <div style={{ flexShrink: 0, padding: "12px 20px", borderTop: "1px solid rgba(0,255,163,0.09)", background: "rgba(3,5,14,0.85)", backdropFilter: "blur(16px)", position: "relative" }}>
                  <div className="ea-scan-line" id="chat-scan" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
                  <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onFocus={(e) => {
                          setInputFocused(true);
                          (e.target.closest("div")?.previousSibling as HTMLElement)?.classList?.add("ea-scan-active");
                        }}
                        onBlur={(e) => {
                          setInputFocused(false);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleAction(undefined, false, e, "CHAT_COMMAND")}
                        placeholder="Enter forensic command…"
                        className="ea-input"
                        style={{ paddingRight: 38 }}
                      />
                      {inputFocused && (
                        <div style={{
                          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                          width: 2, height: 14, background: "var(--em)", borderRadius: 1,
                          animation: "cursor-blink 1s step-end infinite",
                        }} />
                      )}
                    </div>
                    <button className="ea-btn-primary"
                      onClick={(e) => handleAction(undefined, false, e, "CHAT_COMMAND")}
                      disabled={loading || !chatInput.trim()}
                      style={{ whiteSpace: "nowrap", padding: "11px 22px" }}>
                      TRANSMIT
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}