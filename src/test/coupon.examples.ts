import * as request from "request-promise-native";
import { config } from "../config";

export async function createCouponExample(ownerId: string) {
	return request({
		uri: config.test.baseurl + "/coupon/register",
		method: "POST",
		body: {
			message: "coupon description",
			owner: ownerId,
		},
		json: true,
	}).promise();
}

export async function retrieveCouponByCouponNumber(couponNum: string) {
	return request({
		uri: config.test.baseurl + `/coupon/by-coupon-number?cn=${couponNum}`,
		method: "GET",
		json: true,
	}).promise();
}

export async function retrieveCouponsByUser(userId: string) {
	return request({
		uri: config.test.baseurl + `/user/${userId}/coupons`,
		method: "GET",
		json: true,
	}).promise();
}

export async function consumeCoupon(couponNum: string) {
	return request({
		uri: config.test.baseurl + `/coupon/consume?cn=${couponNum}`,
		method: "GET",
		json: true,
	}).promise();
}

export async function deleteCoupon(couponNum: string) {
	return request({
		uri: config.test.baseurl + `/coupon/delete?cn=${couponNum}`,
		method: "DELETE",
		json: true,
	}).promise();
}
