"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_HEADERS = (apiKey: string) => ({
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "HTTP-Referer": "https://stardust-app.com",
  "X-Title": "Stardust Dream Journal",
});

const IMAGE_PROMPT_SYSTEM = `You are a dream visualization artist. Given a dream description, create a vivid image generation prompt that captures the dream's essence, mood, and key visual elements.

Rules:
- Write a single paragraph, 2-4 sentences
- Focus on atmosphere, lighting, colors, composition, and emotion
- Use painterly/surreal art direction: "ethereal", "dreamlike", "soft glow", "cinematic lighting"
- Never include text or words in the scene
- Never reference the dreamer directly — describe the scene itself
- Return ONLY the prompt text, nothing else`;

export const generateVisualization = internalAction({
  args: {
    dreamId: v.id("dreams"),
    transcript: v.string(),
  },
  handler: async (ctx, { dreamId, transcript }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      await ctx.runMutation(internal.dreams.failVisualization, {
        dreamId,
        imageError: "API key not configured",
      });
      return;
    }

    try {
      // Step 1: Generate image prompt via Kimi K2
      const promptResponse = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: OPENROUTER_HEADERS(apiKey),
        body: JSON.stringify({
          model: "moonshotai/kimi-k2",
          messages: [
            { role: "system", content: IMAGE_PROMPT_SYSTEM },
            {
              role: "user",
              content: `Create an image prompt for this dream:\n\n${transcript}`,
            },
          ],
        }),
      });

      if (!promptResponse.ok) {
        const err = await promptResponse.text();
        throw new Error(`Prompt gen error ${promptResponse.status}: ${err}`);
      }

      const promptData = (await promptResponse.json()) as {
        choices: { message: { content: string } }[];
      };
      const imagePrompt =
        promptData.choices[0]?.message?.content?.trim() ?? "";
      if (!imagePrompt) throw new Error("Empty image prompt from LLM");

      // Step 2: Generate image via Nano Banana (Gemini) through OpenRouter
      const imageResponse = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: OPENROUTER_HEADERS(apiKey),
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          modalities: ["image", "text"],
          messages: [
            {
              role: "user",
              content: imagePrompt,
            },
          ],
        }),
      });

      if (!imageResponse.ok) {
        const err = await imageResponse.text();
        throw new Error(`Image gen error ${imageResponse.status}: ${err}`);
      }

      const imageData = (await imageResponse.json()) as {
        choices: {
          message: {
            content?: string;
            images?: {
              type: string;
              image_url: { url: string };
            }[];
          };
        }[];
      };

      const images = imageData.choices?.[0]?.message?.images;
      if (!images || images.length === 0) {
        throw new Error("No image in response");
      }

      // Extract base64 data from data URL (format: data:image/png;base64,...)
      const dataUrl = images[0].image_url.url;
      const base64Match = dataUrl.match(
        /^data:(image\/\w+);base64,(.+)$/
      );
      if (!base64Match) {
        throw new Error("Invalid image data URL format");
      }

      const mimeType = base64Match[1];
      const base64Data = base64Match[2];

      // Step 3: Process and store image in Convex storage
      const rawBuffer = Buffer.from(base64Data, "base64");

      let finalBuffer: Buffer = rawBuffer;
      let finalMimeType: string = mimeType;
      try {
        const { processImage } = await import("./imageUtils");
        const result = await processImage(rawBuffer, mimeType);
        finalBuffer = result.buffer;
        finalMimeType = result.mimeType;
      } catch (processError) {
        console.warn("Image processing failed, storing raw:", processError);
      }

      const blob = new Blob([new Uint8Array(finalBuffer)], { type: finalMimeType });
      const storageId = await ctx.storage.store(blob);
      const sceneUrl = await ctx.storage.getUrl(storageId);

      if (!sceneUrl) throw new Error("Failed to get storage URL");

      // Step 4: Save to dream (with storageId for URL regeneration)
      await ctx.runMutation(internal.dreams.saveVisualization, {
        dreamId,
        sceneStorageId: storageId,
        sceneUrl,
        imagePrompt,
        visualStyle: "dreamlike",
      });
    } catch (error) {
      console.error("Visualization failed:", error);
      await ctx.runMutation(internal.dreams.failVisualization, {
        dreamId,
        imageError: error instanceof Error ? error.message : "Image generation failed",
      });
    }
  },
});
