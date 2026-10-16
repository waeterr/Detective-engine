import type { EvidenceId, LocationId, PersonId, TimelineEventId } from "./ids.js";
import type { Timestamp } from "./timestamp.js";

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  address?: string;
  accessRestricted: boolean;
}

export interface TimelineEvent {
  id: TimelineEventId;
  timestamp: Timestamp;
  description: string;
  locationId: LocationId;
  personIds: PersonId[];
  evidenceIds: EvidenceId[];
}

export interface Alibi {
  personId: PersonId;
  startTime: Timestamp;
  endTime: Timestamp;
  locationId: LocationId;
  claimedBy: EvidenceId;
  verified: boolean;
}
