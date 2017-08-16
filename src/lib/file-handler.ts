import * as fs from "fs";
import * as multer from "multer";
import * as path from "path";

import { config } from "../config";
import * as model from "../db/model";

export const upload = multer({
	dest: path.join(__dirname, config.path_public, "img"),
});

/**
 * It handles only single file
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
			path: path.join("/", "img",
			filenameRenamed),
		});
		await image.save();
		return image._id;
	}
	catch (err) {
		console.log("[api] renaming uploaded file error, \n", err);
		return err;
	}

}
