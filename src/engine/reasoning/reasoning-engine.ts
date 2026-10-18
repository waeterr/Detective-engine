import {
  ConfidenceLevel,
  type EvidenceId,
  type Explanation,
  type Hypothesis,
  type ReasoningResult,
} from "../../domain/index.js";
import { Case } from "../case.js";

export class ReasoningEngine {
  evaluateHypothesis(hypothesis: Hypothesis, caseInstance: Case): ReasoningResult {
    const supportingEvidence: EvidenceId[] = [];
    const contradictingEvidence: EvidenceId[] = [];
    const explanations: Explanation[] = [];
    let totalScore = 0;

    for (const claim of hypothesis.claims) {
      for (const evidenceId of claim.supportingEvidenceIds) {
        const evidence = caseInstance.getEvidence(evidenceId);
        if (!evidence) continue;

        const contribution = (evidence.reliability / 100) * (evidence.relevance / 100);
        totalScore += contribution;

        if (!supportingEvidence.includes(evidenceId)) {
          supportingEvidence.push(evidenceId);
        }
      }

      for (const evidenceId of claim.contradictingEvidenceIds) {
        const evidence = caseInstance.getEvidence(evidenceId);
        if (!evidence) continue;

        const penalty = (evidence.reliability / 100) * (evidence.relevance / 100) * 0.5;
        totalScore -= penalty;

        if (!contradictingEvidence.includes(evidenceId)) {
          contradictingEvidence.push(evidenceId);
        }
      }
    }

    if (supportingEvidence.length > 0) {
      explanations.push({
        reason: `${supportingEvidence.length} pieces of supporting evidence corroborate the hypothesis.`,
        evidenceIds: supportingEvidence,
        weight: supportingEvidence.length * 0.2,
      });
    }

    if (contradictingEvidence.length > 0) {
      explanations.push({
        reason: `${contradictingEvidence.length} pieces of evidence contradict the hypothesis.`,
        evidenceIds: contradictingEvidence,
        weight: -contradictingEvidence.length * 0.15,
      });
    }

    const normalizedScore = Math.max(0, Math.min(100, totalScore * 100));

    const unresolvedClaims = hypothesis.claims.filter((claim) => claim.status === "UNRESOLVED");

    const confidence = this.scoreToConfidence(normalizedScore, unresolvedClaims.length);

    return {
      hypothesisId: hypothesis.id,
      score: normalizedScore,
      confidence,
      supportingEvidence,
      contradictingEvidence,
      unresolvedClaims,
      explanations,
    };
  }

  private scoreToConfidence(score: number, unresolvedCount: number): ConfidenceLevel {
    if (unresolvedCount > 3) {
      return ConfidenceLevel.VERY_LOW;
    }

    if (score >= 85) return ConfidenceLevel.VERY_HIGH;
    if (score >= 70) return ConfidenceLevel.HIGH;
    if (score >= 50) return ConfidenceLevel.MEDIUM;
    if (score >= 30) return ConfidenceLevel.LOW;
    return ConfidenceLevel.VERY_LOW;
  }
}
