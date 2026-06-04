import { ScoreResult } from "./ForensicScorer";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface FinalVerdict {
  action: "BUY" | "PASS" | "INVESTIGATE";
  confidenceScore: number; // 0 to 100
  summary: string;
  flags: string[];
}

export interface VerdictConfig {
  buyThreshold: number;      // Default: 7.5
  passThreshold: number;     // Default: 4.0
  minConfidence: "HIGH" | "MEDIUM" | "LOW";
  maxVariancePercent: number; // Default: 50
  minYieldPercent: number;   // Default: 3.0
}

export interface RiskFlag {
  code: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  message: string;
  autoTrigger: boolean; // Triggers action change?
}

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: VerdictConfig = {
  buyThreshold: 7.5,
  passThreshold: 4.0,
  minConfidence: "MEDIUM",
  maxVariancePercent: 50,
  minYieldPercent: 3.0,
};

const CONFIDENCE_WEIGHTS: Record<string, number> = {
  HIGH: 1.0,
  MEDIUM: 0.7,
  LOW: 0.4,
  NONE: 0.0,
};

// ─────────────────────────────────────────────────────────────────────────────
// VERDICT ENGINE CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class VerdictEngine {
  private config: VerdictConfig;
  private flags: RiskFlag[] = [];

  constructor(config: Partial<VerdictConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main entry: ScoreResult → FinalVerdict
   */
  evaluate(scoreResult: ScoreResult): FinalVerdict {
    this.flags = []; // Reset flags

    // ─── STEP 1: Extract & normalize inputs ───
    const {
      score,
      verdict: rawVerdict,
      confidence,
      variance,
      baseline,
      medianSold,
      reasoning,
    } = scoreResult;

    // ─── STEP 2: Build risk flags ───
    this.assessConfidence(confidence, score);
    this.assessVariance(variance);
    this.assessYield(scoreResult);
    this.assessDataQuality(scoreResult);
    this.assessMarketConditions(scoreResult);

    // ─── STEP 3: Determine action ───
    const action = this.determineAction(score, rawVerdict, confidence);

    // ─── STEP 4: Calculate confidence score (0-100) ───
    const confidenceScore = this.calculateConfidenceScore(
      score,
      confidence,
      this.flags
    );

    // ─── STEP 5: Generate summary ───
    const summary = this.generateSummary(
      action,
      score,
      variance,
      confidence,
      this.flags
    );

    // ─── STEP 6: Extract flag messages ───
    const flagMessages = this.flags
      .filter((f) => f.severity !== "INFO")
      .map((f) => `[${f.severity}] ${f.code}: ${f.message}`);

    return {
      action,
      confidenceScore: Math.round(confidenceScore),
      summary,
      flags: flagMessages,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Risk Assessment Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private assessConfidence(
    confidence: string,
    score: number
  ): void {
    const weight = CONFIDENCE_WEIGHTS[confidence] || 0;

    if (confidence === "NONE" || confidence === "LOW") {
      this.addFlag({
        code: "LOW_CONFIDENCE",
        severity: "HIGH",
        message: `Market confidence is ${confidence}. Decision reliability compromised.`,
        autoTrigger: true,
      });
    }

    if (weight < 0.5 && score > 7) {
      this.addFlag({
        code: "HIGH_SCORE_LOW_CONFIDENCE",
        severity: "CRITICAL",
        message: "High score with low confidence data — potential false positive.",
        autoTrigger: true,
      });
    }
  }

  private assessVariance(variance: number): void {
    const { maxVariancePercent } = this.config;

    if (Math.abs(variance) > maxVariancePercent) {
      this.addFlag({
        code: "EXTREME_VARIANCE",
        severity: "CRITICAL",
        message: `Variance ${variance.toFixed(1)}% exceeds ${maxVariancePercent}% threshold. Market anomaly detected.`,
        autoTrigger: true,
      });
    } else if (Math.abs(variance) > 30) {
      this.addFlag({
        code: "HIGH_VARIANCE",
        severity: "HIGH",
        message: `Variance ${variance.toFixed(1)}% indicates significant price deviation.`,
        autoTrigger: false,
      });
    }
  }

  private assessYield(scoreResult: ScoreResult): void {
    // Yield check if available in extended ScoreResult
    const yield_ = (scoreResult as any).projectedYield;
    if (yield_ === undefined) return;

    if (yield_ < this.config.minYieldPercent) {
      this.addFlag({
        code: "LOW_YIELD",
        severity: "MEDIUM",
        message: `Yield ${yield_.toFixed(2)}% below minimum ${this.config.minYieldPercent}%.`,
        autoTrigger: false,
      });
    }
  }

  private assessDataQuality(scoreResult: ScoreResult): void {
    const hasSoldData = scoreResult.medianSold !== null && scoreResult.medianSold > 0;

    if (!hasSoldData) {
      this.addFlag({
        code: "NO_SOLD_COMPARABLES",
        severity: "HIGH",
        message: "No recent sold transactions found. Baseline is AI estimate only.",
        autoTrigger: true,
      });
    }

    // Check for suspicious precision
    const baselineStr = scoreResult.baseline?.toString() || "";
    if (baselineStr.includes(".") && baselineStr.split(".")[1].length > 2) {
      this.addFlag({
        code: "SUSPICIOUS_PRECISION",
        severity: "LOW",
        message: "Baseline shows unusual precision — verify calculation source.",
        autoTrigger: false,
      });
    }
  }

  private assessMarketConditions(scoreResult: ScoreResult): void {
    // Detect if variance direction contradicts score
    const { score, variance } = scoreResult;

    if (score >= 8 && variance > 10) {
      this.addFlag({
        code: "SCORE_VARIANCE_MISMATCH",
        severity: "CRITICAL",
        message: "High score but positive variance (overpriced). Algorithm conflict.",
        autoTrigger: true,
      });
    }

    if (score <= 3 && variance < -10) {
      this.addFlag({
        code: "UNDervalued_REJECTED",
        severity: "MEDIUM",
        message: "Low score despite undervaluation — check for hidden risks.",
        autoTrigger: false,
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Action Determination
  // ─────────────────────────────────────────────────────────────────────────────

  private determineAction(
    score: number,
    rawVerdict: string,
    confidence: string
  ): "BUY" | "PASS" | "INVESTIGATE" {
    const hasCriticalFlags = this.flags.some(
      (f) => f.severity === "CRITICAL" && f.autoTrigger
    );
    const hasHighFlags = this.flags.some(
      (f) => f.severity === "HIGH" && f.autoTrigger
    );

    // CRITICAL: Auto-triggered flags force INVESTIGATE
    if (hasCriticalFlags) {
      return "INVESTIGATE";
    }

    // HIGH severity flags downgrade to INVESTIGATE
    if (hasHighFlags && score >= this.config.buyThreshold) {
      return "INVESTIGATE";
    }

    // Confidence gate
    if (confidence === "NONE" || confidence === "LOW") {
      return "INVESTIGATE";
    }

    // Score-based decision
    if (score >= this.config.buyThreshold) {
      return "BUY";
    }

    if (score <= this.config.passThreshold) {
      return "PASS";
    }

    // Borderline cases
    return "INVESTIGATE";
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Confidence Score Calculation (0-100)
  // ─────────────────────────────────────────────────────────────────────────────

  private calculateConfidenceScore(
    score: number,
    confidence: string,
    flags: RiskFlag[]
  ): number {
    let baseScore = score * 10; // 0-100 base

    // Confidence multiplier
    const weight = CONFIDENCE_WEIGHTS[confidence] || 0;
    baseScore *= weight;

    // Flag penalties
    const penalties = flags.reduce((total, flag) => {
      const penaltyMap: Record<string, number> = {
        CRITICAL: 40,
        HIGH: 25,
        MEDIUM: 10,
        LOW: 3,
        INFO: 0,
      };
      return total + (penaltyMap[flag.severity] || 0);
    }, 0);

    const finalScore = Math.max(0, Math.min(100, baseScore - penalties));

    // Bonus for no flags
    if (flags.length === 0) {
      return Math.min(100, finalScore + 10);
    }

    return finalScore;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Summary Generation
  // ─────────────────────────────────────────────────────────────────────────────

  private generateSummary(
    action: string,
    score: number,
    variance: number,
    confidence: string,
    flags: RiskFlag[]
  ): string {
    const actionDescriptions: Record<string, string> = {
      BUY: "Strong investment opportunity identified.",
      PASS: "Risk profile exceeds acceptable thresholds.",
      INVESTIGATE: "Additional due diligence required before decision.",
    };

    const criticalFlags = flags.filter((f) => f.severity === "CRITICAL");
    const warningFlags = flags.filter(
      (f) => f.severity === "HIGH" || f.severity === "MEDIUM"
    );

    let summary = `## ${action} — ${actionDescriptions[action]}\n\n`;
    summary += `**Forensic Score:** ${score}/10 | **Confidence:** ${confidence} | **Variance:** ${variance.toFixed(1)}%\n\n`;

    if (criticalFlags.length > 0) {
      summary += `### 🚨 Critical Issues (${criticalFlags.length})\n`;
      criticalFlags.forEach((f) => {
        summary += `- **${f.code}:** ${f.message}\n`;
      });
      summary += "\n";
    }

    if (warningFlags.length > 0) {
      summary += `### ⚠️ Warnings (${warningFlags.length})\n`;
      warningFlags.forEach((f) => {
        summary += `- **${f.code}:** ${f.message}\n`;
      });
      summary += "\n";
    }

    if (flags.length === 0) {
      summary += "✅ No risk flags detected. Clean analysis.\n\n";
    }

    summary += `**Recommendation:** ${
      action === "BUY"
        ? "Proceed with acquisition after final verification."
        : action === "PASS"
        ? "Avoid investment. Seek alternative opportunities."
        : "Conduct manual review and gather additional market data."
    }`;

    return summary;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Utility Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private addFlag(flag: RiskFlag): void {
    this.flags.push(flag);
  }

  /**
   * Get all flags for external inspection
   */
  getFlags(): RiskFlag[] {
    return [...this.flags];
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(newConfig: Partial<VerdictConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTORY FUNCTION (Convenience)
// ─────────────────────────────────────────────────────────────────────────────

export function createVerdictEngine(config?: Partial<VerdictConfig>): VerdictEngine {
  return new VerdictEngine(config);
}
export default VerdictEngine;