export interface CaseBrief {
  id: string;
  seed: string;
  brief: {
    title: string;
    summary: string;
    crimeType: string;
    occurredAt: string;
    locationId: string;
    victimId: string;
  };
  suspects: Array<{
    id: string;
    name: string;
    age: number;
    occupation: string;
    description: string;
    relationshipToVictim: string;
    knownLocations: string[];
    motive: {
      category: string;
      strength: string;
      description: string;
    };
  }>;
  victim: {
    id: string;
    name: string;
    age: number;
    occupation: string;
    description: string;
    deceased: boolean;
  } | null;
  witnesses: Array<{
    id: string;
    name: string;
    age: number;
    occupation: string;
    description: string;
    credibility: number;
  }>;
  locations: Array<{
    id: string;
    name: string;
    description: string;
    address?: string;
    accessRestricted: boolean;
  }>;
  evidence: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    locationId: string;
    discoveredAt: string;
    reliability: number;
    relevance: number;
    verificationStatus: string;
    [key: string]: unknown;
  }>;
  timeline: Array<{
    id: string;
    timestamp: string;
    description: string;
    locationId: string;
    personIds: string[];
    evidenceIds: string[];
  }>;
  statements: Array<{
    id: string;
    speakerId: string;
    content: string;
    timestamp: string;
    reliability: number;
    claims: string[];
  }>;
}

export interface CaseGenerationRequest {
  difficulty: string;
  crimeType: string;
  suspectCount: number;
  evidenceDensity: string;
  redHerringCount: number;
  timelineComplexity: string;
  seed?: string;
}

export interface HypothesisRequest {
  hypothesisId: string;
  suspectId: string;
  description: string;
  claims: Array<{
    description: string;
    supportingEvidenceIds: string[];
    contradictingEvidenceIds: string[];
  }>;
}

export interface HypothesisResult {
  hypothesisId: string;
  score: number;
  confidence: string;
  supportingEvidence: string[];
  contradictingEvidence: string[];
  unresolvedClaims: Array<{
    description: string;
    supportingEvidenceIds: string[];
    contradictingEvidenceIds: string[];
    status: string;
  }>;
  explanations: Array<{
    reason: string;
    evidenceIds: string[];
    weight: number;
  }>;
}

export interface ConclusionRequest {
  culpritId: string | null;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CERTAIN';
}

export interface ConclusionResult {
  correct: boolean;
  actualCulpritId: string;
  score: number;
}

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  generateCase: (data: CaseGenerationRequest) =>
    request<CaseBrief>('/cases/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCase: (id: string) => request<CaseBrief>(`/cases/${id}`),

  getCases: () => request<CaseBrief[]>('/cases'),

  getEvidence: (caseId: string) =>
    request<CaseBrief['evidence']>(`/cases/${caseId}/evidence`),

  getTimeline: (caseId: string) =>
    request<CaseBrief['timeline']>(`/cases/${caseId}/timeline`),

  getSuspects: (caseId: string) =>
    request<CaseBrief['suspects']>(`/cases/${caseId}/suspects`),

  evaluateHypothesis: (caseId: string, data: HypothesisRequest) =>
    request<HypothesisResult>(`/cases/${caseId}/hypotheses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitConclusion: (caseId: string, data: ConclusionRequest) =>
    request<ConclusionResult>(`/cases/${caseId}/conclusion`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
