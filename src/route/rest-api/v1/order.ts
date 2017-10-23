/**
 * Order API
 * 
 * Author: Jin-woo Shin
 * Date: 2017-09-23
 */
import * as express from "express";

import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";
import * as validator from "../../../lib/validator";

/**
 * Create Order
 * 
 * Path: /register
 * Method: POST
 * 
 * Request
 * @body date_to_receive Date optional date of consumer hopes to receive order, default is after a week from ordered
 * @body orderer string required "_id" field of user who ordered
 * @body phone_number string optional phone number, defulat is the user's phone number
 * @body additional string optional additional message for order, default is empty string ""
 * 
 * Response
 * @body result string required result of string
 * @body emssage string optional message about result
 * @body order OrderModel optional created order if succeed
 */
export async function createOrder(req: express.Request) {
	const dateToReceive = req.body["date_to_receive"];
	const idOrderer = req.body["orderer"];
	// const products = req.body["products"];
	const phoneNumber = req.body["phone_number"];
	const additional = req.body["additional"];

	try {
		const userOrdered = await model.UserModel.findById(idOrderer, {
			bucket: true,
			phone_number: true,
		})
		.populate("bucket.product")
		.exec();

		if (!userOrdered) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(user)");
		}
	
		const bucket: any[] = (userOrdered as any)["bucket"];
		let sumPrice = 0;
		for (const item of bucket) {
			sumPrice += item["product"]["price"] * item["quantity"];
		}
		
		const newOrder = new model.OrderModel({
			date_ordered: Date.now(),
			date_to_receive: new Date(dateToReceive),
			orderer: idOrderer,
			// products,
			bucket,
			phone_number: phoneNumber ? 
			phoneNumber : 
			(userOrdered as any)["phone_number"],
			state: "pending",
			additional,
			price_total: sumPrice,
		});

		await newOrder.save();

		(userOrdered as any)["bucket"] = [];

		await userOrdered.save();

		const aNewOrder = newOrder as any;

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_CREATED,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "order",
				obj: {
					_id: aNewOrder["_id"],
					date_ordered: aNewOrder["date_ordered"],
					date_to_receive: aNewOrder["date_to_receive"],
					orderer: aNewOrder["orderer"],
					products: bucket,
					phone_number: aNewOrder["phone_number"],
					state: aNewOrder["state"],
					additional: aNewOrder["additional"],
					price_total: aNewOrder["price_total"],
				},
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while creating new order\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Retrieving order API
 * 
 * Path: /{orderId}
 * Method: GET
 * 
 * Request
 * @param orderId string required "_id" field of order
 * @query q string required comma separated string of fields' name to retrieve
 * ["date_ordered", "date_to_receive", "date_received", "orderer", "products", "phone_number", "state", "additional", "price_total"]
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body order OrderModel optional retrieved order if request succeed
 */
export async function retrieveOrder(req: express.Request, idOrder: string) {
	const q = req.query["q"];

	if (!q) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameter");
	}

	const queries = (q as string).split(",");

	const objProjection: any = {
		_id: true,
		date_ordered: queries.indexOf("date_ordered") > -1,
		date_to_receive: queries.indexOf("date_to_receive") > -1,
		date_received : queries.indexOf("date_received") > -1,
		orderer: queries.indexOf("orderer") > -1,
		products: queries.indexOf("products") > -1,
		phone_number: queries.indexOf("phone_number") > -1,
		state: queries.indexOf("state") > -1,
		additional: queries.indexOf("additional") > -1,
		price_total: queries.indexOf("price_total") > -1,
	};

	for (const i in objProjection) {
		if (!objProjection[i]) {
			delete objProjection[i];
		}
	}

	try {
		let dbQuery = model.OrderModel.findById(idOrder, objProjection);
		
		if (objProjection["orderer"]) {
			dbQuery = dbQuery.populate("orderer", "_id username phone_number");
		}
		if (objProjection["products"]) {
			dbQuery = dbQuery.populate("products.products");
		}

		const orderFound = await dbQuery.exec();

		if (!orderFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(order)");
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "order",
				obj: orderFound,
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving order\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Retrieving order by user API
 * 
 * Path: /{userId}/orders
 * Method: GET
 * 
 * Request
 * @param userId string required "_id" field of user
 * @query q string required comma separated string of fields' name to retrieve
 * ["date_ordered", "date_to_receive", "date_received", "orderer", "products", "phone_number", "state", "additional", "price_total"]
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body orders OrderModel optional retrieved order if request succeed
 */
export async function retrieveOrderByUser(req: express.Request, idUser: string) {
	const q = req.query["q"];

	if (!q) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameter");
	}

	const queries = (q as string).split(",");

	const objProjection: any = {
		_id: true,
		date_ordered: queries.indexOf("date_ordered") > -1,
		date_to_receive: queries.indexOf("date_to_receive") > -1,
		date_received : queries.indexOf("date_received") > -1,
		orderer: queries.indexOf("orderer") > -1,
		products: queries.indexOf("products") > -1,
		phone_number: queries.indexOf("phone_number") > -1,
		state: queries.indexOf("state") > -1,
		additional: queries.indexOf("additional") > -1,
		price_total: queries.indexOf("price_total") > -1,
	};

	for (const i in objProjection) {
		if (!objProjection[i]) {
			delete objProjection[i];
		}
	}

	try {
		let dbQuery = model.OrderModel.find({
			orderer: idUser,
		}, objProjection);
		
		if (objProjection["orderer"]) {
			dbQuery = dbQuery.populate("orderer");
		}
		if (objProjection["products"]) {
			dbQuery = dbQuery.populate("products.products");
		}

		const orderFound = await dbQuery.exec();

		if (!orderFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(order)");
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "orders",
				obj: orderFound,
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving order\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Update Order API
 * 
 * Path: /{orderId}/update
 * Method: PUT
 * 
 * Request
 * @param orderId
 * 
 * @body state string required state to be updated
 * 
 * Response
 * @code 200 ok
 * @code 404 not found
 * @code 405 invalid paramters
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function updateOrder(req: express.Request, idOrder: string) {
	const state = req.body["state"];

	try {
		const orderFound = await model.OrderModel.findById(idOrder).exec();

		if (!orderFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(order)");
		}

		if (!validator.isValidStateChanging((orderFound as any)["state"],
		state)) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid state changing");
		}

		(orderFound as any)["state"] = state;

		await orderFound.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while updating order\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Delete order API
 * 
 * Path: /{orderId}/delete
 * Method: DELETE
 * 
 * Request
 * @param orderId string required "_id" field of order
 * 
 * Response
 * @code 200 ok
 * @code 404 not found
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function deleteOrder(req: express.Request, idOrder: string) {
	
	try {
		const orderFound = await model.OrderModel.findById(idOrder).exec();

		if (!orderFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(order)");
		}

		await orderFound.remove();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while deleting order\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
