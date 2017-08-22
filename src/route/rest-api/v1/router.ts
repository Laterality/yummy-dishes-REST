import * as express from "express";

import * as resHandler from "../../../lib/response-handler";
import * as validator from "../../../lib/validator";
import { router as categoryApi } from "./category";
import { router as imageApi } from "./image";
import * as productApi from "./product";
import { router as userApi } from "./user";

export const router = express.Router();

router.use(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	// console.log("path: " + req.path, "routing...");
	next();
})
.use("/user", userApi)
.use("/image", imageApi)
.use("/product/:p1/:p2", async (req: express.Request, res: express.Response, next: express.NextFunction) => {
	const p1 = (req as any).params["p1"];
	const p2 = (req as any).params["p2"];
	let apiRes: resHandler.ApiResponse | undefined;
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
					default:
						break;
				}
				break;
		}
		if (apiRes) { resHandler.response(res, apiRes); }
		else { next(); }
	}
	catch (err) {
		console.log("[api] routing error, \n", err);
		resHandler.responseWithJson(res, 500, {
			result: "error",
			message: "server fault",
		});
	}
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
		if (apiRes) {
			resHandler.response(res, apiRes);
		}
		else {
			next();
		}
	}
	catch (err) {
		console.log("[api] routing error\n", req);
		next();
	}
})
.use("/category", categoryApi);
