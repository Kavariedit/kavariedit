import { Router, type IRouter, type Request, type Response } from "express";
import { db, userProfilesTable, voiceoverHistoryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateVoiceCloneBody,
  GenerateVoiceoverBody,
  GetVoiceStatusResponse,
  CreateVoiceCloneResponse,
  GenerateVoiceoverResponse,
  GetVoiceoverHistoryResponse,
} from "@workspace/api-zod";
import OpenAI from "openai";
import { join } from "path";
import { writeFile } from "fs/promises";
import { audioDir } from "../app";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;
type OpenAIVoice = (typeof VALID_VOICES)[number];

const router: IRouter = Router();

const FREE_TIER_LIMIT = 5;

async function getOrCreateProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.id, userId))
    .limit(1);

  if (!profile) {
    const [newProfile] = await db
      .insert(userProfilesTable)
      .values({ id: userId })
      .returning();
    return newProfile;
  }

  const now = new Date();
  const resetAt = profile.voiceoversResetAt;
  if (
    !resetAt ||
    now.getMonth() !== resetAt.getMonth() ||
    now.getFullYear() !== resetAt.getFullYear()
  ) {
    const [updated] = await db
      .update(userProfilesTable)
      .set({ voiceoversUsedThisMonth: 0, voiceoversResetAt: now })
      .where(eq(userProfilesTable.id, userId))
      .returning();
    return updated;
  }

  return profile;
}

router.get("/voice/status", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const profile = await getOrCreateProfile(req.user.id);
  const limit = profile.subscriptionTier === "pro" ? 999 : FREE_TIER_LIMIT;

  res.json(
    GetVoiceStatusResponse.parse({
      hasVoiceClone: !!profile.voiceCloneId,
      voiceId: profile.voiceCloneId ?? null,
      voiceoversUsedThisMonth: profile.voiceoversUsedThisMonth,
      voiceoverLimit: limit,
      subscriptionTier: profile.subscriptionTier,
    }),
  );
});

router.post("/voice/create", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateVoiceCloneBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const voiceName = parsed.data.name;
  if (!VALID_VOICES.includes(voiceName as OpenAIVoice)) {
    res.status(400).json({ error: "Invalid voice name." });
    return;
  }

  const profile = await getOrCreateProfile(req.user.id);

  await db
    .update(userProfilesTable)
    .set({ voiceCloneId: voiceName })
    .where(eq(userProfilesTable.id, req.user.id));

  const limit = profile.subscriptionTier === "pro" ? 999 : FREE_TIER_LIMIT;

  res.json(
    CreateVoiceCloneResponse.parse({
      hasVoiceClone: true,
      voiceId: voiceName,
      voiceoversUsedThisMonth: profile.voiceoversUsedThisMonth,
      voiceoverLimit: limit,
      subscriptionTier: profile.subscriptionTier,
    }),
  );
});

router.post("/voice/generate", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = GenerateVoiceoverBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const profile = await getOrCreateProfile(req.user.id);
  const limit = profile.subscriptionTier === "pro" ? 999 : FREE_TIER_LIMIT;

  if (profile.voiceoversUsedThisMonth >= limit) {
    res
      .status(403)
      .json({ error: "Monthly voiceover limit reached. Upgrade to Pro for unlimited voiceovers." });
    return;
  }

  if (!profile.voiceCloneId) {
    res.status(400).json({ error: "No voice clone created yet. Please record your voice first." });
    return;
  }

  const voice = profile.voiceCloneId as OpenAIVoice;
  const text = parsed.data.text.slice(0, 4000);

  const ttsResponse = await openai.audio.speech.create({
    model: "tts-1",
    voice,
    input: text,
  });

  const filename = `${req.user.id}_${Date.now()}.mp3`;
  const filepath = join(audioDir, filename);
  await writeFile(filepath, Buffer.from(await ttsResponse.arrayBuffer()));

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const audioUrl = `${baseUrl}/audio/${filename}`;

  await db
    .update(userProfilesTable)
    .set({ voiceoversUsedThisMonth: (profile.voiceoversUsedThisMonth || 0) + 1 })
    .where(eq(userProfilesTable.id, req.user.id));

  const [entry] = await db
    .insert(voiceoverHistoryTable)
    .values({
      userId: req.user.id,
      text: parsed.data.text,
      audioUrl,
    })
    .returning();

  res.json(
    GenerateVoiceoverResponse.parse({
      id: entry.id,
      audioUrl: entry.audioUrl,
      text: entry.text,
      createdAt: entry.createdAt.toISOString(),
    }),
  );
});

router.get("/voice/history", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const history = await db
    .select()
    .from(voiceoverHistoryTable)
    .where(eq(voiceoverHistoryTable.userId, req.user.id));

  res.json(
    GetVoiceoverHistoryResponse.parse(
      history.map((h) => ({
        id: h.id,
        text: h.text,
        audioUrl: h.audioUrl,
        createdAt: h.createdAt.toISOString(),
      })),
    ),
  );
});

export default router;
