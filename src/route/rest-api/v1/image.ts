import * as express from "express";
import * as fs from "fs";
import * as mongoose from "mongoose";
import * as multer from "multer";
import * as path from "path";

import { config } from "../../../config";
import * as model from "../../../db/model";
import * as util from "../../../util";

export const router = express.Router();

router
.post("/upload", util.upload.single("content"), async (req: express.Request,
	res: express.Response, 
	next: express.NextFunction) => {
	res.status(200).send("ok");
	const file = (req as any).file;
	if (!file) {
		console.log("file not found");
		return;
	}

});
