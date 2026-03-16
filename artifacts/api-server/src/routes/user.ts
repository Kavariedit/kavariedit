import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  usersTable,
  userProfilesTable,
  userTemplateCustomizationsTable,
  voiceoverHistoryTable,
  brandDnaProfilesTable,
  sprintProgressTable,
} from "@workspace/db";
import { eq, and, gte } from "drizzle-orm";
import {
  GetUserProfileResponse,
  UpdateUserProfileBody,
  UpdateUserProfileResponse,
  GetUserStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.id, userId))
    .limit(1);

  if (!profile) {
    const [created] = await db
      .insert(userProfilesTable)
      .values({ id: userId })
      .returning();
    return created;
  }
  return profile;
}

router.get("/user/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id))
    .limit(1);

  const profile = await ensureProfile(req.user.id);

  res.json(
    GetUserProfileResponse.parse({
      id: req.user.id,
      email: user?.email ?? req.user.email ?? null,
      firstName: user?.firstName ?? req.user.firstName ?? null,
      lastName: user?.lastName ?? req.user.lastName ?? null,
      profileImageUrl: user?.profileImageUrl ?? req.user.profileImageUrl ?? null,
      subscriptionTier: profile.subscriptionTier,
      createdAt: (user?.createdAt ?? new Date()).toISOString(),
    }),
  );
});

router.patch("/user/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UpdateUserProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const updates: Partial<{ firstName: string; lastName: string }> = {};
  if (parsed.data.firstName) updates.firstName = parsed.data.firstName;
  if (parsed.data.lastName) updates.lastName = parsed.data.lastName;

  if (Object.keys(updates).length > 0) {
    await db.update(usersTable).set(updates).where(eq(usersTable.id, req.user.id));
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id))
    .limit(1);

  const profile = await ensureProfile(req.user.id);

  res.json(
    UpdateUserProfileResponse.parse({
      id: req.user.id,
      email: user?.email ?? null,
      firstName: user?.firstName ?? null,
      lastName: user?.lastName ?? null,
      profileImageUrl: user?.profileImageUrl ?? null,
      subscriptionTier: profile.subscriptionTier,
      createdAt: (user?.createdAt ?? new Date()).toISOString(),
    }),
  );
});

router.get("/user/stats", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const profile = await ensureProfile(req.user.id);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [customizations] = await db
    .select()
    .from(userTemplateCustomizationsTable)
    .where(
      and(
        eq(userTemplateCustomizationsTable.userId, req.user.id),
        gte(userTemplateCustomizationsTable.createdAt, startOfMonth),
      ),
    );

  const templateCount = customizations ? 1 : 0;

  const dnaProfiles = await db
    .select()
    .from(brandDnaProfilesTable)
    .where(eq(brandDnaProfilesTable.userId, req.user.id));

  const [sprintRecord] = await db
    .select()
    .from(sprintProgressTable)
    .where(eq(sprintProgressTable.userId, req.user.id))
    .limit(1);

  const completedDays = sprintRecord?.completedDays ?? [];
  const currentDay = sprintRecord?.isActive ? completedDays.length + 1 : 0;

  const limit = profile.subscriptionTier === "pro" ? 999 : 5;

  res.json(
    GetUserStatsResponse.parse({
      templatesDownloadedThisMonth: templateCount,
      voiceoversUsedThisMonth: profile.voiceoversUsedThisMonth,
      voiceoverLimit: limit,
      brandDnaProfilesCount: dnaProfiles.length,
      sprintDay: currentDay,
      sprintIsActive: sprintRecord?.isActive ?? false,
    }),
  );
});

export default router;
