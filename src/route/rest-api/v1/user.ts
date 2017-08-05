import * as express from "express";
import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt-nodejs";

import * as util from "../../../util";
import * as model from "../../../db/model";

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
 * @body phone_number string required, phone number without hyphens
 * @body age number required, ages of user
 * 
 * Response
 * @code 200 request succeed
 * @code 400 bad request
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
	const phoneNumber = (req as any).body["phone_number"];
	const age = (req as any).body["age"];

	console.log("[api] register user", (req as any).body);

	// check if all values has been input
	if (typeof email === "string" &&
		typeof password === "string" &&
		typeof username === "string" &&
		typeof loginType === "string" &&
		typeof phoneNumber === "string" &&
		typeof age === "number") {
		
		const regexNumber = new RegExp("[0-9]");
		if (!regexNumber.test(phoneNumber)){
			// if phone number has non-number character
			return util.responseWithJson(res, 400, {
				result: "fail",
				message: "phone number must have only numbers",
			});
		}

		// TODO: check if user email duplicates
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
				message: "email duplicates",
			});
		}

		// encrypt password
		const auth = await util.encryption(password);

		const newUser = new model.UserModel({
		email,
		password: auth[0],
		salt: auth[1],
		username,
		login_type: loginType,
		phone_number: phoneNumber,
		age,
		});
		
		try{
			const execUser = await newUser.save();
			console.log("[mongodb] new User saved");
			return util.responseWithJson(res, 200, {
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
		console.log("[api] unfulfilled parameters", `
		tyypeof email: ${typeof email},\n
		typeof password: ${typeof password},\n
		typeof username: ${typeof username},\n
		typeof login_type: ${typeof loginType},\n
		typeof phone_number: ${typeof phoneNumber},\n
		typeof age: ${typeof age}}`);
		return util.responseWithJson(res, 403, {
			result: "fail",
			error: "unfulfilled parameters",
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
 * @body login_type string required login type of user ["native", "google"]
 * 
 * Response
 * @code 200 ok, but not created
 * @code 201 created
 * @code 400 unfulfilled parameters
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
	const loginType = (req as any).body["login_type"];

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

			if (bcrypt.compareSync(rawPassword, (user as any)["password"])) {
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
		return util.responseWithJson(res, 400, {
			result: "error",
			message: "unfulfilled parameters",
		});
	}
})
/**
 * User retrieval API
 * 
 * Path: /:id
 * Method: GET
 * 
 * Request
 * @param id string "_id" field of user
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
	const query = model.UserModel.findById(id)
	.populate("likes")
	.populate("comments")
	.populate("coupons");

	try{
		const result = await query.exec();
		if (result) {
			// if user found
			console.log("[mongodb] user retrieved, _id: " + id);
			const user = result as any;
			return util.responseWithJson(res, 200, {
				result: "ok",
				user: {
					_id: user["_id"],
					email: user["eamil"],
					username: user["username"],
					login_type: user["login_type"],
					phone_number: user["phone_number"],
					accept_push: user["accept_push"],
					cnt_reviewable: user["cnt_reviewable"],
					cnt_stamp: user["cnt_stamp"],
				},
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
 * Username update API
 * 
 * Path: /:id/username
 * Method: PUT
 * 
 * Request
 * @param id string "_id" filed of user
 * 
 * @body updateTo string required username to update
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
.put("/:id/username", async (req: express.Request, res: express.Response) => {
	const username = (req as any).body["updateTo"];
	const id = (req as any).params["id"];
	
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
		if (await model.UserModel.findOne({username}).exec()) {
			// username duplicates
			return util.responseWithJson(res, 409, {
				result: "fail",
				message: "username duplicates",
			});
		}

		const result = await userExist.update({username}).exec();

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
 * Retrieve bucket by user API
 * 
 * Path: /:id/bucket
 * Method: GET
 * 
 * Request
 * @param id string "_id" field of user
 * 
 * Response
 * @code 200 ok
 * @code 404 user not found
 * @code 500 internal server error
 * 
 * @body result string required result of request ["ok", "fail", "error"]
 * @body message string optional message about result if fail or error
 * @body bucket Array<Product> optional bucket of user if succeed
 */
.get("/:id/bucket", async (req: express.Request, res: express.Response) => {
	const id = (req as any).params["id"];

	try{
		const result = await model.UserModel.findById(id).populate("bucket").exec();
		
		// check if user exists
		if (!result) {
			console.log("[mongodb] user not found, _id: " + id);
			return util.responseWithJson(res, 404, {
				result: "fail",
				message: "user not found",
			});
		}

		console.log("[mongodb] retrieved bucket by user, _id: " + id);
		return util.responseWithJson(res, 200, {
			result: "ok",
			bucket: (result as any)["bucket"],
		});
	}
	catch (err) {
		console.log("[mongodb] retrieve bucket by user error", err);
		return util.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
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
			}
			catch (err) {
				return util.responseWithJson(res, 500, {
					result: "error",
					message: "server fault",
				});
			}
	}
	else {
		return util.responseWithJson(res, 400, {
			result: "fail",
			message: "unfulfilled parameter",
		});
	}
})
/**
 * User stamp modification API
 * 
 * This API just only modifies stamp count, handling of this can be occurred in other place(FE, other API, etc.)
 * 
 * Path: /:id/stamp
 * Method: PUT
 * 
 * Request
 * @param id string required "_id" field of user
 * 
 * @body updateTo number required stamp count to be updated
 * 
 * Response
 * @code 200 ok
 * @code 400 unfulfilled parameter
 * @code 404 user not found
 * @code 500 server fault
 * 
 * @body result string required result of request ["ok", "fail", "error"]
 * @body message string optional message about result
 */
.put("/:id/stamp", async (req: express.Request, res: express.Response) => {
	const id = (req as any).params["id"];
	const updateTo = (req as any).body["updateTo"];

	// check parameter type
	if (typeof updateTo !== "number") {
		return util.responseWithJson(res, 400, {
			result: "fail",
			message: "unfulfilled parameter",
		});
	}

	try{
		const user = await model.UserModel.findById(id).exec();
		if (!user) {
			// user not found
			return util.responseWithJson(res, 404, {
				result: "fail",
				message: "user not found",
			});
		}

		(user as any)["cnt_stamp"] = updateTo;
		const result = await user.save();
		console.log("[mongodb] user stamp count modified, _id: ", id);
		return util.responseWithJson(res, 200, {
			result: "ok",
		});
	}
	catch (err) {
		console.log("[mongodb] modifying user stamp count error", err);
		return util.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
});
