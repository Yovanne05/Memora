import { describe, expect, it } from "vitest";
import {
  calculateLayeredLayout,
  determineConnectionDirection,
} from "@/features/visualization/lib/layoutEngine";

describe("layoutEngine", () => {
  it("places orphan nodes on a dedicated layer", () => {
    const nodes = [
      { id: "root" },
      { id: "child" },
      { id: "orphan-1" },
      { id: "orphan-2" },
    ];
    const edges = [{ sourceId: "root", targetId: "child" }];

    const positions = calculateLayeredLayout(nodes, edges);

    expect(positions["root"].y).toBe(0);
    expect(positions["child"].y).toBeGreaterThan(positions["root"].y);

    const orphanY = positions["orphan-1"].y;
    expect(orphanY).toBe(positions["orphan-2"].y);
    expect(orphanY).toBeGreaterThan(positions["child"].y);
  });

  it("prefers vertical connections when nodes are on different layers", () => {
    const upper = { x: 0, y: 0 };
    const lower = { x: 200, y: 150 };

    const direction = determineConnectionDirection(upper, lower);

    expect(direction).toEqual({
      sourceSide: "bottom",
      targetSide: "top",
    });
  });
});
