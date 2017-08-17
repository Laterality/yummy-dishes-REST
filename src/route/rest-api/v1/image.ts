import * as express from "express";
import * as fs from "fs";
import * as mongoose from "mongoose";
import * as multer from "multer";
import * as path from "path";

import { config } from "../../../config";
import * as model from "../../../db/model";
import * as fileHandler from "../../../lib/file-handler";
import * as resHandler from "../../../lib/response-handler";

export const router = express.Router();

/**
 * Image file upload API
 * 
 * Path: /upload
 * Method: POST
 * 
 * Request
 * @body content File required single image file to upload
 * 
 * Response
 * @code 201 image uploaded
 * @code 405 invalid parameter
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 * @body image ImageModel optional uploaded image information if request succeed
 */
router
.post("/upload", fileHandler.upload.single("content"), 
async (req: express.Request, res: express.Response) => {
	const file = (req as any).file;
	if (!file) {
		console.log("[api] file not exists");

		return resHandler.responseWithJson(res, 405, {
			result: "fail",
			message: "file not exists",
		});
	}
	else {
		try {
			const image = await fileHandler.fileHandler(file);

			return resHandler.responseWithJson(res, 201, {
					result: "ok",
					image: {
						_id: image._id,
						path: (image as any)["path"],
					},
				});
		}
		catch (err) {
			if (err.message === "unsupported file extension") {
				return resHandler.responseWithJson(res, 405, {
					result: "fail",
					message: err.message,
				});
			}
			return resHandler.responseWithJson(res, 500, {
				result: "error",
				message: "server fault",
			});
		}
		
	}

});
