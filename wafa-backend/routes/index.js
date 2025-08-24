
import { Router } from "express";
import examRoute from "./examRoute.js";
import moduleRoute from "./modueRoute.js";
const router = Router();

router.use("/exams", examRoute);
router.use("/modules", moduleRoute);

export default router;
