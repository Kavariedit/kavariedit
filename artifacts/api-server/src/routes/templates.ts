import { Router, type IRouter, type Request, type Response } from "express";
import { db, templatesTable, socialTemplatesTable, userTemplateCustomizationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetTemplatesResponse,
  GetTemplateResponse,
  TrackTemplateCustomizationResponse,
  GetSocialTemplatesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/templates", async (req: Request, res: Response) => {
  const { category } = req.query;

  let templates;
  if (category && typeof category === "string") {
    templates = await db
      .select()
      .from(templatesTable)
      .where(eq(templatesTable.category, category as any));
  } else {
    templates = await db.select().from(templatesTable);
  }

  res.json(
    GetTemplatesResponse.parse(
      templates.map((t) => ({
        id: t.id,
        title: t.title,
        category: t.category,
        thumbnailUrl: t.thumbnailUrl,
        dimensionsWidth: t.dimensionsWidth,
        dimensionsHeight: t.dimensionsHeight,
        templateData: t.templateData ?? {},
      })),
    ),
  );
});

router.get("/templates/:id", async (req: Request, res: Response) => {
  const [template] = await db
    .select()
    .from(templatesTable)
    .where(eq(templatesTable.id, req.params.id as string))
    .limit(1);

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json(
    GetTemplateResponse.parse({
      id: template.id,
      title: template.title,
      category: template.category,
      thumbnailUrl: template.thumbnailUrl,
      dimensionsWidth: template.dimensionsWidth,
      dimensionsHeight: template.dimensionsHeight,
      templateData: template.templateData ?? {},
    }),
  );
});

router.post("/templates/:id/customize", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await db.insert(userTemplateCustomizationsTable).values({
    userId: req.user.id,
    templateId: req.params.id as string,
  });

  res.json(TrackTemplateCustomizationResponse.parse({ success: true }));
});

router.get("/social-templates", async (req: Request, res: Response) => {
  const { platform } = req.query;

  let templates;
  if (platform && typeof platform === "string") {
    templates = await db
      .select()
      .from(socialTemplatesTable)
      .where(eq(socialTemplatesTable.platform, platform as any));
  } else {
    templates = await db.select().from(socialTemplatesTable);
  }

  res.json(
    GetSocialTemplatesResponse.parse(
      templates.map((t) => ({
        id: t.id,
        title: t.title,
        platform: t.platform,
        thumbnailUrl: t.thumbnailUrl,
        dimensionsWidth: t.dimensionsWidth,
        dimensionsHeight: t.dimensionsHeight,
        captionSuggestions: t.captionSuggestions,
        templateData: t.templateData ?? {},
      })),
    ),
  );
});

export default router;
