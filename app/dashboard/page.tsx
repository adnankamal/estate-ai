"use client"; 

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";

// Dynamic Imports for Heavy Markdown Processing to prevent SSR mismatches
const ReactMarkdown: any = dynamic(() => import("react-markdown"), { ssr: false });
const remarkGfm: any = dynamic(() => import("remark-gfm"), { ssr: false });

// Dynamic Import for Satellite Component with Absolute Fallback Boundary
const SatelliteMap = dynamic(() => import("../components/SatelliteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-950 border border-gray-800 flex items-center justify-center text-gray-500 font-mono text-xs tracking-widest animate-pulse rounded-lg">
      [CONNECTING_TO_SATELLITE_UPLINK...]
    </div>
  )
});

// ─── DATA ORIGIN TYPES & CONFIGURATION ───
interface DataOrigin {
  source: "LOCAL_REGISTRY" | "HYBRID_WEB_SCRAPE" | "AI_ESTIMATE" | "DEMO_MODE" | "INSUFFICIENT";
  confidence: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  sourcesCount: number;
  lastUpdated: string;
  isDemoMode: boolean;
  fallbackReason?: string;
}

const ORIGIN_CONFIG = {
  LOCAL_REGISTRY: { color: "bg-green-500/20 text-green-400 border-green-500/50", icon: "✓", label: "VERIFIED DATA" },
  HYBRID_WEB_SCRAPE: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50", icon: "⚠", label: "WEB SOURCES" },
  AI_ESTIMATE: { color: "bg-red-500/20 text-red-400 border-red-500/50", icon: "✗", label: "AI ESTIMATE" },
  DEMO_MODE: { color: "bg-purple-500/20 text-purple-400 border-purple-500/50", icon: "DEMO", label: "DEMO DATA" },
  INSUFFICIENT: { color: "bg-gray-500/20 text-gray-400 border-gray-500/50", icon: "?", label: "NO DATA" }
};

function DataOriginBadge({ origin }: { origin: DataOrigin }) {
  const style = ORIGIN_CONFIG[origin.source] || ORIGIN_CONFIG.INSUFFICIENT;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border ${style.color} text-xs font-mono`}>
      <span>{style.icon}</span>
      <span className="font-semibold">{style.label}</span>
      <span className="opacity-60">|</span>
      <span>{origin.confidence} CONFIDENCE</span>
      {origin.sourcesCount > 0 && (
        <>
          <span className="opacity-60">|</span>
          <span>{origin.sourcesCount} sources</span>
        </>
      )}
      {origin.isDemoMode && (
        <span className="ml-1 text-purple-300 font-bold">[DEMO]</span>
      )}
    </div>
  );
}

// ─── MAIN CORE DASHBOARD MOTOR ───
 function AuditDashboard() {
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [auditData, setAuditData] = useState<any>(null);
  const [coords, setCoords] = useState({ lat: 25.1124, lng: 55.1390 });
  const [originMetrics, setOriginMetrics] = useState<DataOrigin>({
    source: "AI_ESTIMATE",
    confidence: "MEDIUM",
    sourcesCount: 1,
    lastUpdated: "PENDING",
    isDemoMode: false
  });

  // Data Fetching Memoized Execution Context
  const fetchTelemetryData = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setAuditData(data);
        
        // Parse Lat/Lng strings safely from schema target parameters
        if (data.input_params?.lat && data.input_params?.lng) {
          setCoords({
            lat: Number(data.input_params.lat),
            lng: Number(data.input_params.lng)
          });
          
          setOriginMetrics({
            source: "LOCAL_REGISTRY",
            confidence: "HIGH",
            sourcesCount: 3,
            lastUpdated: data.created_at || "JUST NOW",
            isDemoMode: false
          });
        }
      }
    } catch (err: any) {
      console.error("[TELEMETRY FETCH EXCEPTION]:", err.message);
      setOriginMetrics(prev => ({ ...prev, source: "INSUFFICIENT", confidence: "NONE" }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetryData();
  }, [fetchTelemetryData]);

  // Forensic Documentation Export Engine
  const executePDFGeneration = () => {
    if (!auditData) return;
    const doc = new jsPDF();
    doc.setFont("courier", "bold");
    doc.text("ESTATE.AI SYSTEM REPORT // FORENSIC ANALYSIS", 14, 20);
    doc.setFont("courier", "normal");
    doc.text(`Timestamp: ${originMetrics.lastUpdated}`, 14, 30);
    doc.text(`Data Source: ${originMetrics.source}`, 14, 40);
    
    const lines = doc.splitTextToSize(auditData?.output_text || "No records rendered.", 180);
    doc.text(lines, 14, 50);
    doc.save(`EstateAI_Audit_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-mono selection:bg-green-500 selection:text-black">
      
      {/* HUD Header Matrix */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white">ESTATE.AI // ANALYTICAL_DASHBOARD</h1>
          <p className="text-xs text-gray-500 mt-1">REAL-TIME RISK & ASSET ARCHITECTURE ENGINE</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DataOriginBadge origin={originMetrics} />
          <button 
            onClick={executePDFGeneration}
            disabled={loading || !auditData}
            className="px-4 py-1.5 bg-gray-950 border border-gray-700 text-xs text-gray-300 hover:bg-white hover:text-black hover:border-white disabled:opacity-40 disabled:hover:bg-gray-950 disabled:hover:text-gray-300 disabled:hover:border-gray-700 transition-all duration-150 rounded"
          >
            EXPORT_PDF_REPORT
          </button>
        </div>
      </header>

      {/* Primary Workspace Viewport Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Tactical Satellite Grid */}
        <div className="bg-gray-950 p-4 border border-gray-800 rounded-lg flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-gray-900 pb-2">
            <h2 className="text-green-500 text-xs font-bold uppercase tracking-widest">[SATELLITE_TARGET_GRID]</h2>
            <span className="text-[10px] text-gray-500">LOC: {coords.lat.toFixed(4)}N , {coords.lng.toFixed(4)}E</span>
          </div>
          <SatelliteMap lat={coords.lat} lng={coords.lng} />
        </div>
        
        {/* Right Column: Forensic Output Feed */}
        <div ref={reportRef} className="bg-gray-950 p-4 border border-gray-800 rounded-lg flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-gray-900 pb-2">
            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest">[FORENSIC_RAW_FEED]</h2>
            <button 
              onClick={() => router.push("/audit")} 
              className="text-[10px] text-blue-400 hover:underline"
            >
              RUN_NEW_AUDIT →
            </button>
          </div>
          
          <div className="text-sm text-gray-300 leading-relaxed overflow-y-auto max-h-[22rem] pr-2 custom-scrollbar">
            {loading ? (
              <div className="text-gray-500 text-xs animate-pulse font-mono py-4">
                [SYSTEM LOG] Processing analytical matrices, please hold...
              </div>
            ) : auditData ? (
              <div className="prose prose-invert max-w-none text-xs">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {auditData.output_text}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-red-400 text-xs border border-red-900/30 bg-red-950/10 p-3 rounded font-mono">
                [SYSTEM WARNING] No forensic payload found within the linked Supabase history.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── HYDRATION FIX ───
function useClientOnly() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}

// ─── STAMP OVERLAY ───
function StampOverlay({ verdict, visible }: { verdict: string; visible: boolean }) {
  if (!visible) return null;
  const stamps: Record<string, { text: string; color: string; rotate: string }> = {
    PRIME_ASSET: { text: "PRIME ASSET // VERIFIED", color: "#FFB800", rotate: "-12deg" },
    HIGH_YIELD: { text: "HIGH YIELD // CONFIRMED", color: "#00C853", rotate: "8deg" },
    REJECT: { text: "REJECT // RISK ALERT", color: "#FF2200", rotate: "-6deg" },
    HOLD: { text: "HOLD // PENDING REVIEW", color: "#666", rotate: "0deg" },
    INSUFFICIENT_DATA: { text: "NO DATA // VERIFY", color: "#FF2200", rotate: "-4deg" },
  };
  const s = stamps[verdict] || stamps.HOLD;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      style={{ mixBlendMode: "multiply", animation: "stamp-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
    >
      <div
        className="border-4 border-dashed px-8 py-4 font-bold tracking-widest text-2xl uppercase opacity-80"
        style={{
          color: s.color,
          borderColor: s.color,
          transform: `rotate(${s.rotate})`,
          fontFamily: "Space Grotesk, sans-serif",
        }}
      >
        {s.text}
      </div>
    </div>
  );
}

// ─── EVIDENCE CARD ───
function EvidenceCard({
  title,
  children,
  stamp,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  stamp?: string;
  className?: string;
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
    <div className={`relative border border-[#111111] bg-[#0A0A0A] overflow-hidden ${className}`}>
      <div className="px-4 py-2 border-b border-[#111111] flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#E8E4D9] opacity-60">
          {title}
        </span>
        <div className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-pulse" />
      </div>
      <div className="p-4 relative">{children}</div>
      <StampOverlay verdict={stamp || ""} visible={showStamp} />
    </div>
  );
}

// ─── METRIC COUNTER ───
function MetricCounter({ 
  label, 
  value, 
  suffix = "", 
  color = "#E8E4D9",
  isNA = false 
}: { 
  label: string; 
  value: string | number; 
  suffix?: string; 
  color?: string;
  isNA?: boolean;
}) {
  const [display, setDisplay] = useState("—");
  const mounted = useClientOnly();
  
  useEffect(() => {
    if (!mounted) return;
    
    if (isNA || value === "N/A" || value === null || value === undefined) {
      setDisplay("—");
      return;
    }
    
    const target = parseFloat(value.toString().replace(/[^0-9.-]/g, "")) || 0;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = target * eased;
      setDisplay(Number.isInteger(target) ? Math.round(current).toString() : current.toFixed(1));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, mounted, isNA]);
  
  return (
    <div className="flex flex-col p-4 border-r border-[#111111] last:border-r-0 hover:bg-[#111111]/50 transition-colors duration-300 cursor-default group">
      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#E8E4D9] opacity-40 mb-2 group-hover:opacity-70 transition-opacity">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight" style={{ 
          color: isNA ? "#FFB800" : color, 
          fontFamily: "IBM Plex Mono, monospace" 
        }}>
          {mounted ? display : "—"}
        </span>
        {suffix && !isNA && (
          <span className="text-[10px] font-bold opacity-40" style={{ color, fontFamily: "IBM Plex Mono, monospace" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── SCAN LINE ───
function ScanLine({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <div 
        className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF4D00] to-transparent"
        style={{ animation: "scan-sweep 2.5s ease-in-out infinite" }}
      />
    </div>
  );
}

// ─── TERMINAL LOG ───
function TerminalLog({ logs }: { logs: string[] }) {
  const mounted = useClientOnly();
  
  return (
    <div className="space-y-1 h-32 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {logs.map((log, i) => (
        <div
          key={i}
          className="text-[8px] font-mono leading-relaxed border-l border-[#111111] pl-3 py-0.5 text-[#E8E4D9] opacity-30 hover:opacity-70 transition-opacity duration-200"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          <span className="text-[#FF4D00] opacity-60">
            {mounted ? `[${new Date().toLocaleTimeString('en-US', { hour12: false })}]` : `[--:--:--]`}
          </span> {log}
        </div>
      ))}
    </div>
  );
}

// ─── COLOR HELPERS (FIXED: Type-safe) ───
function getScoreColor(score: number | string): string {
  if (score === 'N/A') return "#FFB800";
  if (typeof score !== 'number') return "#FF2200";
  if (score >= 7) return "#00C853";
  if (score >= 4) return "#FFB800";
  return "#FF2200";
}

function getVarianceColor(variance: number | string): string {
  if (variance === 'N/A') return "#FFB800";
  if (typeof variance !== 'number') return "#E8E4D9";
  if (variance < 0) return "#FF2200";
  if (variance > 0) return "#00C853";
  return "#E8E4D9";
}
// FUTURE SCORE CARD — 20-Year Decay Forecast
// ═══════════════════════════════════════════════════════════════════════
function FutureScoreCard({ 
  currentScore, 
  futureScore, 
  verdict 
}: { 
  currentScore: number | string; 
  futureScore: number | string; 
  verdict: string; 
}) {
  const current = typeof currentScore === 'number' ? currentScore : 0;
  const future = typeof futureScore === 'number' ? futureScore : 0;
  const decay = current - future;
  
  const getVerdictColor = (v: string) => {
    if (v.includes("LEGACY")) return "#00C853";
    if (v.includes("CONDITIONAL")) return "#FFB800";
    if (v.includes("EXIT")) return "#FF6B00";
    if (v.includes("TOXIC")) return "#FF2200";
    if (v.includes("BURIAL")) return "#8B0000";
    return "#FFB800";
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FF2200]">
          20-Year Decay Forecast
          
        </span>
        <span className="text-[10px] font-bold" style={{ color: decay > 3 ? "#FF2200" : "#FFB800" }}>
          {decay > 0 ? `-${decay.toFixed(1)} POINTS` : "STABLE"}
        </span>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: getScoreColor(current), fontFamily: "IBM Plex Mono, monospace" }}>
            {current.toFixed(1)}
          </div>
          <div className="text-[8px] opacity-40 mt-1">TODAY</div>
        </div>
        <div className="flex-1 h-[3px] bg-[#111111] relative rounded">
          <div 
            className="absolute h-full rounded bg-gradient-to-r from-[#00C853] via-[#FFB800] to-[#FF2200]" 
            style={{ width: `${(future / 10) * 100}%` }}
          />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: getScoreColor(future), fontFamily: "IBM Plex Mono, monospace" }}>
            {future.toFixed(1)}
          </div>
          <div className="text-[8px] opacity-40 mt-1">2046</div>
        </div>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: getVerdictColor(verdict) }}>
          {verdict}
        </span>
        {decay > 4 && (
          <span className="text-[8px] text-[#FF2200] animate-pulse">
            ⚠ CRITICAL DECAY
          </span>
        )}
      </div>
    </div>
  );
}
// ─── MAIN DASHBOARD ───
export default function Dashboard() {
  const router = useRouter();
  const scrollRef = useRef<any>(null);
  const mounted = useClientOnly();

  const [activeTab, setActiveTab] = useState("description");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("SYSTEM_IDLE");
  const [chatInput, setChatInput] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "[INITIALIZING] Sentinel Core v3.3",
    "[OK] Encryption Layer Verified"
  ]);

  // FIXED: Dynamic metrics from API response
  const [scoreState, setScoreState] = useState<number | string>(0);
  const [varianceState, setVarianceState] = useState<number | string>(0);
  const [yieldState, setYieldState] = useState<number>(0);
  const [verdictState, setVerdictState] = useState("HOLD");
  const [isFaultActive, setIsFaultActive] = useState(false);
  const [lastStamp, setLastStamp] = useState("");

  // Data origin tracking
  const [dataOrigin, setDataOrigin] = useState<DataOrigin | null>(null);
  const [hasRealData, setHasRealData] = useState(false);
   const [darkPoolDeals, setDarkPoolDeals] = useState<any[]>([]);
  const [darkPoolLoading, setDarkPoolLoading] = useState(false);
  const [portfolioAssets, setPortfolioAssets] = useState<any[]>([]);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);
  const [portfolioJson, setPortfolioJson] = useState("");
  const [futureScoreState, setFutureScoreState] = useState<number | null>(null);
  const [futureVerdictState, setFutureVerdictState] = useState("UNKNOWN");
  const [futureDecayState, setFutureDecayState] = useState(0);
  const [futureEvents, setFutureEvents] = useState<Array<{year: number; event: string; severity: string}>>([]);

  const [property, setProperty] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [beds, setBeds] = useState(3);
  const [baths, setBaths] = useState(2);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "### ESTATE AI // SENTINEL CORE\nUplink Established. Provide asset parameters for forensic investment audit.",
    },
  ]);

  // ─── AUTH CHECK ───
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/");
      else {
        setUserEmail(user.email ?? null);
        setUserId(user.id);
      }
    };
    checkUser();
  }, [router]);

  // ─── ADD LOG ───
  const addLog = useCallback((msg: string) => {
    const now = new Date();
    const stamp = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSystemLogs((prev) => [`[${stamp}] ${msg}`, ...prev].slice(0, 20));
  }, []);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    try {
      const { data: hist } = await supabase
        .from("ai_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
        
      setHistory(hist || []);
      
      const { data: lds } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
        
      setLeads(lds || []);
    } catch (err) {
      console.error("[FETCH] Error:", err);
    }
  }, [userId]);

  // ─── FETCH DARK POOL ───
  const fetchDarkPool = useCallback(async () => {
    if (!location) return;
    setDarkPoolLoading(true);
    try {
      const res = await fetch("/api/dark-pool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, propertyType: property, investorProfile: "AGGRESSIVE" }),
      });
      if (res.ok) {
        const data = await res.json();
        setDarkPoolDeals(data.deals || []);
        addLog(`DARK_POOL_SCAN: ${data.matchesFound} opportunities detected`);
      }
    } catch (e) {
      console.error(e);
      addLog("DARK_POOL_SCAN_FAILED");
    } finally {
      setDarkPoolLoading(false);
    }
  }, [location, property, addLog]);
  const handlePortfolioUpload = async () => {
    if (!portfolioJson.trim()) return;
    try {
      const assets = JSON.parse(portfolioJson);
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets }),
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolioAnalysis(data);
        addLog("PORTFOLIO_REBALANCE_ANALYSIS_COMPLETE");
      }
    } catch (e) { 
      addLog("PORTFOLIO_UPLOAD_ERROR"); 
      console.error(e);
    }
  };

  // ─── SCROLL TO BOTTOM ───
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // ─── GENERATE PDF ───
  const generatePDF = useCallback(
    (content: string) => {
      const doc = new jsPDF();
      const docId = `AUDIT-${Math.random().toString(36).toUpperCase().substring(2, 9)}`;

      doc.setFillColor(10, 10, 10);
      doc.rect(0, 0, 210, 297, "F");

      doc.setTextColor(232, 228, 217);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("ESTATE AI // FORENSIC AUDIT REPORT", 20, 35);

      doc.setDrawColor(255, 77, 0);
      doc.setLineWidth(0.8);
      doc.line(20, 42, 190, 42);

      doc.setFontSize(8);
      doc.setTextColor(255, 77, 0);
      doc.text(`DOC_REF: ${docId}`, 20, 52);
      doc.text(`OPERATOR: ${userId?.substring(0, 12) || 'ANON'}`, 20, 58);
      doc.text(`TIMESTAMP: ${new Date().toLocaleString()}`, 135, 52);

      doc.setTextColor(232, 228, 217);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(content, 170);
      doc.text(splitText, 20, 75);

      doc.setTextColor(255, 77, 0);
      doc.setFontSize(7);
      doc.text("CONFIDENTIAL FORENSIC TELEMETRY // ESTATE AI SENTINEL v3.3", 20, 285);

      doc.save(`${docId}_FORENSIC_REPORT.pdf`);
    },
    [userId]
  );

  // ─── HANDLE ACTION ───
  const handleAction = async (
    directPrompt?: string,
    forceLive: boolean = false,
    event?: React.FormEvent | React.KeyboardEvent,
    executionType: string = "AUDIT"
  ) => {
    if (event) event.preventDefault();
    const input = directPrompt || chatInput;
    if (!input && !property) return;
    if (loading) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input || `Audit Command: ${property} | ${location} | ${price}` },
    ]);
    setChatInput("");
    setLoading(true);
    setIsFaultActive(false);

    const steps = [
      "EVIDENCE_GATHERING",
      "MARKET_CROSS_REF",
      "VARIANCE_CALCULATION",
      "YIELD_SIMULATION",
      "FINAL_VERDICT"
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(`[${currentStep + 1}/${steps.length}] ${steps[currentStep]}`);
        addLog(`PROTOCOL_${steps[currentStep]}_INITIATED`);
        currentStep++;
      }
    }, 1500);

    try {
      const transmissionPayload = {
        propertyType: property || "Unknown Asset",
        price: price || "AED 0",
        location: location || "Unknown Location",
        message: input,
        userId: userId,
        forceLive: forceLive,
        type: executionType,
        beds: beds,
        baths: baths
      };

      console.log("[AUDIT] Sending:", transmissionPayload);

      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: transmissionPayload }),
      });

      const responseData = await response.json();
      clearInterval(interval);

      console.log("[AUDIT] Response:", responseData);

      if (response.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: responseData.data }]);
        setStatus("ANALYSIS_VERIFIED");
        addLog("FORENSIC_AUDIT_COMPLETE");

        // Extract metrics properly with N/A handling
        const metrics = responseData?.telemetryMetrics || {};
        
        const safeScore = metrics.systemScoreOverride === 'N/A' ? 'N/A' : 
                          parseFloat(metrics.systemScoreOverride) || 0;
        const safeVariance = metrics.variance === 'N/A' ? 'N/A' : 
                             parseFloat(metrics.variance) || 0;
        const safeYield = parseFloat(metrics.projectedYield) || 0;

        setScoreState(safeScore);
        setVarianceState(safeVariance);
        setYieldState(safeYield);
        setVerdictState(metrics.verdict || "HOLD");
        setLastStamp(metrics.verdict || "HOLD");

        // Data origin tracking
        setDataOrigin(responseData.dataOrigin || null);
        setHasRealData(responseData.hasRealData || false);
try {
          const futureResponse = await fetch("/api/future", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              location: location || "Unknown",
              propertyType: property || "Unknown",
              price: price || "0",
              beds: beds,
              baths: baths,
              holdPeriodYears: 20,
            }),
          });
          
          if (futureResponse.ok) {
            const futureData = await futureResponse.json();
            setFutureScoreState(futureData.futureScore);
            setFutureVerdictState(futureData.futureVerdict);
            setFutureDecayState((safeScore !== 'N/A' ? safeScore as number : 0) - futureData.futureScore);
            setFutureEvents(futureData.criticalEvents || []);
            
            addLog(`FUTURE_AUDIT_COMPLETE: ${futureData.futureVerdict}`);
            
            if (futureData.futureScore < 4) {
              addLog("CRITICAL_FUTURE_DECAY_DETECTED");
              setIsFaultActive(true);
            }
          } else {
            addLog("FUTURE_AUDIT_API_ERROR");
          }
        } catch (futureErr) {
          console.error("Future audit fetch failed:", futureErr);
          addLog("FUTURE_AUDIT_UNAVAILABLE");
        }

        // Fault detection
        if ((safeScore !== 'N/A' && safeScore <= 3.0) || metrics.verdict === "REJECT") {
          setIsFaultActive(true);
          addLog("CRITICAL_RISK_GEOMETRY_DETECTED");
        }

        await fetchData();
         fetchDarkPool().catch(console.error);
      } else {
        throw new Error(responseData.error || "SERVER_ERROR");
      }
    } catch (err: any) {
      clearInterval(interval);
      setStatus("UPLINK_CRITICAL_FAILURE");
      addLog(`ERROR: ${err.message || "NETWORK_TIMEOUT"}`);
      console.error("[AUDIT] Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ─── FORMAT VARIANCE ───
  const formatVariance = (val: number | string) => {
    if (val === "N/A" || val === null || val === undefined) return "N/A";
    const num = parseFloat(val as string);
    if (isNaN(num)) return "N/A";
    if (Math.abs(num) > 999) return num > 0 ? "+999.9%" : "-999.9%";
    return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  // ─── EVIDENCE POINTS ───
  const evidencePoints = hasRealData ? (dataOrigin?.sourcesCount || 0) * 12 + Math.round((scoreState !== 'N/A' ? scoreState as number : 0) * 2) : 0;

  if (!mounted) {
    return (
      <div className="flex h-screen bg-[#0A0A0A] items-center justify-center">
        <div className="text-[#FF4D00] text-sm font-bold tracking-widest animate-pulse">
          INITIALIZING SENTINEL CORE...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-[#E8E4D9] overflow-hidden" style={{ fontFamily: "Inter, sans-serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,wght@0,400;1,400&family=Inter:wght@400;600&display=swap');
        
        @keyframes scan-sweep {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes stamp-in {
          0% { transform: scale(2) rotate(-12deg); opacity: 0; }
          100% { transform: scale(1) rotate(-12deg); opacity: 0.8; }
        }
        @keyframes evidence-fade {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(255, 77, 0, 0.3); }
          50% { box-shadow: 0 0 20px rgba(255, 77, 0, 0.6); }
        }
        
        .animate-scan-sweep { animation: scan-sweep 2.5s ease-in-out infinite; }
        .animate-stamp-in { animation: stamp-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-evidence { animation: evidence-fade 0.6s ease-out forwards; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #1A1A1A; border-radius: 2px; }
        
        .prose-evidence h3 { color: #E8E4D9; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border-left: 2px solid #FF4D00; padding-left: 0.5rem; margin: 1rem 0 0.5rem; }
        .prose-evidence p { color: #E8E4D9; opacity: 0.7; font-family: 'Newsreader', serif; font-size: 0.8rem; line-height: 1.6; margin-bottom: 0.75rem; }
        .prose-evidence strong { color: #FF4D00; font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
        .prose-evidence ul { list-style: none; padding-left: 0; }
        .prose-evidence li { padding-left: 1rem; position: relative; margin-bottom: 0.25rem; }
        .prose-evidence li::before { content: "▸"; position: absolute; left: 0; color: #FF4D00; opacity: 0.6; }
      `}</style>

      {/* ─── SIDEBAR ─── */}
      <aside className="w-64 border-r border-[#111111] bg-[#0A0A0A] flex flex-col z-30 shrink-0">
        <div className="p-6 border-b border-[#111111]">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-[#FF4D00]" />
            <div>
              <h1 className="text-lg font-bold tracking-wider" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                estate<span className="text-[#FF4D00]">.</span>ai
              </h1>
              <p className="text-[8px] uppercase tracking-[0.2em] opacity-40" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                Forensic Intelligence
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: "description", label: "Evidence Board", icon: "◈" },
            { id: "lead", label: "Acquisition Targets", icon: "◉" },
            { id: "contract", label: "Smart Contracts", icon: "◆" },
            { id: "history", label: "Case Archive", icon: "◊" },
            { id: "darkpool", label: "Dark Pool", icon: "◉" },
            { id: "portfolio", label: "Portfolio Intelligence", icon: "◆" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 text-[10px] uppercase tracking-[0.15em] transition-all duration-200 border-l-2 ${
                activeTab === tab.id
                  ? "border-[#FF4D00] bg-[#111111] text-[#E8E4D9] font-bold"
                  : "border-transparent text-[#E8E4D9] opacity-30 hover:opacity-60 hover:bg-[#111111]/50"
              }`}
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <span className="mr-2 opacity-40">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#111111]">
          <div className="mb-4 p-3 bg-[#111111] border border-[#1A1A1A]">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FF4D00] mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#FF4D00] rounded-full animate-pulse" />
              Core Telemetry
            </p>
            <TerminalLog logs={systemLogs} />
          </div>
          <button
            onClick={() => supabase.auth.signOut().then(() => router.push("/"))}
            className="w-full py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#FF2200] border border-[#FF2200]/20 hover:bg-[#FF2200]/10 transition-all duration-200"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* ─── MAIN CANVAS ─── */}
      <main className="flex-1 flex flex-col relative bg-[#0A0A0A] overflow-hidden">
        <ScanLine active={loading} />

        {/* Header */}
        <header className="h-16 border-b border-[#111111] flex items-center justify-between px-6 bg-[#0A0A0A] z-20 shrink-0">
          <div className="flex items-center gap-8">
            <div className="border-l-2 border-[#FF4D00] pl-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-40 mb-0.5">Protocol Status</p>
              <div className={`text-xs font-bold flex items-center gap-2 ${loading ? "text-[#FFB800]" : "text-[#00C853]"}`} style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-[#FFB800] animate-pulse" : "bg-[#00C853]"}`} />
                {status}
              </div>
            </div>
            <div className="hidden xl:block border-l border-[#111111] pl-6">
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-40 mb-0.5">Engine Mode</p>
              <p className="text-xs font-bold tracking-wider" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                LLAMA_3.3_FORENSIC_CORE
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[7px] font-bold uppercase tracking-[0.2em] opacity-30 mb-0.5">Operator Verified</p>
              <p className="text-[10px] font-bold opacity-70" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                {userEmail || "PENDING..."}
              </p>
            </div>
            <div className="w-8 h-8 bg-[#111111] border border-[#1A1A1A] flex items-center justify-center text-[10px] font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
              S3
            </div>
          </div>
        </header>

        {/* Metrics Bar — FIXED: Type-safe color helpers */}
        <div className="grid grid-cols-4 border-b border-[#111111] bg-[#0A0A0A] shrink-0">
          <MetricCounter 
            label="Evidence Points" 
            value={evidencePoints} 
            suffix="pts" 
            color="#E8E4D9" 
            isNA={!hasRealData}
          />
          <MetricCounter 
            label="Acquisition Targets" 
            value={leads.length} 
            suffix="active" 
            color="#00C853" 
          />
          <MetricCounter 
            label="Forensic Score" 
            value={scoreState} 
            suffix="/10" 
            color={getScoreColor(scoreState)} 
            isNA={scoreState === 'N/A'}
          />
          <MetricCounter 
            label="Variance Delta" 
            value={varianceState} 
            suffix="" 
            color={getVarianceColor(varianceState)} 
            isNA={varianceState === 'N/A'}
          />
        {futureScoreState !== null && (
          <div className="border-b border-[#FF2200]/20 bg-[#FF2200]/5">
            <FutureScoreCard 
              currentScore={scoreState} 
              futureScore={futureScoreState} 
              verdict={futureVerdictState}
            />
          </div>
        )}

        {/* Critical Events Timeline */}
        {futureEvents.length > 0 && (
          <div className="border-b border-[#111111] bg-[#0A0A0A] p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FF2200] mb-2">Critical Events Timeline</p>
            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              {futureEvents.map((evt, i) => (
                <div key={`evt-${i}`} className="shrink-0 px-3 py-2 border border-[#111111] bg-[#111111]/50">
                  <div className="text-[10px] font-bold" style={{ fontFamily: "IBM Plex Mono, monospace" }}>{evt.year}</div>
                  <div className="text-[8px] opacity-60 max-w-[120px] truncate">{evt.event}</div>
                  <div className={`text-[7px] font-bold mt-1 ${evt.severity === 'CRITICAL' ? 'text-[#FF2200]' : evt.severity === 'HIGH' ? 'text-[#FF6B00]' : 'text-[#FFB800]'}`}>{evt.severity}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          {activeTab === "description" && (
            <div className="w-80 min-w-[20rem] border-r border-[#111111] bg-[#0A0A0A] flex flex-col shrink-0">
              <div className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-none">
                <EvidenceCard title="Asset Parameters" stamp={lastStamp}>
                  <div className="space-y-3">
                    {[
                      { l: "Asset Classification", v: property, s: setProperty, p: "e.g. Villa, Apartment" },
                      { l: "Capital Valuation", v: price, s: setPrice, p: "e.g. AED 13,199,000" },
                      { l: "Geo Coordinates", v: location, s: setLocation, p: "e.g. Jumeirah Park, Dubai" },
                    ].map((inp, i) => (
                      <div key={i} className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-40" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                          {inp.l}
                        </label>
                        <input
                          placeholder={inp.p}
                          value={inp.v}
                          onChange={(e) => inp.s(e.target.value)}
                          className="w-full bg-[#111111] border border-[#1A1A1A] px-3 py-2.5 text-xs text-[#E8E4D9] placeholder:opacity-20 outline-none focus:border-[#FF4D00]/50 transition-colors"
                          style={{ fontFamily: "IBM Plex Mono, monospace" }}
                        />
                      </div>
                    ))}
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-40">Beds</label>
                        <input
                          type="number"
                          value={beds}
                          onChange={(e) => setBeds(Number(e.target.value) || 3)}
                          className="w-full bg-[#111111] border border-[#1A1A1A] px-3 py-2 text-xs text-[#E8E4D9] outline-none focus:border-[#FF4D00]/50"
                          style={{ fontFamily: "IBM Plex Mono, monospace" }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-40">Baths</label>
                        <input
                          type="number"
                          value={baths}
                          onChange={(e) => setBaths(Number(e.target.value) || 2)}
                          className="w-full bg-[#111111] border border-[#1A1A1A] px-3 py-2 text-xs text-[#E8E4D9] outline-none focus:border-[#FF4D00]/50"
                          style={{ fontFamily: "IBM Plex Mono, monospace" }}
                        />
                      </div>
                    </div>
                  </div>
                </EvidenceCard>

                {/* Data Origin Badge in sidebar */}
                {dataOrigin && (
                  <div className="p-3 border border-[#111111] bg-[#111111]/30">
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] opacity-40 mb-2">Data Origin</p>
                    <DataOriginBadge origin={dataOrigin} />
                    <p className="text-[8px] opacity-30 mt-2" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                      {dataOrigin.fallbackReason || "Real-time analysis"}
                    </p>
                  </div>
                )}

                <button
                  onClick={(e) => handleAction(undefined, false, e, "AUDIT")}
                  disabled={loading}
                  className="w-full py-3 bg-[#FF4D00] text-[#0A0A0A] font-bold text-[10px] uppercase tracking-[0.15em] hover:bg-[#FF6B2C] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed animate-pulse-glow"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {loading ? "◉ FORENSIC ANALYSIS RUNNING..." : "◉ INITIATE AUDIT"}
                </button>

                {verdictState === "PRIME_ASSET" && (
                  <div className="p-3 border border-[#FFB800]/30 bg-[#FFB800]/5 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#FFB800] mb-2">Prime Asset Detected</p>
                    <button
                      onClick={() => setActiveTab("lead")}
                      className="w-full py-2 bg-[#FFB800] text-[#0A0A0A] font-bold text-[9px] uppercase tracking-wider hover:bg-[#FFD54F] transition-colors"
                    >
                      Route to Acquisition
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[#111111]">
                <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#FF2200] mb-1 flex items-center gap-1.5">
                  <span>◉</span> Reality Check Protocol
                </p>
                <p className="text-[9px] opacity-40 leading-normal mb-3" style={{ fontFamily: "Newsreader, serif" }}>
                  Enforce strict discrepancy scans over current evaluation matrices.
                </p>
                <button
                  onClick={(e) =>
                    handleAction(
                      "Conduct a mandatory investment reality check. Identify all risks, tax discrepancies, and overpayment flags.",
                      true,
                      e,
                      "REALITY_CHECK"
                    )
                  }
                  className="w-full py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] border border-[#FF2200]/30 text-[#FF2200] bg-[#FF2200]/5 hover:bg-[#FF2200]/15 transition-colors"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  ACTIVATE RISK MITIGATION
                </button>
              </div>
            </div>
          )}

          {/* Right Panel */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 custom-scroll">
              {activeTab === "description" && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Data Origin Banner for latest analysis */}
                  {dataOrigin && messages.length > 1 && (
                    <div className="animate-evidence">
                      <div className="flex justify-between items-center border-b border-[#111111] pb-3">
                        <DataOriginBadge origin={dataOrigin} />
                        <span className="text-xs text-gray-500 font-mono">
                          {new Date(dataOrigin.lastUpdated).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                     {futureScoreState !== null && (
  <div className="border-b border-[#FF2200]/20 bg-[#FF2200]/5 p-4">
    <div className="flex justify-between items-center mb-3">
      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FF2200]">20-Year Decay Forecast</span>
      <span className="text-[10px] font-bold" style={{ color: (typeof scoreState === 'number' ? scoreState : 0) - futureScoreState > 3 ? "#FF2200" : "#FFB800" }}>
        {(typeof scoreState === 'number' ? scoreState : 0) - futureScoreState > 4 && (
          <span className="text-[8px] text-[#FF2200] animate-pulse">⚠ CRITICAL DECAY</span>
        )}
      </span>
    </div>
    <div className="flex items-center gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: getScoreColor(scoreState), fontFamily: "IBM Plex Mono, monospace" }}>
          {typeof scoreState === 'number' ? scoreState.toFixed(1) : "0.0"}
        </div>
        <div className="text-[8px] opacity-40 mt-1">TODAY</div>
      </div>
      <div className="flex-1 h-[3px] bg-[#111111] relative rounded">
        <div className="absolute h-full rounded bg-gradient-to-r from-[#00C853] via-[#FFB800] to-[#FF2200]" style={{ width: `${(futureScoreState / 10) * 100}%` }} />
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: getScoreColor(futureScoreState), fontFamily: "IBM Plex Mono, monospace" }}>
          {futureScoreState.toFixed(1)}
        </div>
        <div className="text-[8px] opacity-40 mt-1">2046</div>
      </div>
    </div>
    <div className="mt-3 flex justify-between items-center">
      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: futureVerdictState.includes("LEGACY") ? "#00C853" : futureVerdictState.includes("CONDITIONAL") ? "#FFB800" : futureVerdictState.includes("EXIT") ? "#FF6B00" : futureVerdictState.includes("TOXIC") ? "#FF2200" : "#8B0000" }}>
        {futureVerdictState}
      </span>
      {(typeof scoreState === 'number' ? scoreState : 0) - futureScoreState > 4 && (
        <span className="text-[8px] text-[#FF2200] animate-pulse">⚠ CRITICAL DECAY</span>
      )}
    </div>
  </div>
)}
                  {messages.map((m, i) => (
                    <div key={i} className={`animate-evidence ${m.role === "user" ? "ml-auto max-w-2xl" : "max-w-3xl"}`} style={{ animationDelay: `${i * 0.1}s` }}>
                      <div
                        className={`border p-5 relative ${
                          m.role === "user"
                            ? "bg-[#111111] border-[#1A1A1A] text-[#E8E4D9] opacity-70"
                            : "bg-[#0A0A0A] border-[#111111] text-[#E8E4D9]"
                        }`}
                      >
                        {m.role === "assistant" && i > 0 && (
                          <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#FF4D00] flex items-center justify-center">
                            <span className="text-[8px] text-[#0A0A0A] font-bold">!</span>
                          </div>
                        )}
                        <div className="prose-evidence">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                        </div>
                        {m.role === "assistant" && i > 0 && (
                          <div className="mt-4 pt-3 border-t border-[#111111] flex justify-between items-center">
                            <span className="text-[8px] uppercase tracking-[0.2em] opacity-30" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                              Verified Telemetry // Sentinel_v3.3
                            </span>
                            <button
                              onClick={() => generatePDF(m.content)}
                              className="px-3 py-1.5 bg-[#111111] border border-[#1A1A1A] text-[9px] font-bold uppercase tracking-wider hover:border-[#FF4D00]/50 transition-colors"
                            >
                              Export PDF
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="p-6 border border-[#111111] bg-[#111111]/30 space-y-3">
                      <div className="h-2 bg-[#1A1A1A] rounded w-full animate-pulse" />
                      <div className="h-2 bg-[#111111] rounded w-5/6 animate-pulse" style={{ animationDelay: "0.1s" }} />
                      <div className="h-2 bg-[#111111] rounded w-2/3 animate-pulse" style={{ animationDelay: "0.2s" }} />
                      <p className="text-[8px] text-[#FF4D00] font-bold uppercase tracking-widest pt-2 animate-pulse">Forensic analysis in progress...</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "lead" && (
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-sm font-bold uppercase tracking-[0.1em] border-l-2 border-[#00C853] pl-3 mb-6" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Acquisition Targets ({leads.length})
                  </h2>
                  {!leads.length ? (
                    <div className="border border-dashed border-[#1A1A1A] p-8 text-center">
                      <p className="text-[10px] uppercase tracking-wider opacity-30">No acquisition targets in system pool.</p>
                    </div>
                  ) : (
                    leads.map((l, i) => (
                      <div
                        key={i}
                        className="p-4 border border-[#111111] bg-[#111111]/30 mb-3 flex justify-between items-center hover:border-[#00C853]/30 transition-colors group"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-2 h-2 bg-[#00C853] rounded-full shadow-[0_0_10px_#00C853]" />
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-wider text-[#00C853] mb-0.5">{l.audit_verdict}</p>
                            <p className="text-xs font-bold" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                              {l.location_data} — <span className="opacity-40">{l.target_value}</span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => generatePDF(l.output_text || "")}
                          className="px-3 py-1.5 bg-[#111111] border border-[#1A1A1A] text-[9px] font-bold uppercase tracking-wider hover:border-[#00C853]/50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Extract
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "contract" && (
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-sm font-bold uppercase tracking-[0.1em] border-l-2 border-[#FF4D00] pl-3 mb-6" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Smart Contract Protocols
                  </h2>
                  <div className="p-6 border border-[#FF4D00]/20 bg-[#FF4D00]/5">
                    <span className="text-[9px] font-bold text-[#FF4D00] uppercase tracking-widest block mb-2">Escrow Engine Status</span>
                    <p className="text-xs opacity-50 leading-relaxed" style={{ fontFamily: "Newsreader, serif" }}>
                      System awaiting formal parameter extraction confirmation to allocate smart pipeline escrow deployments.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-sm font-bold uppercase tracking-[0.1em] border-l-2 border-[#E8E4D9] pl-3 mb-6" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                    Case Archive ({history.length})
                  </h2>
                  {!history.length ? (
                    <div className="border border-dashed border-[#1A1A1A] p-8 text-center">
                      <p className="text-[10px] uppercase tracking-wider opacity-30">Historical query stack is empty.</p>
                    </div>
                  ) : (
                    
                    history.map((h, i) => (
                      <div
                        key={i}
                        className="p-5 border border-[#111111] bg-[#111111]/20 mb-4 relative hover:border-[#1A1A1A] transition-colors"
                      >
                        <div className="absolute top-4 right-4 flex gap-3 items-center">
                          <span className="text-[9px] opacity-30" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                            {new Date(h.created_at).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => generatePDF(h.output_text)}
                            className="text-[9px] font-bold uppercase tracking-wider hover:text-[#FF4D00] transition-colors"
                          >
                            Download
                          </button>
                        </div>
                        <div className="prose-evidence mt-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{h.output_text}</ReactMarkdown>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                          )}
            </div>

          {activeTab === "portfolio" && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] border-l-2 border-[#00C853] pl-3 mb-6" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Portfolio Intelligence
              </h2>
              
              {!portfolioAnalysis ? (
                <div className="border border-dashed border-[#1A1A1A] p-8">
                  <p className="text-[10px] uppercase tracking-wider opacity-30 mb-4">Upload portfolio JSON for analysis</p>
                  <textarea 
                    value={portfolioJson}
                    onChange={(e) => setPortfolioJson(e.target.value)}
                    placeholder='[{"id":"V1","location":"dubai","propertyType":"villa","currentValue":5000000,"purchasePrice":4000000,"yield":5.5,"riskScore":4}]'
                    className="w-full h-32 bg-[#111111] border border-[#1A1A1A] p-3 text-xs text-[#E8E4D9] placeholder:opacity-20 outline-none focus:border-[#FF4D00]/50 mb-4 font-mono"
                  />
                  <button 
                    onClick={handlePortfolioUpload}
                    className="px-6 py-2 bg-[#FF4D00] text-[#0A0A0A] font-bold text-[10px] uppercase tracking-widest"
                  >
                    ANALYZE PORTFOLIO
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Metrics */}
                  <div className="grid grid-cols-4 border border-[#111111]">
                    <div className="p-4 border-r border-[#111111]">
                      <div className="text-[8px] uppercase opacity-40 mb-1">Total Value</div>
                      <div className="text-xl font-bold" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                        ${(portfolioAnalysis.portfolioMetrics.totalValue / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div className="p-4 border-r border-[#111111]">
                      <div className="text-[8px] uppercase opacity-40 mb-1">Avg Yield</div>
                      <div className="text-xl font-bold text-[#00C853]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                        {portfolioAnalysis.portfolioMetrics.avgYield.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-4 border-r border-[#111111]">
                      <div className="text-[8px] uppercase opacity-40 mb-1">Risk Score</div>
                      <div className="text-xl font-bold" style={{ color: portfolioAnalysis.portfolioMetrics.avgRisk > 6 ? '#FF2200' : '#FFB800', fontFamily: "IBM Plex Mono, monospace" }}>
                        {portfolioAnalysis.portfolioMetrics.avgRisk.toFixed(1)}/10
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[8px] uppercase opacity-40 mb-1">Diversification</div>
                      <div className="text-xl font-bold text-[#00C853]" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                        {portfolioAnalysis.portfolioMetrics.diversificationScore.toFixed(1)}/10
                      </div>
                    </div>
                  </div>

                  {/* Rebalance Signals */}
                  {portfolioAnalysis.rebalanceSignals.length > 0 && (
                    <div className="border border-[#FF2200]/20 bg-[#FF2200]/5 p-4">
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FF2200] mb-3">
                        Rebalance Signals ({portfolioAnalysis.rebalanceSignals.length})
                      </p>
                      {portfolioAnalysis.rebalanceSignals.map((signal: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 mb-2 p-2 bg-[#0A0A0A] border border-[#111111]">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: signal.action === 'SELL' ? '#FF2200' : signal.action === 'REDUCE' ? '#FF6B00' : '#FFB800' }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold uppercase">{signal.action}</span>
                              <span className="text-[8px] opacity-40">{signal.assetId}</span>
                            </div>
                            <p className="text-[8px] opacity-60">{signal.reason}</p>
                          </div>
                          <span className="text-[7px] font-bold px-2 py-1" style={{ backgroundColor: signal.urgency === 'IMMEDIATE' ? '#FF2200' : signal.urgency === '30_DAYS' ? '#FF6B00' : '#FFB800', color: '#0A0A0A' }}>
                            {signal.urgency}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Correlations */}
                  {portfolioAnalysis.correlations.length > 0 && (
                    <div className="border border-[#FFB800]/20 bg-[#FFB800]/5 p-4">
                      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#FFB800] mb-3">
                        Correlation Risks ({portfolioAnalysis.correlations.length})
                      </p>
                      {portfolioAnalysis.correlations.map((c: any, i: number) => (
                        <div key={i} className="text-[8px] mb-1">
                          <span className="text-[#FF2200] font-bold">{c.pair[0]}</span> ↔ <span className="text-[#FF2200] font-bold">{c.pair[1]}</span> = {(c.correlation * 100).toFixed(0)}% correlation
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {activeTab === "darkpool" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold uppercase tracking-[0.1em] border-l-2 border-[#FF2200] pl-3" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Dark Pool Opportunities ({darkPoolDeals.length})
                </h2>
                <button 
                  onClick={() => fetchDarkPool()}
                  disabled={darkPoolLoading}
                  className="px-3 py-1.5 bg-[#FF2200] text-[#0A0A0A] text-[8px] font-bold uppercase tracking-wider hover:bg-[#FF6B2C] transition-colors disabled:opacity-30"
                >
                  {darkPoolLoading ? "SCANNING..." : "◉ RE-SCAN"}
                </button>
              </div>
              
              {!darkPoolDeals.length ? (
                <div className="border border-dashed border-[#1A1A1A] p-8 text-center">
                  <div className="text-4xl mb-4 opacity-20">🔒</div>
                  <p className="text-[10px] uppercase tracking-wider opacity-30 mb-2">No off-market opportunities detected.</p>
                  <p className="text-[8px] opacity-20">Enter location to scan developer CRMs, court auctions, and broker networks.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {darkPoolDeals.map((deal, i) => (
                    <div key={deal.id} className="border border-[#FF2200]/20 bg-[#FF2200]/5 relative overflow-hidden group hover:border-[#FF2200]/40 transition-colors">
                      <div className="absolute top-0 right-0 px-3 py-1 bg-[#FF2200] text-[#0A0A0A] text-[8px] font-bold uppercase tracking-wider">
                        {deal.type}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-[#111111] border border-[#1A1A1A] flex items-center justify-center text-lg shrink-0 group-hover:bg-[#FF2200]/10 transition-colors">
                            {deal.type === "PRE_LAUNCH" ? "🚀" : deal.type === "DISTRESSED" ? "⚡" : "🔥"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#FF2200]">{deal.id}</span>
                              <span className="text-[7px] opacity-30">|</span>
                              <span className="text-[7px] opacity-30 uppercase">{deal.source}</span>
                            </div>
                            <p className="text-xs font-bold mb-2 truncate" style={{ fontFamily: "IBM Plex Mono, monospace" }}>
                              {deal.location} — <span className="opacity-40">{deal.propertyType}</span>
                            </p>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-2 py-1 bg-[#FF2200] text-[#0A0A0A] text-[10px] font-bold">
                                {deal.discount}% OFF MARKET
                              </span>
                              {deal.minInvestment && (
                                <span className="text-[9px] opacity-60" style={{ fontFamily: "IBM Plex Mono, monospace" }}>Min: {deal.minInvestment}</span>
                              )}
                              {deal.reservePrice && (
                                <span className="text-[9px] opacity-60" style={{ fontFamily: "IBM Plex Mono, monospace" }}>Reserve: {deal.reservePrice}</span>
                              )}
                            </div>
                            {deal.reason && <p className="text-[8px] text-[#FF2200]">{deal.reason}</p>}
                            {deal.expiresAt && (
                              <div className="flex items-center gap-1 mt-2">
                                <span className="w-1.5 h-1.5 bg-[#FF2200] rounded-full animate-pulse" />
                                <span className="text-[8px] text-[#FF2200] font-bold">
                                  Expires {new Date(deal.expiresAt).toLocaleDateString()} ({Math.ceil((new Date(deal.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-[#111111]/50 border-t border-[#111111] flex items-center justify-between">
                        <span className="text-[7px] opacity-30 uppercase tracking-wider">Off-Market Access Required</span>
                        <button className="px-3 py-1 bg-[#FF2200] text-[#0A0A0A] text-[8px] font-bold uppercase tracking-wider hover:bg-[#FF6B2C] transition-colors">
                          REQUEST ACCESS
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

            {activeTab === "description" && (
              <div className="p-4 border-t border-[#111111] bg-[#0A0A0A] shrink-0">
                <div className="max-w-5xl mx-auto flex gap-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Enter forensic command (e.g. Scan portfolio overvaluations in Manhattan)..."
                    onKeyDown={(e) => e.key === "Enter" && handleAction(undefined, false, e, "CHAT_COMMAND")}
                    className="flex-1 bg-[#111111] border border-[#1A1A1A] px-4 py-3 text-xs text-[#E8E4D9] placeholder:opacity-20 outline-none focus:border-[#FF4D00]/50 transition-colors"
                    style={{ fontFamily: "IBM Plex Mono, monospace" }}
                  />
                  <button
                    onClick={(e) => handleAction(undefined, false, e, "CHAT_COMMAND")}
                    className="px-6 bg-[#FF4D00] text-[#0A0A0A] font-bold text-[10px] uppercase tracking-widest hover:bg-[#FF6B2C] transition-colors"
                    style={{ fontFamily: "Space Grotesk, sans-serif" }}
                  >
                    TRANSMIT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}