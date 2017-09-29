/**
 * Like API
 * Author: Jin-woo Shin
 * Date: 2017-09-18
 */
import * as async from "async";
import * as express from "express";
import * as mongoose from "mongoose";

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
				`not found${!userFound || !prodFound ? "(" : ""}${!userFound ? "user" : ""}${!userFound || !prodFound ? "," : ""}${!prodFound ? "product" : ""}${!userFound || !prodFound ? ")" : ""}`);
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
		// await userFound.save();
		await model.UserModel.findByIdAndUpdate(idUser, {
			$push: {
				likes: idProduct,
			},
		});
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
 * @query prod string required "_id" field of product
 * 
 * Response
 * @code 200 ok
 * @code 400
 * @code 404 not found
 */
export async function unlikeProduct(req: express.Request, idUser: string) {
	const idProd = (req.query as any)["prod"];

	try {
		const userFound = await model.UserModel.findById(idUser, {
			likes: true,
		}).exec();
		const prodFound = await model.ProductModel.findById(idProd, {
			cnt_like: true,
		}).exec();

		// if user or product not found
		if (!userFound || !prodFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				`not found${!userFound || !prodFound ? "(" : ""}${!userFound ? "user" : ""}${!userFound || !prodFound ? "," : ""}${!prodFound ? "product" : ""}${!userFound || !prodFound ? ")" : ""}`);
		}

		// check if user's likes list has the product
		const resultFind = ((userFound as any)["likes"] as any[])
		.find((value: any, idx: number, obj: any[]) => {
			// console.log(`[api] comapring ${value.toString()} === ${idProd}: ${value.equals(idProd)}`);
			return value.equals(idProd);
		});

		// console.log("[api] find result: ", resultFind);
		// resultFind is undefined if likes array doesn't include the Product _id
		if (!resultFind) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"user hasn't liked the product");
		}

		console.log("[api] likes: " + (userFound as any)["likes"]);

		(userFound as any)["likes"].remove(idProd);
		await userFound.save();
		((prodFound as any)["cnt_like"] as number)--;
		await prodFound.save();
		// const resultUpdateuser = await model.UserModel.findByIdAndUpdate(idUser,
		// {
		// 	$pull: {
		// 		likes: idProd,
		// 	},
		// }).exec();

		// console.log("[api] result: " + resultUpdateuser);

	}
	catch (err) {
		console.log("[mongodb] error occurred while unlikeness\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
