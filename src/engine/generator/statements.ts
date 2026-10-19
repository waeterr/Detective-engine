import {
  createStatementId,
  createTimestamp,
  timestampToDate,
  type Statement,
  type PersonId,
  type CaseTruth,
} from "../../domain/index.js";
import { SeededRandom } from "../../infrastructure/random.js";

export function generateStatements(
  random: SeededRandom,
  truth: CaseTruth,
  suspectIds: PersonId[]
): Statement[] {
  const statements: Statement[] = [];
  const crimeDate = timestampToDate(truth.timestamp);
  
  const statementTemplates = [
    (_name: string, time: string) => `I left the office at ${time}.`,
    (_name: string, time: string) => `I was at the hotel lobby from ${time} onwards.`,
    (_name: string, time: string) => `I didn't see anyone suspicious around ${time}.`,
    (_name: string, time: string) => `I heard a noise around ${time}.`,
    (_name: string, time: string) => `I was nowhere near the crime scene at ${time}.`,
  ];

  for (const suspectId of suspectIds) {
    const isCulprit = suspectId === truth.culpritId;
    const statementTime = new Date(crimeDate.getTime() + random.nextInt(-60, 60) * 60 * 1000);
    const claimedTime = new Date(crimeDate.getTime() + random.nextInt(-120, -30) * 60 * 1000);
    
    const template = random.choice(statementTemplates);
    const content = template(
      suspectId,
      claimedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    );

    statements.push({
      id: createStatementId(`S-${suspectId}`),
      speakerId: suspectId,
      content,
      timestamp: createTimestamp(statementTime.toISOString()),
      reliability: isCulprit ? random.nextInt(45, 65) : random.nextInt(70, 90),
      claims: [content],
    });
  }

  return statements;
}
