import * as express from "express";

import { versionRouter } from "./rest-api/router-version";

export const apiRouter = express.Router();

apiRouter.use((req: any, res: any, next: any) => {
	console.log("path: " + req.path);
	next();
});
apiRouter.use("/api", versionRouter);
