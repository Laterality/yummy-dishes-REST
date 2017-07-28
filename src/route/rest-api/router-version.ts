import * as express from "express";

import { router as routerV1 } from "./v1/router";

export const versionRouter = express.Router();

versionRouter.use("/v1", routerV1);
