/**
 * Notice API
 * 
 * Author: Jin-woo Shin
 * Date: 2017-09-25
 */
import * as express from "express";

import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Notice creation API
 * 
 * Path: /register
 * Method: POST
 * 
 * Request
 * @body title string required title of notice
 * @body category string required category of notice
 * @body content string required content of notice
 * @body author string required author of notice(Should be an admin)
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body notice NoticeModel optional created notice if request succeeeded
 * 
 */
export async function createNotice(req: express.Request) {
	const title		= req.body["title"];
	const category	= req.body["category"];
	const content	= req.body["content"];
	const author	= req.body["author"];

	if ((!title || !category || !content || !author) || 
		(title		as string).length === 0 ||
		(category	as string).length === 0 ||
		(content	as string).length === 0 ||
		(author		as string).length === 0) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameter");
	}

	try {
		// check if user exists
		const authorFound = await model.UserModel.findById(author, {
			is_admin: true,
		}).exec();

		if (!authorFound) {
			// if user is not found
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"author not exists");
		}
		else if (!(authorFound as any)["is_admin"]) {
			// if author is not an admin
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"author is not an admin");
		}
		
		const newNotice = new model.NoticeModel({
			title,
			category,
			content,
			author,
		});

		await newNotice.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_CREATED,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "notice",
				obj: {
					_id: newNotice._id,
					title,
					category,
					content,
					author,
				},
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while creating notice\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Noitce retrieval API
 * 
 * Path: /{noticeId}
 * Method: GET
 * 
 * Request
 * @param noticeId string required "_id" field of notice
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body notice Notice optional retrieved notice if request succeeded
 */
export async function retrieveNotice(req: express.Request, idNotice: string) {

	try {
		const noticeFound = await model.NoticeModel.findById(idNotice)
		.populate("author", "_id username")
		.exec();

		if (!noticeFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(notice)");
		}

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "notice",
				obj: noticeFound,
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving Notice\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Notices retrieval API
 * 
 * Path: /notices
 * Method: GE
 * 
 * Request
 * @query from date optional retrieve notices from the date
 * @query to date optional retrieves notices to the date
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body notices NoticeModel[] retrieved notices up to 10 by the date condition
 */
export async function retrieveNotices(req: express.Request) {
	const strDateFrom	= req.query["from"];
	const strDateTo		= req.query["to"];
	const dateFrom		= new Date(strDateFrom);
	const dateTo		= new Date(strDateTo);

	// console.log(`[api] date ${strDateFrom} - ${strDateTo}`);

	// check if the date format is valid
	if (dateFrom.toString() === "Invalid Date" ||
		dateTo.toString() === "Invalid Date") {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameter(date)");
	}

	try {
		const objFind: any = {};
		objFind["date_reg"] = {};
		if (strDateFrom) {
			objFind["date_reg"]["$gte"] = dateFrom;
		}
		if (strDateTo) {
			objFind["date_reg"]["$lte"] = dateTo;
		}

		const noticesFound = await model.NoticeModel.find(objFind, {
			title: true,
			category: true,
			date_reg: true,
		})
		.sort({date_reg: -1})
		.limit(10)
		.exec();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "notices",
				obj: noticesFound,
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving notices\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Notice updating API
 * 
 * Path: /{noticeId}/update
 * Method: PUT
 * 
 * Request
 * @param noticeId string required "_id" field of notice
 * @body title string optional title to update
 * @body category string optional category to update
 * @body content string optional content to update
 * 
 * Response
 * @body result string required result of request
 * @body message string required message about result
 * 
 */
export async function updateNotice(req: express.Request, idNotice: string) {
	const title		= req.body["title"];
	const category	= req.body["category"];
	const content	= req.body["content"];

	try {
		const noticeFound = await model.NoticeModel.findById(idNotice).exec();

		if (!noticeFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(notice)");
		}

		if (title && (title as string).length !== 0) {
			(noticeFound as any)["title"] = title;
		}
		if (category && (category as string).length !== 0) {
			(noticeFound as any)["category"] = category;
		}
		if (content && (content as string).length !== 0) {
			(noticeFound as any)["content"] = content;
		}

		await noticeFound.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while updating notice\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Notice deletion API
 * 
 * Path: /{noticeId}/delete
 * Method: DELETE
 * 
 * Request
 * @param noticeId string required "_id" field of notice
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function deleteNotice(req: express.Request, idNotice: string) {
	try {
		const noticeFound = await model.NoticeModel.findById(idNotice).exec();

		if (!noticeFound) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found(notice)");
		}

		await noticeFound.remove();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while deleting notice\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
