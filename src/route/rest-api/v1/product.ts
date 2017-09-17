import * as async from "async";
import * as express from "express";
import * as mongoose from "mongoose";
import * as multer from "multer";

import * as model from "../../../db/model";
import * as fileHandler from "../../../lib/file-handler";
import * as resHandler from "../../../lib/response-handler";
import * as validator from "../../../lib/validator";

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
 * @body contents string[] text contents
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
export async function createProduct(req: express.Request){
	const name		= (req as any).body["name"];
	const price		= (req as any).body["price"];
	const amount	= (req as any).body["amount"];
	const ingreds	= (req as any).body["ingredient"];
	const category	= (req as any).body["category"];
	const contents	= (req as any).body["contents"];
	const imageIds	= (req as any).body["image_ids"];

	// paramter type check
	if (typeof name		=== "string" &&
		typeof price	=== "number" &&
		typeof amount	=== "string" &&
		typeof ingreds	=== "string" &&
		typeof category	=== "string" &&
		Array.isArray(contents) &&
		Array.isArray(imageIds)) {

		try{
			const newProduct = await new model.ProductModel({
				name,
				price,
				amount,
				ingredient: ingreds,
				contents,
				category,
				images: imageIds ? imageIds : [],
			}).save();

			// add created product's _id into category's "products" field
			await model.CategoryModel.findByIdAndUpdate(category, {
				$push: {
					products: newProduct._id,
				},
			});

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_CREATED, 
				resHandler.ApiResponse.RESULT_OK, "", {
					name: "product",
					obj: {
						_id:		newProduct._id,
						name:		(newProduct as any)["name"],
						price:		(newProduct as any)["price"],
						amount:		(newProduct as any)["amount"],
						ingredient:	(newProduct as any)["ingredient"],
						category:	(newProduct as any)["category"],
						contents:	(newProduct as any)["contents"],
						date_reg:	(newProduct as any)["date_reg"],
						images:		(newProduct as any)["images"],
					},
				});
		}
		catch (err) {
			console.log("[api] product creation error\n", err);
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_SERVER_FAULT, 
				resHandler.ApiResponse.RESULT_ERROR,
				"server fault");
		}
	}
	else {
		console.log(`[api] product creation - invalid parameters\n
		name:		${typeof name}\n
		price:		${typeof price}\n
		amount:		${typeof amount}\n
		ingredient:	${typeof ingreds}\n
		category:	${typeof contents}\n
		contents:	${typeof contents}\n
		image_ids:	${typeof imageIds}`);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL, 
			"invalid parameters");
	}
}
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
export async function retrieveProduct(req: express.Request, productId: string) {
	const id	=	productId; // (req as any).params["p1"];
	const q		=	(req as any).query["q"];

	const queries = q ? (q as string).split(",") : [];

	// handle reqeust queries
	const objProjection: any = {
		_id:		true,
		name:		true,
		price:		true,
		amount:		queries.indexOf("amount") > -1,
		ingredient:	queries.indexOf("ingredient") > -1,
		category:	queries.indexOf("category") > -1,
		contents:	queries.indexOf("contents") > -1,
		date_reg:	queries.indexOf("date_reg") > -1,
		cnt_like:	queries.indexOf("cnt_like") > -1,
		avg_rate:	queries.indexOf("avg_rate") > -1,
		images:		queries.indexOf("images") > -1,
	};

	for (const i in objProjection) {
		if (!objProjection[i]) {
			delete objProjection[i];
		}
	}

	if (typeof id !== "string") {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameters");
	}

	try {
		// make db query
		let findQuery = model.ProductModel.findById(id, objProjection);
		if (objProjection["category"]) {
			findQuery = findQuery.populate("category");
		}
		
		if (objProjection["images"]) {
			findQuery = findQuery.populate("images");
		}

		const result = (await findQuery.exec()) as any;

		// check if result exists matches to id
		if (!result) {
			console.log("[api] product not found, _id: " + id);

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		// make result object to send with response
		const product: any = {
			_id:	result["_id"],
			name:	result["name"],
			price:	result["price"],
		};

		if (objProjection["amount"]) {
			product["amount"]		= result["amount"];
		}

		if (objProjection["ingredient"]) {
			product["ingredient"]	= result["ingredient"];
		}

		if (objProjection["category"]) {
			product["category"]		= result["category"];
		}

		if (objProjection["contents"]) {
			product["contents"]		= result["contents"];
		}

		if (objProjection["date_reg"]) {
			product["date_reg"]		= result["date_reg"];
		}

		if (objProjection["cnt_like"]) {
			product["cnt_like"]		= result["cnt_like"];
		}

		if (objProjection["avg_rate"]) {
			product["avg_rate"]		= result["avg_rate"];
		}

		if (objProjection["images"]) {
			product["images"]		= result["images"];
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "product",
				obj: product,
			});
	}
	catch (err) {
		console.log("[mongodb] retrieve product error,\n", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
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
export async function updateProduct(req: express.Request, productId: string) {
	const id			= productId; // (req as any).params["p1"];
	const name			= (req as any).body["name"];
	const price			= (req as any).body["price"];
	const ingredient	= (req as any).body["ingredient"];
	const category		= (req as any).body["category"];
	const images		= (req as any).body["images"];
	
	const update: any = {};

	// check if request has an id as a path parameter
	if (!id || (id as string).length === 0) {
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
			resHandler.ApiResponse.RESULT_FAIL,
			"invalid parameter: productId");
	}
	
	try {
		// make update query object
		if (typeof name === "string" &&
			(name as string).length !== 0) {
			update["name"] = name;
		}
		if (typeof price === "number" &&
			(price as number) !== 0) {
				update["price"] = price;
			}
		if (typeof ingredient === "string" &&
			(ingredient as string).length !== 0) {
				update["ingredient"] = ingredient;
			}
		if (typeof category === "string" &&
			(category as string).length !== 0) {
				update["category"] = category;
			}
		if (Array.isArray(images)) { update["images"] = images; }

		try {
			const result = await model.ProductModel.findByIdAndUpdate(id, update).exec();

			// console.log("[mongodb] product updated", result);

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK,
				"");
		}
		catch (err) {
			console.log("[mongodb] product update error", err);

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_SERVER_FAULT,
				resHandler.ApiResponse.RESULT_ERROR,
				"server fault");
		}
	}
	catch (err) {
		console.log("[api] product update error", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}

}
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
export async function deleteProduct(req: express.Request, productId: string) {
	const id = productId; // (req as any).params["id"];

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

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_OK,
				resHandler.ApiResponse.RESULT_OK,
				"");
		}
		else {
			console.log("[mongodb] product not found, _id: " + id);

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found: productId");
		}
	}
	catch (err) {
		console.log("[mongodb] delete product error", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
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
export async function searchProduct(req: express.Request) {
	const keyword	= (req as any).query["keyword"];
	const category	= (req as any).query["category"];
	const query		= (req as any).query["q"];
	const queries	= query ? (query as string).split(",") : [];

	let sort		= (req as any).query["sort"];

	const objFind: any = {};
	const objProjection: any = {
		score:		{
			$meta:		"textScore",
		},
		name: 		true,
		price: 		true,
		amount: 	queries.indexOf("amount") > -1,
		ingredient:	queries.indexOf("ingredient") > -1,
		contents:	queries.indexOf("contents") > -1,
		category:	queries.indexOf("category") > -1,
		date_reg:	queries.indexOf("date_reg") > -1,
		cnt_like:	queries.indexOf("cnt_likes") > -1,
		avg_rate:	queries.indexOf("avg_rate") > -1,
	};

	for (const i in objProjection) {
		if (!objProjection[i]) {
			delete objProjection[i];
		}
	}

	const objSort: any = {
		score: {
			$meta: "textScore",
		},
	};

	// determine conditions
	// if keyword not exists or keywords length is zero, make query find all
	const findAll = !keyword || (keyword.length === 0);
	// if category filter exists
	const filterByCategory = validator.isObjectid(category);
	
	if (!new RegExp("^(name|cnt_like|avg_rate)+$").test(sort)) {
		sort = "name";
	}

	if (!findAll) {
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

	console.log(`[api] product search\n
	query: ${JSON.stringify(dbQuery.getQuery())}\n
	find: ${JSON.stringify(objFind)}\n
	projection: ${JSON.stringify(objProjection)}`);
	try {
		const result = await dbQuery.exec();

		if (result) {
			// console.log("[api] product search succeess, " + result.length + "results\n", result);
		}
		
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "products",
				obj: result,
			});
	}
	catch (err) {
		console.log("[mongodb] search product error ", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
