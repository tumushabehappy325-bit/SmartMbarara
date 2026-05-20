import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import reportsRouter from "./reports.js";
import statsRouter from "./stats.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reportsRouter);
router.use(statsRouter);

export default router;
