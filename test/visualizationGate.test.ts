import { describe, expect, it, vi } from "vitest";
import {
  VISUALIZE_DREAM_PLACEMENT,
  requestVisualizationWithGate,
} from "../lib/visualizationGate";

describe("requestVisualizationWithGate", () => {
  it("starts visualization immediately for pro users", async () => {
    const showPaywall = vi.fn(async () => true);
    const startVisualization = vi.fn(async () => {});

    await expect(
      requestVisualizationWithGate({
        isPro: true,
        showPaywall,
        startVisualization,
      })
    ).resolves.toBe("started");

    expect(showPaywall).not.toHaveBeenCalled();
    expect(startVisualization).toHaveBeenCalledTimes(1);
  });

  it("does not start visualization when the paywall is dismissed", async () => {
    const showPaywall = vi.fn(async () => false);
    const startVisualization = vi.fn(async () => {});

    await expect(
      requestVisualizationWithGate({
        isPro: false,
        showPaywall,
        startVisualization,
      })
    ).resolves.toBe("dismissed");

    expect(showPaywall).toHaveBeenCalledWith(VISUALIZE_DREAM_PLACEMENT);
    expect(startVisualization).not.toHaveBeenCalled();
  });

  it("starts visualization after the paywall unlocks access", async () => {
    const showPaywall = vi.fn(async () => true);
    const startVisualization = vi.fn(async () => {});

    await expect(
      requestVisualizationWithGate({
        isPro: false,
        showPaywall,
        startVisualization,
      })
    ).resolves.toBe("started");

    expect(showPaywall).toHaveBeenCalledWith(VISUALIZE_DREAM_PLACEMENT);
    expect(startVisualization).toHaveBeenCalledTimes(1);
  });
});
