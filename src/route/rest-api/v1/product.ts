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

		// add created product's _id into category's "products" field
		await model.CategoryModel.findByIdAndUpdate(category, {
			$push: {
				products: newProduct._id,
			},
		});

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
	const objProjection: any = {
		_id: true,
		name: true,
		price: true,
		amount: queries.indexOf("amount") > -1,
		ingredient: queries.indexOf("ingredient") > -1,
		category: queries.indexOf("category") > -1,
		contents: queries.indexOf("contents") > -1,
		date_reg: queries.indexOf("date_reg") > -1,
		cnt_like: queries.indexOf("cnt_like") > -1,
		avg_rate: queries.indexOf("avg_rate") > -1,
		images: queries.indexOf("images") > -1,
	};

	if (typeof id !== "string") {
		return resHandler.responseWithJson(res, 405, {
			result: "fail",
			message: "invalid parameter",
		});
	}

	try {
		// make db query
		let findQuery = model.ProductModel.findById(id, objProjection);
		if (objProjection["category"]) { findQuery = findQuery.populate("category"); }
		if (objProjection["images"]) { findQuery = findQuery.populate("images"); }

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

		if (objProjection["amount"]) {
			product["amount"] = result["amount"];
		}

		if (objProjection["ingredient"]) {
			product["ingredient"] = result["ingredient"];
		}

		if (objProjection["category"]) {
			product["category"] = result["category"];
		}

		if (objProjection["contents"]) {
			product["contents"] = result["contents"];
		}

		if (objProjection["date_reg"]) {
			product["date_reg"] = result["date_reg"];
		}

		if (objProjection["cnt_like"]) {
			product["cnt_like"] = result["cnt_like"];
		}

		if (objProjection["avg_rate"]) {
			product["avg_rate"] = result["avg_rate"];
		}

		if (objProjection["images"]) {
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
 * @code 404 not found
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
		const result = await model.ProductModel.findById(id, {category: true}).exec();

		// remove product from its category's "products" array
		if (result) {
			await result.remove();
			await model.CategoryModel.findByIdAndUpdate((result as any)["category"]._id, 
			{
				$pullAll: {
					products: [result._id],
				},
			}).exec();

			console.log("[mongodb] product removed");
			return resHandler.responseWithJson(res, 200, {
				result: "ok",
			});
		}
		else {
			console.log("[mongodb] product not found, _id: " + id);
			return resHandler.responseWithJson(res, 404, {
				result: "fail",
				message: "not found",
			});
		}
	}
	catch (err) {
		console.log("[mongodb] delete product error", err);
		resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
})
/**
 * Production search API
 * 
 * Path: /search
 * Method: GET
 * 
 * Request
 * @query sort string optional field to sort descending by ["name", "cnt_like", "avg_rate"], default is name
 * @query keyword string optional keyword to search
 * @query category string optional "_id" field of category
 * @query q string optional field to projection 
 * ["amount", ingredient", "category", "contents", "date_reg", "cnt_like", "avg_rate", "images"]
 * 
 * Response
 * @code 200 ok
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 * @body products ProductModel[] result if success
 * 
 */
.get("/search", async (req: express.Request, res: express.Response) => {
	const keyword = (req as any).query["keyword"];
	const category = (req as any).query["category"];
	const query = (req as any).query["q"];
	const queries = query ? (query as string).split(",") : [];
	let sort = (req as any).query["sort"];

	const objFind: any = {};
	const objProjection: any = {
		name: true,
		price: true,
		amount: queries.indexOf("amount") > -1,
		ingredient: queries.indexOf("ingredient") > -1,
		contents: queries.indexOf("contents") > -1,
		category: queries.indexOf("category") > -1,
		date_reg: queries.indexOf("date_reg") > -1,
		cnt_like: queries.indexOf("cnt_likes") > -1,
		avg_rate: queries.indexOf("avg_rate") > -1,
	};
	const objSort: any = {
		score: {
			$meta: "textScore",
		},
	};

	// determine conditions
	// if keyword not exists or keywords length is zero, make query find all
	const findAll = !keyword || (keyword.length === 0);
	// if category filter exists
	const filterByCategory = (!category || (category.length === 0));
	
	if (!new RegExp("^(name|cnt_like|avg_rate)+$").test(sort)) {
		sort = "name";
	}

	if (findAll) {
		objFind["$text"] = {
			$search: keyword,
		};
	}

	if (filterByCategory) {
		objFind["category"] = category;
	}

	let dbQuery = model.ProductModel.find(objFind, objProjection)
	.sort(objSort);
	
	if (objProjection["category"]) {
		dbQuery = dbQuery.populate("category");
	}

	try {
		const result = await dbQuery.exec();
		
		return resHandler.responseWithJson(res, 200, {
			result: "ok",
			products: result,
		});
	}
	catch (err) {
		console.log("[mongodb] search product error ", err);
		return resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
})
;
