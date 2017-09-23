/**
 * Order API Exmaples
 * 
 * Author: Jin-woo Shin
 * Date: 2017-09-23
 */
import * as request from "request-promise-native";

import { config } from "../config";

export async function createOrderExample(idOrderer: string) {
	const date = new Date();
	return request({
		uri: config.test.baseurl + `/order/register`,
		method: "POST",
		body: {
			date_to_receive: date.setDate(date.getDate() + 7),
			orderer: idOrderer,
			additional: "some additional content of order",
		},
		json: true,
	}).promise();
}

export async function retrieveOrderExample(idOrder: string) {
	return request({
		uri: config.test.baseurl + `/order/${idOrder}`,
		method: "GET",
		qs: {
			q: "date_ordered,orderer,products",
		},
		json: true,
	}).promise();
}

export async function retrieveOrderByUserExample(idUser: string) {
	return request({
		uri: config.test.baseurl + `/user/${idUser}/orders`,
		method: "GET",
		qs: {
			q: "date_ordered,date_to_receive,products",
		},
		json: true,
	}).promise();
}

export async function updateOrderExample(idOrder: string, state: string) {
	return request({
		uri: config.test.baseurl + `/order/${idOrder}/update`,
		method: "PUT",
		body: {
			state,
		},
		json: true,
	}).promise();
}

export async function deleteOrderExample(idOrder: string) {
	return request({
		uri: config.test.baseurl + `/order/${idOrder}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}
