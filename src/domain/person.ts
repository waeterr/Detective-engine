import type { PersonId, LocationId } from "./ids.js";
import type { MotiveCategory, MotiveStrength } from "./enums.js";

export interface Person {
  id: PersonId;
  name: string;
  age: number;
  occupation: string;
  description: string;
}

export interface Suspect extends Person {
  relationshipToVictim: string;
  knownLocations: LocationId[];
  motive: Motive;
}

export interface Victim extends Person {
  deceased: boolean;
}

export interface Witness extends Person {
  credibility: number;
}

export interface Motive {
  category: MotiveCategory;
  strength: MotiveStrength;
  description: string;
}

export type PersonRole = "VICTIM" | "SUSPECT" | "WITNESS" | "OTHER";

export interface PersonWithRole {
  person: Person;
  role: PersonRole;
}
