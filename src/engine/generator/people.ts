import {
  createPersonId,
  MotiveCategory,
  MotiveStrength,
  type Suspect,
  type Victim,
  type Witness,
} from "../../domain/index.js";
import { SeededRandom } from "../../infrastructure/random.js";
import type { GeneratedPeople } from "./types.js";

const FIRST_NAMES = [
  "Marcus", "Sarah", "Thomas", "Helen", "Daniel", "Emma", "James", "Olivia",
  "William", "Sophia", "Benjamin", "Charlotte", "Alexander", "Isabella"
] as const;

const LAST_NAMES = [
  "Carter", "Bennett", "Hayes", "Morrison", "Sullivan", "Foster", "Reynolds",
  "Mitchell", "Parker", "Collins", "Anderson", "Graham"
] as const;

const OCCUPATIONS = [
  "Business Partner", "Accountant", "Lawyer", "Hotel Manager", "Consultant",
  "Executive", "Director", "Analyst", "Architect", "Journalist"
] as const;

export function generatePeople(
  random: SeededRandom,
  suspectCount: number
): GeneratedPeople {
  const usedNames = new Set<string>();

  function generateUniqueName(): { first: string; last: string } {
    let attempts = 0;
    while (attempts < 100) {
      const first = random.choice([...FIRST_NAMES]);
      const last = random.choice([...LAST_NAMES]);
      const fullName = `${first} ${last}`;
      if (!usedNames.has(fullName)) {
        usedNames.add(fullName);
        return { first, last };
      }
      attempts++;
    }
    throw new Error("Failed to generate unique name");
  }

  const victimName = generateUniqueName();
  const victim: Victim = {
    id: createPersonId("P-VICTIM"),
    name: `${victimName.first} ${victimName.last}`,
    age: random.nextInt(35, 65),
    occupation: random.choice([...OCCUPATIONS]),
    description: "The victim of the crime.",
    deceased: true,
  };

  const suspects: Suspect[] = [];
  for (let i = 0; i < suspectCount; i++) {
    const suspectName = generateUniqueName();
    suspects.push({
      id: createPersonId(`P-SUSPECT-${i + 1}`),
      name: `${suspectName.first} ${suspectName.last}`,
      age: random.nextInt(25, 60),
      occupation: random.choice([...OCCUPATIONS]),
      description: `A person of interest in the investigation.`,
      relationshipToVictim: random.choice([
        "Business Associate",
        "Former Partner",
        "Competitor",
        "Acquaintance",
        "Family Friend",
      ]),
      knownLocations: [],
      motive: {
        category: random.choice([
          MotiveCategory.MONEY,
          MotiveCategory.REVENGE,
          MotiveCategory.JEALOUSY,
          MotiveCategory.FEAR,
          MotiveCategory.POWER,
        ]),
        strength: random.choice([
          MotiveStrength.LOW,
          MotiveStrength.MEDIUM,
          MotiveStrength.HIGH,
        ]),
        description: "Potential motive under investigation.",
      },
    });
  }

  const witnessCount = random.nextInt(1, 3);
  const witnesses: Witness[] = [];
  for (let i = 0; i < witnessCount; i++) {
    const witnessName = generateUniqueName();
    witnesses.push({
      id: createPersonId(`P-WITNESS-${i + 1}`),
      name: `${witnessName.first} ${witnessName.last}`,
      age: random.nextInt(22, 70),
      occupation: random.choice([...OCCUPATIONS, "Security Guard", "Receptionist"]),
      description: "A witness to events surrounding the crime.",
      credibility: random.nextInt(60, 95),
    });
  }

  return { victim, suspects, witnesses };
}
