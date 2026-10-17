import { EvidenceType, type Evidence, type PersonId } from "../../domain/index.js";
import { Case } from "../case.js";

export type ValidationCode =
  | "MISSING_VICTIM"
  | "MISSING_CULPRIT"
  | "MISSING_CRIME_LOCATION"
  | "INVALID_CRIME_TIME"
  | "CULPRIT_HAS_NO_OPPORTUNITY"
  | "NO_TRUTH_EVIDENCE"
  | "NO_RED_HERRING"
  | "INVALID_TIMELINE"
  | "INVALID_ALIBI";

export interface ValidationIssue {
  code: ValidationCode;
  message: string;
}

export interface CaseValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export class CaseValidator {
  validate(caseInstance: Case): CaseValidationResult {
    const issues: ValidationIssue[] = [];
    const truth = caseInstance.getTruth();
    const victim = caseInstance.getVictim();
    const culprit = caseInstance.getSuspect(truth.culpritId);
    const crimeLocation = caseInstance.getLocation(truth.locationId);

    if (!victim || victim.id !== truth.victimId) {
      issues.push({ code: "MISSING_VICTIM", message: "Truth victim does not exist in case." });
    }

    if (!culprit) {
      issues.push({ code: "MISSING_CULPRIT", message: "Truth culprit is not a suspect in case." });
    }

    if (!crimeLocation) {
      issues.push({ code: "MISSING_CRIME_LOCATION", message: "Truth crime location does not exist in case." });
    }

    if (Number.isNaN(Date.parse(truth.timestamp))) {
      issues.push({ code: "INVALID_CRIME_TIME", message: "Truth crime timestamp is invalid." });
    }

    if (culprit && !culprit.knownLocations.includes(truth.locationId)) {
      issues.push({
        code: "CULPRIT_HAS_NO_OPPORTUNITY",
        message: "Culprit has no known access to the crime location.",
      });
    }

    const evidence = caseInstance.getAllEvidence();
    if (!evidence.some((item) => supportsPersonAtLocation(item, truth.culpritId, truth.locationId))) {
      issues.push({
        code: "NO_TRUTH_EVIDENCE",
        message: "No evidence links the culprit to the crime location.",
      });
    }

    if (!evidence.some((item) => isRedHerring(item, truth.culpritId))) {
      issues.push({
        code: "NO_RED_HERRING",
        message: "No low-relevance evidence points to a non-culprit.",
      });
    }

    for (const event of caseInstance.getAllTimelineEvents()) {
      if (Number.isNaN(Date.parse(event.timestamp)) || !caseInstance.getLocation(event.locationId)) {
        issues.push({
          code: "INVALID_TIMELINE",
          message: `Timeline event ${event.id} has an invalid timestamp or location.`,
        });
        break;
      }
    }

    for (const [personId, alibis] of caseInstance.getAllAlibis()) {
      for (const alibi of alibis) {
        if (
          alibi.personId !== personId ||
          Date.parse(alibi.startTime) > Date.parse(alibi.endTime) ||
          !caseInstance.getLocation(alibi.locationId)
        ) {
          issues.push({
            code: "INVALID_ALIBI",
            message: `Alibi for ${personId} has an invalid range or location.`,
          });
          break;
        }
      }
    }

    return { valid: issues.length === 0, issues };
  }
}

function supportsPersonAtLocation(
  evidence: Evidence,
  personId: PersonId,
  locationId: typeof evidence.locationId
): boolean {
  if (evidence.locationId !== locationId) {
    return false;
  }

  switch (evidence.type) {
    case EvidenceType.FINGERPRINT:
    case EvidenceType.DNA:
      return evidence.personId === personId;
    case EvidenceType.CCTV:
      return evidence.personsDetected.includes(personId);
    case EvidenceType.GPS:
    case EvidenceType.ACCESS_LOG:
      return evidence.personId === personId;
    default:
      return false;
  }
}

function isRedHerring(evidence: Evidence, culpritId: PersonId): boolean {
  return (
    evidence.type === EvidenceType.FINGERPRINT &&
    evidence.personId !== culpritId &&
    evidence.relevance <= 25
  );
}
