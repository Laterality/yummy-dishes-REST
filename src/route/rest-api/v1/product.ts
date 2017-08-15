import * as express from "express";
import * as mongoose from "mongoose";
import * as multer from "multer";

import * as model from "../../../db/model";
import * as util from "../../../util";

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
 * @body.name string required name of product
 * @body.price number required price of product
 * @body.ingredient string required ingredients of product
 * @body.category string(ObjectId) required "_id" field of category
 * @body.image file optional image of product
 * 
 * Response
 * @code 201 product registered
 * @code 403 unfulfilled parameters
 * 
 * @body.result string required result of request ["ok", "fail", "error"]
 * @body.message string optional message about result
 * @body.product Product optional registered product if request success
 */
.get("/register", util.upload.single("image"), async (req: express.Request, 
res: express.Response) => {
	const name = (req as any).body["name"];
	const price = (req as any).body["price"];
	const ingreds = (req as any).body["ingredient"];
	const category = (req as any).body["category"];

	// paramter type check
	if (typeof name === "string" &&
	typeof price === "number" &&
	typeof ingreds === "string" &&
	typeof category === "string") {

		let imageIds: string[] = [];

		// if image exists
		if ((req as any).files &&
			((req as any).files as multer.Instance[]).length >= 1) {
			imageIds = await util.fileHandler((req as any).files);
		}

		const newProduct = await new model.ProductModel({
			name,
			price,
			ingredient: ingreds,
			category,
			images: imageIds,
		}).save();

		return util.responseWithJson(res, 201, {
			result: "ok",
			product: {
				name: (newProduct as any)["name"],
				price: (newProduct as any)["price"],
				ingredient: (newProduct as any)["ingredient"],
				category: (newProduct as any)["category"],
				date_reg: (newProduct as any)["cnt_like"],
				image: (newProduct as any)["images"],
			},
		});

	}
	else {
		return util.responseWithJson(res, 403, {
			result: "fail",
			message: "unfulfilled parameters",
		});
	}

})
;
