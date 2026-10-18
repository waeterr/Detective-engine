import type { CaseId, PersonId, EvidenceId, HypothesisId } from "../domain/ids.js";
import type { Case } from "../engine/case.js";
import type { CaseBrief } from "../domain/case.js";
import type { Evidence } from "../domain/evidence.js";
import type { Suspect, Victim, Witness } from "../domain/person.js";
import type { Location, TimelineEvent } from "../domain/timeline.js";
import type { Statement } from "../domain/statement.js";

export interface CaseResponse {
  id: CaseId;
  seed: string;
  brief: CaseBrief;
  suspects: Suspect[];
  victim: Victim | null;
  witnesses: Witness[];
  locations: Location[];
  evidence: Evidence[];
  timeline: TimelineEvent[];
  statements: Statement[];
}

export interface HypothesisEvaluationRequest {
  hypothesisId: HypothesisId;
  suspectId: PersonId;
  description: string;
  claims: Array<{
    description: string;
    supportingEvidenceIds: EvidenceId[];
    contradictingEvidenceIds: EvidenceId[];
  }>;
}

export interface ConclusionRequest {
  culpritId: PersonId | null;
  confidence: "LOW" | "MEDIUM" | "HIGH" | "CERTAIN";
}

export interface ConclusionResponse {
  correct: boolean;
  actualCulpritId: PersonId;
  score: number;
}

export function toCaseResponse(caseInstance: Case): CaseResponse {
  return {
    id: caseInstance.id,
    seed: caseInstance.seed,
    brief: caseInstance.brief,
    suspects: caseInstance.getAllSuspects(),
    victim: caseInstance.getVictim(),
    witnesses: caseInstance.getAllWitnesses(),
    locations: caseInstance.getAllLocations(),
    evidence: caseInstance.getAllEvidence(),
    timeline: caseInstance.getAllTimelineEvents(),
    statements: caseInstance.getAllStatements(),
  };
}
