"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

const SYSTEM_PROMPT = `You are an incisive dream analyst trained in Jungian depth psychology and symbolic interpretation. You give readings that feel personal and uncomfortably accurate — never generic.

Given a dream transcript, return a JSON object with this exact structure:

{
  "symbols": [
    {"name": "symbol name", "meaning": "what it represents in the dreamer's psyche", "archetype": "Jungian archetype if applicable"}
  ],
  "hiddenPatterns": ["pattern 1", "pattern 2"],
  "emotionalTheme": "the dominant emotional undercurrent of the dream",
  "practicalInsight": "what the dreamer's subconscious might be processing in waking life",
  "fullAnalysis": "A 2-3 paragraph rich interpretation. Write in second person ('you were...'). Reference specific details from the dream BY NAME — people, places, objects, actions."
}

Rules:
- 3-5 symbols max. Each symbol MUST reference a specific element from the dream, not an abstract concept.
- Name symbols after the actual thing in the dream (e.g. "the flooded hallway", "Sage running ahead") not generic labels like "water" or "person".
- If someone is chasing or being chased, call it out directly: who is chasing whom, and what the gap between them represents.
- If water appears (floods, oceans, pools, rain), determine whether it represents overwhelm, emotional flooding, or escape/freedom based on the dreamer's relationship to it in the scene.
- Identify whether the dream is processing: unresolved relationships, anxiety about control, desire for something out of reach, or nostalgia for a past self. State this directly.
- NEVER use hedging phrases like "this may represent", "could symbolize", "perhaps suggests". Be direct: "This is about...", "You are processing...", "The reason you dreamed this is..."
- hiddenPatterns: identify narrative structures (pursuit without resolution, environments that shift, people who transform into others)
- emotionalTheme: 1-2 sentences, name the specific emotion, not a category
- practicalInsight: 1-2 sentences, connect to a specific waking-life situation the dream is processing
- fullAnalysis: the main value. Weave specific dream details into the interpretation. Every sentence should reference something the dreamer actually saw or did.
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
            "HTTP-Referer": "https://droplett.app",
            "X-Title": "Droplett Dream Journal",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
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

// ─── Dream Pattern Analysis ─────────────────────────────

const PATTERNS_SYSTEM_PROMPT = `You are a dream pattern analyst. Given an array of dream transcripts, analyze them for recurring patterns across all dreams. Return a JSON object with this exact structure:

{
  "recurringPeople": [{"name": "person name", "count": 5, "meaning": "what their recurrence represents"}],
  "recurringSettings": [{"name": "setting name", "count": 3, "meaning": "why the dreamer returns here"}],
  "recurringThemes": [{"name": "theme name", "count": 7, "meaning": "what this pattern reveals"}],
  "emotionalPatterns": [{"name": "pattern name", "count": 4, "meaning": "what triggers this emotional state in dreams"}]
}

Rules:
- Count how many dreams each person, place, or theme appears in. Include the exact count.
- Rank every array by count — most frequent first.
- For recurringPeople: use actual names from the dreams. If the same person appears under different descriptions, unify them.
- For recurringSettings: identify specific locations (e.g. "high school hallway", "childhood bedroom"), not vague categories.
- For recurringThemes: look for action patterns like chasing, falling, being late, searching, water, flying, teeth, nudity. Be specific about the form they take.
- For emotionalPatterns: correlate dream intensity with life events mentioned. E.g. "Your most vivid dreams cluster around relationship transitions."
- Be direct and specific. No hedging language.
- Return ONLY valid JSON, no markdown fences or extra text`;

export const analyzeDreamPatterns = internalAction({
  args: {
    transcripts: v.array(v.string()),
  },
  handler: async (_ctx, { transcripts }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

    const numberedDreams = transcripts
      .map((t, i) => `Dream ${i + 1}:\n${t}`)
      .join("\n\n---\n\n");

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
          messages: [
            { role: "system", content: PATTERNS_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Analyze patterns across these ${transcripts.length} dreams:\n\n${numberedDreams}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("Empty response from API");

    const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  },
});

// ─── Dream Title Generation ─────────────────────────────

const TITLE_SYSTEM_PROMPT = `You are a poet who titles dreams. Given a dream transcript, return a single evocative word that captures the emotional essence of this specific dream.

Rules:
- Return ONLY one word, nothing else. No quotes, no punctuation, no explanation.
- The word must be emotionally charged and specific to THIS dream.
- NEVER use generic dream words like: Dream, Sleep, Night, Chase, Vision, Journey, Awakening, Wandering.
- Push for visceral, unexpected words. Examples of good titles: Flood, Dissolving, Forgiven, Unmoored, Hollow, Ember, Fracture, Tethered, Swallowed, Gilded.
- If the dream involves water, lean toward words about submersion or flow: Undertow, Drowned, Tributary, Deluge.
- If the dream involves pursuit, lean toward words about distance or longing: Vanishing, Unreachable, Receding, Eclipsed.
- If the dream involves a specific person, lean toward words about the emotional relationship: Forgiven, Severed, Entangled, Haunted.
- The title should make the dreamer feel seen.`;

export const generateDreamTitle = internalAction({
  args: {
    transcript: v.string(),
  },
  handler: async (_ctx, { transcript }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

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
          messages: [
            { role: "system", content: TITLE_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Title this dream:\n\n${transcript}`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices[0]?.message?.content?.trim();
    if (!content) throw new Error("Empty response from API");

    // Clean up — take only the first word in case the model added extra
    return content.split(/\s+/)[0].replace(/[^a-zA-Z]/g, "");
  },
});
