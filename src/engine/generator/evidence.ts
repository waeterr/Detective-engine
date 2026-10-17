import {
  createEvidenceId,
  EvidenceType,
  VerificationStatus,
  type CaseTruth,
  type CctvEvidence,
  type Evidence,
  type FingerprintEvidence,
  type LocationId,
  type PersonId,
  type TimelineEvent,
} from "../../domain/index.js";
import { SeededRandom } from "../../infrastructure/random.js";

export function generateEvidence(
  random: SeededRandom,
  truth: CaseTruth,
  timeline: TimelineEvent[],
  suspectIds: PersonId[],
  locations: LocationId[]
): Evidence[] {
  const evidence: Evidence[] = [];
  const crimeEvent = timeline.find((event) => event.id === "TE-CRIME");

  const cctv: CctvEvidence = {
    id: createEvidenceId("E-001"),
    type: EvidenceType.CCTV,
    title: "Corridor CCTV Footage",
    description: "CCTV records the culprit near the crime location.",
    locationId: truth.locationId,
    discoveredAt: truth.timestamp,
    reliability: 90,
    relevance: 90,
    verificationStatus: VerificationStatus.VERIFIED,
    timestamp: truth.timestamp,
    personsDetected: [truth.culpritId],
    footage: "cctv://corridor-camera",
  };
  evidence.push(cctv);

  const fingerprint: FingerprintEvidence = {
    id: createEvidenceId("E-002"),
    type: EvidenceType.FINGERPRINT,
    title: "Fingerprint at Crime Scene",
    description: "A partial fingerprint recovered near the victim.",
    locationId: truth.locationId,
    discoveredAt: truth.timestamp,
    reliability: 85,
    relevance: 85,
    verificationStatus: VerificationStatus.VERIFIED,
    personId: truth.culpritId,
    matchConfidence: 87,
  };
  evidence.push(fingerprint);

  const redHerringCandidates = suspectIds.filter((id) => id !== truth.culpritId);
  if (redHerringCandidates.length > 0) {
    const redHerringPerson = random.choice(redHerringCandidates);
    evidence.push({
      id: createEvidenceId("E-003"),
      type: EvidenceType.FINGERPRINT,
      title: "Older Fingerprint",
      description: "Print predates the crime and only establishes prior presence.",
      locationId: random.choice(locations),
      discoveredAt: truth.timestamp,
      reliability: 75,
      relevance: 25,
      verificationStatus: VerificationStatus.VERIFIED,
      personId: redHerringPerson,
      matchConfidence: 90,
    });
  }

  const targetCount = random.nextInt(8, 12);
  for (let i = evidence.length; i < targetCount; i++) {
    const personId = random.choice(suspectIds);
    const locationId = random.choice(locations);
    const event = random.choice(timeline);

    evidence.push({
      id: createEvidenceId(`E-${String(i + 1).padStart(3, "0")}`),
      type: EvidenceType.ACCESS_LOG,
      title: "Access Control Record",
      description: "A recorded access event requiring further analysis.",
      locationId,
      discoveredAt: event.timestamp,
      reliability: random.nextInt(55, 90),
      relevance: random.nextInt(30, 75),
      verificationStatus: VerificationStatus.VERIFIED,
      personId,
      timestamp: event.timestamp,
      accessGranted: random.boolean(0.8),
    });
  }

  if (crimeEvent) {
    crimeEvent.evidenceIds.push(cctv.id, fingerprint.id);
  }

  return evidence;
}
