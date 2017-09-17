import * as request from "request-promise-native";
import { config } from "../config";

export async function createTasteExample() {
	return request({
		uri: config.test.baseurl + "/taste/register",
		method: "POST",
		body: {
			title: "test taste 1",
		},
		json: true,
	}).promise();
}

export async function retrieveTasteExample(tasteId: string) {
	return request({
		uri: config.test.baseurl + `/taste/${tasteId}`,
		method: "GET",
		json: true,
	}).promise();
}

export async function retrieveTastesExample() {
	return request({
		uri: config.test.baseurl + "/taste/tastes",
		method: "GET",
		json: true,
	}).promise();
}

export async function updateTasteExample(tasteId: string) {
	return request({
		uri: config.test.baseurl + `/taste/${tasteId}/update`,
		method: "PUT",
		body: {
			title: "modified taste title",
		},
		json: true,
	}).promise();
}

export async function deleteTasteExample(tasteId: string) {
	return request({
		uri: config.test.baseurl + `/taste/${tasteId}/delete`,
		method: "DELETE",
		json: true,
	}).promise();
}
