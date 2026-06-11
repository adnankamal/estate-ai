"use client";
import { useState, useEffect, useRef } from "react";

const AURORA_ORBS = [
  { cx: "15%", cy: "20%", r: 320, color: "#00FFA3", opacity: 0.045, dur: 18 },
  { cx: "80%", cy: "75%", r: 280, color: "#00FFA3", opacity: 0.035, dur: 22 },
  { cx: "60%", cy: "10%", r: 200, color: "#00CFFF", opacity: 0.03, dur: 15 },
  { cx: "5%",  cy: "80%", r: 180, color: "#00FFA3", opacity: 0.025, dur: 26 },
];

function AuroraCanvas() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {AURORA_ORBS.map((o, i) => (
          <radialGradient key={i} id={`orb${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={o.color} stopOpacity={o.opacity * 18} />
            <stop offset="100%" stopColor={o.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>
      {AURORA_ORBS.map((o, i) => (
        <ellipse key={i} cx={o.cx} cy={o.cy} rx={o.r} ry={o.r * 0.7} fill={`url(#orb${i})`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`0,0; ${i % 2 === 0 ? 40 : -40},${i % 2 === 0 ? -25 : 30}; 0,0`}
            dur={`${o.dur}s`}
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
          />
        </ellipse>
      ))}
    </svg>
  );
}

function GridLines() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="52" height="52" patternUnits="userSpaceOnUse">
          <path d="M 52 0 L 0 0 0 52" fill="none" stroke="#00FFA3" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

function HexCorner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const corners: Record<'tl'|'tr'|'bl'|'br', string> = {
    tl: "M 0 16 L 0 0 L 16 0",
    tr: "M 0 0 L 16 0 L 16 16",
    bl: "M 0 0 L 0 16 L 16 16",
    br: "M 16 0 L 16 16 L 0 16",
  };
  const positions: Record<'tl'|'tr'|'bl'|'br', string> = {
    tl: "top-0 left-0",
    tr: "top-0 right-0",
    bl: "bottom-0 left-0",
    br: "bottom-0 right-0",
  };
  return (
    <svg
      className={`absolute ${positions[pos]} w-5 h-5`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={corners[pos]} stroke="#00FFA3" strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

function SignalBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-3.5">
      {[3, 5, 7, 9].map((h, i) => (
        <div
          key={i}
          className="w-1 rounded-sm transition-all duration-500"
          style={{
            height: `${h}px`,
            background: active
              ? i < 3 ? "#00FFA3" : "#00FFA333"
              : "#1a2a1f",
            transitionDelay: active ? `${i * 60}ms` : "0ms",
          }}
        />
      ))}
    </div>
  );
}

function ScanLine({ active }: { active: boolean }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
      aria-hidden="true"
    >
      <div
        className="absolute left-0 right-0 h-[1px] transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(to right, transparent, #00FFA3 30%, #00FFA3 70%, transparent)",
          opacity: active ? 0.5 : 0,
          animation: active ? "scan 2s ease-in-out infinite" : "none",
        }}
      />
      <style>{`
        @keyframes scan {
          0%   { top: 0%;   opacity: 0.6; }
          50%  { top: 100%; opacity: 0.3; }
          100% { top: 0%;   opacity: 0; }
        }
        @keyframes cursor-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes card-appear {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.08); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

export default function AuthPortal() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: -dy * 4, y: dx * 4 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHovered(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "#03050E" }}
      onMouseMove={handleMouseMove}
    >
      <GridLines />
      <AuroraCanvas />

      {/* Deep vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, #03050E 100%)",
        }}
      />

      {/* Card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full"
        style={{
          maxWidth: 420,
          padding: "0 1rem",
          animation: "card-appear 0.7s cubic-bezier(0.22,1,0.36,1) both",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        <div
          style={{
            background: "rgba(6, 14, 26, 0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(0, 255, 163, 0.13)",
            borderRadius: 16,
            padding: "2.5rem 2rem 2rem",
            transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 0.15s ease-out, box-shadow 0.3s",
            boxShadow: hovered
              ? "0 20px 80px rgba(0,255,163,0.08), 0 0 0 1px rgba(0,255,163,0.12) inset"
              : "0 0 60px rgba(0,255,163,0.04)",
            position: "relative",
          }}
        >
          <HexCorner pos="tl" />
          <HexCorner pos="tr" />
          <HexCorner pos="bl" />
          <HexCorner pos="br" />
          <ScanLine active={focused} />

          {/* Pulse ring behind logo */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 120,
              height: 120,
              top: "2rem",
              left: "50%",
              transform: "translateX(-50%)",
              border: "1px solid rgba(0,255,163,0.12)",
              animation: "ring-pulse 3s ease-in-out infinite",
            }}
          />

          {/* Header */}
          <div className="text-center mb-8 relative">
            <div
              className="inline-flex items-center justify-center mb-3"
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: "rgba(0,255,163,0.07)",
                border: "1px solid rgba(0,255,163,0.18)",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  stroke="#00FFA3"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22V12h6v10"
                  stroke="#00FFA3"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="19" cy="8" r="3" fill="#00FFA3" opacity="0.9" />
              </svg>
            </div>

            <h1
              style={{
                fontFamily: "monospace",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "0.08em",
                background: "linear-gradient(135deg, #00FFA3 0%, #80FFD4 60%, #00CFFF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              EstateAI
            </h1>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: 9,
                letterSpacing: "0.32em",
                color: "rgba(0,255,163,0.45)",
                marginTop: 6,
                textTransform: "uppercase",
              }}
            >
              Forensic Intelligence Portal
            </p>
          </div>

          {/* Status bar */}
          <div
            className="flex items-center justify-between mb-5 px-1"
            style={{ animation: "fadeUp 0.6s 0.3s both" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#00FFA3", boxShadow: "0 0 6px #00FFA3" }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "rgba(0,255,163,0.5)",
                  textTransform: "uppercase",
                }}
              >
                Node Active
              </span>
            </div>
            <SignalBars active={focused} />
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right, transparent, rgba(0,255,163,0.15) 40%, rgba(0,255,163,0.15) 60%, transparent)",
              marginBottom: "1.5rem",
            }}
          />

          {!submitted ? (
            <form onSubmit={handleSubmit} style={{ animation: "fadeUp 0.6s 0.4s both" }}>
              <div className="mb-5">
                <label
                  style={{
                    display: "block",
                    fontFamily: "monospace",
                    fontSize: 9,
                    letterSpacing: "0.28em",
                    color: "rgba(0,255,163,0.4)",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Operator Identity
                </label>

                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="operator@estate.ai"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(0,0,0,0.45)",
                      border: focused
                        ? "1px solid rgba(0,255,163,0.5)"
                        : "1px solid rgba(0,255,163,0.12)",
                      borderRadius: 8,
                      padding: "0.75rem 1rem",
                      color: "#00FFA3",
                      fontFamily: "monospace",
                      fontSize: 13,
                      letterSpacing: "0.05em",
                      outline: "none",
                      transition: "border-color 0.25s, box-shadow 0.25s",
                      boxShadow: focused
                        ? "0 0 0 3px rgba(0,255,163,0.08), inset 0 0 20px rgba(0,255,163,0.03)"
                        : "none",
                    }}
                  />
                  {focused && (
                    <span
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 2,
                        height: 14,
                        background: "#00FFA3",
                        borderRadius: 1,
                        animation: "cursor-blink 1s step-end infinite",
                      }}
                    />
                  )}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  background: email
                    ? "linear-gradient(135deg, rgba(0,180,110,0.9), rgba(0,255,163,0.8))"
                    : "rgba(0,255,163,0.08)",
                  border: "1px solid rgba(0,255,163,0.25)",
                  borderRadius: 8,
                  color: email ? "#03050E" : "rgba(0,255,163,0.3)",
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: email ? "pointer" : "default",
                  transition: "all 0.25s",
                  boxShadow: email ? "0 0 24px rgba(0,255,163,0.2)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (email)
                    e.currentTarget.style.boxShadow = "0 0 40px rgba(0,255,163,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = email
                    ? "0 0 24px rgba(0,255,163,0.2)"
                    : "none";
                }}
              >
                Execute Handshake
              </button>
            </form>
          ) : (
            <div
              className="text-center py-4"
              style={{ animation: "fadeUp 0.5s both" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(0,255,163,0.1)",
                  border: "1px solid rgba(0,255,163,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  boxShadow: "0 0 20px rgba(0,255,163,0.15)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M4 10l4.5 4.5L16 6"
                    stroke="#00FFA3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  color: "#00FFA3",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Handshake Established
              </p>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color: "rgba(0,255,163,0.4)",
                  letterSpacing: "0.1em",
                }}
              >
                {email}
              </p>
            </div>
          )}

          {/* Footer */}
          <div
            className="mt-6 pt-4 text-center"
            style={{ borderTop: "1px solid rgba(0,255,163,0.07)" }}
          >
            <div className="flex items-center justify-center gap-3">
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontFamily: "monospace",
                  fontSize: 8,
                  letterSpacing: "0.25em",
                  color: "rgba(0,255,163,0.25)",
                  textTransform: "uppercase",
                }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <rect width="8" height="8" rx="2" fill="rgba(0,255,163,0.2)" />
                  <path d="M2 4h4M4 2v4" stroke="#00FFA3" strokeWidth="1" opacity="0.6" />
                </svg>
                Encrypted Node
              </span>
              <span style={{ color: "rgba(0,255,163,0.12)", fontSize: 8 }}>//</span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  letterSpacing: "0.25em",
                  color: "rgba(0,255,163,0.25)",
                  textTransform: "uppercase",
                }}
              >
                Level 03
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}