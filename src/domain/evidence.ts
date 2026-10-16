import type { PersonId, LocationId, EvidenceId } from "./ids.js";
import type { Timestamp } from "./timestamp.js";
import type { VerificationStatus } from "./enums.js";

export enum EvidenceType {
  FINGERPRINT = "FINGERPRINT",
  BLOOD = "BLOOD",
  DNA = "DNA",
  WEAPON = "WEAPON",
  OBJECT = "OBJECT",
  CLOTHING = "CLOTHING",
  FOOTPRINT = "FOOTPRINT",
  CCTV = "CCTV",
  PHONE_LOG = "PHONE_LOG",
  MESSAGE = "MESSAGE",
  EMAIL = "EMAIL",
  GPS = "GPS",
  ACCESS_LOG = "ACCESS_LOG",
  TRANSACTION = "TRANSACTION",
  WITNESS_STATEMENT = "WITNESS_STATEMENT",
  ALIBI = "ALIBI",
  CONFESSION = "CONFESSION",
  RUMOR = "RUMOR",
  INTERVIEW = "INTERVIEW",
  WEATHER = "WEATHER",
  POWER_OUTAGE = "POWER_OUTAGE",
  NOISE = "NOISE",
  LIGHTING = "LIGHTING",
  TEMPERATURE = "TEMPERATURE",
}

export interface BaseEvidence {
  id: EvidenceId;
  type: EvidenceType;
  title: string;
  description: string;
  locationId: LocationId;
  discoveredAt: Timestamp;
  reliability: number;
  relevance: number;
  verificationStatus: VerificationStatus;
}

export interface FingerprintEvidence extends BaseEvidence {
  type: EvidenceType.FINGERPRINT;
  personId: PersonId;
  matchConfidence: number;
}

export interface BloodEvidence extends BaseEvidence {
  type: EvidenceType.BLOOD;
  personId?: PersonId;
  bloodType: string;
}

export interface DNAEvidence extends BaseEvidence {
  type: EvidenceType.DNA;
  personId?: PersonId;
  matchConfidence: number;
}

export interface WeaponEvidence extends BaseEvidence {
  type: EvidenceType.WEAPON;
  weaponType: string;
  ownerId?: PersonId;
}

export interface ObjectEvidence extends BaseEvidence {
  type: EvidenceType.OBJECT;
  objectType: string;
  ownerId?: PersonId;
}

export interface ClothingEvidence extends BaseEvidence {
  type: EvidenceType.CLOTHING;
  clothingType: string;
  ownerId?: PersonId;
}

export interface FootprintEvidence extends BaseEvidence {
  type: EvidenceType.FOOTPRINT;
  size: string;
  pattern: string;
}

export interface CctvEvidence extends BaseEvidence {
  type: EvidenceType.CCTV;
  timestamp: Timestamp;
  personsDetected: PersonId[];
  footage: string;
}

export interface PhoneLogEvidence extends BaseEvidence {
  type: EvidenceType.PHONE_LOG;
  ownerId: PersonId;
  calls: Array<{
    timestamp: Timestamp;
    contactId?: PersonId;
    duration: number;
  }>;
}

export interface MessageEvidence extends BaseEvidence {
  type: EvidenceType.MESSAGE;
  senderId: PersonId;
  recipientId: PersonId;
  timestamp: Timestamp;
  content: string;
}

export interface EmailEvidence extends BaseEvidence {
  type: EvidenceType.EMAIL;
  senderId: PersonId;
  recipientId: PersonId;
  timestamp: Timestamp;
  subject: string;
  content: string;
}

export interface GpsEvidence extends BaseEvidence {
  type: EvidenceType.GPS;
  personId: PersonId;
  timestamp: Timestamp;
  coordinates: { lat: number; lng: number };
}

export interface AccessLogEvidence extends BaseEvidence {
  type: EvidenceType.ACCESS_LOG;
  personId: PersonId;
  timestamp: Timestamp;
  accessGranted: boolean;
}

export interface TransactionEvidence extends BaseEvidence {
  type: EvidenceType.TRANSACTION;
  personId: PersonId;
  timestamp: Timestamp;
  amount: number;
  description: string;
}

export interface WitnessStatementEvidence extends BaseEvidence {
  type: EvidenceType.WITNESS_STATEMENT;
  witnessId: PersonId;
  statementText: string;
  recordedAt: Timestamp;
}

export interface AlibiEvidence extends BaseEvidence {
  type: EvidenceType.ALIBI;
  personId: PersonId;
  claimedLocationId: LocationId;
  startTime: Timestamp;
  endTime: Timestamp;
}

export interface ConfessionEvidence extends BaseEvidence {
  type: EvidenceType.CONFESSION;
  personId: PersonId;
  confessionText: string;
  recordedAt: Timestamp;
}

export interface RumorEvidence extends BaseEvidence {
  type: EvidenceType.RUMOR;
  sourceId?: PersonId;
  targetId: PersonId;
  rumorText: string;
}

export interface InterviewEvidence extends BaseEvidence {
  type: EvidenceType.INTERVIEW;
  intervieweeId: PersonId;
  interviewerId?: PersonId;
  transcript: string;
  recordedAt: Timestamp;
}

export interface WeatherEvidence extends BaseEvidence {
  type: EvidenceType.WEATHER;
  timestamp: Timestamp;
  conditions: string;
  temperature: number;
}

export interface PowerOutageEvidence extends BaseEvidence {
  type: EvidenceType.POWER_OUTAGE;
  startTime: Timestamp;
  endTime: Timestamp;
  affectedLocations: LocationId[];
}

export interface NoiseEvidence extends BaseEvidence {
  type: EvidenceType.NOISE;
  timestamp: Timestamp;
  description: string;
  reportedBy?: PersonId;
}

export interface LightingEvidence extends BaseEvidence {
  type: EvidenceType.LIGHTING;
  timestamp: Timestamp;
  lightingCondition: string;
}

export interface TemperatureEvidence extends BaseEvidence {
  type: EvidenceType.TEMPERATURE;
  timestamp: Timestamp;
  temperature: number;
  unit: "C" | "F";
}

export type Evidence =
  | FingerprintEvidence
  | BloodEvidence
  | DNAEvidence
  | WeaponEvidence
  | ObjectEvidence
  | ClothingEvidence
  | FootprintEvidence
  | CctvEvidence
  | PhoneLogEvidence
  | MessageEvidence
  | EmailEvidence
  | GpsEvidence
  | AccessLogEvidence
  | TransactionEvidence
  | WitnessStatementEvidence
  | AlibiEvidence
  | ConfessionEvidence
  | RumorEvidence
  | InterviewEvidence
  | WeatherEvidence
  | PowerOutageEvidence
  | NoiseEvidence
  | LightingEvidence
  | TemperatureEvidence;
