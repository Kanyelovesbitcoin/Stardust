"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const transcribeAudio = internalAction({
  args: {
    dreamId: v.id("dreams"),
    audioStorageId: v.id("_storage"),
    userId: v.string(),
  },
  handler: async (ctx, { dreamId, audioStorageId, userId }) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY not set");
      await ctx.runMutation(internal.dreams.updateTranscript, {
        dreamId,
        transcript: "[Transcription failed: API key not configured]",
        userId,
      });
      return;
    }

    try {
      const audioBlob = await ctx.storage.get(audioStorageId);
      if (!audioBlob) {
        throw new Error("Audio file not found in storage");
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      const formData = new FormData();
      const audioFile = new File([audioBuffer], "audio.m4a", {
        type: "audio/m4a",
      });
      formData.append("file", audioFile);
      formData.append("model", "whisper-large-v3");
      formData.append("language", "en");

      const response = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errorText}`);
      }

      const result = (await response.json()) as { text: string };

      await ctx.runMutation(internal.dreams.updateTranscript, {
        dreamId,
        transcript: result.text,
        userId,
      });
    } catch (error) {
      console.error("Transcription failed:", error);
      await ctx.runMutation(internal.dreams.updateTranscript, {
        dreamId,
        transcript: "[Transcription failed. Please try again.]",
        userId,
      });
    }
  },
});
