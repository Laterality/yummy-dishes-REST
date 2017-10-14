import * as request from "request-promise-native";

import { config } from "../config";

export async function createNoticeExample(idUser: string) {
	return request({
		uri: config.test.baseurl + "/notice/register",
		method: "POST",
		body: {
			title: "some notice title",
			category: "NOTICE",
			content: "some notice content",
			author: idUser,
		},
		json: true,
	}).promise();
}

export async function retrieveNoticeExample(idNotice: string) {
	return request({
		uri: config.test.baseurl + `/notice/${idNotice}`,
		method: "GET",
		json: true,
	}).promise();
}

export async function retrieveNoticesExample(dateFrom?: Date, dateTo?: Date) {
	const qs: any = {};
	if (dateFrom) { qs["from"] = `${dateFrom.getUTCFullYear()}-${dateFrom.getUTCMonth() + 1 < 10 ? "0" : ""}${dateFrom.getUTCMonth() + 1}-${dateFrom.getUTCDate() < 10 ? "0" : ""}${dateFrom.getUTCDate()}`; }
	if (dateTo) { qs["to"] = `${dateTo.getUTCFullYear()}-${dateTo.getUTCMonth() + 1 < 10 ? "0" : ""}${dateTo.getUTCMonth() + 1}-${dateTo.getUTCDate() < 10 ? "0" : ""}${dateTo.getUTCDate()}`; }

	return request({
		uri: config.test.baseurl + `/notice/notices`,
		method: "GET",
		qs,
		json: true,
	}).promise();
}

export async function updateNoticeExample(idNotice: string, body?: any) {
	return request({
		uri: config.test.baseurl + `/notice/${idNotice}/update`,
		method: "PUT",
		body,
		json: true,
	}).promise();
}

export async function deleteNoticeExample(idNotice: string) {
	return request({
		uri: config.test.baseurl + `/notice/${idNotice}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}
