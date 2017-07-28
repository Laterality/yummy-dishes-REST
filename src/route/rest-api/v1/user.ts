import * as express from "express";

export const router = express.Router();

router
.get("/", (req: express.Request, res: express.Response) => {
	console.log("user api called");
	res.status(200);
	res.send("yd-api-v1-user");
	res.end();
});
