"use client";

import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";

const ReactMarkdown: any = dynamic(() => import("react-markdown"), { ssr: false });
const remarkGfm: any = dynamic(() => import("remark-gfm"), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── HYDRATION FIX: Client-only rendering hook ───
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
    if (stamp && stamp !== "HOLD") {
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
function MetricCounter({ label, value, suffix = "", color = "#E8E4D9" }: { label: string; value: string | number; suffix?: string; color?: string }) {
  const [display, setDisplay] = useState("0");
  const mounted = useClientOnly();
  
  useEffect(() => {
    if (!mounted) return;
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
  }, [value, mounted]);
  
  return (
    <div className="flex flex-col p-4 border-r border-[#111111] last:border-r-0 hover:bg-[#111111]/50 transition-colors duration-300 cursor-default group">
      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#E8E4D9] opacity-40 mb-2 group-hover:opacity-70 transition-opacity">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tracking-tight" style={{ color, fontFamily: "IBM Plex Mono, monospace" }}>
          {mounted ? display : "0.0"}
        </span>
        {suffix && (
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

  const [scoreState, setScoreState] = useState(0);
  const [varianceState, setVarianceState] = useState(0);
  const [yieldState, setYieldState] = useState(0);
  const [verdictState, setVerdictState] = useState("HOLD");
  const [isFaultActive, setIsFaultActive] = useState(false);
  const [lastStamp, setLastStamp] = useState("");

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

  // ─── FETCH DATA ───
  const fetchData = useCallback(async () => {
    if (!userId) {
      console.log("[FETCH] No userId, skipping");
      return;
    }
    
    console.log("[FETCH] Fetching for user:", userId.substring(0, 8));
    
    try {
      const { data: hist, error: histError } = await supabase
        .from("ai_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
        
      if (histError) {
        console.error("[FETCH] History error:", histError.message);
      } else {
        console.log("[FETCH] History loaded:", hist?.length || 0, "records");
        setHistory(hist || []);
      }
      
      const { data: lds, error: leadError } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (leadError) {
        console.error("[FETCH] Leads error:", leadError.message);
      } else {
        console.log("[FETCH] Leads loaded:", lds?.length || 0, "records");
        setLeads(lds || []);
      }
    } catch (err) {
      console.error("[FETCH] Exception:", err);
    }
  }, [userId]);

  // ─── FETCH ON USERID CHANGE ───
  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

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
        price: price || "$0",
        location: location || "Unknown Location",
        message: input,
        userId: userId,
        forceLive: forceLive,
        type: executionType,
        beds: beds,
        baths: baths
      };

      console.log("[AUDIT] Sending payload:", transmissionPayload);

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

        const metrics = responseData?.telemetryMetrics || {};
        const safeScore = parseFloat(metrics.systemScoreOverride) || 0;
        const safeVariance = parseFloat(metrics.variance) || 0;
        const safeYield = parseFloat(metrics.projectedYield) || 0;

        setScoreState(safeScore);
        setVarianceState(safeVariance);
        setYieldState(safeYield);
        setVerdictState(metrics.verdict || "HOLD");
        setLastStamp(metrics.verdict || "HOLD");

        if (safeScore <= 3.0 || metrics.verdict === "REJECT") {
          setIsFaultActive(true);
          addLog("CRITICAL_RISK_GEOMETRY_DETECTED");
        }

        // ─── REFETCH DATA FOR METRICS ───
        await fetchData();
        
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
  const formatVariance = (val: number) => {
    if (val === 0) return "0.0%";
    if (Math.abs(val) > 999) return val > 0 ? "+999.9%" : "-999.9%";
    return `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;
  };

  // ─── CALCULATE EVIDENCE POINTS ───
  const evidencePoints = history.length * 12 + Math.round(scoreState * 2);

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

        {/* Metrics Bar — FIXED: Dynamic values */}
        <div className="grid grid-cols-4 border-b border-[#111111] bg-[#0A0A0A] shrink-0">
          <MetricCounter 
            label="Evidence Points" 
            value={evidencePoints} 
            suffix="pts" 
            color="#E8E4D9" 
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
            color={scoreState >= 7 ? "#00C853" : scoreState >= 4 ? "#FFB800" : "#FF2200"} 
          />
          <MetricCounter 
            label="Variance Delta" 
            value={formatVariance(varianceState)} 
            suffix="" 
            color={varianceState < 0 ? "#FF2200" : varianceState > 0 ? "#00C853" : "#E8E4D9"} 
          />
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
                      { l: "Asset Classification", v: property, s: setProperty, p: "e.g. Single Family Residence" },
                      { l: "Capital Valuation", v: price, s: setPrice, p: "e.g. $450,000" },
                      { l: "Geo Coordinates", v: location, s: setLocation, p: "e.g. 702 S Hayne St, Monroe, NC" },
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
                    
                    {/* Beds/Baths — FIXED: Number() instead of parseInt */}
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