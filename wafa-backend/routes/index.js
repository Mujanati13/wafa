
import { Router } from "express";
import examRoute from "./examRoute.js";
const router = Router();

router.use("/exams", examRoute);

export default router;
