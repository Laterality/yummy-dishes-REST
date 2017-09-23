import * as request from "request-promise-native";

import { config } from "../config";

export async function createCommentExample(authorId: string, productId: string, tasteIds: string[]) {
	return request({
		uri: config.test.baseurl + "/comment/register",
		method: "POST",
		body: {
			author: authorId,
			product: productId,
			rate: 3,
			tastes: tasteIds,
			content: {
				text: "comment text content",
				images: [],
			},
		},
		json: true,
	}).promise();
}

export async function createReplyExample(commentId: string, authorId: string) {
	return request({
		uri: config.test.baseurl + `/comment/${commentId}/reply`,
		method: "POST",
		body: {
			author: authorId,
			content: "test reply content",
		},
		json: true,
	}).promise();
}

export async function retrieveCommentExample(commentId: string, query?: string) {
	return request({
		uri: config.test.baseurl + `/comment/${commentId}?q=${query ? query : "rate,content"}`,
		method: "GET",
		json: true,
	}).promise();
}

export async function retrieveCommentsByProductExample(productId: string) {
	return request({
		uri: config.test.baseurl + `/product/${productId}/comments?q=rate,content`,
		method: "GET",
		json: true,
	}).promise();
}

export async function updateCommentExample(commentId: string) {
	return request({
		uri: config.test.baseurl + `/comment/${commentId}/update`,
		method: "PUT",
		body: {
			rate: 5,
			content: {
				text: "modified comment content",
			},
		},
		json: true,
	}).promise();
}

export async function deleteCommentExample(commentId: string) {
	return request({
		uri: config.test.baseurl + `/comment/${commentId}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}
