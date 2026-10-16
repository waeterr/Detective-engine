import { describe, expect, it } from "vitest";
import { Case } from "../../src/engine/case.js";
import {
  createCaseId,
  createPersonId,
  createEvidenceId,
  createLocationId,
  createStatementId,
  createTimelineEventId,
  createTimestamp,
  CrimeType,
  Difficulty,
  EvidenceType,
  VerificationStatus,
  MotiveCategory,
  MotiveStrength,
  type InvestigationCase,
  type Suspect,
  type Victim,
  type Witness,
  type Location,
  type FingerprintEvidence,
  type TimelineEvent,
  type Statement,
} from "../../src/domain/index.js";

describe("Case aggregate", () => {
  const mockCase: InvestigationCase = {
    id: createCaseId("CASE-001"),
    seed: "SEED-001",
    difficulty: Difficulty.MEDIUM,
    brief: {
      title: "The Silent Room",
      summary: "A murder in a hotel room",
      crimeType: CrimeType.MURDER,
      occurredAt: createTimestamp("2026-10-14T21:30:00.000Z"),
      locationId: createLocationId("LOC-HOTEL"),
      victimId: createPersonId("P-VICTIM"),
    },
    truth: {
      culpritId: createPersonId("P-MARCUS"),
      victimId: createPersonId("P-VICTIM"),
      method: "Blunt force trauma",
      locationId: createLocationId("LOC-HOTEL"),
      timestamp: createTimestamp("2026-10-14T21:30:00.000Z"),
      motive: "Financial dispute",
    },
  };

  it("creates a case from investigation case data", () => {
    const caseInstance = new Case(mockCase);

    expect(caseInstance.id).toBe("CASE-001");
    expect(caseInstance.seed).toBe("SEED-001");
    expect(caseInstance.brief.title).toBe("The Silent Room");
  });

  it("manages suspects", () => {
    const caseInstance = new Case(mockCase);

    const suspect: Suspect = {
      id: createPersonId("P-MARCUS"),
      name: "Marcus Carter",
      age: 42,
      occupation: "Business Partner",
      description: "Former business associate",
      relationshipToVictim: "Business Partner",
      knownLocations: [createLocationId("LOC-HOTEL")],
      motive: {
        category: MotiveCategory.MONEY,
        strength: MotiveStrength.HIGH,
        description: "Financial dispute over partnership",
      },
    };

    caseInstance.addSuspect(suspect);

    expect(caseInstance.getSuspect(suspect.id)).toEqual(suspect);
    expect(caseInstance.getAllSuspects()).toHaveLength(1);
    expect(caseInstance.getPerson(suspect.id)).toEqual(suspect);
  });

  it("manages victim", () => {
    const caseInstance = new Case(mockCase);

    const victim: Victim = {
      id: createPersonId("P-VICTIM"),
      name: "John Doe",
      age: 45,
      occupation: "Business Owner",
      description: "Hotel guest",
      deceased: true,
    };

    caseInstance.setVictim(victim);

    expect(caseInstance.getVictim()).toEqual(victim);
    expect(caseInstance.getPerson(victim.id)).toEqual(victim);
  });

  it("manages witnesses", () => {
    const caseInstance = new Case(mockCase);

    const witness: Witness = {
      id: createPersonId("P-HELEN"),
      name: "Helen Smith",
      age: 38,
      occupation: "Hotel Staff",
      description: "Found the body",
      credibility: 85,
    };

    caseInstance.addWitness(witness);

    expect(caseInstance.getWitness(witness.id)).toEqual(witness);
    expect(caseInstance.getAllWitnesses()).toHaveLength(1);
  });

  it("manages evidence", () => {
    const caseInstance = new Case(mockCase);

    const evidence: FingerprintEvidence = {
      id: createEvidenceId("E-001"),
      type: EvidenceType.FINGERPRINT,
      title: "Fingerprint on door",
      description: "Partial print found on door handle",
      locationId: createLocationId("LOC-HOTEL"),
      discoveredAt: createTimestamp("2026-10-14T22:00:00.000Z"),
      reliability: 90,
      relevance: 85,
      verificationStatus: VerificationStatus.VERIFIED,
      personId: createPersonId("P-MARCUS"),
      matchConfidence: 92,
    };

    caseInstance.addEvidence(evidence);

    expect(caseInstance.getEvidence(evidence.id)).toEqual(evidence);
    expect(caseInstance.getAllEvidence()).toHaveLength(1);
  });

  it("manages locations", () => {
    const caseInstance = new Case(mockCase);

    const location: Location = {
      id: createLocationId("LOC-HOTEL"),
      name: "Blackwood Hotel",
      description: "Luxury hotel room 305",
      address: "123 Main St",
      accessRestricted: true,
    };

    caseInstance.addLocation(location);

    expect(caseInstance.getLocation(location.id)).toEqual(location);
    expect(caseInstance.getAllLocations()).toHaveLength(1);
  });

  it("manages timeline events sorted by timestamp", () => {
    const caseInstance = new Case(mockCase);

    const event1: TimelineEvent = {
      id: createTimelineEventId("TE-001"),
      timestamp: createTimestamp("2026-10-14T21:00:00.000Z"),
      description: "Marcus enters hotel",
      locationId: createLocationId("LOC-HOTEL"),
      personIds: [createPersonId("P-MARCUS")],
      evidenceIds: [],
    };

    const event2: TimelineEvent = {
      id: createTimelineEventId("TE-002"),
      timestamp: createTimestamp("2026-10-14T21:30:00.000Z"),
      description: "Estimated time of death",
      locationId: createLocationId("LOC-HOTEL"),
      personIds: [],
      evidenceIds: [],
    };

    caseInstance.addTimelineEvent(event2);
    caseInstance.addTimelineEvent(event1);

    const timeline = caseInstance.getAllTimelineEvents();
    expect(timeline).toHaveLength(2);
    expect(timeline[0].id).toBe(event1.id);
    expect(timeline[1].id).toBe(event2.id);
  });

  it("manages statements by speaker", () => {
    const caseInstance = new Case(mockCase);

    const statement: Statement = {
      id: createStatementId("S-001"),
      speakerId: createPersonId("P-MARCUS"),
      content: "I left the office at 21:00",
      timestamp: createTimestamp("2026-10-15T10:00:00.000Z"),
      reliability: 60,
      claims: ["Left at 21:00", "Was in office"],
    };

    caseInstance.addStatement(statement);

    expect(caseInstance.getStatement(statement.id)).toEqual(statement);
    expect(caseInstance.getStatementsBySpeaker(statement.speakerId)).toHaveLength(1);
  });

  it("manages alibis per person", () => {
    const caseInstance = new Case(mockCase);

    const alibi = {
      personId: createPersonId("P-MARCUS"),
      startTime: createTimestamp("2026-10-14T20:00:00.000Z"),
      endTime: createTimestamp("2026-10-14T22:00:00.000Z"),
      locationId: createLocationId("LOC-LOBBY"),
      claimedBy: createEvidenceId("E-STATEMENT"),
      verified: false,
    };

    caseInstance.addAlibi(alibi.personId, alibi);

    const alibis = caseInstance.getAlibis(alibi.personId);
    expect(alibis).toHaveLength(1);
    expect(alibis[0]).toEqual(alibi);
  });

  it("manages evidence connections and retrieves connected evidence", () => {
    const caseInstance = new Case(mockCase);

    const e1 = createEvidenceId("E-001");
    const e2 = createEvidenceId("E-002");
    const e3 = createEvidenceId("E-003");

    caseInstance.addEvidenceConnection({
      sourceEvidenceId: e1,
      targetEvidenceId: e2,
    });

    caseInstance.addEvidenceConnection({
      sourceEvidenceId: e2,
      targetEvidenceId: e3,
    });

    const connectedToE2 = caseInstance.getConnectedEvidence(e2);
    expect(connectedToE2).toHaveLength(2);
    expect(connectedToE2).toContain(e1);
    expect(connectedToE2).toContain(e3);
  });

  it("exposes truth through getTruth()", () => {
    const caseInstance = new Case(mockCase);

    const truth = caseInstance.getTruth();
    expect(truth.culpritId).toBe("P-MARCUS");
    expect(truth.victimId).toBe("P-VICTIM");
  });
});
