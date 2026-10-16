import { describe, expect, it, expectTypeOf } from "vitest";
import {
  createPersonId,
  createEvidenceId,
  createLocationId,
  type PersonId,
  type EvidenceId,
  type LocationId,
} from "../../src/domain/index.js";

describe("branded IDs", () => {
  it("prevents mixing different ID types at compile time", () => {
    const personId = createPersonId("P-001");
    const evidenceId = createEvidenceId("E-001");
    const locationId = createLocationId("LOC-001");

    expectTypeOf(personId).toEqualTypeOf<PersonId>();
    expectTypeOf(evidenceId).toEqualTypeOf<EvidenceId>();
    expectTypeOf(locationId).toEqualTypeOf<LocationId>();

    expectTypeOf(personId).not.toEqualTypeOf<EvidenceId>();
    expectTypeOf(evidenceId).not.toEqualTypeOf<LocationId>();
  });

  it("preserves string operations", () => {
    const personId = createPersonId("P-001");

    expect(personId.startsWith("P-")).toBe(true);
    expect(personId.length).toBe(5);
    expect(personId.toUpperCase()).toBe("P-001");
  });
});
