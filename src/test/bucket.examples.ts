/**
 * Bucket API Examples
 * 
 * Author: Jin-woo Shin
 * Date: 2017-09-22
 */
import * as request from "request-promise-native";

import { config } from "../config";

export async function addBucketItemExmaple(userId: string, productId: string, quantity?: number) {
	return request({
		uri: config.test.baseurl + `/user/${userId}/add-bucket`,
		method: "POST",
		body: {
			product: productId,
			quantity: quantity ? quantity : 2,
		},
		json: true,
	}).promise();
}

export async function updateBucketItemExample(userId: string, productId: string, quantity: number) {
	return request({
		uri: config.test.baseurl + `/user/${userId}/update-bucket`,
		method: "PUT",
		body: {
			product: productId,
			quantity,
		},
		json: true,
	}).promise();
}

export async function deleteBucketItem(userId: string, productId: string) {
	return request({
		uri: config.test.baseurl + `/user/${userId}/delete-from-bucket`,
		method: "PUT",
		body: {
			product: productId,
		},
		json: true,
	});
}
