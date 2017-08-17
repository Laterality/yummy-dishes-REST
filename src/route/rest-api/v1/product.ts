import * as async from "async";
import * as express from "express";
import * as mongoose from "mongoose";
import * as multer from "multer";

import * as model from "../../../db/model";
import * as fileHandler from "../../../lib/file-handler";
import * as resHandler from "../../../lib/response-handler";

export const router = express.Router()
/**
 * Product registration API
 * 
 * Image count should be controlled by FE
 * 
 * Path: /register
 * Method: POST
 * 
 * Reqeust
 * @body name string required name of product
 * @body price number required price of product
 * @body amount string required amount of product
 * @body ingredient string required ingredients of product
 * @body category string(ObjectId) required "_id" field of category
 * @body content string[] text contents
 * @body image_ids string[] optional array of id of image of product
 * 
 * Response
 * @code 201 product registered
 * @code 405 invalid parameters
 * @code 500 server fault
 * 
 * @body result string required result of request ["ok", "fail", "error"]
 * @body message string optional message about result
 * @body product Product optional registered product if request success
 */
.post("/register", async (req: express.Request, 
res: express.Response) => {
	const name = (req as any).body["name"];
	const price = (req as any).body["price"];
	const amount = (req as any).body["amount"];
	const ingreds = (req as any).body["ingredient"];
	const category = (req as any).body["category"];
	const contents = (req as any).body["contents"];
	const imageIds = (req as any).body["image_ids"];

	// paramter type check
	if (typeof name === "string" &&
	typeof price === "number" &&
	typeof amount === "string" &&
	typeof ingreds === "string" &&
	typeof category === "string" && 
	Array.isArray(contents) &&
	Array.isArray(imageIds)) {

		const newProduct = await new model.ProductModel({
			name,
			price,
			amount,
			ingredient: ingreds,
			contents,
			category,
			images: imageIds,
		}).save();

		return resHandler.responseWithJson(res, 201, {
			result: "ok",
			product: {
				name: (newProduct as any)["name"],
				price: (newProduct as any)["price"],
				amount: (newProduct as any)["amount"],
				ingredient: (newProduct as any)["ingredient"],
				category: (newProduct as any)["category"],
				contents: (newProduct as any)["contents"],
				date_reg: (newProduct as any)["cnt_like"],
				images: (newProduct as any)["images"],
			},
		});
	}
	else {
		return resHandler.responseWithJson(res, 405, {
			result: "fail",
			message: "invalid parameters",
		});
	}

})
/**
 * Path: /product/{productId}
 * Method: GET
 * 
 * Request
 * @param productId string required "_id" field of product
 * @query q string optional query to need 
 * ["amount", ingredient", "category", "contents", "date_reg", "cnt_like", "avg_rate"]
 * 
 * Response
 * @code 200 ok
 * @code 404 not found
 * @code 405 invalid parameter
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 * @body product ProducModel optional product if success
 */
.get("/:id", async (req: express.Request, res: express.Response) => {
	const id = (req as any).body["id"];
	const q = (req as any).query["q"];

	const queries = (q as string).split(",");

	// handle reqeust queries
	const queryBool: any = {};

	if (queries.indexOf("amount") > -1) { queryBool["amount"] = true; }
	if (queries.indexOf("ingredient") > -1) { queryBool["ingredient"] = true; }
	if (queries.indexOf("category") > -1) { queryBool["category"] = true; }
	if (queries.indexOf("contents") > -1) { queryBool["contents"] = true; }
	if (queries.indexOf("date_reg") > -1) { queryBool["date_reg"] = true; }
	if (queries.indexOf("cnt_like") > -1) { queryBool["cnt_like"] = true; }
	if (queries.indexOf("avg_rate") > -1) { queryBool["avg_rate"] = true; }
	if (queries.indexOf("images") > - 1) { queryBool["images"] = true; }

	if (typeof id !== "string") {
		return resHandler.responseWithJson(res, 405, {
			result: "fail",
			message: "invalid parameter",
		});
	}

	try {
		// make db query
		let findQuery = model.ProductModel.findById(id);
		if (queryBool["category"]) { findQuery = findQuery.populate("category"); }
		if (queryBool["images"]) { findQuery = findQuery.populate("images"); }

		const result = (await findQuery.exec()) as any;

		if (result) {
			console.log("[api] product not found, _id: " + id);
			return resHandler.responseWithJson(res, 404, {
				result: "fail",
				message: "not found",
			});
		}
		const product: any = {
			_id: result["_id"],
			name: result["name"],
			price: result["price"],
		};

		if (queryBool["amount"]) {
			product["amount"] = result["amount"];
		}

		if (queryBool["ingredient"]) {
			product["ingredient"] = result["ingredient"];
		}

		if (queryBool["category"]) {
			product["category"] = result["category"];
		}

		if (queryBool["contents"]) {
			product["contents"] = result["contents"];
		}

		if (queryBool["date_reg"]) {
			product["date_reg"] = result["date_reg"];
		}

		if (queryBool["cnt_like"]) {
			product["cnt_like"] = result["cnt_like"];
		}

		if (queryBool["avg_rate"]) {
			product["avg_rate"] = result["avg_rate"];
		}

		if (queryBool["images"]) {
			product["images"] = result["images"];
		}

		return resHandler.responseWithJson(res, 200, {
			result: "ok",
			product,
		});
	}
	catch (err) {
		console.log("[mongodb] retrieve product error ", err);
		return resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
})
/**
 * Product update API
 * 
 * Path: /{productId}/update
 * Method: PUT
 * 
 * Request
 * @param productId string required "_id" field of product
 * 
 * @body name string optional product name to update
 * @body price number optional product price to update
 * @body amount string optional product amount to update
 * @body ingredient string optional product ingredient to update
 * @body contents string[] optional product contents to update
 * @body category string optional "_id" field of category to update
 * @body images Array<string> optional images to update, if array is empty(length is zero), clear the exist array
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
.put("/:id/update", async (req: express.Request, res: express.Response) => {
	const id = (req as any).params["id"];
	const name = (req as any).body["name"];
	const price = (req as any).body["price"];
	const ingredient = (req as any).body["ingredient"];
	const category = (req as any).body["category"];
	const images = (req as any).body["images"];

	const update: any = {};

	if (!id || (id as string).length === 0) {
		return resHandler.responseWithJson(res, 405, {
			result: "fail",
			message: "invalid parameters",
		});
	}
	
	try {
		if (typeof name === "string" &&
		(name as string).length !== 0) { update["name"] = name; }
		if (typeof price === "number" &&
		(price as number) !== 0) { update["price"] = price; }
		if (typeof ingredient === "string" &&
		(ingredient as string).length !== 0) { update["ingredient"] = ingredient; }
		if (typeof category === "string" &&
		(category as string).length !== 0) { update["category"] = category; }
		if (Array.isArray(images)) { update["images"] = images; }

		try {
			const result = await model.ProductModel.findByIdAndUpdate(id, update).exec();

			console.log("[mongodb] product updated", result);

			return resHandler.responseWithJson(res, 200, {
				result: "ok",
			});
		}
		catch (err) {
			console.log("[mongodb] product update error", err);
			return resHandler.responseWithJson(res, 500, {
				result: "error",
				message: "server fault",
			});
		}
	}
	catch (err) {
		console.log("[api] product update error", err);
		return resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}

})
/**
 * Product remove API
 * 
 * Path: /{productId}/delete
 * Method: DELETE
 * 
 * Request
 * @param productId string required "_id" field of product
 * 
 * Response
 * @code 200 ok
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 */
.delete("/:id/delete", async (req: express.Request, res: express.Response) => {
	const id = (req as any).params["id"];

	if ((id as any).length !== 0) {
		console.log("[api] id param's length is zero");
	}

	try {
		const result = model.ProductModel.findByIdAndRemove(id).exec();

		console.log("[mongodb] product removed");
		return resHandler.responseWithJson(res, 200, {
			result: "ok",
		});
	}
	catch (err) {
		console.log("[mongodb] delete product error", err);
		resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
})
;
