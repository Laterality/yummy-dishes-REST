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

export async function retrieveProductsByCategory(cat: any): Promise<any> {
	return request({
		uri: config.test.baseurl + `/category/${cat["_id"]}/products`,
		method: "GET",
		qs: {
			q: "amount,contents",
		},
		json: true,
	}).promise();
}

export async function updateCategoryExample(cat: any): Promise<any> {
	return request({
		uri: config.test.baseurl + `/category/${cat["_id"]}/update`,
		method: "PUT",
		body: {
			name: "changedTestCategory",
		},
		json: true,
	}).promise();
}

export async function deleteCategoryExample(cat: any): Promise<any> {
	return request({
		uri: config.test.baseurl + `/category/${cat["_id"]}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}

export async function createProductExample(cat: any): Promise<any> {
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
			category: cat["_id"],
			image_ids: [],
		},
		json: true,
	}).promise();
}

export async function retrieveProductExample(prod: any): Promise<any> {
	return request({
		uri: config.test.baseurl + `/product/${prod["_id"]}`,
		method: "GET",
		qs: {
			q: "amount,contents",
		},
		json: true,
	}).promise();
}

export async function updateProductExample(prod: any): Promise<any> {
	return request({
		uri: config.test.baseurl + `/product/${prod["_id"]}/update`,
		method: "PUT",
		body: {
			name: "changed product name",
			price: 4500,
		},
		json: true,
	}).promise();
}

export async function deleteProductExample(prod: any): Promise<any> {
	return request({
		uri: config.test.baseurl + `/product/${prod["_id"]}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}
