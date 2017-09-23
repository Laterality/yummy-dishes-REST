import * as express from "express";

import * as fileHandler from "../../../lib/file-handler";
import * as resHandler from "../../../lib/response-handler";
import * as validator from "../../../lib/validator";

import * as bucketApi from "./bucket";
import * as categoryApi from "./category";
import * as commentApi from "./comment";
import * as couponApi from "./coupon";
import * as imageApi from "./image";
import * as likeApi from "./like";
import * as orderApi from "./order";
import * as productApi from "./product";
import * as tasteApi from "./taste";
import * as userApi from "./user";

export const router = express.Router();

router.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	// console.log("path: " + req.path, "routing...");
	next();
})
.use("/user/:p1/:p2", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	const p2 = (req as any).params["p2"];

	// console.log("[api] route..." + p1 + "/" + p2);

	let apiRes: resHandler.ApiResponse|undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			case "is":
				if (p2 === "duplicates") {
					apiRes = await userApi.duplicateCheck(req);
				}
				break;
			default:
				switch (p2) {
					case "update":
						apiRes = await userApi.updateUser(req, p1);
						break;
					case "delete":
						apiRes = await userApi.deleteUser(req, p1);
						break;
					case "coupons":
						apiRes = await couponApi.retrieveCouponsByUser(req, p1);
						break;
					case "like":
						apiRes = await likeApi.likeProduct(req, p1);
						break;
					case "unlike":
						apiRes = await likeApi.unlikeProduct(req, p1);
						break;
					case "add-bucket":
						apiRes = await bucketApi.addBucketItem(req, p1);
						break;
					case "update-bucket":
						apiRes = await bucketApi.updateBucketItem(req, p1);
						break;
					case "delete-from-bucket":
						apiRes = await bucketApi.deleteBucketItem(req, p1);
						break;
					case "orders":
						apiRes = await orderApi.retrieveOrderByUser(req, p1);
						break;
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/user/:p1", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	
	// console.log("[api] route..." + p1);

	let apiRes: resHandler.ApiResponse|undefined;

	apiRes = undefined;

	try {

		switch (p1) {
			case "register":
				apiRes = await userApi.createUser(req);
				break;
			case "login":
				apiRes = await userApi.loginUser(req);
				break;
			default:
				if (validator.isObjectid(p1)) {
					apiRes = await userApi.retrieveUser(req, p1);
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
		next();
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/image/:p1", fileHandler.upload.single("content"), 
async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];

	let apiRes: resHandler.ApiResponse|undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			case "upload":
				apiRes = await imageApi.uploadImage(req);
				break;
			default:
				break;
		}
	}
	catch (err) {
		console.log("[api] ");
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/product/:p1/:p2", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	const p2 = (req as any).params["p2"];
	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;

	try {
		// first path routing
		switch (p1) {
			default:
			// second path routing
				switch (p2) {
					case "update":
						if (validator.isObjectid(p1)) {
							apiRes = await productApi.updateProduct(req, p1);
						}
						break;
					case "delete":
						if (validator.isObjectid(p1)) {
							apiRes = await productApi.deleteProduct(req, p1);
						}
						break;
					case "comments":
						if (validator.isObjectid(p1)) {
							apiRes = await commentApi.retrieveCommentsByProduct(req, p1);
						}
					default:
						break;
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error, \n", err);
		resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/product/:p1", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	let apiRes: resHandler.ApiResponse|undefined;

	try {
		switch (p1) {
			case "register":
				apiRes = await productApi.createProduct(req);
				break;
			case "search":
				apiRes = await productApi.searchProduct(req);
				break;
			default:
				if (validator.isObjectid(p1)) {
					apiRes = await productApi.retrieveProduct(req, p1);
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", req);
		next();
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/category/:p1/:p2", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	const p2 = (req as any).params["p2"];

	let apiRes: resHandler.ApiResponse|undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			default:
				switch (p2) {
					case "products":
						apiRes = await categoryApi.retrieveProductsByCategory(req, p1);
						break;
					case "update":
						apiRes = await categoryApi.updateCategory(req, p1);
						break;
					case "delete":
						apiRes = await categoryApi.deleteCategory(req, p1);
						break;
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/category/:p1", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];

	let apiRes: resHandler.ApiResponse|undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			case "register":
				apiRes = await categoryApi.createCategory(req);
				break;
			case "categories":
				apiRes = await categoryApi.retrieveCategories(req);
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/comment/:p1/:p2", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	const p2 = (req as any).params["p2"];

	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			default:
				switch (p2) {
					case "reply":
						if (validator.isObjectid(p1)) {
							apiRes = await commentApi.createReply(p1, req);
						}
						break;

					// comment by product routed by /product route

					case "update":
						if (validator.isObjectid(p1)) {
							apiRes = await commentApi.updateComment(req, p1);
						}
						break;
					case "delete":
						if (validator.isObjectid(p1)) {
							apiRes = await commentApi.deleteComment(req, p1);
						}
						break;
				}
			break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/comment/:p1", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];

	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			case "register":
				apiRes = await commentApi.createComment(req);
				break;
			default:
				if (validator.isObjectid(p1)) {
					apiRes = await commentApi.retrieveComment(req, p1);
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/coupon/:p1/:p2", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	const p2 = (req as any).params["p2"];

	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			default:
				switch (p2) {
					// /{userId}/coupons routes in /user route
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) {resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/coupon/:p1", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];

	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;
	
	try {
		switch (p1) {
			case "register":
				apiRes = await couponApi.createCoupon(req);
				break;
			case "by-coupon-number":
				apiRes = await couponApi.retrieveCouponByCouponNumber(req);
				break;
			case "consume":
				apiRes = await couponApi.consumeCoupon(req);
				break;
			case "delete":
				apiRes = await couponApi.deleteCouponByCouponNumber(req);
				break;
			default:
				console.log("[api] not matched route");
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/taste/:p1/:p2", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	const p2 = (req as any).params["p2"];

	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			default:
				switch (p2) {
					case "update":
						if (validator.isObjectid(p1)) {
							apiRes = await tasteApi.updateTaste(req, p1);
						}
						break;
					case "delete":
						if (validator.isObjectid(p1)) {
							apiRes = await tasteApi.deleteTaste(req, p1);
						}
						break;
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/taste/:p1", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];

	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			case "register":
				apiRes = await tasteApi.createTaste(req);
				break;
			case "tastes":
				apiRes = await tasteApi.retrieveTastes();
				break;
			default:
				if (validator.isObjectid(p1)) {
					apiRes = await tasteApi.retrieveTaste(req, p1);
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/order/:p1/:p2", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = req.params["p1"];
	const p2 = req.params["p2"];

	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			default:
				switch (p2) {
					case "update":
						apiRes = await orderApi.updateOrder(req, p1);
						break;
					case "delete":
						apiRes = await orderApi.deleteOrder(req, p1);
						break;
				}
			break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
})
.use("/order/:p1", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = req.params["p1"];

	let apiRes: resHandler.ApiResponse | undefined;

	apiRes = undefined;

	try {
		switch (p1) {
			case "register":
				apiRes = await orderApi.createOrder(req);
				break;
			default:
				if (validator.isObjectid(p1)) {
					apiRes = await orderApi.retrieveOrder(req, p1);
				}
				break;
		}
	}
	catch (err) {
		console.log("[api] routing error\n", err);
	}

	if (apiRes) { resHandler.response(res, apiRes); }
	else { next(); }
});
