import * as express from "express";
import * as mongoose from "mongoose";
import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Coupon creation API
 * 
 * Path: /register
 * Method: POST
 * 
 * Request
 * @body message string required text to be displayed on coupon
 * @body owner string "_id" field of user who to has the coupon
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body coupon Coupon optional created coupon if request succeeded
 */
export async function createCoupon(req: express.Request) {
	const text = (req.body as any)["message"];
	const owner = (req.body as any)["owner"];

	try {

		const userOwner = await model.UserModel.findById(owner).exec();
		
		if (!userOwner) {
			// user not exists
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"user not found");
		}

		// make coupon number
		const baseDate = new Date();
		const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
		const mon = date.getMonth();
		const day = date.getDate();
		
		let cpnNum: string;
		// make valid coupone number and check if number duplicates
		while (true) {
			const num1 = Math.floor(Math.random() * 10000);
			const num2 = Math.floor(Math.random() * 10000);
	
			const candNum = `${date.getFullYear() % 10}${mon % 10}${day < 10 ? "0" : ""}${day}-${num1}-${num2}`;

			const result = await model.CouponModel.find({
				coupon_num: candNum,
				available: true,
			}).exec();

			if ((result as mongoose.Document[]).length === 0) {
				// no duplication
				cpnNum = candNum;
				break;
			}
		}

		const newCpn = new model.CouponModel({
			message: text,
			available: true,
			date_reg: Date.now(),
			date_expiration: date.setMonth(date.getMonth() + 1),
			coupon_num: cpnNum,
			owner,
		});

		await newCpn.save();

		(userOwner as any)["coupons"].push(newCpn._id);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_CREATED,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "coupon",
				obj: {
					_id: newCpn._id,
					coupon_num: cpnNum,
					message: text,
					available: true,
					date_reg: (newCpn as any)["date_reg"],
					date_expiration: (newCpn as any)["date_expiration"],
				},
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while creating coupon\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}

}

/**
 * Retrieve coupon by coupon number
 * 
 * Path: /by-coupon-number
 * Method: GET
 * 
 * Request
 * @query cn string required coupon number
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body coupon Coupon optional coupon retrieved
 */
export async function retrieveCouponByCouponNumber(req: express.Request) {
	const cpnNum = (req.query as any)["cn"];

	try {
		if (!cpnNum) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameter");
		}

		const cpnFound = await model.CouponModel.findOne({
			coupon_num: cpnNum,
		}).exec();

		if (!cpnFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "coupon",
				obj: cpnFound,
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving coupon\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Retrieve coupon by user
 * 
 * Path: /{userId}/coupons
 * Method: GET
 * 
 * Request
 * @param userId "_id" field of user who has coupon
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body coupons Coupon[] optional only avaiable coupons user has
 */
export async function retrieveCouponsByUser(req: express.Request, userId: string) {
	
	try {
		const date = new Date();
		const result = await model.CouponModel.find({
			// date_expiration: {
			// 	$lte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
			// },
			available: true,
			owner: userId,
		}).exec();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "coupons",
				obj: result,
			},
		);
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieve coupons\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Consume coupon API
 * 
 * Path: /consume
 * Method: GET
 * 
 * Request
 * @query cn string required coupon number
 * 
 * Response
 * @body result result of request
 */
export async function consumeCoupon(req: express.Request) {
	const couponNum = (req.query as any)["cn"];
	
	try {
		const cpnFound = await model.CouponModel.findOne({
			coupon_num: couponNum,
		}).exec();

		if (!cpnFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		(cpnFound as any)["available"] = false;

		await cpnFound.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);

	}
	catch (err) {
		console.log("[mongodb] error occurred while update coupon\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Coupon deletion API
 * 
 * Path: /delete
 * Method: DELETE
 * 
 * Request
 * @query cn string required coupon number to delete
 * 
 * Response
 * @body result string required result of request
 * @body message string optinal message about result
 */
export async function deleteCouponByCouponNumber(req: express.Request) {
	const cpnNum = (req.query as any)["cn"];

	try {
		const cpnFound = await model.CouponModel.findOne({
			coupon_num: cpnNum,
		}).exec();

		if (!cpnFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		await cpnFound.remove();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while deleting coupon\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
