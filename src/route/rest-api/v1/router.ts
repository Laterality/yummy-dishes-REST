import * as express from "express";

import { router as userApi } from "./user";
import { router as imageApi } from "./image";

export const router = express.Router();

router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	// console.log("path: " + req.path, "routing...");
	next();
})
.use("/user", userApi)
.use("/image", imageApi);
