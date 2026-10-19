import { describe, expect, it } from "vitest";
import { CaseGenerator } from "../../src/engine/index.js";
import {
  CrimeType,
  Difficulty,
  EvidenceDensity,
  EvidenceType,
  TimelineComplexity,
} from "../../src/domain/index.js";

const options = {
  difficulty: Difficulty.HARD,
  crimeType: CrimeType.MURDER,
  suspectCount: 5,
  evidenceDensity: EvidenceDensity.HIGH,
  redHerringCount: 2,
  timelineComplexity: TimelineComplexity.MEDIUM,
  seed: "CASE-827194",
};

describe("CaseGenerator", () => {
  it("generates the same case from the same seed", () => {
    const generator = new CaseGenerator();
    const first = generator.generate(options);
    const second = generator.generate(options);

    expect(first.id).toBe(second.id);
    expect(first.brief).toEqual(second.brief);
    expect(first.getTruth()).toEqual(second.getTruth());
    expect(first.getAllSuspects()).toEqual(second.getAllSuspects());
    expect(first.getAllEvidence()).toEqual(second.getAllEvidence());
    expect(first.getAllTimelineEvents()).toEqual(second.getAllTimelineEvents());
  });

  it("generates different case data from different seeds", () => {
    const generator = new CaseGenerator();
    const first = generator.generate({ ...options, seed: "CASE-A" });
    const second = generator.generate({ ...options, seed: "CASE-B" });

    expect(first.getTruth()).not.toEqual(second.getTruth());
  });

  it("creates a complete playable case", () => {
    const generatedCase = new CaseGenerator().generate(options);
    const truth = generatedCase.getTruth();

    expect(generatedCase.getVictim()).not.toBeNull();
    expect(generatedCase.getAllSuspects()).toHaveLength(options.suspectCount);
    expect(generatedCase.getAllLocations().length).toBeGreaterThanOrEqual(3);
    expect(generatedCase.getAllTimelineEvents().length).toBeGreaterThanOrEqual(9);
    expect(generatedCase.getAllEvidence().length).toBeGreaterThanOrEqual(8);
    expect(generatedCase.getAllStatements()).toHaveLength(options.suspectCount);
    expect(generatedCase.getSuspect(truth.culpritId)).toBeDefined();
    expect(generatedCase.getVictim()?.id).toBe(truth.victimId);
    expect(generatedCase.getLocation(truth.locationId)).toBeDefined();
  });

  it("provides verified evidence linked to the culprit", () => {
    const generatedCase = new CaseGenerator().generate(options);
    const truth = generatedCase.getTruth();
    const evidence = generatedCase.getAllEvidence();

    const culpritCctv = evidence.find(
      (item) =>
        item.type === EvidenceType.CCTV &&
        item.personsDetected.includes(truth.culpritId)
    );
    const culpritFingerprint = evidence.find(
      (item) =>
        item.type === EvidenceType.FINGERPRINT &&
        item.personId === truth.culpritId
    );

    expect(culpritCctv).toBeDefined();
    expect(culpritFingerprint).toBeDefined();
  });

  it("includes a red herring linked to a non-culprit", () => {
    const generatedCase = new CaseGenerator().generate(options);
    const truth = generatedCase.getTruth();
    const redHerring = generatedCase.getAllEvidence().find(
      (item) =>
        item.type === EvidenceType.FINGERPRINT &&
        item.personId !== truth.culpritId &&
        item.relevance <= 25
    );

    expect(redHerring).toBeDefined();
  });

  it("rejects invalid suspect counts", () => {
    const generator = new CaseGenerator();

    expect(() => generator.generate({ ...options, suspectCount: 0 })).toThrow(
      "suspectCount must be an integer between 1 and 10"
    );
    expect(() => generator.generate({ ...options, suspectCount: 11 })).toThrow(
      "suspectCount must be an integer between 1 and 10"
    );
  });
});
