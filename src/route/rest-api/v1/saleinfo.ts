/**
 * Sale info API
 * 
 * Author: Jin-woo Shin
 * Date: 2017-10-12
 */
import * as express from "express";
import * as request from "request-promise-native";

import { config } from "../../../config";
import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Create sale info
 * 
 * Path: /register
 * Method: POST
 * 
 * Request
 * @body prods string[] required array of "_id" field of the products on sale on the day
 * 
 * Response
 * @code 201 created
 * @code 409 conflict
 * 
 * @body result string required result of request
 * @body message string optional message about result
 * @body saleInfo SaleInfo optional sale info if succeeded
 */
export async function createSaleInfo(req: express.Request) {
	const prods = req.body["prods"];
	
	const dateToday = new Date();
	// dateToday.setUTCHours(0);
	// dateToday.setUTCMinutes(0);

	try {
		// check if sale info for today is already registered
		const siDupl = await findSaleInfoByDate(dateToday);

		if (siDupl) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_CONFLICT,
				resHandler.ApiResponse.RESULT_FAIL,
				"today's sale info is already registered");
		}

		const newSaleInfo = new model.SaleInfoModel({
			date_sale: dateToday,
			prods_today: prods ? prods : [],
			timesale: {
				started: false,
				ratio: 0,
				prods: [],
			},
		});

		await newSaleInfo.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_CREATED,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "saleInfo",
				obj: {
					_id: newSaleInfo._id,
					date_sale: (newSaleInfo as any)["date_sale"],
					prods_today: (newSaleInfo as any)["prods_today"],
				},
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while creating sale info\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Retrieve sale info
 * 
 * Path: /{saleInfoId}
 * Method: GET
 * 
 * Request
 * @param saleInfoId string required "_id" field of sale info 
 * @query populate string optional Wether populate the prods ["true", "false"]. Default is "false"
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body saleInfo SaleInfo optional Sale info found
 */
export async function retrieveSaleInfo(req: express.Request, saleInfoId: string) {
	const populate = req.query["populate"] === "true";
	try {
		let dbQuery = model.SaleInfoModel.findById(saleInfoId);
		if (populate) {
			dbQuery = dbQuery.populate("prods_today")
			.populate("timesale.prods");
		}
		
		const siFound = await dbQuery.exec();

		if (!siFound) {
			// sale info not found
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(saleInfo)");
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "saleInfo",
				obj: {
					_id: siFound._id,
					date_sale: (siFound as any)["date_sale"],
					prods_today: (siFound as any)["prods_today"],
					timesale: (siFound as any)["timesale"],
				},
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieve sale info\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_FAIL,
			"server fault");
	}
}

/**
 * Retrieve sale info by date
 * 
 * Path: /by-date
 * Method: GET
 * 
 * Request
 * @param saleInfoId string required "_id" field of sale info 
 * @query populate string optional Wether populate the prods ["true", "false"]. Default is "false"
 * @query date string optional Date of sale(default is today)
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body saleInfo SaleInfo optional Sale info found
 */
export async function retrieveSaleInfoByDate(req: express.Request) {
	const populate = req.query["populate"] === "true";
	const strDateSale = req.query["date"];
	try {
		const date = new Date(strDateSale);
		if (date.toString() === "Invalid Date") {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameter(date)");
		}
		
		// in here, The date parameter is surely valid
		const siFound = await findSaleInfoByDate(strDateSale ? date : new Date(), populate);

		if (!siFound) {
			// sale info not found
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(saleInfo)");
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "saleInfo",
				obj: {
					_id: (siFound as any)._id,
					date_sale: (siFound as any)["date_sale"],
					prods_today: (siFound as any)["prods_today"],
					timesale: (siFound as any)["timesale"],
				},
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieve sale info\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_FAIL,
			"server fault");
	}
}

/**
 * Update sale info
 * 
 * Path: /{saleInfoId}/update
 * Method: PUT
 * 
 * Request
 * @body prods_today required string[] prods
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function updateSaleInfo(req: express.Request, saleInfoId: string) {
	const prods = req.body["prods"];

	if (!prods) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameter(prods)");
	}

	try {
		const siFound = await model.SaleInfoModel.findById(saleInfoId).exec();

		if (!siFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(sale info)");
		}

		// update sale info and save
		(siFound as any)["prods_today"] = prods;
		await siFound.save();
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);

	}
	catch (err) {
		console.log("[mongodb] error occurred while updating sale info\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Delete sale info
 * 
 * Path: /{saleInfoId}/delete
 * Method: DELETE
 * 
 * Request
 * @param saleInfoId string required "_id" field of sale info
 * 
 * Response
 * @result string required result of request
 * @message string optional message about result
 */
export async function deleteSaleInfo(req: express.Request, saleInfoId: string) {
	try {
		const siFound = await model.SaleInfoModel.findById(saleInfoId).exec();

		if (!siFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(saleInfo)");
		}

		await siFound.remove();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while deleting sale info\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Begin time sale
 * 
 * Path: /timesale/begin
 * Method: POST
 * 
 * Request
 * @body ratio number ratio of discount
 * @body prods string[] array of "_id" field of product on sale
 * 
 * Response
 * @body result string result of request
 * @body message string message about result
 */
export async function beginTimeSale(req: express.Request) {
	const ratio	= Number(req.body["ratio"]);
	const prods	= req.body["prods"];

	// check if ratio value is invalid
	if (isNaN(ratio)) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameter(ratio)");
	}

	if (!Array.isArray(prods)) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameter(prods)");
	}

	try {

		// find sale info with date today
		const siFound = await findSaleInfoByDate(new Date());

		// check if sale info exists
		if (!siFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		(siFound as any).timesale["started"] = true;
		(siFound as any).timesale["date_started"] = new Date();
		(siFound as any).timesale["ratio"] = ratio;
		(siFound as any).timesale["prods"] = prods;

		await siFound.save();

		const dateSaleEnd = new Date();
		dateSaleEnd.setHours(24);
		dateSaleEnd.setMinutes(0);
		dateSaleEnd.setSeconds(0);
		dateSaleEnd.setMilliseconds(0);

		const timeRemains = dateSaleEnd.getTime() - Date.now();
		console.log("[api] time sale ends in " + new Date(Date.now() + timeRemains));

		setTimeout(async (id: string) => {
			const si = await model.SaleInfoModel.findById(id).exec();
			if (si) {
				(si as any).timesale["started"] = false;
				await si.save();
			}
		}, timeRemains, siFound._id);

		// TODO: send push notification
		if (config.fcm_auth && config.fcm_auth.length !== 0) {
			model.UserModel.find({
				"accept_push.accepted": true,
			}, { device_id: true }).then((users: any[]) => {
				console.log("[api] result: \n", users);
				console.log("[api] send push notification to " + users.length + "users");
	
				const authKey = config.fcm_auth;
	
				// if the number of receivers over 1000, seprate the receivers
				if (users.length > 1000) {
					while (true) {
						const nSpliced = Math.min(1000, users.length);
						const usersSpliced = users.splice(0, nSpliced);
						request({
							uri: "https://fcm.googleapis.com/fcm/send",
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								"Authorization": `key=${authKey}`,
							},
							body: {
								to: usersSpliced,
								data: {
									title: "TIMESALE",
									content: "BEGIN",
								},
								time_to_live: 0,
							},
							json: true,
						}).promise().then();
					}
				}
			});
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[api] error occurred while beginning timesale\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Find sale info by date
 * 
 * @param datePivot Date required it will be used the year, month, day
 * 
 * @returns single sale info found, undefined if not found
 */
async function findSaleInfoByDate(datePivot: Date, populate?: boolean) {
	/**
	 * new Date(
	 * 	year, 
	 * 	month, 
	 * 	date, hour, minute, second, milsec)
	 */
	const dateFrom = new Date(
		datePivot.getUTCFullYear(),
		datePivot.getUTCMonth(),
		datePivot.getUTCDate(), 0, 0, 0, 0);
	const dateTo = new Date(
		datePivot.getUTCFullYear(),
		datePivot.getUTCMonth(),
		datePivot.getUTCDate(), 24, 0, 0, 0);
	
	let dbQuery = model.SaleInfoModel.findOne({
		date_sale: {
			$gt: dateFrom,
			$lt: dateTo,
		},
	});

	if (populate) {
		dbQuery = dbQuery.populate("prods_today").populate("timesale.prods");
	}

	const siFound = await dbQuery.exec();

	return siFound;
}
