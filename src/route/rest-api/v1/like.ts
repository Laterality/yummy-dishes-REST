/**
 * Like API
 * Author: Jin-woo Shin
 * Date: 2017-09-18
 */
import * as async from "async";
import * as express from "express";

import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Like product API
 * 
 * Path: /{userId}/like
 * Method: GET
 * 
 * Request
 * @param userId string required "_id" field of user
 * @query prod string required "_id" field of product
 * 
 * Response
 * @code 200 ok
 * @code 400 bad request
 * @code 404 not found
 * @code 409 conflict (already liked)
 * 
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function likeProduct(req: express.Request, idUser: string) {
	const idProduct = (req.query as any)["prod"];

	try {
		const userFound = await model.UserModel.findById(idUser, 
			{
				likes: true,
			}).exec();
		const prodFound = await model.ProductModel.findById(idProduct, {
			cnt_like: true,
		}).exec();

		// if user or product not found
		if (!userFound || !prodFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		// check if user already liked this product
		const likedProds: string[] = (userFound as any)["likes"];

		const alreadyLiked = likedProds.indexOf(idProduct) > -1;

		if (alreadyLiked) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_CONFLICT,
				resHandler.ApiResponse.RESULT_FAIL,
				"already liked");
		}

		// then, it's okay to make likeness
		((userFound as any)["likes"] as string[]).push(idProduct);
		((prodFound as any)["cnt_like"] as number) += 1;

		// save both
		await userFound.save();
		await prodFound.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while make like\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Unlike Product API
 * 
 * Path: /{userId}/unlike
 * Methodo: GET
 * 
 * Request
 * @param userId string required "_id" field of user
 * @body prod string required "_id" field of product
 * 
 * Response
 * @code 200 ok
 * @code 400
 * @code 404 not found
 */
export async function unlikeProduct(req: express.Request, idUser: string) {
	const idProd = (req.body as any)["product"];

	try {
		const userFound = await model.UserModel.findById(idUser, {
			likes: true,
		}).exec();
		const prodFound = await model.ProductModel.findById(idProd, {
			cnt_like: true,
		}).exec();

		// if user or product not exists
		if (!userFound || !prodFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		const reultUpdateuser = await model.UserModel.findByIdAndUpdate(idUser,
		{
			$pull: {
				"likes._id": idProd,
			},
		}).exec();

	}
	catch (err) {
		console.log("[mongodb] error occurred while unlikeness\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
