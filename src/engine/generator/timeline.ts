import {
  createTimelineEventId,
  createTimestamp,
  timestampToDate,
  type TimelineEvent,
  type CaseTruth,
  type PersonId,
  type LocationId,
} from "../../domain/index.js";
import { SeededRandom } from "../../infrastructure/random.js";

export function generateTimeline(
  random: SeededRandom,
  truth: CaseTruth,
  suspectIds: PersonId[],
  witnessIds: PersonId[],
  locationIds: LocationId[]
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const crimeDate = timestampToDate(truth.timestamp);
  const crimeTime = crimeDate.getTime();

  const eventCount = random.nextInt(8, 15);

  for (let i = 0; i < eventCount; i++) {
    const offsetMinutes = random.nextInt(-180, 180);
    const eventTime = new Date(crimeTime + offsetMinutes * 60 * 1000);

    const personPool = [...suspectIds, ...witnessIds];
    const personCount = random.nextInt(1, 3);
    const involvedPersons = random.sample(personPool, Math.min(personCount, personPool.length));

    const location = random.choice(locationIds);

    const descriptions = [
      "Person enters location",
      "Person leaves location",
      "Person observed at location",
      "Security checkpoint logged",
      "Witness reports activity",
      "CCTV timestamp",
    ];

    events.push({
      id: createTimelineEventId(`TE-${i + 1}`),
      timestamp: createTimestamp(eventTime.toISOString()),
      description: random.choice(descriptions),
      locationId: location,
      personIds: involvedPersons,
      evidenceIds: [],
    });
  }

  events.push({
    id: createTimelineEventId(`TE-CRIME`),
    timestamp: truth.timestamp,
    description: "Estimated time of crime",
    locationId: truth.locationId,
    personIds: [truth.culpritId, truth.victimId],
    evidenceIds: [],
  });

  return events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
