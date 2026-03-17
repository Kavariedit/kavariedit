import { Router, type IRouter, type Request, type Response } from "express";
import OpenAI from "openai";

const router: IRouter = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post("/social-posts/generate", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { url } = req.body;
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "A blog URL is required." });
    return;
  }

  // Fetch and extract text from the blog URL
  let blogText: string;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KavariBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const html = await response.text();
    // Strip HTML tags and collapse whitespace
    blogText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000); // Keep it concise for the AI
  } catch (err) {
    res.status(422).json({ error: "Could not fetch the blog URL. Please check it and try again." });
    return;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a social media expert. Given blog content, write 5 engaging social media posts. Each post should be distinct — vary the angle, tone, and platform style (e.g. one punchy Twitter-style, one storytelling LinkedIn, one curiosity-hook Instagram, one list-based, one question-driven). Return ONLY a JSON array of 5 strings, no extra text.",
      },
      {
        role: "user",
        content: `Blog content:\n\n${blogText}`,
      },
    ],
    temperature: 0.8,
  });

  const raw = completion.choices[0].message.content ?? "[]";

  // Parse the JSON array from the response
  let posts: string[];
  try {
    const match = raw.match(/\[[\s\S]*\]/);
    posts = JSON.parse(match ? match[0] : raw);
    if (!Array.isArray(posts)) throw new Error("Not an array");
  } catch {
    // Fallback: split by numbered list if JSON parsing fails
    posts = raw
      .split(/\n\d+\.\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 5);
  }

  res.json({ posts });
});

export default router;
