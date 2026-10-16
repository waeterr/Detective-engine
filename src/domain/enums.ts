export enum CaseStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  SOLVED = "SOLVED",
  FAILED = "FAILED",
  ABANDONED = "ABANDONED",
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
  EXPERT = "EXPERT",
  NIGHTMARE = "NIGHTMARE",
}

export enum CrimeType {
  MURDER = "MURDER",
  THEFT = "THEFT",
  KIDNAPPING = "KIDNAPPING",
  DISAPPEARANCE = "DISAPPEARANCE",
  ARSON = "ARSON",
  FRAUD = "FRAUD",
  SABOTAGE = "SABOTAGE",
}

export enum VerificationStatus {
  UNVERIFIED = "UNVERIFIED",
  VERIFIED = "VERIFIED",
  DISPUTED = "DISPUTED",
  INCONCLUSIVE = "INCONCLUSIVE",
}

export enum EvidenceRelationship {
  SUPPORTS = "SUPPORTS",
  CONTRADICTS = "CONTRADICTS",
  CORROBORATES = "CORROBORATES",
  DEPENDS_ON = "DEPENDS_ON",
  EXPLAINS = "EXPLAINS",
  DISPROVES = "DISPROVES",
  RELATED_TO = "RELATED_TO",
}

export enum MotiveCategory {
  REVENGE = "REVENGE",
  MONEY = "MONEY",
  JEALOUSY = "JEALOUSY",
  FEAR = "FEAR",
  POWER = "POWER",
  PROTECTION = "PROTECTION",
  BLACKMAIL = "BLACKMAIL",
  ACCIDENT = "ACCIDENT",
  UNKNOWN = "UNKNOWN",
}

export enum MotiveStrength {
  NONE = "NONE",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  EXTREME = "EXTREME",
}

export enum ContradictionSeverity {
  MINOR = "MINOR",
  MODERATE = "MODERATE",
  MAJOR = "MAJOR",
  CRITICAL = "CRITICAL",
}

export enum ConfidenceLevel {
  VERY_LOW = "VERY_LOW",
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  VERY_HIGH = "VERY_HIGH",
  CERTAIN = "CERTAIN",
}

export enum EvidenceDensity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum TimelineComplexity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}
