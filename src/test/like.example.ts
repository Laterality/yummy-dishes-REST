import * as request from "request-promise-native";

import { config } from "../config";

export async function likeProductExample(idUser: string, idProduct: string) {
	return request({
		uri: config.test.baseurl + `/user/${idUser}/like`,
		method: "GET",
		qs: {
			prod: idProduct,
		},
		json: true,
	}).promise();
}

export async function unlikeProductExample(idUser: string, idProduct: string) {
	return request({
		uri: config.test.baseurl + `/user/${idUser}/unlike`,
		method: "GET",
		qs: {
			prod: idProduct,
		},
		json: true,
	}).promise();
}
