import * as bcrypt from "bcrypt-nodejs";
import * as express from "express";
import * as mongoose from "mongoose";

import * as model from "../../../db/model";
import * as util from "../../../util";

export const router = express.Router();

// use native promise
(mongoose as any).Promise = global.Promise;

router
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
.post("/register", async (req: express.Request, res: express.Response) => {
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
			return util.responseWithJson(res, 405, {
				result: "fail",
				message: "phone number must have only numbers",
			});
		}

		const duplRes = await model.UserModel.findOne({
			$or: [
				{email},
				{username},
			],
		}).exec();
		
		console.log("duplRes: ", duplRes);
		
		if (duplRes) {
			return util.responseWithJson(res, 409, {
				result: "fail",
				message: "email or username duplicates",
			});
		}

		const nativeLogin = loginType === "native";

		// encrypt password
		const auth = nativeLogin ? await util.encryption(password) :
		["", ""];

		const newUser = new model.UserModel({
		email,
		password: nativeLogin ? auth[0] : "",
		salt: nativeLogin ? auth[1] : "",
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
			return util.responseWithJson(res, 201, {
				result: "ok",
				user: {
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
			return util.responseWithJson(res, 500, {
				result: "error",
				message: "server fault",
			});
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
		return util.responseWithJson(res, 405, {
			result: "fail",
			error: "invalid parameters",
		});
	}
})

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
.post("/login", async (req: express.Request, res: express.Response) => {
	const email = (req as any).body["email"];
	const rawPassword = (req as any).body["password"];
	const accessToken = (req as any).body["access_token"];
	const loginType = (req as any).body["login_type"];
	const nativeLogin = loginType === "native";

	if (typeof email === "string" &&
		typeof rawPassword === "string" &&
		typeof loginType === "string") {
		try {
			const user = await model.UserModel.findOne({email}).exec();

			if (!user && loginType === "google") {
				// use login with google but account for service not exists
				// respond to user sign up
				return util.responseWithJson(res, 200, {
					result: "ok",
					message: "redirect to sign up",
				});
			}
			else if (!user) {
				console.log("user not found, email: " + email);

				return util.responseWithJson(res, 404, {
					result: "fail",
					message: "email or password incorrect",
				});
			}

			if ((nativeLogin && bcrypt.compareSync(rawPassword, (user as any)["password"])) ||
			(user as any)["login_type"] === loginType && (user as any)["access_token"] === accessToken) {
				// login success
				const auser = user as any;
				return util.responseWithJson(res, 201, {
					result: "ok",
					user: {
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
				return util.responseWithJson(res, 404, {
					result: "fail",
					message: "email or password incorrect",
				});
			}
		}
		catch (err) {
			console.log("[api] user login error", err);
			return util.responseWithJson(res, 500, {
				result: "error",
				message: "server fault",
			});
		}
	}
	else {
		return util.responseWithJson(res, 405, {
			result: "error",
			message: "invalid parameters",
		});
	}
})

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
.get("/:id", async (req: express.Request, res: express.Response) => {
	const id = (req as any).params["id"];
	// console.log("[api] retrieve user, _id: " + id);
	const q = (req as any).query["q"];

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
				_id: user["user"],
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

			return util.responseWithJson(res, 200, {
				result: "ok",
				user: queryResult,
			});
		}
		else{
			// if not found
			console.log("[mongodb] user nt found, _id: " + id);
			return util.responseWithJson(res, 404, {
				result: "fail",
				message: "not found",
			});
		}
	}
	catch (err){
		console.log("[mongodb] user retrival error", err);
		return util.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
})

/**
 * User information update API
 * 
 * Path: /{userId}/update
 * Method: PUT
 * 
 * Request
 * @param id string "_id" filed of user
 * 
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
.put("/:id/update", async (req: express.Request, res: express.Response) => {
	const id = (req as any).params["id"];
	const username = (req as any).body["username"];
	const deviceId = (req as any).body["device_id"];
	const cntStamp = (req as any).body["cnt_stamp"];
	const acceptPush = (req as any).body["accept_push"];
	
	try{
		// check if user exists
		const userExist = await model.UserModel.findById(id).exec();
		if (!userExist) {
			// if user not found
			console.log("[mongodb] user not found, _id: " + id);
			return util.responseWithJson(res, 404, {
				result: "fail",
				message: "user not found",
			});
		}

		// check if username duplicated
		if (username) {
			if (await model.UserModel.findOne({username}).exec()) {
				// username duplicates
				return util.responseWithJson(res, 409, {
					result: "fail",
					message: "username duplicates",
				});
			}
		}

		const update: any = {};
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

		console.log("[mongodb] update result", result);

		console.log("[mongodb] username updated, username: " + username);
		return util.responseWithJson(res, 200, {
			result: "ok",
		});
	}
	catch (err) {
		console.log("[mongodb] retrieve user by username error", err);
		return util.responseWithJson(res, 500, {
			result: "error",
			error: "server fault",
		});
	}

})

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
.get("/is/duplicates", async (req: express.Request, res: express.Response) => {
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
						return util.responseWithJson(res, 200, {
							result: "ok",
							message: "not duplicates",
						});
					}
					else {
						return util.responseWithJson(res, 200, {
							result: "ok",
							message: "duplicates",
						});
					}
				}
				else if (where === "username") {
					// check username duplication
					const result = await model.UserModel.findOne({username: value}).exec();
					if (!result) {
						// if not duplicates
						return util.responseWithJson(res, 200, {
							result: "ok",
							message: "not duplicates",
						});
					}
					else {
						return util.responseWithJson(res, 200, {
							result: "ok",
							message: "duplicates",
						});
					}
				}
				else {
					return util.responseWithJson(res, 405, {
						result: "fail",
						message: "invalid parameter",
					});
				}
			}
			catch (err) {
				return util.responseWithJson(res, 500, {
					result: "error",
					message: "server fault",
				});
			}
	}
	else {
		return util.responseWithJson(res, 405, {
			result: "fail",
			message: "invalid parameter",
		});
	}
});
