/**
 * Sale Info API Examples
 * 
 * Author: Jin-woo Shin
 * Date: 2017-10-14
 */
import * as request from "request-promise-native";

import { config } from "../config";

// create
// retrieve
// retrieve as list
// update
// delete
// begin timesale
export async function createSaleInfoExample(prods: string[]) {
	return request({
		uri: config.test.baseurl + `/saleinfo/register`,
		method: "POST",
		body: {
			prods,
		},
		json: true,
	}).promise();
}

export async function retrieveSaleInfoExample(id: string) {
	return request({
		uri: config.test.baseurl + `/saleinfo/${id}`,
		method: "GET",
		json: true,
	}).promise();
}

export async function retrieveSaleInfoByDateExample(date?: Date, populate?: boolean) {
	const qs: any = {};
	if (date) {
		qs["date"] = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
	}
	if (populate !== undefined) {
		qs["populate"] = populate;
	}
	return request({
		uri: config.test.baseurl + `/saleinfo/by-date`,
		method: "GET",
		qs,
		json: true,
	}).promise();
}

export async function updateSaleInfoExample(id: string, prods: string[]) {
	return request({
		uri: config.test.baseurl + `/saleinfo/${id}/update`,
		method: "PUT",
		body: {
			prods,
		},
		json: true,
	}).promise();
}

export async function deleteSaleInfoExample(id: string) {
	return request({
		uri: config.test.baseurl + `/saleinfo/${id}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}

export async function beginTimeSaleExample(ratio: string, prods: string[]) {
	return request({
		uri: config.test.baseurl + `/timesale/begin`,
		method: "POST",
		body: {
			ratio,
			prods,
		},
		json: true,
	}).promise();
}
