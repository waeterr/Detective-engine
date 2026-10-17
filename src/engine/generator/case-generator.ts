import {
  createCaseId,
  type CaseGenerationOptions,
  type CaseBrief,
  type InvestigationCase,
} from "../../domain/index.js";
import { Case as CaseAggregate } from "../case.js";
import { SeededRandom } from "../../infrastructure/random.js";
import { generateEvidence } from "./evidence.js";
import { generateLocations } from "./locations.js";
import { generatePeople } from "./people.js";
import { generateTimeline } from "./timeline.js";
import { generateTruth } from "./truth.js";

function generateSeed(): string {
  return `CASE-${Date.now().toString(36).toUpperCase()}`;
}

export class CaseGenerator {
  generate(options: CaseGenerationOptions): CaseAggregate {
    if (!Number.isInteger(options.suspectCount) || options.suspectCount < 1 || options.suspectCount > 10) {
      throw new Error("suspectCount must be an integer between 1 and 10");
    }

    const seed = options.seed ?? generateSeed();
    const random = new SeededRandom(seed);
    const locations = generateLocations(random);
    const people = generatePeople(random, options.suspectCount);
    const truth = generateTruth(
      random,
      people.victim.id,
      people.suspects.map((suspect) => suspect.id),
      locations.map((location) => location.id)
    );
    const timeline = generateTimeline(
      random,
      truth,
      people.suspects.map((suspect) => suspect.id),
      people.witnesses.map((witness) => witness.id),
      locations.map((location) => location.id)
    );
    const evidence = generateEvidence(
      random,
      truth,
      timeline,
      people.suspects.map((suspect) => suspect.id),
      locations.map((location) => location.id)
    );

    const brief: CaseBrief = {
      title: `${random.choice(["The Silent", "The Final", "The Broken", "The Last"])} ${random.choice(["Room", "Alibi", "Promise", "Signal"])}`,
      summary: `An unexplained ${options.crimeType.toLowerCase()} requires investigation.`,
      crimeType: options.crimeType,
      occurredAt: truth.timestamp,
      locationId: truth.locationId,
      victimId: people.victim.id,
    };

    const investigationCase: InvestigationCase = {
      id: createCaseId(seed),
      seed,
      difficulty: options.difficulty,
      brief,
      truth,
    };

    const caseInstance = new CaseAggregate(investigationCase);
    locations.forEach((location) => caseInstance.addLocation(location));
    caseInstance.setVictim(people.victim);
    people.suspects.forEach((suspect) => {
      suspect.knownLocations = [truth.locationId];
      caseInstance.addSuspect(suspect);
    });
    people.witnesses.forEach((witness) => caseInstance.addWitness(witness));
    timeline.forEach((event) => caseInstance.addTimelineEvent(event));
    evidence.forEach((item) => caseInstance.addEvidence(item));

    return caseInstance;
  }
}
