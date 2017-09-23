import * as express from "express";

import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Product addtion into bucket API
 * 
 * Path: /{userId}/add-bucket
 * Method: POST
 *
 * Request
 * @param string required "_id" field of user
 * @body product string required "_id" field of product
 * @body qunatity number optional quantity of product to add into bucket, default is 1
 * 
 * Response
 * @code 200 ok
 * @code 404 not found
 * @code 405 invalid parameters
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function addBucketItem(req: express.Request, idUser: string) { 
	const idProduct	= (req.body as any)["product"];
	const qty		= (req.body as any)["quantity"] ? (req.body as any)["quantity"] : 1;

	if (typeof qty !== "number" ||
		qty			<= 0) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid paramters");
	}

	try {
		const userFound = await model.UserModel.findById(idUser, {
			bucket: true,
		})
		.exec();

		if (!userFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(user)");
		}

		const prodFound = await model.ProductModel.findById(idProduct).exec();

		if (!prodFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(product)");
		}

		((userFound as any)["bucket"] as any[]).push({
			product: idProduct,
			quantity: qty,
		});

		await userFound.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while add product bucket\r", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Bucket item update API
 * 
 * Path: /{userId}/update-bucket
 * Method: PUT
 * 
 * Request
 * @param userId string required "_id" field of user
 * 
 * @body product string required "_id" field of product to update
 * @body quantity number 
 * 
 * Response
 * @code 200 ok
 * @code 404 not found
 * @code 405 invalid parameters
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function updateBucketItem(req: express.Request, idUser: string) {
	const idProduct	= (req.body as any)["product"];
	const qty		= (req.body as any["quantity"]);
	let updated		= false;

	try {
		const userFound = await model.UserModel.findById(idUser, {
			bucket: true,
		})
		.exec();

		if (!userFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(user)");
		}

		// find product in bucket and change the qunatity
		if (Array.isArray((userFound as any)["bucket"])) {
			for (const p in (userFound as any)["bucket"]) {
				if ((userFound as any)["bucket"][p]["product"] === idProduct &&
					(userFound as any)["bucket"][p]["quantity"] !== qty) {
						(userFound as any)["bucket"][p]["quantity"] = qty;
						updated = true;
				}
			}

			if (updated) {
				await userFound.save();
				
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK);
			}
			else {
				// not updated
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"not updated: bucket has no matched product");
			}
		}
		else {
			console.log("[api] user's bucket is not an array");
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_SERVER_FAULT,
				resHandler.ApiResponse.RESULT_ERROR,
				"server fault");
		}
	}
	catch (err) {
		console.log("[mongodb] error occurred while update bucket item\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Bucket item delete API
 * 
 * Path: /{userId}/delete-from-bucket
 * Method: PUT
 * 
 * Request
 * @param userId string required "_id" field of user
 * @body product string required "_id" field of product
 * 
 * Response
 * @code 200 ok
 * @code 404 not found
 * @code 405 invalid parameters
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message message about result
 */
export async function deleteBucketItem(req: express.Request, idUser: string) {
	const idProduct	= (req.body as any)["product"];
	let deleted		= false;

	try {
		const userFound = await model.UserModel.findById(idUser).exec();

		if (!userFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(user)");
		}

		// find product in bucket and change the qunatity
		if (Array.isArray((userFound as any)["bucket"])) {
			for (const p of (userFound as any)["bucket"]) {
				const idx = ((userFound as any)["bucket"] as any[]).indexOf(p);
				if (idx < 0) { continue; }
				console.log(`[api] ${p["product"]} === ${idProduct}: ${p["product"] === idProduct}`);
				if (p["product"].toString() === idProduct) {
					((userFound as any)["bucket"] as any[]).splice(idx, 1);
					deleted = true;
					// console.log("[api] bucket item deleted");
					break;
				}
			}

			if (deleted) {
				await userFound.save();
				
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK);
			}
			else {
				// not deleted
				return new resHandler.ApiResponse(
					resHandler.ApiResponse.CODE_OK,
					resHandler.ApiResponse.RESULT_OK,
					"not deleted: bucket has no matched product");
			}
		}
		else {
			console.log("[api] user's bucket is not an array");
		}
	}
	catch (err) {
		console.log("[mongodb] error occurred while deleting bucket item\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
