export const VISUALIZE_DREAM_PLACEMENT = "visualize_dream";

type RequestVisualizationWithGateArgs = {
  isPro: boolean;
  showPaywall: (placement?: string) => Promise<boolean>;
  startVisualization: () => Promise<void>;
  placement?: string;
};

export type VisualizationGateResult = "started" | "dismissed";

export async function requestVisualizationWithGate({
  isPro,
  showPaywall,
  startVisualization,
  placement = VISUALIZE_DREAM_PLACEMENT,
}: RequestVisualizationWithGateArgs): Promise<VisualizationGateResult> {
  if (!isPro) {
    const unlocked = await showPaywall(placement);
    if (!unlocked) {
      return "dismissed";
    }
  }

  await startVisualization();
  return "started";
}
