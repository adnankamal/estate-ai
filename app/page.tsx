import React from 'react';

export default function AuthPortal() {
  return (
    /* ==========================================================================
       1. BACKGROUND ENGINE (Grid Lines + Dark Cyber Vibe)
       Purane flat black wrapper div ko is class se replace karo.
       ========================================================================== */
    <div className="min-h-screen w-full flex items-center justify-center bg-[#030712] relative overflow-hidden bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem]">
      
      {/* Dynamic Cyber Glow Effect over the grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(16,185,129,0.08),transparent_70%)]" />

      {/* ==========================================================================
         2. AUTH CARD (Glassmorphism + Neon Border Shadow)
         Tumhare purane solid dark gray middle card (`bg-zinc-900`) ki jagah yeh aayega.
         ========================================================================== */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-xl bg-gray-900/40 backdrop-blur-md border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] transition-all duration-500">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 tracking-wider font-mono">
            EstateAI
          </h1>
          <p className="text-[10px] uppercase font-mono tracking-[0.3em] text-emerald-500/70 mt-1.5">
            Forensic Intelligence Portal
          </p>
        </div>

        {/* Form Container */}
        <form className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2">
              Operator Identity
            </label>
            
            {/* ==========================================================================
               3. TACTICAL INPUTS (Monospace text + Active Edge Glow)
               Purane generic wrapper/input fields ko is responsive state se swap karo.
               ========================================================================== */}
            <div className="relative">
              <input 
                type="email" 
                required
                className="w-full bg-black/60 border border-gray-800 focus:border-emerald-500/80 rounded p-3 text-emerald-400 font-mono text-sm outline-none transition-all duration-300 placeholder:text-gray-600 focus:ring-1 focus:ring-emerald-500/20"
                placeholder="OPERATOR_IDENTITY@ESTATE.AI"
              />
            </div>
          </div>

          {/* ==========================================================================
             4. ACTION BUTTON (Tactical Emerald + Transform Scale Engine)
             Purane solid yellow (`bg-yellow-400`) button element ko isse replace karo.
             ========================================================================== */}
          <button 
            type="submit"
            className="w-full mt-2 bg-emerald-600/90 hover:bg-emerald-500 text-white font-mono text-xs font-bold tracking-[0.2em] uppercase py-3.5 rounded border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all duration-300 transform active:scale-[0.99] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            Execute Handshake
          </button>
        </form>

        {/* System Footer Node inside the card */}
        <div className="mt-6 pt-4 border-t border-gray-800/60 text-center">
          <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
            SECURE ENCRYPTED NODE // LEVEL 03
          </span>
        </div>

      </div>
    </div>
  );
}