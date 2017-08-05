import * as mongoose from "mongoose";
import * as express from "express";
import * as multer from "multer";
import * as path from "path";
import * as fs from "fs";

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
	console.log("[api] upload image file...", `
	originalName: ${file.originalname}\n
	encoding: ${file.encoding}\n
	mimetype: ${file.mimetype}\n
	size: ${file.size}\n
	filename: ${file.filename}\n
	path: ${file.path}`);

	console.log("[api] upload dir.: " + path.join(file.path, ".."));

	try {
		// get extension from original file name
		const originalName: string = file.originalname as string;
		const separatedFilename = originalName.split(".");
		const ext = separatedFilename[separatedFilename.length - 1];

		// rename file with extension
		const rename = file.path + ext;
		console.log("[api] renaming with ext. ${ext}");
		fs.rename(file.path, file.path + "." + ext, (err) => {
			if (err) {
				console.log("[api] renaming uploaded file error, ", err);
			}
			else {
				console.log("[api] renamed: " + rename);
			}
		});
	}
	catch (err) {
		console.log("[api] renaming uploaded file error, \n", err);
	}
	
});
