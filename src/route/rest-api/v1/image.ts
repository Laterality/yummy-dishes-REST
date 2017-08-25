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
export async function uploadImage(req: express.Request){
	const file = (req as any).file;
	if (!file) {
		console.log("[api] file not exists");

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"file not exists");
	}
	else {
		try {
			const image = await fileHandler.fileHandler(file);

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_CREATED,
				resHandler.ApiResponse.RESULT_OK,
				"",
				{
					name: "image",
					obj: {
						_id: image._id,
						path: (image as any)["path"],
					},
				});
		}
		catch (err) {
			if (err.message === "unsupported file extension") {
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
					resHandler.ApiResponse.RESULT_FAIL,
					err.message);
			}
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_SERVER_FAULT,
				resHandler.ApiResponse.RESULT_FAIL,
				"server fault");
		}
	}
}
