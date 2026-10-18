import { describe, expect, it } from "vitest";
import {
  ContradictionSeverity,
  CrimeType,
  Difficulty,
  EvidenceDensity,
  EvidenceType,
  TimelineComplexity,
  createEvidenceId,
  createHypothesisId,
  createLocationId,
  createPersonId,
  createStatementId,
  createTimestamp,
  type Hypothesis,
  type Statement,
} from "../../src/domain/index.js";
import {
  AlibiEngine,
  CaseGenerator,
  ContradictionEngine,
  OpportunityEngine,
  ReasoningEngine,
} from "../../src/engine/index.js";

const options = {
  difficulty: Difficulty.HARD,
  crimeType: CrimeType.MURDER,
  suspectCount: 5,
  evidenceDensity: EvidenceDensity.HIGH,
  redHerringCount: 2,
  timelineComplexity: TimelineComplexity.MEDIUM,
  seed: "PHASE-5-CASE",
};

describe("Phase 5 engines", () => {
  it("detects contradictions between a statement and CCTV", () => {
    const statement: Statement = {
      id: createStatementId("S-001"),
      speakerId: createPersonId("P-MARCUS"),
      content: "I left the office at 21:00.",
      timestamp: createTimestamp("2026-10-14T22:00:00.000Z"),
      reliability: 70,
      claims: ["Left the office"],
    };
    const contradictions = new ContradictionEngine().detect([statement], [{
      id: createEvidenceId("E-001"),
      type: EvidenceType.CCTV,
      title: "Corridor CCTV",
      description: "Marcus detected later.",
      locationId: createLocationId("LOC-OFFICE"),
      discoveredAt: createTimestamp("2026-10-14T21:21:00.000Z"),
      reliability: 94,
      relevance: 90,
      verificationStatus: "VERIFIED",
      timestamp: createTimestamp("2026-10-14T21:21:00.000Z"),
      personsDetected: [statement.speakerId],
      footage: "cctv://office",
    }]);

    expect(contradictions).toHaveLength(1);
    expect(contradictions[0]?.severity).toBe(ContradictionSeverity.MAJOR);
  });

  it("detects alibi conflicts", () => {
    const caseInstance = new CaseGenerator().generate(options);
    const suspect = caseInstance.getAllSuspects()[0]!;
    caseInstance.addAlibi(suspect.id, {
      personId: suspect.id,
      startTime: createTimestamp("2026-10-14T20:00:00.000Z"),
      endTime: createTimestamp("2026-10-15T00:00:00.000Z"),
      locationId: createLocationId("LOC-NOT-REAL"),
      claimedBy: createEvidenceId("E-ALIBI"),
      verified: false,
    });

    expect(new AlibiEngine().detectConflicts(caseInstance)).not.toHaveLength(0);
  });

  it("finds high opportunity for the truth culprit", () => {
    const caseInstance = new CaseGenerator().generate(options);
    const truth = caseInstance.getTruth();
    const analysis = new OpportunityEngine().analyzeOpportunity(
      caseInstance,
      truth.culpritId,
      truth.timestamp,
      truth.locationId
    );

    expect(analysis.presenceConfirmed).toBe(true);
    expect(analysis.hasRequiredAccess).toBe(true);
    expect(analysis.opportunityLevel).toBe("HIGH");
  });

  it("scores strong evidence higher than weak evidence", () => {
    const caseInstance = new CaseGenerator().generate(options);
    const evidence = caseInstance.getAllEvidence();
    const strongEvidence = evidence.find((item) => item.reliability >= 85 && item.relevance >= 85)!;
    const weakEvidence = evidence.find((item) => item.relevance <= 25)!;

    const base = {
      suspectId: caseInstance.getTruth().culpritId,
      createdAt: createTimestamp("2026-10-15T00:00:00.000Z"),
    };
    const strongHypothesis: Hypothesis = {
      ...base,
      id: createHypothesisId("H-STRONG"),
      description: "Strong evidence hypothesis",
      claims: [{
        description: "Suspect was present.",
        supportingEvidenceIds: [strongEvidence.id],
        contradictingEvidenceIds: [],
        status: "PROVEN",
      }],
    };
    const weakHypothesis: Hypothesis = {
      ...base,
      id: createHypothesisId("H-WEAK"),
      description: "Weak evidence hypothesis",
      claims: [{
        description: "Suspect was present.",
        supportingEvidenceIds: [weakEvidence.id],
        contradictingEvidenceIds: [],
        status: "PROVEN",
      }],
    };

    const engine = new ReasoningEngine();
    const strongResult = engine.evaluateHypothesis(strongHypothesis, caseInstance);
    const weakResult = engine.evaluateHypothesis(weakHypothesis, caseInstance);

    expect(strongResult.score).toBeGreaterThan(weakResult.score);
    expect(strongResult.explanations).not.toHaveLength(0);
  });
});
