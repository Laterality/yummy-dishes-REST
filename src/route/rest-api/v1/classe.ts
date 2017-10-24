import * as express from "express";

import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Create product class
 * 
 * Path: /register
 * Method: POST
 * 
 * Request
 * @body name string required name of class
 * 
 * Response
 * @code 201 created
 * @code 405 invalid parameter
 * @code 500 server fault
 * 
 * @body result string required result of string
 * @body message string optional message about result
 * @body class Class optional created class if succeeded
 * 
 */
export async function createClass(req: express.Request) {
	const name = req.body["name"];

	try {
		const newClass = new model.ProductClassModel({
			name,
		});

		await newClass.save();
		
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_CREATED,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "class",
				obj: {
					_id: newClass._id,
					name: (newClass as any)["name"],
				},
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while creating product class\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Retrieve all product classes
 * 
 * Path: /classes
 * Method: GET
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body classes ProductClass[] optional retieved classes if request succeeded
 */
export async function retrieveClasses() {
	try {
		const result = await model.ProductClassModel.find().exec();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "classes",
				obj: result,
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving classes\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Delete product class
 * 
 * Path: /{classId}/delete
 * Method: DELETE
 * 
 * Request
 * @param classid string required "_id" of product class
 * 
 * Response
 * @code 200 ok
 * @code 404 not found
 * @code 500 server fault
 * 
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function deleteClass(req: express.Request, idCls: string) {
	
	try {
		const clsFound = await model.ProductClassModel.findById(idCls).exec();

		if (!clsFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(productmodel)");
		}

		await clsFound.remove();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while deleting product class\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
