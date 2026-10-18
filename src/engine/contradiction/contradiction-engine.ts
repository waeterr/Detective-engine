import {
  ContradictionSeverity,
  EvidenceType,
  type Contradiction,
  type Evidence,
  type Statement,
} from "../../domain/index.js";

export class ContradictionEngine {
  detect(statements: Statement[], evidence: Evidence[]): Contradiction[] {
    const contradictions: Contradiction[] = [];

    for (const statement of statements) {
      for (const item of evidence) {
        if (!this.conflicts(statement, item)) {
          continue;
        }

        contradictions.push({
          id: `CON-${statement.id}-${item.id}`,
          severity: this.severityFor(item),
          description: `${statement.id} conflicts with ${item.id}.`,
          evidenceIds: [item.id],
          statementIds: [statement.id],
          detected: true,
        });
      }
    }

    return contradictions;
  }

  private conflicts(statement: Statement, evidence: Evidence): boolean {
    const normalizedStatement = statement.content.toLowerCase();

    if (
      evidence.type === EvidenceType.CCTV &&
      evidence.personsDetected.includes(statement.speakerId)
    ) {
      return normalizedStatement.includes("left") || normalizedStatement.includes("was not");
    }

    if (evidence.type === EvidenceType.ACCESS_LOG && evidence.personId === statement.speakerId) {
      return normalizedStatement.includes("left") || normalizedStatement.includes("was not");
    }

    return false;
  }

  private severityFor(evidence: Evidence): ContradictionSeverity {
    if (evidence.reliability >= 90) {
      return ContradictionSeverity.MAJOR;
    }
    if (evidence.reliability >= 70) {
      return ContradictionSeverity.MODERATE;
    }
    return ContradictionSeverity.MINOR;
  }
}
