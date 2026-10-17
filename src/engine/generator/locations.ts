import {
  createLocationId,
  type Location,
} from "../../domain/index.js";
import { SeededRandom } from "../../infrastructure/random.js";

const LOCATION_TEMPLATES = [
  { name: "Blackwood Hotel", description: "A luxury hotel with private suites." },
  { name: "Riverside Gallery", description: "A modern art gallery beside the river." },
  { name: "Westbridge Offices", description: "A high-rise corporate office building." },
  { name: "The Ember Club", description: "An exclusive private members club." },
  { name: "Hawthorne Estate", description: "A secluded family estate." },
] as const;

const ROOM_NAMES = ["Lobby", "Office", "Private Suite", "Service Corridor", "Rooftop", "Archive Room"] as const;

export function generateLocations(random: SeededRandom): Location[] {
  const venue = random.choice([...LOCATION_TEMPLATES]);
  const rooms = random.sample([...ROOM_NAMES], 3);

  return rooms.map((room, index) => ({
    id: createLocationId(`LOC-${index + 1}`),
    name: index === 0 ? venue.name : `${venue.name} — ${room}`,
    description: index === 0 ? venue.description : `${room} within ${venue.name}.`,
    accessRestricted: index > 0,
  }));
}
