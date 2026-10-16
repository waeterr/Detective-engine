import type { CaseId, EvidenceId, LocationId, PersonId } from "./ids.js";
import type { Timestamp } from "./timestamp.js";
import type { CrimeType, Difficulty, EvidenceDensity, TimelineComplexity } from "./enums.js";

export interface CaseTruth {
  culpritId: PersonId;
  victimId: PersonId;
  method: string;
  locationId: LocationId;
  timestamp: Timestamp;
  motive: string;
}

export interface CaseGenerationOptions {
  difficulty: Difficulty;
  crimeType: CrimeType;
  suspectCount: number;
  evidenceDensity: EvidenceDensity;
  redHerringCount: number;
  timelineComplexity: TimelineComplexity;
  seed?: string;
}

export interface CaseBrief {
  title: string;
  summary: string;
  crimeType: CrimeType;
  occurredAt: Timestamp;
  locationId: LocationId;
  victimId: PersonId;
}

export interface EvidenceConnection {
  sourceEvidenceId: EvidenceId;
  targetEvidenceId: EvidenceId;
}

export interface InvestigationCase {
  id: CaseId;
  seed: string;
  difficulty: Difficulty;
  brief: CaseBrief;
  truth: CaseTruth;
}
