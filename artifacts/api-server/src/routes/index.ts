import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import brandDnaRouter from "./brand-dna";
import templatesRouter from "./templates";
import voiceRouter from "./voice";
import nichesRouter from "./niches";
import sprintRouter from "./sprint";
import calculatorRouter from "./calculator";
import userRouter from "./user";
import socialPostsRouter from "./social-posts";
import testEmailRouter from "./test-email";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(adminRouter);
router.use(healthRouter);
router.use(authRouter);
router.use(brandDnaRouter);
router.use(templatesRouter);
router.use(voiceRouter);
router.use(nichesRouter);
router.use(sprintRouter);
router.use(calculatorRouter);
router.use(userRouter);
router.use(socialPostsRouter);
router.use(testEmailRouter);

export default router;
