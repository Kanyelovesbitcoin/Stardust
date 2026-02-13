"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const SYSTEM_PROMPT = `You are a dream interpretation expert combining Jungian psychology, symbolic analysis, and practical insight. Given a dream transcript, return a JSON object with this exact structure:

{
  "symbols": [
    {"name": "symbol name", "meaning": "what it represents in the dreamer's psyche", "archetype": "Jungian archetype if applicable"}
  ],
  "hiddenPatterns": ["pattern 1", "pattern 2"],
  "emotionalTheme": "the dominant emotional undercurrent of the dream",
  "practicalInsight": "what the dreamer's subconscious might be processing in waking life",
  "fullAnalysis": "A 2-3 paragraph rich interpretation weaving together symbols, emotions, and meaning. Write in second person ('your dream suggests...'). Be specific to THIS dream, not generic."
}

Rules:
- 3-5 symbols max, each with a concise but insightful meaning
- 1-3 hidden patterns (recurring themes, contradictions, or narrative structures)
- Keep emotionalTheme to 1-2 sentences
- Keep practicalInsight to 1-2 sentences
- fullAnalysis should be the main value — rich, specific, and illuminating
- Return ONLY valid JSON, no markdown fences or extra text`;

interface InterpretationResult {
  symbols: { name: string; meaning: string; archetype?: string }[];
  hiddenPatterns: string[];
  emotionalTheme: string;
  practicalInsight: string;
  fullAnalysis: string;
}

export const interpretDream = internalAction({
  args: {
    dreamId: v.id("dreams"),
    transcript: v.string(),
  },
  handler: async (ctx, { dreamId, transcript }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      await ctx.runMutation(internal.dreams.failInterpretation, { dreamId });
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
            "HTTP-Referer": "https://stardust-app.com",
            "X-Title": "Stardust Dream Journal",
          },
          body: JSON.stringify({
            model: "moonshotai/kimi-k2",
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
        interpretation: {
          symbols: result.symbols.map((s) => ({
            name: s.name,
            meaning: s.meaning,
            archetype: s.archetype,
          })),
          hiddenPatterns: result.hiddenPatterns,
          emotionalTheme: result.emotionalTheme,
          practicalInsight: result.practicalInsight,
          fullAnalysis: result.fullAnalysis,
          generatedAt: Date.now(),
        },
      });
    } catch (error) {
      console.error("Interpretation failed:", error);
      await ctx.runMutation(internal.dreams.failInterpretation, { dreamId });
    }
  },
});
