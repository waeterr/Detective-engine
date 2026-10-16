import type { HypothesisId, PersonId, EvidenceId } from "./ids.js";
import type { Timestamp } from "./timestamp.js";
import type { ConfidenceLevel } from "./enums.js";

export interface Claim {
  description: string;
  supportingEvidenceIds: EvidenceId[];
  contradictingEvidenceIds: EvidenceId[];
  status: "PROVEN" | "DISPROVEN" | "UNRESOLVED";
}

export interface Hypothesis {
  id: HypothesisId;
  suspectId: PersonId;
  description: string;
  claims: Claim[];
  createdAt: Timestamp;
}

export interface Explanation {
  reason: string;
  evidenceIds: EvidenceId[];
  weight: number;
}

export interface ReasoningResult {
  hypothesisId: HypothesisId;
  score: number;
  confidence: ConfidenceLevel;
  supportingEvidence: EvidenceId[];
  contradictingEvidence: EvidenceId[];
  unresolvedClaims: Claim[];
  explanations: Explanation[];
}
