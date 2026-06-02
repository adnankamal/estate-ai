// ─────────────────────────────────────────────────────────────────────────────
// AUDIT HASHER — Tamper-proof audit trail
// SHA-256 hash of audit data stored in Supabase
// ─────────────────────────────────────────────────────────────────────────────

import { createHash } from "crypto";

export interface AuditPayload {
  userId: string;
  propertyType: string;
  location: string;
  price: string;
  consensus: number;
  variance: number;
  score: number;
  verdict: string;
  timestamp: number;
}

export function generateAuditHash(audit: AuditPayload): string {
  const canonical = JSON.stringify(audit, Object.keys(audit).sort());
  return createHash("sha256").update(canonical).digest("hex");
}

export function verifyAuditIntegrity(audit: AuditPayload, hash: string): boolean {
  return generateAuditHash(audit) === hash;
}

// Add to Supabase schema: ai_history.hash column