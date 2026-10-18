import Fastify, { type FastifyInstance } from "fastify";
import {
  CaseGenerator,
  CaseValidator,
  ReasoningEngine,
} from "../engine/index.js";
import {
  CrimeType,
  Difficulty,
  EvidenceDensity,
  TimelineComplexity,
  createCaseId,
  createHypothesisId,
  timestampNow,
  type CaseGenerationOptions,
  type Hypothesis,
} from "../domain/index.js";
import { toCaseResponse, type ConclusionRequest, type HypothesisEvaluationRequest } from "./types.js";

const enumValues = <T extends Record<string, string>>(values: T): string[] => Object.values(values);

function isEnumValue<T extends Record<string, string>>(values: T, value: unknown): value is T[keyof T] {
  return typeof value === "string" && enumValues(values).includes(value);
}

function parseGenerationOptions(body: unknown): CaseGenerationOptions | null {
  if (!body || typeof body !== "object") return null;
  const input = body as Record<string, unknown>;

  const suspectCount = input.suspectCount;
  const redHerringCount = input.redHerringCount;

  if (
    !isEnumValue(Difficulty, input.difficulty) ||
    !isEnumValue(CrimeType, input.crimeType) ||
    !isEnumValue(EvidenceDensity, input.evidenceDensity) ||
    !isEnumValue(TimelineComplexity, input.timelineComplexity) ||
    !Number.isInteger(suspectCount) ||
    typeof suspectCount !== "number" ||
    suspectCount < 1 ||
    suspectCount > 10 ||
    !Number.isInteger(redHerringCount) ||
    typeof redHerringCount !== "number" ||
    redHerringCount < 0 ||
    redHerringCount > 10 ||
    (input.seed !== undefined && (typeof input.seed !== "string" || input.seed.length > 128))
  ) {
    return null;
  }

  return {
    difficulty: input.difficulty,
    crimeType: input.crimeType,
    suspectCount,
    evidenceDensity: input.evidenceDensity,
    redHerringCount,
    timelineComplexity: input.timelineComplexity,
    ...(input.seed === undefined ? {} : { seed: input.seed }),
  };
}

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: false });
  const cases = new Map();
  const generator = new CaseGenerator();
  const validator = new CaseValidator();
  const reasoning = new ReasoningEngine();

  app.get("/health", async () => ({ status: "ok" }));

  app.get("/api/cases", async () => {
    return Array.from(cases.values()).map(toCaseResponse);
  });

  app.post("/api/cases/generate", async (request, reply) => {
    const options = parseGenerationOptions(request.body);
    if (!options) {
      return reply.code(400).send({ error: "Invalid case generation options." });
    }

    const caseInstance = generator.generate(options);
    const validation = validator.validate(caseInstance);
    if (!validation.valid) {
      return reply.code(422).send({ error: "Generated case failed validation.", issues: validation.issues });
    }

    cases.set(caseInstance.id, caseInstance);
    return reply.code(201).send(toCaseResponse(caseInstance));
  });

  app.get<{ Params: { id: string } }>("/api/cases/:id", async (request, reply) => {
    const caseInstance = cases.get(createCaseId(request.params.id));
    if (!caseInstance) {
      return reply.code(404).send({ error: "Case not found." });
    }
    return toCaseResponse(caseInstance);
  });

  app.get<{ Params: { id: string } }>("/api/cases/:id/evidence", async (request, reply) => {
    const caseInstance = cases.get(createCaseId(request.params.id));
    if (!caseInstance) return reply.code(404).send({ error: "Case not found." });
    return caseInstance.getAllEvidence();
  });

  app.get<{ Params: { id: string } }>("/api/cases/:id/timeline", async (request, reply) => {
    const caseInstance = cases.get(createCaseId(request.params.id));
    if (!caseInstance) return reply.code(404).send({ error: "Case not found." });
    return caseInstance.getAllTimelineEvents();
  });

  app.get<{ Params: { id: string } }>("/api/cases/:id/suspects", async (request, reply) => {
    const caseInstance = cases.get(createCaseId(request.params.id));
    if (!caseInstance) return reply.code(404).send({ error: "Case not found." });
    return caseInstance.getAllSuspects();
  });

  app.post<{ Params: { id: string } }>("/api/cases/:id/hypotheses", async (request, reply) => {
    const caseInstance = cases.get(createCaseId(request.params.id));
    if (!caseInstance) return reply.code(404).send({ error: "Case not found." });

    const body = request.body as HypothesisEvaluationRequest | null;
    if (!body || typeof body.description !== "string" || !caseInstance.getSuspect(body.suspectId) || !Array.isArray(body.claims)) {
      return reply.code(400).send({ error: "Invalid hypothesis." });
    }

    const hypothesis: Hypothesis = {
      id: createHypothesisId(body.hypothesisId),
      suspectId: body.suspectId,
      description: body.description,
      claims: body.claims.map((claim) => ({ ...claim, status: "UNRESOLVED" })),
      createdAt: timestampNow(),
    };
    caseInstance.addHypothesis(hypothesis);
    return reasoning.evaluateHypothesis(hypothesis, caseInstance);
  });

  app.post<{ Params: { id: string } }>("/api/cases/:id/conclusion", async (request, reply) => {
    const caseInstance = cases.get(createCaseId(request.params.id));
    if (!caseInstance) return reply.code(404).send({ error: "Case not found." });

    const body = request.body as ConclusionRequest | null;
    if (!body || !["LOW", "MEDIUM", "HIGH", "CERTAIN"].includes(body.confidence)) {
      return reply.code(400).send({ error: "Invalid conclusion." });
    }

    const correct = body.culpritId === caseInstance.getTruth().culpritId;
    return {
      correct,
      actualCulpritId: caseInstance.getTruth().culpritId,
      score: correct ? 100 : 0,
    };
  });

  return app;
}
