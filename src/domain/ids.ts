export type CaseId = string & { readonly __brand: "CaseId" };
export type PersonId = string & { readonly __brand: "PersonId" };
export type EvidenceId = string & { readonly __brand: "EvidenceId" };
export type LocationId = string & { readonly __brand: "LocationId" };
export type StatementId = string & { readonly __brand: "StatementId" };
export type HypothesisId = string & { readonly __brand: "HypothesisId" };
export type TimelineEventId = string & { readonly __brand: "TimelineEventId" };

export function brandId<T extends string & { readonly __brand: string }>(
  id: string
): T {
  return id as T;
}

/**
 * ID factory functions
 */
export const createCaseId = (id: string): CaseId => brandId<CaseId>(id);
export const createPersonId = (id: string): PersonId => brandId<PersonId>(id);
export const createEvidenceId = (id: string): EvidenceId =>
  brandId<EvidenceId>(id);
export const createLocationId = (id: string): LocationId =>
  brandId<LocationId>(id);
export const createStatementId = (id: string): StatementId =>
  brandId<StatementId>(id);
export const createHypothesisId = (id: string): HypothesisId =>
  brandId<HypothesisId>(id);
export const createTimelineEventId = (id: string): TimelineEventId =>
  brandId<TimelineEventId>(id);
