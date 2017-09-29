import * as request from "request-promise-native";

import { config } from "../config";

export async function createUserExample(): Promise<any> {
	try {
		return await request({
			uri: config.test.baseurl + "/user/register",
			method: "POST",
			body: {
				email: "dolor@sit.com",
				password: "p@ssW0rd",
				username: "JohnDoe",
				login_type: "native",
				phone_number: "01012345678",
				age: 20,
				device_id: "",
			},
			json: true,
		}).promise();
	}
	catch (err) {
		console.log("[test] error occurred while creating user,\n", err);

		throw new Error(err);
	}
}

export async function retrieveUserExmaple(userId: string, query?: string): Promise<any> {
	try {
		return request({
			uri: config.test.baseurl + `/user/${userId}`,
			method: "GET",
			qs: {
				q: query ? query : "phone_number,date_reg",
			},
			json: true,
		}).promise();
	}
	catch (err) {
		console.log("[test] error occurred while retrieving user,\n", err);

		throw new Error(err);
	}
}

export async function loginUserExample(): Promise<any> {
	try {
		return await request({
			uri: config.test.baseurl + `/user/login`,
			method: "POST",
			body: {
				email: "dolor@sit.com",
				password: "p@ssW0rd",
				login_type: "native",
			},
			json: true,
		}).promise();
	}
	catch (err) {
		console.log("[test] error occurred while user signing in,\n");

		throw new Error(err);
	}
}

export async function updateUserExample(userId: string): Promise<any> {
	try {
		return await request({
			uri: config.test.baseurl + `/user/${userId}/update`,
			method: "PUT",
			body: {
				email: "changed@mail.com",
			},
			json: true, 
		}).promise();
	}
	catch (err) {
		console.log("[test] error occurred while updating user,\n", err);

		throw new Error(err);
	}
}

export async function deleteUserExample(userId: string): Promise<any> {
	try {
		return await request({
			uri: config.test.baseurl + `/user/${userId}/delete`,
			method: "DELETE",
			json: true,
		}).promise();
	}
	catch (err) {
		console.log("[test] error occurred while deleting user, \n", err);
		// statusCode - code , error - body
		throw new Error(err);
	}
}

export async function duplicateCheckExample(): Promise<any> {
	try {
		return request({
			uri: config.test.baseurl + "/user/is/duplicates",
			method: "GET",
			qs: {
				where: "email",
				value: "dolor@sit.com",
			},
			json: true,
		}).promise();
	}
	catch (err) {
		console.log("[test] error occurred while checking duplication, \n", err);

		throw new Error(err);
	}
}

export async function updateUserToAdminExample(idUser: string) {
	return request({
		uri: config.test.baseurl + `/user/${idUser}/adminize`,
		method: "PUT",
		json: true,
	}).promise();
}
