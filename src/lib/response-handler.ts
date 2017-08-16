
import * as express from "express";
import * as fs from "fs";

import * as path from "path";

import * as model from "../db/model";

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
