import * as bcrypt from "bcrypt-nodejs";
import * as express from "express";
import * as fs from "fs";
import * as multer from "multer";
import * as path from "path";

import { config } from "./config";
import * as model from "./db/model";

// tuple with hashed password and salt
type auth = [string, string];

export const upload = multer({
	dest: path.join(__dirname, config.path_public, "img"),
});

/**
 *
 * @param res response for request
 * @param code status code
 * @param body object to convert to json into response body
 */
export function responseWithJson(res: express.Response, code: number, body: any): void {
	res.type("type")
	.status(code)
	.send(JSON.stringify(body));
}

export async function encryption(raw: string, salt = bcrypt.genSaltSync(10)): Promise<auth> {
	const pwHashed = bcrypt.hashSync(raw, salt);
	return [pwHashed, salt];
}

/**
 * 
 * @param file file object created by multer
 * 
 * @return fileId "_id" field of updated file if success, or error object
 */
export async function fileHandler(file: any) {
	// console.log("[api] upload image file...", `
	// originalName: ${file.originalname}\n
	// encoding: ${file.encoding}\n
	// mimetype: ${file.mimetype}\n
	// size: ${file.size}\n
	// filename: ${file.filename}\n
	// path: ${file.path}`);

	// console.log("[api] upload dir.: " + path.join(file.path, ".."));

	try {
		const loop = Array.isArray(file) ? file.length : 1;
		const imageIds: string[] = [];

		for (let i = 0; i < loop; i++) {
			// get extension from original file name
			const originalName: string = file.originalname as string;
			const separatedFilename = originalName.split(".");
			const ext = separatedFilename[separatedFilename.length - 1];

			// rename file with extension
			const rename = file.path + "." + ext;
			const filenameRenamed = file.filename + "." + ext;
			console.log("[api] renaming with ext. ${ext}");
			fs.rename(file.path, rename, (err) => {
				if (err) {
					console.log("[api] renaming uploaded file error, ", err);
				}
				else {
					console.log("[api] renamed: " + rename);
				}
			});

			const image = new model.ImageModel({
				path: path.join(config.baseurl, config.path_public, "img",
				filenameRenamed),
			});
			await image.save();
			imageIds.push(image._id.toHexString());
		}
		return imageIds;
	}
	catch (err) {
		console.log("[api] renaming uploaded file error, \n", err);
		return err;
	}

}
