import type {
  CaseId,
  PersonId,
  EvidenceId,
  LocationId,
  StatementId,
  TimelineEventId,
} from "../domain/ids.js";
import type {
  InvestigationCase,
  CaseTruth,
  CaseBrief,
  EvidenceConnection,
} from "../domain/case.js";
import type { Evidence } from "../domain/evidence.js";
import type { Person, Suspect, Victim, Witness } from "../domain/person.js";
import type { Location, TimelineEvent, Alibi } from "../domain/timeline.js";
import type { Statement } from "../domain/statement.js";
import type { Hypothesis } from "../domain/hypothesis.js";

export class Case {
  private _id: CaseId;
  private _seed: string;
  private _brief: CaseBrief;
  private _truth: CaseTruth;
  private _people: Map<PersonId, Person>;
  private _suspects: Map<PersonId, Suspect>;
  private _victim: Victim | null;
  private _witnesses: Map<PersonId, Witness>;
  private _evidence: Map<EvidenceId, Evidence>;
  private _locations: Map<LocationId, Location>;
  private _timeline: Map<TimelineEventId, TimelineEvent>;
  private _statements: Map<StatementId, Statement>;
  private _alibis: Map<PersonId, Alibi[]>;
  private _hypotheses: Map<string, Hypothesis>;
  private _evidenceConnections: EvidenceConnection[];

  constructor(investigationCase: InvestigationCase) {
    this._id = investigationCase.id;
    this._seed = investigationCase.seed;
    this._brief = investigationCase.brief;
    this._truth = investigationCase.truth;
    this._people = new Map();
    this._suspects = new Map();
    this._victim = null;
    this._witnesses = new Map();
    this._evidence = new Map();
    this._locations = new Map();
    this._timeline = new Map();
    this._statements = new Map();
    this._alibis = new Map();
    this._hypotheses = new Map();
    this._evidenceConnections = [];
  }

  get id(): CaseId {
    return this._id;
  }

  get seed(): string {
    return this._seed;
  }

  get brief(): CaseBrief {
    return this._brief;
  }

  getTruth(): CaseTruth {
    return this._truth;
  }

  addPerson(person: Person): void {
    this._people.set(person.id, person);
  }

  getPerson(id: PersonId): Person | undefined {
    return this._people.get(id);
  }

  getAllPeople(): Person[] {
    return Array.from(this._people.values());
  }

  addSuspect(suspect: Suspect): void {
    this._suspects.set(suspect.id, suspect);
    this.addPerson(suspect);
  }

  getSuspect(id: PersonId): Suspect | undefined {
    return this._suspects.get(id);
  }

  getAllSuspects(): Suspect[] {
    return Array.from(this._suspects.values());
  }

  setVictim(victim: Victim): void {
    this._victim = victim;
    this.addPerson(victim);
  }

  getVictim(): Victim | null {
    return this._victim;
  }

  addWitness(witness: Witness): void {
    this._witnesses.set(witness.id, witness);
    this.addPerson(witness);
  }

  getWitness(id: PersonId): Witness | undefined {
    return this._witnesses.get(id);
  }

  getAllWitnesses(): Witness[] {
    return Array.from(this._witnesses.values());
  }

  addEvidence(evidence: Evidence): void {
    this._evidence.set(evidence.id, evidence);
  }

  getEvidence(id: EvidenceId): Evidence | undefined {
    return this._evidence.get(id);
  }

  getAllEvidence(): Evidence[] {
    return Array.from(this._evidence.values());
  }

  addLocation(location: Location): void {
    this._locations.set(location.id, location);
  }

  getLocation(id: LocationId): Location | undefined {
    return this._locations.get(id);
  }

  getAllLocations(): Location[] {
    return Array.from(this._locations.values());
  }

  addTimelineEvent(event: TimelineEvent): void {
    this._timeline.set(event.id, event);
  }

  getTimelineEvent(id: TimelineEventId): TimelineEvent | undefined {
    return this._timeline.get(id);
  }

  getAllTimelineEvents(): TimelineEvent[] {
    return Array.from(this._timeline.values()).sort((a, b) => {
      return a.timestamp.localeCompare(b.timestamp);
    });
  }

  addStatement(statement: Statement): void {
    this._statements.set(statement.id, statement);
  }

  getStatement(id: StatementId): Statement | undefined {
    return this._statements.get(id);
  }

  getStatementsBySpeaker(speakerId: PersonId): Statement[] {
    return Array.from(this._statements.values()).filter(
      (s) => s.speakerId === speakerId
    );
  }

  getAllStatements(): Statement[] {
    return Array.from(this._statements.values());
  }

  addAlibi(personId: PersonId, alibi: Alibi): void {
    const existing = this._alibis.get(personId) ?? [];
    existing.push(alibi);
    this._alibis.set(personId, existing);
  }

  getAlibis(personId: PersonId): Alibi[] {
    return this._alibis.get(personId) ?? [];
  }

  getAllAlibis(): Map<PersonId, Alibi[]> {
    return new Map(this._alibis);
  }

  addHypothesis(hypothesis: Hypothesis): void {
    this._hypotheses.set(hypothesis.id, hypothesis);
  }

  getHypothesis(id: string): Hypothesis | undefined {
    return this._hypotheses.get(id);
  }

  getAllHypotheses(): Hypothesis[] {
    return Array.from(this._hypotheses.values());
  }

  addEvidenceConnection(connection: EvidenceConnection): void {
    this._evidenceConnections.push(connection);
  }

  getEvidenceConnections(): EvidenceConnection[] {
    return [...this._evidenceConnections];
  }

  getConnectedEvidence(evidenceId: EvidenceId): EvidenceId[] {
    const connected: EvidenceId[] = [];

    for (const conn of this._evidenceConnections) {
      if (conn.sourceEvidenceId === evidenceId) {
        connected.push(conn.targetEvidenceId);
      } else if (conn.targetEvidenceId === evidenceId) {
        connected.push(conn.sourceEvidenceId);
      }
    }

    return connected;
  }
}
