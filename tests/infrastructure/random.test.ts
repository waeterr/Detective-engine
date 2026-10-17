import { describe, expect, it } from "vitest";
import { SeededRandom } from "../../src/infrastructure/random.js";

describe("SeededRandom", () => {
  it("produces deterministic results from the same seed", () => {
    const rng1 = new SeededRandom("test-seed-123");
    const rng2 = new SeededRandom("test-seed-123");

    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.next()).toBe(rng2.next());
    expect(rng1.nextInt(1, 100)).toBe(rng2.nextInt(1, 100));
  });

  it("produces different results from different seeds", () => {
    const rng1 = new SeededRandom("seed-A");
    const rng2 = new SeededRandom("seed-B");

    expect(rng1.next()).not.toBe(rng2.next());
  });

  it("generates integers within specified range", () => {
    const rng = new SeededRandom("range-test");

    for (let i = 0; i < 100; i++) {
      const value = rng.nextInt(10, 20);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(20);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("generates floats within specified range", () => {
    const rng = new SeededRandom("float-test");

    for (let i = 0; i < 100; i++) {
      const value = rng.nextFloat(5.0, 10.0);
      expect(value).toBeGreaterThanOrEqual(5.0);
      expect(value).toBeLessThanOrEqual(10.0);
    }
  });

  it("chooses from array deterministically", () => {
    const rng1 = new SeededRandom("choice-seed");
    const rng2 = new SeededRandom("choice-seed");
    const array = ["apple", "banana", "cherry", "date"];

    expect(rng1.choice(array)).toBe(rng2.choice(array));
  });

  it("shuffles array deterministically", () => {
    const rng1 = new SeededRandom("shuffle-seed");
    const rng2 = new SeededRandom("shuffle-seed");
    const array = [1, 2, 3, 4, 5];

    expect(rng1.shuffle(array)).toEqual(rng2.shuffle(array));
  });

  it("samples array without replacement", () => {
    const rng = new SeededRandom("sample-seed");
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const sample = rng.sample(array, 5);

    expect(sample).toHaveLength(5);
    expect(new Set(sample).size).toBe(5);
    sample.forEach((item) => expect(array).toContain(item));
  });

  it("generates boolean with probability", () => {
    const rng = new SeededRandom("bool-seed");
    const results = Array.from({ length: 1000 }, () => rng.boolean(0.7));
    const trueCount = results.filter((v) => v).length;

    expect(trueCount).toBeGreaterThan(600);
    expect(trueCount).toBeLessThan(800);
  });
});
