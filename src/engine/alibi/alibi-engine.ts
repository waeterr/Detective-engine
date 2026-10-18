import {
  timestampToDate,
  type Alibi,
  type EvidenceId,
  type PersonId,
  type Timestamp,
} from "../../domain/index.js";
import { Case } from "../case.js";

export interface AlibiConflict {
  personId: PersonId;
  alibi: Alibi;
  conflictingEvidenceIds: EvidenceId[];
  description: string;
}

export class AlibiEngine {
  detectConflicts(caseInstance: Case): AlibiConflict[] {
    const conflicts: AlibiConflict[] = [];

    for (const [personId, alibis] of caseInstance.getAllAlibis()) {
      for (const alibi of alibis) {
        const conflictingEvidence: EvidenceId[] = [];

        for (const event of caseInstance.getAllTimelineEvents()) {
          if (!event.personIds.includes(personId)) {
            continue;
          }

          if (
            event.locationId !== alibi.locationId &&
            this.timeWithinRange(event.timestamp, alibi.startTime, alibi.endTime)
          ) {
            conflictingEvidence.push(...event.evidenceIds);
          }
        }

        for (const evidence of caseInstance.getAllEvidence()) {
          if (
            evidence.type === "CCTV" &&
            evidence.personsDetected.includes(personId) &&
            evidence.locationId !== alibi.locationId &&
            this.timeWithinRange(evidence.timestamp, alibi.startTime, alibi.endTime)
          ) {
            conflictingEvidence.push(evidence.id);
          }

          if (
            evidence.type === "ACCESS_LOG" &&
            evidence.personId === personId &&
            evidence.locationId !== alibi.locationId &&
            this.timeWithinRange(evidence.timestamp, alibi.startTime, alibi.endTime)
          ) {
            conflictingEvidence.push(evidence.id);
          }

          if (
            evidence.type === "GPS" &&
            evidence.personId === personId &&
            this.timeWithinRange(evidence.timestamp, alibi.startTime, alibi.endTime)
          ) {
            conflictingEvidence.push(evidence.id);
          }
        }

        if (conflictingEvidence.length > 0) {
          conflicts.push({
            personId,
            alibi,
            conflictingEvidenceIds: [...new Set(conflictingEvidence)],
            description: `Alibi claims presence at ${alibi.locationId}, but evidence places person elsewhere.`,
          });
        }
      }
    }

    return conflicts;
  }

  private timeWithinRange(timestamp: Timestamp, start: Timestamp, end: Timestamp): boolean {
    const time = timestampToDate(timestamp).getTime();
    const startTime = timestampToDate(start).getTime();
    const endTime = timestampToDate(end).getTime();
    return time >= startTime && time <= endTime;
  }
}
