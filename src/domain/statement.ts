import type { StatementId, PersonId, EvidenceId } from "./ids.js";
import type { Timestamp } from "./timestamp.js";
import type { ContradictionSeverity } from "./enums.js";

export interface Statement {
  id: StatementId;
  speakerId: PersonId;
  content: string;
  timestamp: Timestamp;
  reliability: number;
  claims: string[];
}

export interface Contradiction {
  id: string;
  severity: ContradictionSeverity;
  description: string;
  evidenceIds: EvidenceId[];
  statementIds?: StatementId[];
  detected: boolean;
}
