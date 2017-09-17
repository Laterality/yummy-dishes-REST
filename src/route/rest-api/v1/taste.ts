import * as express from "express";
import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Taste creation API
 * 
 * Path: /register
 * Method: POST
 * 
 * Request
 * @body title string required title of taste
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body taste Taste optional created taste if reques succeeded
 */
export async function createTaste(req: express.Request) {
	const title = (req.body as any)["title"];

	try {
		const newTaste = new model.TasteModel({
			title,
		});

		await newTaste.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_CREATED,
			resHandler.ApiResponse.RESULT_OK,
			"", {
				name: "taste",
				obj: {
					_id: newTaste._id,
					title: (newTaste as any)["title"],
				},
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while creating taste");
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Retrieve taste API
 * 
 * Path: /{tasteId}
 * Method: GET
 * 
 * Request
 * @param tasteId string required "_id" of taste
 * 
 * Response
 * @result string required result of request
 * @message string optional message of result
 * @taste Taste optional taste retrieved if exists
 */
export async function retrieveTaste(req: express.Request, tasteId: string) {
	try {
		const tasteFound = await model.TasteModel.findById(tasteId).exec();

		if (!tasteFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "taste",
				obj: tasteFound,
			},
		);
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving taste\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Retrieve taste list API
 * 
 * Path: /tastes
 * Method: GET
 * 
 * Request
 * 
 * Response
 * @result string required result of request
 * @message string optional message about result
 * @tastes Taste[] optional list of tastes
 */
export async function retrieveTastes() {
	try {
		const tastesFound = await model.TasteModel.find().exec();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "tastes",
				obj: tastesFound,
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving tastes\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Taste update API
 * 
 * Path: /{tasteId}/update
 * Method: PUT
 * 
 * Request
 * @param tasteId string required "_id" field of taste to be updated
 * @body title string required title to be updated
 * 
 * Response
 * @result string required result of string
 * @message string optional message about result
 */
export async function updateTaste(req: express.Request, tasteId: string) {
	const titleToUpdate = (req.body as any)["title"];

	try {
		const tasteFound = await model.TasteModel.findById(tasteId).exec();

		if (!tasteFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		(tasteFound as any)["title"] = titleToUpdate;

		await tasteFound.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while ");
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Taste deletion API
 * 
 * Path: /{tasteId}/delete
 * Method: DELETE
 * 
 * Request
 * @param tasteId string required "_id" field of taste to delete
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message of result
 */
export async function deleteTaste(req: express.Request, tasteId: string) {
	
	try {
		const tstFound = await model.TasteModel.findById(tasteId).exec();

		if (!tstFound) {
			// if taste not exists
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		await tstFound.remove();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving taste");

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
