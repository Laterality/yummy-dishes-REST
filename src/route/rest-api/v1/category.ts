import * as express from "express";
import * as mongoose from "mongoose";

import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Category creation API
 * 
 * Paht: /register
 * Method: POST
 * 
 * Request
 * @body name string required name of category
 * 
 * Response
 * @code 201 created
 * @code 405 invalid parameters
 * @code 500 server fault
 * @body result string required result of request
 * @body message string optional message about result
 * @body category CategoryModel created category if success
 */
export async function createCategory(req: express.Request) {
	const name = (req as any).body["name"];

	try {
		// console.log("[api] create category with name: " + name);
		// console.log("[api] request body\n", (req as any).body);
		const newCategory = await new model.CategoryModel({
			name,
		}).save();

		console.log("[mongodb] category created, _id: " + newCategory._id);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_CREATED,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "category",
				obj: {
					_id: newCategory._id,
					name: (newCategory as any)["name"],
					products: [],
				},
			});
	}
	catch (err) {
		console.log("[mongodb] category create error ", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
/**
 * Category list retrieve API
 * 
 * Path: /categories
 * Method: GET
 * 
 * Request
 * None
 * 
 * Response
 * @code 200 ok
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optoinal message about result
 * @body categories CategoryModel[] optional categories if success, 
 * only includes "_id" and name of category, not products
 */
export async function retrieveCategories(req: express.Request) {
	try {
		const result = await model.CategoryModel.find({}, {
			_id:	true,
			name:	true,
		}).exec();
		
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "categories",
				obj: result,
			});
	}
	catch (err) {
		console.log("[mongodb] category retrieve error ", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
/**
 * Retrieve products by category
 * 
 * Path: /{categoryId}/products
 * Method: GET
 * 
 * Request
 * @param categoryId string required "_Id" field of category
 * @query q string optional filed to be returned separated by comma, default "name" and "price"
 * ["amount", "contents", "ingredient", "date_reg", "cnt_like", "avg_rate", "images"]
 * 
 * Resopnse
 * @code 200 ok
 * @code 404 not found
 * @code 405 invalid parameters
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message message about result
 */
export async function retrieveProductsByCategory(req: express.Request, categoryId: string) {
	const id	= categoryId; // (req as any).body["productId"];
	const q		= (req as any).query["q"];

	const queries = q ? (q as string).split(",") : [];

	let strSelection = "_id name";

	for (const i in queries) {
		if (i) {
			strSelection += " " + i;
		}
	}

	if (!id || (id as string).length === 0) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameters");
	}

	try {
		const dbQuery = model.CategoryModel.findById(id);
		console.log("[api] query: ", dbQuery.getQuery());
		const result = await model.CategoryModel.findById(id, {products: true})
		.populate("products", strSelection)
		.exec(); // model.CategoryModel.findById(id, {products: true})
		// .populate("products", strSelection)
		// model.CategoryModel.find({});
		// .populate("products")
		// .exec();
		
		// console.log("[api] result with _id:" + id + "\n", result);
		if (!result) {
			// console.log("[api] category not found _id: " + id);
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
				name: "category",
				obj: result,
			});
	}
	catch (err) {
		console.log("[mongodb] retrieve category's product error ", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
/**
 * Category update API
 * 
 * Path: /{categoryId}/update
 * Method: PUT
 * 
 * Request
 * @query categoryId string required "_id" field of category
 * @body name string required category name to be updated
 * 
 * Response
 * @code 200 updated
 * @code 404 not found
 * @code 405 invalid parameters
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about request
 */
export async function updateCategory(req: express.Request, categoryId: string) {
	const id = categoryId; // (req as any).query["id"];
	const name = (req as any).body["name"];

	if (!name) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameters");
	}

	try {

		const result = await model.CategoryModel.findById(id).exec();

		if (!result) {
			console.log("[api] ");
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		(result as any)["name"] = name;
		await result.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[api] mongodb error ", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
/**
 * Category removal API
 * 
 * Path: /{categoryId}/delete
 * Method: DELETE
 * 
 * Request
 * @query categoryId string required "_id" field of category
 * 
 * Response
 * @code 200 ok
 * @code 404 not found
 * @code 405 invalid parameters
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 * 
 */
export async function deleteCategory(req: express.Request, categoryId: string) {
	const id = categoryId; // (req as any).query["id"];
	
	if (!id) {
		console.log("[api] invalid parameter");
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameters");
	}

	try {
		const result = await model.CategoryModel.findById(id).exec();
		
		if (!result) {
			console.log("[api] result not found");
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		await result.remove();

		console.log("[api] category removed, _id: " + id);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[api] category delete error ", err); 
	}
}
