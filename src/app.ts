import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as http from "http";

import * as _config from "./config";

import { apiRouter } from "./route/router-api";

const config = _config.config;

const app = express();

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, config.path_public)));

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.log(req.path);
	next();
});
app.use("/yd", apiRouter);

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	const err = new Error("Not Found");
	(err as any).status = 404;
	next(err);
});

if (app.get("env") === "development") {
	app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
		res.status(404);
		res.render("error", {
			error: err.message,
			message: err,
		});
	});
}

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	res.status(err.status);
	res.render("error", {
		error: err.message,
		message: {},
	});
});

const server = http.createServer(app);
server.on("error", onError);
server.on("listening", onListening);
server.listen(config.port);

function onError(err: any): void {
	console.log("error", err);
}

function onListening(): void {
	const addr: any = server.address();
	const bind = typeof addr === "string"
	? "pipe " + addr
	: "port " + addr.port;
	console.log("Listening on " + bind);
}
