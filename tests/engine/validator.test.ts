import { describe, expect, it } from "vitest";
import {
  CrimeType,
  Difficulty,
  EvidenceDensity,
  TimelineComplexity,
  createEvidenceId,
  createLocationId,
  createPersonId,
  createTimestamp,
} from "../../src/domain/index.js";
import { CaseGenerator, CaseValidator } from "../../src/engine/index.js";

const options = {
  difficulty: Difficulty.HARD,
  crimeType: CrimeType.MURDER,
  suspectCount: 5,
  evidenceDensity: EvidenceDensity.HIGH,
  redHerringCount: 2,
  timelineComplexity: TimelineComplexity.MEDIUM,
  seed: "VALIDATOR-CASE",
};

describe("CaseValidator", () => {
  it("accepts a generated case", () => {
    const generatedCase = new CaseGenerator().generate(options);
    const result = new CaseValidator().validate(generatedCase);

    expect(result).toEqual({ valid: true, issues: [] });
  });

  it("rejects case without victim", () => {
    const generatedCase = new CaseGenerator().generate(options);
    generatedCase.setVictim({
      id: createPersonId("P-OTHER"),
      name: "Other Person",
      age: 40,
      occupation: "Other",
      description: "Not the truth victim",
      deceased: true,
    });

    const result = new CaseValidator().validate(generatedCase);

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual({
      code: "MISSING_VICTIM",
      message: "Truth victim does not exist in case.",
    });
  });

  it("rejects a culprit without opportunity", () => {
    const generatedCase = new CaseGenerator().generate(options);
    const culprit = generatedCase.getSuspect(generatedCase.getTruth().culpritId);
    if (!culprit) {
      throw new Error("Expected culprit suspect");
    }
    culprit.knownLocations = [];

    const result = new CaseValidator().validate(generatedCase);

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "CULPRIT_HAS_NO_OPPORTUNITY")).toBe(true);
  });

  it("rejects an invalid alibi", () => {
    const generatedCase = new CaseGenerator().generate(options);
    const personId = generatedCase.getAllSuspects()[0]!.id;
    generatedCase.addAlibi(personId, {
      personId,
      startTime: createTimestamp("2026-10-14T22:00:00.000Z"),
      endTime: createTimestamp("2026-10-14T20:00:00.000Z"),
      locationId: createLocationId("LOC-404"),
      claimedBy: createEvidenceId("E-ALIBI"),
      verified: false,
    });

    const result = new CaseValidator().validate(generatedCase);

    expect(result.valid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "INVALID_ALIBI")).toBe(true);
  });
});
