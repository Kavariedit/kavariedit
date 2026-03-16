import { Router, type IRouter, type Request, type Response } from "express";
import { db, sprintProgressTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetSprintStatusResponse,
  StartSprintResponse,
  CompleteSprintTaskResponse,
  RestartSprintResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SPRINT_DAYS = [
  {
    day: 1,
    title: "Extract Brand DNA",
    description:
      'Find an Instagram account or Etsy shop you admire and extract their Brand DNA. Click "Extract Brand DNA" to get started.',
  },
  {
    day: 2,
    title: "Choose Your Niche",
    description:
      "Browse the Trending Niche Radar and pick ONE niche to focus on. Write down 3 product ideas in that niche.",
  },
  {
    day: 3,
    title: "Map Your First Product",
    description:
      "Decide on your first product: choose a category, name it, and write 3 bullet points about what makes it valuable.",
  },
  {
    day: 4,
    title: "Customize Your First Template",
    description:
      "Pick a template from the library, apply your Brand DNA colors, and personalize the text to match your product.",
  },
  {
    day: 5,
    title: "Create 3 More Pages",
    description:
      "If your product is a planner or multi-page PDF, customize at least 3 pages today. Keep the design consistent.",
  },
  {
    day: 6,
    title: "Design Your Cover",
    description:
      "Create a stunning cover page or product mockup using an Etsy Mockup template with your Brand DNA applied.",
  },
  {
    day: 7,
    title: "Record Your AI Voice",
    description:
      "Head to the Voice Studio, record your 30-second voice sample, and create your AI voice clone for future voiceovers.",
  },
  {
    day: 8,
    title: "Create Social Content",
    description:
      "Design 3 Instagram posts or a Pinterest pin to promote your upcoming product. Use the Social Templates section.",
  },
  {
    day: 9,
    title: "Generate Your First Voiceover",
    description:
      'Use your AI voice to create a 30-second "coming soon" announcement for your product. Download the MP3.',
  },
  {
    day: 10,
    title: "Set Up Your Etsy Shop",
    description:
      'Create your Etsy seller account if you haven\'t already. Set up your shop name, banner, and "About" section.',
  },
  {
    day: 11,
    title: "Write Your Product Listing",
    description:
      "Write your product title (include keywords!), 5 bullet points, and full description. Use the niche radar for inspiration.",
  },
  {
    day: 12,
    title: "Upload and Price Your Product",
    description:
      "Upload your digital files to Etsy, set your price using the Profit Calculator, and upload your product images.",
  },
  {
    day: 13,
    title: "Create Your Launch Post",
    description:
      "Design one final Instagram carousel or Pinterest pin announcing your product launch. Schedule it for tomorrow.",
  },
  {
    day: 14,
    title: "Publish and Share",
    description:
      "Hit PUBLISH on your Etsy listing. Post your social content. Share your product link in at least one Facebook group or Instagram story.",
  },
];

function buildSprintResponse(sprint: {
  isActive: boolean;
  startedAt: Date | null;
  completedDays: number[];
}) {
  const currentDay = sprint.completedDays.length + 1;
  return {
    isActive: sprint.isActive,
    startedAt: sprint.startedAt ? sprint.startedAt.toISOString() : null,
    currentDay: Math.min(currentDay, 14),
    completedDays: sprint.completedDays.length,
    days: SPRINT_DAYS.map((d) => ({
      day: d.day,
      title: d.title,
      description: d.description,
      isCompleted: sprint.completedDays.includes(d.day),
      completedAt: sprint.completedDays.includes(d.day)
        ? new Date().toISOString()
        : null,
    })),
  };
}

router.get("/sprint", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [sprint] = await db
    .select()
    .from(sprintProgressTable)
    .where(eq(sprintProgressTable.userId, req.user.id))
    .limit(1);

  if (!sprint) {
    res.json(
      GetSprintStatusResponse.parse(
        buildSprintResponse({ isActive: false, startedAt: null, completedDays: [] }),
      ),
    );
    return;
  }

  res.json(
    GetSprintStatusResponse.parse(
      buildSprintResponse({
        isActive: sprint.isActive,
        startedAt: sprint.startedAt,
        completedDays: sprint.completedDays ?? [],
      }),
    ),
  );
});

router.post("/sprint", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [existing] = await db
    .select()
    .from(sprintProgressTable)
    .where(eq(sprintProgressTable.userId, req.user.id))
    .limit(1);

  let sprint;
  if (existing) {
    const [updated] = await db
      .update(sprintProgressTable)
      .set({ isActive: true, startedAt: new Date(), completedDays: [] })
      .where(eq(sprintProgressTable.userId, req.user.id))
      .returning();
    sprint = updated;
  } else {
    const [created] = await db
      .insert(sprintProgressTable)
      .values({
        userId: req.user.id,
        isActive: true,
        startedAt: new Date(),
        completedDays: [],
      })
      .returning();
    sprint = created;
  }

  res.json(
    StartSprintResponse.parse(
      buildSprintResponse({
        isActive: sprint.isActive,
        startedAt: sprint.startedAt,
        completedDays: sprint.completedDays ?? [],
      }),
    ),
  );
});

router.post("/sprint/tasks/:day/complete", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const day = parseInt(req.params.day, 10);
  if (isNaN(day) || day < 1 || day > 14) {
    res.status(400).json({ error: "Invalid day" });
    return;
  }

  const [sprint] = await db
    .select()
    .from(sprintProgressTable)
    .where(eq(sprintProgressTable.userId, req.user.id))
    .limit(1);

  if (!sprint) {
    res.status(404).json({ error: "Sprint not started" });
    return;
  }

  const completedDays = sprint.completedDays ?? [];
  if (!completedDays.includes(day)) {
    completedDays.push(day);
  }

  const [updated] = await db
    .update(sprintProgressTable)
    .set({ completedDays })
    .where(eq(sprintProgressTable.userId, req.user.id))
    .returning();

  res.json(
    CompleteSprintTaskResponse.parse(
      buildSprintResponse({
        isActive: updated.isActive,
        startedAt: updated.startedAt,
        completedDays: updated.completedDays ?? [],
      }),
    ),
  );
});

router.post("/sprint/restart", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [existing] = await db
    .select()
    .from(sprintProgressTable)
    .where(eq(sprintProgressTable.userId, req.user.id))
    .limit(1);

  let sprint;
  if (existing) {
    const [updated] = await db
      .update(sprintProgressTable)
      .set({ isActive: true, startedAt: new Date(), completedDays: [] })
      .where(eq(sprintProgressTable.userId, req.user.id))
      .returning();
    sprint = updated;
  } else {
    const [created] = await db
      .insert(sprintProgressTable)
      .values({
        userId: req.user.id,
        isActive: true,
        startedAt: new Date(),
        completedDays: [],
      })
      .returning();
    sprint = created;
  }

  res.json(
    RestartSprintResponse.parse(
      buildSprintResponse({
        isActive: sprint.isActive,
        startedAt: sprint.startedAt,
        completedDays: sprint.completedDays ?? [],
      }),
    ),
  );
});

export default router;
