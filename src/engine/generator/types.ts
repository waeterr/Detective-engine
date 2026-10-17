import type { Case } from "../case.js";
import type {
  CaseGenerationOptions,
  CaseTruth,
  Evidence,
  Location,
  PersonId,
  Suspect,
  TimelineEvent,
  Victim,
  Witness,
} from "../../domain/index.js";

export interface GeneratedCaseData {
  case: Case;
  truth: CaseTruth;
}

export interface GeneratedPeople {
  victim: Victim;
  suspects: Suspect[];
  witnesses: Witness[];
}

export interface GeneratedCaseContent {
  locations: Location[];
  people: GeneratedPeople;
  truth: CaseTruth;
  timeline: TimelineEvent[];
  evidence: Evidence[];
}

export type { CaseGenerationOptions, PersonId };
