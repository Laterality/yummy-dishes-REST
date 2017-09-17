import * as request from "request-promise-native";

import { config } from "../config";

export async function createCategoryExample(): Promise<any> {
	return request({
		uri: config.test.baseurl + "/category/register",
		method: "POST",
		body: {
			name: "testCategory",
		},
		json: true,
	}).promise();
}

export async function retrieveCategoriesExample(): Promise<any> {
	return request({
		uri: config.test.baseurl + `/category/categories`,
		method: "GET",
		json: true,
	}).promise();
}

export async function retrieveProductsByCategory(catId: string): Promise<any> {
	return request({
		uri: config.test.baseurl + `/category/${catId}/products`,
		method: "GET",
		qs: {
			q: "amount,contents",
		},
		json: true,
	}).promise();
}

export async function updateCategoryExample(catId: string): Promise<any> {
	return request({
		uri: config.test.baseurl + `/category/${catId}/update`,
		method: "PUT",
		body: {
			name: "changedTestCategory",
		},
		json: true,
	}).promise();
}

export async function deleteCategoryExample(catId: string): Promise<any> {
	return request({
		uri: config.test.baseurl + `/category/${catId}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}

export async function createProductExample(catId: string): Promise<any> {
	return request({
		uri: config.test.baseurl + "/product/register",
		body: {
			name: "testProduct",
			price: 2000,
			amount: "2 servings(600g)",
			ingredient: "ingredient1, some special ingredient",
			contents: [
				"some contents",
				"ipsum lorem",
			],
			category: catId,
			image_ids: [],
		},
		json: true,
	}).promise();
}

export async function retrieveProductExample(productId: string): Promise<any> {
	return request({
		uri: config.test.baseurl + `/product/${productId}`,
		method: "GET",
		qs: {
			q: "amount,contents",
		},
		json: true,
	}).promise();
}

export async function updateProductExample(productId: string): Promise<any> {
	return request({
		uri: config.test.baseurl + `/product/${productId}/update`,
		method: "PUT",
		body: {
			name: "changed product name",
			price: 4500,
		},
		json: true,
	}).promise();
}

export async function deleteProductExample(productId: string): Promise<any> {
	return request({
		uri: config.test.baseurl + `/product/${productId}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}
