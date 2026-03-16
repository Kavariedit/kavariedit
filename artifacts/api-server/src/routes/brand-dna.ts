import { Router, type IRouter, type Request, type Response } from "express";
import { db, brandDnaProfilesTable, userProfilesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  ExtractBrandDnaBody,
  GetBrandDnaProfilesResponse,
  ExtractBrandDnaResponse,
  DeleteBrandDnaProfileResponse,
  SetDefaultBrandDnaResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateBrandDna(url: string) {
  const seed = url.length;
  const hues = [(seed * 37) % 360, (seed * 73) % 360, (seed * 113) % 360];

  const palettes = [
    {
      primaryColor: "#E8B4B8",
      secondaryColor: "#F5E6E8",
      accentColor: "#C9A8B2",
      neutralColor: "#9B8FA0",
      backgroundColor: "#FDF6F7",
      fontMood: "modern sans-serif",
      contentVibe: "minimal and feminine",
    },
    {
      primaryColor: "#B8D4E8",
      secondaryColor: "#E6F0F5",
      accentColor: "#A8C2C9",
      neutralColor: "#8F9B9E",
      backgroundColor: "#F6FAFB",
      fontMood: "clean and minimal",
      contentVibe: "professional and calm",
    },
    {
      primaryColor: "#D4B8E8",
      secondaryColor: "#EDE6F5",
      accentColor: "#C2A8C9",
      neutralColor: "#9B8FA0",
      backgroundColor: "#F9F6FD",
      fontMood: "elegant script",
      contentVibe: "luxurious and creative",
    },
    {
      primaryColor: "#B8E8C8",
      secondaryColor: "#E6F5EC",
      accentColor: "#A8C9B2",
      neutralColor: "#8FA099",
      backgroundColor: "#F6FDF8",
      fontMood: "playful rounded",
      contentVibe: "fresh and natural",
    },
    {
      primaryColor: "#E8D4B8",
      secondaryColor: "#F5EDE6",
      accentColor: "#C9B8A8",
      neutralColor: "#A09B8F",
      backgroundColor: "#FDF9F6",
      fontMood: "warm serif",
      contentVibe: "cozy and artisanal",
    },
  ];

  return palettes[seed % palettes.length];
}

function detectSourceType(url: string): "instagram" | "etsy" | "other" {
  if (url.includes("instagram") || url.startsWith("@")) return "instagram";
  if (url.includes("etsy")) return "etsy";
  return "other";
}

async function ensureUserProfile(userId: string) {
  const existing = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.id, userId))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(userProfilesTable).values({ id: userId });
  }
}

router.get("/brand-dna", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const profiles = await db
    .select()
    .from(brandDnaProfilesTable)
    .where(eq(brandDnaProfilesTable.userId, req.user.id));

  res.json(
    GetBrandDnaProfilesResponse.parse(
      profiles.map((p) => ({
        id: p.id,
        sourceUrl: p.sourceUrl,
        sourceType: p.sourceType,
        primaryColor: p.primaryColor,
        secondaryColor: p.secondaryColor,
        accentColor: p.accentColor,
        neutralColor: p.neutralColor,
        backgroundColor: p.backgroundColor,
        fontMood: p.fontMood,
        contentVibe: p.contentVibe,
        isDefault: p.isDefault,
        createdAt: p.createdAt.toISOString(),
      })),
    ),
  );
});

router.post("/brand-dna", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = ExtractBrandDnaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  await ensureUserProfile(req.user.id);

  const { url } = parsed.data;
  const dna = generateBrandDna(url);
  const sourceType = detectSourceType(url);

  const [profile] = await db
    .insert(brandDnaProfilesTable)
    .values({
      userId: req.user.id,
      sourceUrl: url,
      sourceType,
      ...dna,
      isDefault: false,
    })
    .returning();

  res.json(
    ExtractBrandDnaResponse.parse({
      id: profile.id,
      sourceUrl: profile.sourceUrl,
      sourceType: profile.sourceType,
      primaryColor: profile.primaryColor,
      secondaryColor: profile.secondaryColor,
      accentColor: profile.accentColor,
      neutralColor: profile.neutralColor,
      backgroundColor: profile.backgroundColor,
      fontMood: profile.fontMood,
      contentVibe: profile.contentVibe,
      isDefault: profile.isDefault,
      createdAt: profile.createdAt.toISOString(),
    }),
  );
});

router.delete("/brand-dna/:id", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await db
    .delete(brandDnaProfilesTable)
    .where(
      and(
        eq(brandDnaProfilesTable.id, req.params.id),
        eq(brandDnaProfilesTable.userId, req.user.id),
      ),
    );

  res.json(DeleteBrandDnaProfileResponse.parse({ success: true }));
});

router.post("/brand-dna/:id/set-default", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await db
    .update(brandDnaProfilesTable)
    .set({ isDefault: false })
    .where(eq(brandDnaProfilesTable.userId, req.user.id));

  await db
    .update(brandDnaProfilesTable)
    .set({ isDefault: true })
    .where(
      and(
        eq(brandDnaProfilesTable.id, req.params.id),
        eq(brandDnaProfilesTable.userId, req.user.id),
      ),
    );

  res.json(SetDefaultBrandDnaResponse.parse({ success: true }));
});

export default router;
