import * as express from "express";

import { router as userApi } from "./user";

export const router = express.Router();

router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.log("path: " + req.path, "routing...");
	next();
})
.use("/users?", userApi);
