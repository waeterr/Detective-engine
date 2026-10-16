import { describe, expect, it } from "vitest";
import {
  createPersonId,
  createEvidenceId,
  createLocationId,
  createTimestamp,
  EvidenceType,
  VerificationStatus,
  type FingerprintEvidence,
  type CctvEvidence,
} from "../../src/domain/index.js";

describe("discriminated unions", () => {
  it("enforces exhaustive checking on evidence types", () => {
    const fingerprint: FingerprintEvidence = {
      id: createEvidenceId("E-001"),
      type: EvidenceType.FINGERPRINT,
      title: "Fingerprint",
      description: "Found on door handle",
      locationId: createLocationId("LOC-001"),
      discoveredAt: createTimestamp("2026-10-14T21:30:00.000Z"),
      reliability: 95,
      relevance: 80,
      verificationStatus: VerificationStatus.VERIFIED,
      personId: createPersonId("P-001"),
      matchConfidence: 95,
    };

    const cctv: CctvEvidence = {
      id: createEvidenceId("E-002"),
      type: EvidenceType.CCTV,
      title: "CCTV Footage",
      description: "Corridor camera",
      locationId: createLocationId("LOC-002"),
      discoveredAt: createTimestamp("2026-10-14T21:35:00.000Z"),
      reliability: 90,
      relevance: 85,
      verificationStatus: VerificationStatus.VERIFIED,
      timestamp: createTimestamp("2026-10-14T21:21:00.000Z"),
      personsDetected: [createPersonId("P-001")],
      footage: "footage-url",
    };

    function getEvidenceDescription(evidence: FingerprintEvidence | CctvEvidence): string {
      switch (evidence.type) {
        case EvidenceType.FINGERPRINT:
          return `Fingerprint match: ${evidence.matchConfidence}%`;
        case EvidenceType.CCTV:
          return `CCTV detected ${evidence.personsDetected.length} person(s)`;
        default: {
          const _exhaustive: never = evidence;
          throw new Error(`Unhandled evidence type: ${_exhaustive}`);
        }
      }
    }

    expect(getEvidenceDescription(fingerprint)).toBe("Fingerprint match: 95%");
    expect(getEvidenceDescription(cctv)).toBe("CCTV detected 1 person(s)");
  });
});
