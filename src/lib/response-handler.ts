
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
	res.type("application/json")
	.status(code)
	.send(JSON.stringify(body));
}

export function response(res: express.Response, apiRes: ApiResponse|undefined) {
	console.log("[api] api response: \n", apiRes);
	if (apiRes) {
		res.type("application/json")
		.status(apiRes.getCode())
		.send(apiRes.toString());
	}
	else {
		res
		.status(200)
		.send("Nothing responded");
	}
}

export interface IResponseObject {
	name: string;
	obj: any;
}

export class ApiResponse {
	public static readonly RESULT_OK = "ok";
	public static readonly RESULT_FAIL = "fail";
	public static readonly RESULT_ERROR = "error";

	public static readonly CODE_OK = 200;
	public static readonly CODE_CREATED = 201;
	public static readonly CODE_NOT_FOUND = 404;
	public static readonly CODE_INVALID_PARAMETERS = 405;
	public static readonly CODE_SERVER_FAULT = 500;

	constructor(
		private status: number,
		private result: string,
		private message = "",
		private objResponse?: IResponseObject,
	) {

	}

	/**
	 * getCode
	 * 
	 * @return status code of the api
	 */
	public getCode(): number {
		return this.status;
	}

	/**
	 * toString
	 * 
	 * @return json string of the response
	 */
	public toString(): string{
		const obj: any = {
			result: this.result,
			message: this.message,
		};
		if (this.objResponse) {
			obj[this.objResponse.name] = this.objResponse.obj;
		}
		return JSON.stringify(obj);
	}
}
