import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../src/api/app.js";

const options = {
  difficulty: "HARD",
  crimeType: "MURDER",
  suspectCount: 5,
  evidenceDensity: "HIGH",
  redHerringCount: 2,
  timelineComplexity: "MEDIUM",
  seed: "API-CASE-001",
};

describe("Case API", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it("generates and returns a public case without hidden truth", async () => {
    app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/cases/generate",
      payload: options,
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBe(options.seed);
    expect(body.evidence.length).toBeGreaterThan(0);
    expect(body).not.toHaveProperty("truth");
  });

  it("retrieves case resources", async () => {
    app = buildApp();
    const generated = await app.inject({ method: "POST", url: "/api/cases/generate", payload: options });
    const { id } = generated.json();

    const [caseResponse, evidenceResponse, timelineResponse, suspectsResponse] = await Promise.all([
      app.inject({ method: "GET", url: `/api/cases/${id}` }),
      app.inject({ method: "GET", url: `/api/cases/${id}/evidence` }),
      app.inject({ method: "GET", url: `/api/cases/${id}/timeline` }),
      app.inject({ method: "GET", url: `/api/cases/${id}/suspects` }),
    ]);

    expect(caseResponse.statusCode).toBe(200);
    expect(caseResponse.json()).not.toHaveProperty("truth");
    expect(evidenceResponse.json().length).toBeGreaterThan(0);
    expect(timelineResponse.json().length).toBeGreaterThan(0);
    expect(suspectsResponse.json().length).toBe(options.suspectCount);
  });

  it("rejects invalid generator input", async () => {
    app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/cases/generate",
      payload: { ...options, suspectCount: 11 },
    });

    expect(response.statusCode).toBe(400);
  });

  it("evaluates a hypothesis", async () => {
    app = buildApp();
    const generated = await app.inject({ method: "POST", url: "/api/cases/generate", payload: options });
    const body = generated.json();

    const response = await app.inject({
      method: "POST",
      url: `/api/cases/${body.id}/hypotheses`,
      payload: {
        hypothesisId: "H-001",
        suspectId: body.suspects[0].id,
        description: "Suspect was present.",
        claims: [{
          description: "Suspect was present.",
          supportingEvidenceIds: [body.evidence[0].id],
          contradictingEvidenceIds: [],
        }],
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ hypothesisId: "H-001" });
  });

  it("returns result only after conclusion submission", async () => {
    app = buildApp();
    const generated = await app.inject({ method: "POST", url: "/api/cases/generate", payload: options });
    const body = generated.json();

    const response = await app.inject({
      method: "POST",
      url: `/api/cases/${body.id}/conclusion`,
      payload: { culpritId: body.suspects[0].id, confidence: "HIGH" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty("actualCulpritId");
  });
});
