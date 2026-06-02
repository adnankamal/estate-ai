"use client";
import { useState } from "react";

interface EstateResponse {
  data?: string;
  error?: string;
}

export default function PropertyPage() {
  const [description, setDescription] = useState<string>("AI analysis will appear here...");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  // Input states (Inhe tum inputs se bhi connect kar sakte ho)
  const [propertyData] = useState({
    type: "Luxury Villa",
    location: "Mumbai",
    price: "4 Crore"
  });

  const generateAudit = async () => {
    setLoading(true);
    setStatus("📡 Initializing Hybrid Search...");
    
    // UI Progress Sequence for User Trust
    const steps = [
      "🔍 Scanning Google for market trends...",
      "🌐 Cross-referencing Deep Data via Tavily...",
      "🧠 Llama 3.3 Engine calculating ROI...",
      "📊 Finalizing Investment Score..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setStatus(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 2500);

    try {
      const res = await fetch("/api/generate", { // Updated to your main route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          payload: {
            propertyType: propertyData.type,
            location: propertyData.location,
            price: propertyData.price,
            message: "Perform a full global investment audit."
          }
        }),
      });

      const json = (await res.json()) as EstateResponse;
      clearInterval(interval);

      if (res.ok && json.data) {
        setDescription(json.data);
        setStatus("✅ Audit Complete");
      } else {
        setDescription("Error: " + (json.error || "Uplink Failed"));
        setStatus("❌ System Error");
      }
    } catch (err) {
      clearInterval(interval);
      setDescription("Connection Error. Check your internet.");
      setStatus("❌ Offline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className={`max-w-xl w-full border border-zinc-800 p-8 rounded-[2rem] bg-zinc-900/50 backdrop-blur-xl space-y-6 transition-all duration-700 ${description.includes("Final Score: 9") || description.includes("Final Score: 8") ? 'shadow-[0_0_50px_rgba(234,179,8,0.15)] border-yellow-500/50' : 'shadow-2xl'}`}>
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-tighter text-yellow-500 uppercase">Estate AI <span className="text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded-full ml-2 align-middle">SENTINEL</span></h1>
          {status && <span className="text-[10px] text-zinc-500 animate-pulse font-mono uppercase tracking-widest">{status}</span>}
        </div>
        
        <div className="p-6 bg-black/40 rounded-2xl border border-zinc-800 flex justify-between items-center">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1">Target Asset</p>
            <h2 className="text-xl font-bold">{propertyData.type}</h2>
            <p className="text-zinc-400 text-sm">{propertyData.location}</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] mb-1">Valuation</p>
            <p className="text-yellow-500 font-black text-2xl">{propertyData.price}</p>
          </div>
        </div>

        <button 
          onClick={generateAudit} 
          disabled={loading} 
          className="w-full bg-yellow-500 text-black font-black py-5 rounded-2xl disabled:opacity-30 hover:bg-yellow-400 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-3 uppercase tracking-tighter"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
              Analyzing Market...
            </>
          ) : "Run Investment Audit"}
        </button>

        <div className="relative group">
          <div className="absolute -top-3 left-6 bg-zinc-900 px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-bold border border-zinc-800 rounded-full">
            Sentinel Report
          </div>
          <div className="p-6 bg-black rounded-3xl border border-zinc-800 text-zinc-300 min-h-[250px] text-sm whitespace-pre-wrap leading-relaxed font-light">
            {description}
          </div>
        </div>

        <div className="text-[9px] text-zinc-600 text-center uppercase tracking-widest">
          Powered by Hybrid Search (Google + Tavily) & Llama 3.3
        </div>
      </div>
    </main>
  );
}