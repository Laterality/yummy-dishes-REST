import * as express from "express";
import * as mongoose from "mongoose";

import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

export const router = express.Router()
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
.post("/register", async (req: express.Request, res: express.Response) => {
	const name = (req as any).body["name"];

	try {

		const newCategory = await new model.CategoryModel({
			name,
		}).save();

		console.log("[mongodb] category created, _id: " + newCategory._id);

		return resHandler.responseWithJson(res, 201, {
			result: "ok",
			category: {
				name: (newCategory as any)["name"],
				products: [],
			},
		});
	}
	catch (err) {
		console.log("[mongodb] category create error ", err);
		return resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}

})
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
.get("/categories", async (req: express.Request, res: express.Response) => {
	try {
		const result = await model.CategoryModel.find({}, {
			_id: true,
			name: true,
		}).exec();
		
		return resHandler.responseWithJson(res, 200, {
			result: "ok",
			categories: result,
		});
	}
	catch (err) {
		console.log("[mongodb] category retrieve error ", err);
		return resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
})
/**
 * Retrieve products by category
 * 
 * Path: /{categoryId}/products
 * Method: GET
 * 
 * Request
 * @param categoryId "_Id" field of category
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
.get("/:id/products", async (req: express.Request, res: express.Response) => {
	const id = (req as any).body["productId"];

	if (!id || (id as string).length === 0) {
		return resHandler.responseWithJson(res, 405, {
			result: "fail",
			message: "invalid parameters",
		});
	}

	try {
		const result = await model.CategoryModel.findById(id, {products: true})
		.populate("products").exec();

		return resHandler.responseWithJson(res, 200, {
			result: "ok",
			products: result,
		});
	}
	catch (err) {
		console.log("[mongodb] retrieve category's product error ", err);
		return resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
});
