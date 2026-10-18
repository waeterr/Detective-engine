import {
  timestampToDate,
  type EvidenceId,
  type LocationId,
  type PersonId,
  type Timestamp,
} from "../../domain/index.js";
import { Case } from "../case.js";

export interface OpportunityAnalysis {
  personId: PersonId;
  couldReachCrimeScene: boolean;
  estimatedTravelTime: number;
  hasRequiredAccess: boolean;
  presenceConfirmed: boolean;
  opportunityLevel: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CERTAIN";
  supportingEvidence: EvidenceId[];
}

export class OpportunityEngine {
  analyzeOpportunity(
    caseInstance: Case,
    personId: PersonId,
    crimeTime: Timestamp,
    crimeLocationId: LocationId
  ): OpportunityAnalysis {
    const person = caseInstance.getPerson(personId);
    if (!person) {
      throw new Error(`Person ${personId} not found`);
    }

    const suspect = caseInstance.getSuspect(personId);
    const supportingEvidence: EvidenceId[] = [];
    let presenceConfirmed = false;
    let hasRequiredAccess = false;

    const crimeLocation = caseInstance.getLocation(crimeLocationId);
    if (crimeLocation) {
      hasRequiredAccess = !crimeLocation.accessRestricted;
    }

    const crimeDate = timestampToDate(crimeTime);
    const timeWindow = 30 * 60 * 1000;

    for (const event of caseInstance.getAllTimelineEvents()) {
      const eventDate = timestampToDate(event.timestamp);
      const timeDiff = Math.abs(eventDate.getTime() - crimeDate.getTime());

      if (
        event.personIds.includes(personId) &&
        event.locationId === crimeLocationId &&
        timeDiff <= timeWindow
      ) {
        presenceConfirmed = true;
        supportingEvidence.push(...event.evidenceIds);
      }
    }

    for (const evidence of caseInstance.getAllEvidence()) {
      if (evidence.locationId !== crimeLocationId) {
        continue;
      }

      if (
        evidence.type === "FINGERPRINT" &&
        evidence.personId === personId
      ) {
        presenceConfirmed = true;
        supportingEvidence.push(evidence.id);
      }

      if (
        evidence.type === "CCTV" &&
        evidence.personsDetected.includes(personId)
      ) {
        presenceConfirmed = true;
        supportingEvidence.push(evidence.id);
      }

      if (
        evidence.type === "ACCESS_LOG" &&
        evidence.personId === personId
      ) {
        hasRequiredAccess = true;
        supportingEvidence.push(evidence.id);
      }
    }

    if (suspect?.knownLocations.includes(crimeLocationId)) {
      hasRequiredAccess = true;
    }

    let opportunityLevel: OpportunityAnalysis["opportunityLevel"] = "NONE";

    if (presenceConfirmed && hasRequiredAccess) {
      opportunityLevel = "HIGH";
    } else if (presenceConfirmed || hasRequiredAccess) {
      opportunityLevel = "MEDIUM";
    } else {
      opportunityLevel = "LOW";
    }

    return {
      personId,
      couldReachCrimeScene: true,
      estimatedTravelTime: 5,
      hasRequiredAccess,
      presenceConfirmed,
      opportunityLevel,
      supportingEvidence: [...new Set(supportingEvidence)],
    };
  }
}
