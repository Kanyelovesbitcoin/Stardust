"use node";

/**
 * Process image buffer for storage.
 * Previously used sharp for PNG→JPEG compression, but sharp requires
 * platform-specific native binaries that don't work in Convex's runtime.
 * Images from Gemini are already reasonably sized for mobile display.
 */
export async function processImage(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  // Return as-is — Convex storage handles the rest
  return { buffer, mimeType };
}
