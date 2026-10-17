import {
  createTimestamp,
  type CaseTruth,
  type LocationId,
  type PersonId,
} from "../../domain/index.js";
import { SeededRandom } from "../../infrastructure/random.js";

export function generateTruth(
  random: SeededRandom,
  victimId: PersonId,
  suspectIds: PersonId[],
  locationIds: LocationId[]
): CaseTruth {
  const culpritId = random.choice(suspectIds);
  const crimeLocationId = random.choice(locationIds);

  const baseDate = new Date("2026-10-14T20:00:00.000Z");
  const crimeMinutes = random.nextInt(0, 180);
  const crimeDate = new Date(baseDate.getTime() + crimeMinutes * 60 * 1000);

  const methods = [
    "Blunt force trauma",
    "Strangulation",
    "Poisoning",
    "Knife wound",
    "Gunshot",
  ];

  const motives = [
    "Financial dispute over partnership",
    "Revenge for past betrayal",
    "Silencing a witness",
    "Jealousy over relationship",
    "Covering up fraud",
  ];

  return {
    culpritId,
    victimId,
    method: random.choice(methods),
    locationId: crimeLocationId,
    timestamp: createTimestamp(crimeDate.toISOString()),
    motive: random.choice(motives),
  };
}
