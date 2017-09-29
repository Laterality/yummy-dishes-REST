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
	if (dateFrom) { qs["dateFrom"] = dateFrom; }
	if (dateTo) { qs["dateTo"] = dateTo; }

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
