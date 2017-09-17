import * as express from "express";
import * as model from "../../../db/model";
import * as resHandler from "../../../lib/response-handler";

/**
 * Comment creation API
 * 
 * Path: /register
 * Method: POST
 * 
 * Request
 * @body author string required "_id" field of user who write the comment
 * @body product string required "_id" field of product who user wrote about
 * @body rate number required rate score in integer
 * @body tastes TasteModel[] required tastes user selected
 * @body content.text string required comment content(text)
 * @body content.images string[] optional array of "_id" field of image models
 */
export async function createComment(req: express.Request): Promise<resHandler.ApiResponse> {
	const author	= req.body["author"];
	const product	= req.body["product"];
	const rate		= req.body["rate"];
	const tastes	= req.body["tastes"];
	const content	= req.body["content"];

	// check parameters' type
	if (typeof author			!== "string" ||
		typeof product			!== "string" ||
		typeof rate				!== "number" ||
		typeof content["text"]	!== "string" ||
		!Array.isArray(tastes)				 ||
		Array.isArray(content["images"])) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameters");
	}

	// construct comment model object
	const newComment = new model.CommentModel({
		author,
		product,
		rate,
		tastes,
		content: {
			text:	content["text"],
			images:	content["images"] ? content["images"] : [],
		},
	});

	try {
		const result = await newComment.save();

		// new comment saved
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_CREATED,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "comment",
				obj: {
					_id:		newComment._id,
					author:		(newComment as any)["author"],
					product:	(newComment as any)["product"],
					rate:		(newComment as any)["rate"],
					tastes:		(newComment as any)["tastes"],
					content: {
						text:	(newComment as any)["content"]["text"],
						images:	(newComment as any)["content"]["images"],
					},
				},
			});
	}
	catch (err) {
		console.log("[mongodb] errror occurred while creating comment,\n", err);
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Reply creation API
 * 
 * Path: /{commentId}/reply
 * Method: POST
 * 
 * Request
 * @param commentId string required "_id" field of comment to add reply
 * @body author string required "_id" field of user who registered the reply
 * @body content string required content of reqly
 * 
 * Response
 * @body result		string required	result of request
 * @body message	string optional	message about request
 */
export async function createReply(commentId: string, req: express.Request) {
	const content	= (req as any)["content"];
	const author	= (req as any)["author"];
	
	try {
		const comment = await model.CommentModel.findById(commentId).exec();

		// check if comment exists
		if (!comment) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"comment not found");
		}

		// check if comment has reply already
		if ((comment as any)["reply"] && 
			((comment as any) as string).length !== 0) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_CONFLICT,
				resHandler.ApiResponse.RESULT_FAIL,
				"comment has reply already");
		}

		(comment as any)["reply"] = {
			content,
			author,
		};

		await comment.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] err occurred while find comment");
	}
}

/**
 * Retrieve comment by id API
 * 
 * Path: /{commentId}
 * Method: GET
 * 
 * Request
 * @param commentId string required "_id" field of comment
 * @query q string field to retrieve separating by comma
 * ["author", "product", "date_reg", "rate", "tastes", "content", "reply"]
 * 
 * Response
 * @result string required result of request
 * @message string optional message about result
 * @comment Comment optional retrieved comment if success
 */
export async function retrieveComment(req: express.Request, commentId: string) {
	try {
		const q = (req.query as any)["q"];

		const queries = q ? (q as string).split(",") : [];

		const objProjection: any = {
			_id:		true,
			author:		queries.indexOf("author") > -1,
			product:	queries.indexOf("product") > -1,
			date_reg:	queries.indexOf("date_reg") > -1,
			rate:		queries.indexOf("rate") > -1,
			tastes:		queries.indexOf("tastes") > -1,
			content:	queries.indexOf("content") > -1,
			reply:		queries.indexOf("reply") > -1,
		};

		for (const i in objProjection) {
			if (!objProjection[i]) {
				delete objProjection[i];
			}
		}

		let dbQuery = model.CommentModel.findById(commentId, objProjection);

		if (objProjection.author) {
			dbQuery = dbQuery.populate("author");
		}

		if (objProjection.product) {
			dbQuery = dbQuery.populate("product");
		}

		if (objProjection.tastes) {
			dbQuery = dbQuery.populate("tastes");
		}

		const commentFound = await dbQuery.exec();

		if (!commentFound) {
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
				name: "comment",
				obj: commentFound,
			},
		);
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving comment");
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Retrieve comments by product
 * 
 * Path: /{productId}/comments
 * Method: GET
 * 
 * Request
 * @param productId string required "_id" field of product
 * @query q string field to retrieve separating by comma
 * ["author", "product", "date_reg", "rate", "tastes", "content", "reply"]
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 * @body comments CommentModel[] comments of the product if request succeed
 */
export async function retrieveCommentsByProduct(req: express.Request, id: string): Promise<resHandler.ApiResponse> {
	const productId	= id;
	const q 		= req.query["q"];

	const queries 	= q ? (q as string).split(",") : [];

	const objProjection: any = {
		_id			: true,
		author		: queries.indexOf("author") > -1,
		product		: queries.indexOf("product") > -1,
		date_reg	: queries.indexOf("date_reg") > -1,
		rate		: queries.indexOf("rate") > -1,
		tastes		: queries.indexOf("tastes") > - 1,
		content		: queries.indexOf("content") > -1,
		reply		: queries.indexOf("reply") > -1,
	};

	// check product exists
	try {
		const result = await model.ProductModel.findById(productId).exec();

		if (!result) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_INVALID_PARAMETERS,
				resHandler.ApiResponse.RESULT_FAIL,
				"invalid parameters");
		}
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving product\n", err);

	}

	for (const i in objProjection) {
		if (!objProjection[i]) {
			delete objProjection[i];
		}
	}

	// make db query
	let dbQuery = model.CommentModel.find({
		product: productId,
	}, objProjection);

	if (objProjection["product"]) {
		dbQuery = dbQuery.populate("product");
	}
	if (objProjection["author"]) {
		dbQuery = dbQuery.populate("author");
	}
	if (objProjection["tastes"]) {
		dbQuery = dbQuery.populate("tastes");
	}

	try {
		const result = await dbQuery.exec();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK,
			"",
			{
				name: "comments",
				obj: result,
			});
	}
	catch (err) {
		console.log("[mongodb] error occurred while retrieving comments by product\n", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Comment update API
 * 
 * Path: /{commentId}/update
 * Method: PUT
 * 
 * Request
 * @param commentId string required "_id" 
 * @body rate number required rate score
 * @body content.text string required text contents
 * @body content.images string[] required array of "_id" field
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function updateComment(req: express.Request, id: string) {
	const productId		= id;
	const rate = (req.body as any)["rate"];
	const content = (req.body as any)["content"];

	try {
		const product = await model.CommentModel.findById(productId).exec();

		if (!product) {
			console.log("[mongodb] product not found");

			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		(product as any)["rate"] = rate;
		(product as any)["content"]["text"] = (content as any)["text"];
		(product as any)["content"]["images"] = (content as any)["images"];
		
		await product.save();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred retrieve comment\n", err);
		
		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}

/**
 * Comment deletion API
 * 
 * Path: /{commentId}/delete
 * Method: DELETE
 * 
 * Request
 * @param commentId string required "_id" field of comment
 * 
 * Response
 * @body result string required result of request
 * @body message string optional message about result
 */
export async function deleteComment(req: express.Request, id: string) {
	const commentId = id;

	try {
		const product = await model.CommentModel.findById(commentId).exec();

		if (!product) {
			return new resHandler.ApiResponse(
				resHandler.ApiResponse.CODE_NOT_FOUND,
				resHandler.ApiResponse.RESULT_FAIL,
				"not found");
		}

		const authorId = product["author"];
		
		await product.remove();

		// remove the comment from the author's written comments list
		await model.UserModel.findByIdAndUpdate(authorId,
		{
			$pull: {
				comments: {
					_id: product["_id"],
				},
			},
		}).exec();

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_OK,
			resHandler.ApiResponse.RESULT_OK);
	}
	catch (err) {
		console.log("[mongodb] error occurred while deleting comment\n", err);

		return new resHandler.ApiResponse(
			resHandler.ApiResponse.CODE_SERVER_FAULT,
			resHandler.ApiResponse.RESULT_ERROR,
			"server fault");
	}
}
