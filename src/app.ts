import * as bodyParser from "body-parser";
import * as express from "express";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as mongoose from "mongoose";
import * as logger from "morgan";
import * as multer from "multer";
import * as path from "path";

import { config } from "./config";

import { apiRouter } from "./route/router-api";

// express setup
const app = express();

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use("/static", express.static(path.join(__dirname, config.path_public)));

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
	next();
});
app.use(apiRouter);

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

// mongodb connection
mongoose.connect(config.db.uri, ({
	useMongoClient: true,
} as any));
mongoose.connection.on("connected", () => {
	console.log("[mongodb] connected");
});

// mongodb error handling methods
mongoose.connection.on("error", (err: any) => {
	console.log("[mongodb] connection error", err);
});

mongoose.connection.on("disconnected", () => {
	console.log("[mongodb] disconnected");
});

// http server error handling methods
const server = config.https.use 
? https.createServer({
	key: fs.readFileSync(config.https.key, "utf-8"),
	cert: fs.readFileSync(config.https.cert, "utf-8"),
}, app)
: http.createServer(app);
server.on("error", (err: any) => {
	console.log("error", err);
});
server.on("listening", () => {
	const addr: any = server.address();
	const bind = typeof addr === "string" ?
	"pipe " + addr :
	"port " + addr.port;
	console.log("Listening on " + bind);
});
server.listen(config.port);

process.on("SIGINT", () => {
	console.log("[process] process terminating");
	mongoose.connection.close(() => {
		console.log("[mongodb] connection closed");
		process.exit(0);
	});
});
