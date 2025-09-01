
import { Router } from "express";
import examRoute from "./examRoute.js";
import moduleRoute from "./modueRoute.js";
import questionRoute from "./questionRoute.js";
import reportQuestionsRoute from "./reportQuestionsRoute.js";
import authRoute from "./authRoute.js";
import explanationsRoute from "./explanationRoute.js";
import resumesRoute from "./resumeRoute.js";
import userRoute from "./userRoute.js";
const router = Router();

router.use("/exams", examRoute);
router.use("/modules", moduleRoute);
router.use("/questions", questionRoute);
router.use("/report-questions", reportQuestionsRoute);
router.use("/auth", authRoute);
router.use("/explanations", explanationsRoute);
router.use("/resumes", resumesRoute);
router.use("/users", userRoute);

export default router;
