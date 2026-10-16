import { describe, expect, it } from "vitest";
import {
  EvidenceType,
  VerificationStatus,
  createEvidenceId,
  createLocationId,
  createPersonId,
  createTimestamp,
  timestampToDate,
  type Evidence,
} from "../../src/domain/index.js";

describe("domain primitives", () => {
  it("creates branded identifiers from strings", () => {
    expect(createPersonId("PERSON-001")).toBe("PERSON-001");
    expect(createEvidenceId("E-001")).toBe("E-001");
    expect(createLocationId("LOC-001")).toBe("LOC-001");
  });

  it("round-trips ISO timestamps", () => {
    const timestamp = createTimestamp("2026-10-14T21:30:00.000Z");

    expect(timestampToDate(timestamp).toISOString()).toBe(timestamp);
  });

  it("narrows evidence through its type discriminator", () => {
    const evidence: Evidence = {
      id: createEvidenceId("E-017"),
      type: EvidenceType.FINGERPRINT,
      title: "Office desk fingerprint",
      description: "Partial print recovered from the desk.",
      locationId: createLocationId("LOC-OFFICE"),
      discoveredAt: createTimestamp("2026-10-14T21:52:00.000Z"),
      reliability: 92,
      relevance: 74,
      verificationStatus: VerificationStatus.VERIFIED,
      personId: createPersonId("PERSON-MARCUS"),
      matchConfidence: 92,
    };

    if (evidence.type !== EvidenceType.FINGERPRINT) {
      throw new Error("Expected fingerprint evidence");
    }

    expect(evidence.matchConfidence).toBe(92);
    expect(evidence.personId).toBe("PERSON-MARCUS");
  });
});
