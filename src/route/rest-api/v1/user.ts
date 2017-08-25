import * as bcrypt from "bcrypt-nodejs";
import * as express from "express";
import * as mongoose from "mongoose";

import * as model from "../../../db/model";
import * as auth from "../../../lib/auth";
import * as resHandler from "../../../lib/response-handler";

export const router = express.Router();

// use native promise
(mongoose as any).Promise = global.Promise;

/**
 * User creation API
 * 
 * Path: /register
 * Method: POST
 * 
 * Request
 * @body email string required, email
 * @body password string required, raw string of password
 * @body username string required, username
 * @body login_type string required, login type ["native", "google"]
 * @body access_token string optional access token if use other platforms
 * @body phone_number string required, phone number without hyphens
 * @body age number required, ages of user
 * @body device_id string required, device id for push message
 * 
 * Response
 * @code 201 request succeed
 * @code 405 invalid parameters
 * @code 409 email or username duplicates
 * @code 500 internal server error
 * 
 * @body result string required result of request ["ok", "fail", "error"]
 * @body message string optional reason of failure if error
 * @body user User optional registered user information if request succeed, or undefined
 */
export async function createUser(req: express.Request) {
	const email = (req as any).body["email"];
	const password = (req as any).body["password"];
	const username = (req as any).body["username"];
	const loginType = (req as any).body["login_type"];
	const accessToken = (req as any).body["access_token"];
	const phoneNumber = (req as any).body["phone_number"];
	const age = (req as any).body["age"];
	const deviceId = (req as any).body["device_id"];

	console.log("[api] register user", (req as any).body);

	// check if all values has been input
	if (typeof email === "string" &&
		typeof password === "string" &&
		typeof username === "string" &&
		typeof loginType === "string" &&
		typeof phoneNumber === "string" &&
		typeof age === "number" &&
		typeof deviceId === "string") {
		
		const regexNumber = new RegExp("[0-9]+$");
		if (!regexNumber.test(phoneNumber)){
			// if phone number has non-number character
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameters");
		}

		const duplRes = await model.UserModel.findOne({
			$or: [
				{email},
				{username},
			],
		}).exec();
		
		console.log("duplRes: ", duplRes);
		
		if (duplRes) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_CONFLICT,
				resHandler.ApiResponse.RESULT_FAIL,
				"email or username duplicates");
		}

		const nativeLogin = loginType === "native";

		// encrypt password
		const authInfo = nativeLogin ? await auth.encryption(password) :
		["", ""];

		const newUser = new model.UserModel({
		email,
		password: nativeLogin ? authInfo[0] : "",
		salt: nativeLogin ? authInfo[1] : "",
		username,
		login_type: loginType,
		access_token: nativeLogin ? "" : accessToken,
		phone_number: phoneNumber,
		age,
		device_id: deviceId,
		});
		
		try{
			const execUser = await newUser.save();
			console.log("[mongodb] new User saved");

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_CREATED,
				resHandler.ApiResponse.RESULT_OK,
				"",
				{
					name: "user",
					obj: {
						_id: (execUser as any)["_id"],
						email: (execUser as any)["eamil"],
						username: (execUser as any)["username"],
						login_type: (execUser as any)["login_type"],
						phone_number: (execUser as any)["phone_number"],
					},
				});
		}
		catch (err){
			console.log("[mongodb] user saving error", err);
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_SERVER_FAULT,
				resHandler.ApiResponse.RESULT_ERROR,
				"server fault");
		}
	}
	else {
		console.log("[api] invalid parameters", `
		tyypeof email: ${typeof email},\n
		typeof password: ${typeof password},\n
		typeof username: ${typeof username},\n
		typeof login_type: ${typeof loginType},\n
		typeof phone_number: ${typeof phoneNumber},\n
		typeof age: ${typeof age}}
		typeof device_id: ${typeof deviceId}`);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameters");
	}
}

/**
 * User login API
 * 
 * If user sign up with google, use this API
 * 
 * Path: /login
 * Method: POST
 * 
 * Request
 * @body email string required user email
 * @body password string required raw string of user password
 * @body access_token string optional access token if use other platform
 * @body login_type string required login type of user ["native", "google"]
 * 
 * Response
 * @code 200 ok, but not created
 * @code 201 created
 * @code 405 invalid parameters
 * @code 404 email or password incorrect
 * @code 500 server fault
 * 
 * @body result string required result of request ["ok", "fail", "error"]
 * @body message string optional message about result
 * @body user User optional user information if login succeed
 */
export async function loginUser(req: express.Request) {
	const email			= (req as any).body["email"];
	const rawPassword	= (req as any).body["password"];
	const accessToken	= (req as any).body["access_token"];
	const loginType		= (req as any).body["login_type"];
	const nativeLogin	= loginType === "native";

	if (typeof email === "string" &&
		typeof rawPassword === "string" &&
		typeof loginType === "string") {
		try {
			const user = await model.UserModel.findOne({email}).exec();

			if (!user && loginType === "google") {
				// use login with google but account for service not exists
				// respond to user sign up
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"redirect to sign up");
			}
			else if (!user) {
				console.log("user not found, email: " + email);

				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_NOT_FOUND,
					resHandler.ApiResponse.RESULT_FAIL,
					"email or password incorrect");
			}

			if ((nativeLogin && bcrypt.compareSync(rawPassword, (user as any)["password"])) ||
			(user as any)["login_type"] === loginType && (user as any)["access_token"] === accessToken) {
				// login success
				const auser = user as any;
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_CREATED,
					resHandler.ApiResponse.RESULT_OK,
					"",
					{
						name: "user",
						obj: {
							_id: auser["_id"],
							email: auser["email"],
							username: auser["username"],
							login_type: auser["login_type"],
							accept_push: auser["accept_push"],
							bucket: auser["bucket"],
							tastes: auser["tastes"],
						},
					});
			}
			else {
				// login fail (password incorrect)
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_NOT_FOUND,
					resHandler.ApiResponse.RESULT_FAIL,
					"email or password incorrect");
			}
		}
		catch (err) {
			console.log("[api] user login error", err);

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_SERVER_FAULT,
				resHandler.ApiResponse.RESULT_ERROR,
				"server fault");
		}
	}
	else {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_ERROR,
			"invalid parameters");
	}
}

/**
 * User retrieval API
 * 
 * Path: /{userId}
 * Method: GET
 * 
 * Request
 * @param id string required "_id" field of user
 * @query q string optional keys to query separte by comma "email", "username" is default
 * ["login_type", "phone_number", "date_reg", "age",
 * "accept_push", "accept_privacy", "bucket", "tastes", "likes", "comments", 
 * "coupons", "cnt_reviewable", "cnt_stamp"]
 * 
 * Response
 * @code 200 request succeed
 * @code 404 user not found
 * @code 500 internal server error
 * 
 * @body result string required result of request ["ok", "fail", "error"]
 * @body message string optional message about result if fail or error
 * @body user User optional information of retrived user if succeed
 * 
 */
export async function retrieveUser(req: express.Request, userId: string) {
	const id	= userId; // (req as any).params["id"];
	// console.log("[api] retrieve user, _id: " + id);
	const q		= (req as any).query["q"];

	const queries: string[] = q ? q.split(",") : [];
	
	let query = model.UserModel.findById(id);
	
	// if query exists, handle it
	if (queries.length !== 0){
		query = queries.indexOf("likes") > -1 ? query : query.populate("likes", "name rate_avg cnt_like");
		query = queries.indexOf("comments") > -1 ? query : query.populate("comments", "content rate")
		.populate("comments product", "name")
		.populate("comments tastes", "text");
		query = queries.indexOf("coupons") > -1 ? query : query.populate("coupons");
		query = queries.indexOf("bucket") > -1 ? query : query.populate("bucket");
		query = queries.indexOf("tastes") > -1 ? query : query.populate("tastes");
	}

	try{
		const result = await query.exec();
		if (result) {
			// if user found
			console.log("[mongodb] user retrieved, _id: " + id);
			const user = result as any;

			// default result
			const queryResult: any = {
				_id: user["_id"],
				email: user["email"],
				username: user["username"],
			};

			// optional results
			if (queries.indexOf("login_type") > -1) {
				queryResult["login_type"] = user["login_type"];
			}
			if (queries.indexOf("phone_number") > -1) {
				queryResult["phone_number"] = user["phone_number"];
			}
			if (queries.indexOf("date_reg") > -1 ) {
				queryResult["date_reg"] = user["date_reg"];
			}
			if (queries.indexOf("age") > -1) {
				queryResult["age"] = user["age"];
			}
			if (queries.indexOf("accept_push") > -1) {
				queryResult["accept_push"] = user["accept_push"];
			}
			if (queries.indexOf("accept_privacy") > -1) {
				queryResult["accept_privacy"] = user["accept_privacy"];
			}
			if (queries.indexOf("cnt_reviewable") > - 1) {
				queryResult["cnt_reviewable"] = user["cnt_reviewable"];
			}
			if (queries.indexOf("cnt_stamp") > - 1) {
				queryResult["cnt_stamp"] = user["cnt_stamp"];
			}

			// populated things
			if (queries.indexOf("likes") > -1) {
				queryResult["likes"] = user["likes"];
			}
			if (queries.indexOf("comments") > -1) {
				queryResult["comments"] = user["comments"];
			}
			if (queries.indexOf("coupons") > -1) {
				queryResult["coupons"] = user["couponse"];
			}
			if (queries.indexOf("bucket") > -1) {
				queryResult["bucket"] = user["bucket"];
			}
			if (queries.indexOf("tastes") > -1) {
				queryResult["tastes"] = user["tastes"];
			}

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK,
				"",
				{
					name: "user",
					obj: queryResult,
				});
		}
		else{
			// if not found
			console.log("[mongodb] user not found, _id: " + id);

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}
	}
	catch (err){
		console.log("[mongodb] user retrival error", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * User information update API
 * 
 * Path: /{userId}/update
 * Method: PUT
 * 
 * Request
 * @param id string "_id" filed of user
 * 
 * @body email string optional email to update
 * @body username string optional username to update
 * @body device_id string optional device id to update
 * @body cnt_stamp number optional count of stamp
 * 
 * Response
 * @code 200 updated successfully
 * @code 404 user not found
 * @code 409 username duplicated
 * @code 500 internal server error
 * 
 * @body result string required result of request ["ok", "fail", "error"]
 * @body message string optional message about result if fail or error
 */
export async function updateUser(req: express.Request, userId: string) {
	const id			= userId; // (req as any).params["id"];
	const dirtyEmail	= (req as any).body["email"];
	const username		= (req as any).body["username"];
	const deviceId		= (req as any).body["device_id"];
	const cntStamp		= (req as any).body["cnt_stamp"];
	const acceptPush	= (req as any).body["accept_push"];

	const email = dirtyEmail ? (dirtyEmail as string).toLowerCase() : undefined;
	
	try{
		// check if user exists
		const userExist = await model.UserModel.findById(id).exec();
		if (!userExist) {
			// if user not found
			console.log("[mongodb] user not found, _id: " + id);

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"user not found");
		}

		// check if email duplicates
		if (email) {
			if (await model.UserModel.findOne({email}).exec()) {
				// email duplicates
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_CONFLICT,
					resHandler.ApiResponse.RESULT_FAIL,
					"email duplicates");
			}
		}

		// check if username duplicates
		if (username) {
			if (await model.UserModel.findOne({username}).exec()) {
				// username duplicates
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_CONFLICT,
					resHandler.ApiResponse.RESULT_FAIL,
					"username duplicates");
			}
		}

		const update: any = {};
		if (email) { update["email"] = email; }
		if (username) { update["username"] = username; }
		if (deviceId) { update["deviceid"] = deviceId; }
		if (cntStamp) { update["cnt_stamp"] = cntStamp; }
		if (acceptPush) {
			update["accept_push"]["accepted"] = acceptPush["accepted"]; 
			if (acceptPush["accepted"]) {
				update["accept_push"]["date_accepted"] = Date.now();
			}
		}

		const result = await userExist.update(update).exec();

		// console.log("[mongodb] update result", result);

		// console.log("[mongodb] username updated, username: " + username);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] retrieve user by username error", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}

}

/**
 * Duplication check API
 * 
 * Path: /is/duplicates
 * Method: GET
 * 
 * Request
 * @query where string required field check duplication ["email", "username"]
 * @query value string required value to check duplication
 * 
 * Response
 * @code 200 ok
 * @code 405 invalid parameters
 * @body result string required result of request ["ok", "fail", "error"]
 * @body message string required result of check if request succeed ["duplicates", "not duplicates"], 
 * or message about result if not
 */
export async function duplicateCheck(req: express.Request) {
	const where = (req as any).query["where"];
	const value = (req as any).query["value"];

	if (typeof where === "string" &&
		typeof value === "string") {
			try {

				if (where === "email") {
					// check email duplication
					const result = await model.UserModel.findOne({email: value}).exec();
					if (!result) {
						// if not duplicates
						return new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_OK,
							resHandler.ApiResponse.RESULT_OK,
							"not duplicates");
					}
					else {
						return new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_OK,
							resHandler.ApiResponse.RESULT_OK,
							"duplicates");
					}
				}
				else if (where === "username") {
					// check username duplication
					const result = await model.UserModel.findOne({username: value}).exec();
					if (!result) {
						// if not duplicates
						return new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_OK,
							resHandler.ApiResponse.RESULT_OK,
							"not duplicates");
					}
					else {
						return new resHandler.ApiResponse(
							resHandler.ApiResponse.CODE_OK,
							resHandler.ApiResponse.RESULT_OK,
							"duplicates");
					}
				}
				else {
					return new resHandler.ApiResponse(
						resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
						resHandler.ApiResponse.RESULT_FAIL,
						"invalid parameter");
				}
			}
			catch (err) {
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_SERVER_FAULT,
					resHandler.ApiResponse.RESULT_ERROR,
					"server fault");
			}
	}
	else {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameters");
	}
}

/**
 * User delete API
 * 
 * Path: /{userId}/delete
 * Method: DELETE
 * 
 * Request
 * @param userId string required "_id" field of user
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function deleteUser(req: express.Request, userId: string) {
	
	try {
		const result = await model.UserModel.findById(userId).exec();

		if (!result) {
			console.log("[api] user not found, _id: " + userId);
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"user not found");
		}

		await result.remove();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[api] user deletion error,\n", err);
		
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
