import * as express from "express";
import * as bcrypt from "bcrypt-nodejs";
import * as multer from "multer";
import * as path from "path";

import { config } from "./config";

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
