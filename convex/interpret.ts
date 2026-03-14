"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const SYSTEM_PROMPT = `Dream interpreter. Return ONLY JSON, no markdown. Be concise.

{"emotionalTheme":"one sentence","practicalInsight":"one sentence","fullAnalysis":"2-3 sentences max, second person, specific to this dream"}`;

interface InterpretationResult {
  emotionalTheme: string;
  practicalInsight: string;
  fullAnalysis: string;
}

export const interpretDream = internalAction({
  args: {
    dreamId: v.id("dreams"),
    transcript: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, { dreamId, transcript, userId }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      await ctx.runMutation(internal.dreams.failInterpretation, { dreamId, userId });
      return;
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://droplett.app",
            "X-Title": "Droplett Dream Journal",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            max_tokens: 300,
            temperature: 0,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Interpret this dream:\n\n${transcript}`,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `OpenRouter API error ${response.status}: ${errorText}`
        );
      }

      const data = (await response.json()) as {
        choices: { message: { content: string } }[];
      };

      const content = data.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from API");
      }

      // Parse JSON — strip markdown fences if present
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      const result: InterpretationResult = JSON.parse(cleaned);

      await ctx.runMutation(internal.dreams.saveInterpretation, {
        dreamId,
        userId,
        interpretation: {
          symbols: [],
          hiddenPatterns: [],
          emotionalTheme: result.emotionalTheme,
          practicalInsight: result.practicalInsight,
          fullAnalysis: result.fullAnalysis,
          generatedAt: Date.now(),
        },
      });
    } catch (error) {
      console.error("Interpretation failed:", error);
      await ctx.runMutation(internal.dreams.failInterpretation, { dreamId, userId });
    }
  },
});
