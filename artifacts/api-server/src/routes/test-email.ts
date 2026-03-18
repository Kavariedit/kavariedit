import { Router, type Request, type Response } from "express";
import { Resend } from "resend";

const router = Router();

router.post("/test-email", async (_req: Request, res: Response) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "kayleydoyle13@gmail.com",
    subject: "🎉 Your email is working!",
    text: "If you're reading this, your Resend API is set up correctly. You can now send emails from your app!",
  });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true });
});

export default router;
