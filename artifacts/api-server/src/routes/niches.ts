import { Router, type IRouter, type Request, type Response } from "express";
import { db, trendingNichesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  GetTrendingNichesResponse,
  GetTrendingNicheResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/niches", async (req: Request, res: Response) => {
  const niches = await db.select().from(trendingNichesTable);

  res.json(
    GetTrendingNichesResponse.parse(
      niches.map((n) => ({
        id: n.id,
        name: n.name,
        demandScore: n.demandScore,
        competitionLevel: n.competitionLevel,
        description: n.description,
        lastUpdated: n.lastUpdated.toISOString(),
      })),
    ),
  );
});

router.get("/niches/:id", async (req: Request, res: Response) => {
  const [niche] = await db
    .select()
    .from(trendingNichesTable)
    .where(eq(trendingNichesTable.id, req.params.id))
    .limit(1);

  if (!niche) {
    res.status(404).json({ error: "Niche not found" });
    return;
  }

  res.json(
    GetTrendingNicheResponse.parse({
      id: niche.id,
      name: niche.name,
      demandScore: niche.demandScore,
      competitionLevel: niche.competitionLevel,
      description: niche.description,
      productIdeas: niche.productIdeas,
      relatedTemplateIds: niche.relatedTemplateIds,
      lastUpdated: niche.lastUpdated.toISOString(),
    }),
  );
});

export default router;
