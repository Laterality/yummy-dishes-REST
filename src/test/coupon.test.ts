/**
 * coupon API Test
 * Author: jin-woo Shin
 * Date: 2017-09-14
 */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as xmplCoupon from "./coupon.examples";
import * as xmplUser from "./user.exmaples";

chai.use(chaiAsPromised);

/**
 * Test Scenario:
 * 
 * 1. create user to be owner of coupon
 * 2. create coupon with user as a owner
 * 3. retrieve coupon by coupon number - check if the coupon retrieved
 * 4. retreive coupon by user - check includes the coupon
 * 5. consume coupon
 * 6. delete coupon
 * 7. delete user
 */
describe("Coupon REST API Test", () => {
	let user: any;
	let cpn: any;

	it("1. Create user to be owner", (done) => {
		xmplUser.createUserExample()
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			user = response["user"];
			done();
		});
	});

	it("2. Create coupon", (done) =>
	{
		xmplCoupon.createCouponExample(user["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			cpn = response["coupon"];
			done();
		});
	});

	it("3. Retrieve coupon with coupon number", (done) => {
		xmplCoupon.retrieveCouponByCouponNumber(cpn["coupon_num"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			chai.expect(response["coupon"]["_id"]).to.equal(cpn["_id"]);
			done();
		});
	});

	it("4. Retrieve coupon with user id", (done) => {
		xmplCoupon.retrieveCouponsByUser(user["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			chai.assert(Array.isArray(response["coupons"]));
			const ids: string[] = [];
			for (const c in response["coupons"]) {
				ids.push((response["coupons"][c]["_id"]) as string);
			}
			chai.expect(ids).to.deep.include(cpn["_id"]);
			done();
		});
	});

	it("5. Consume coupon", (done) => {
		xmplCoupon.consumeCoupon(cpn["coupon_num"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");

			xmplCoupon.retrieveCouponByCouponNumber(cpn["coupon_num"])
			.then((retrieveResponse: any) => {
				chai.expect(retrieveResponse["result"]).to.equal("ok");
				chai.expect(retrieveResponse["coupon"]["available"]).to.equal(false);
				done();
			});
		});
	});

	it("6. Delete coupon", (done) => {
		xmplCoupon.deleteCoupon(cpn["coupon_num"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");

			xmplCoupon.retrieveCouponByCouponNumber(cpn["coupon_num"])
			.catch((err: any) => {
				chai.expect(err.statusCode).to.equal(404);
				chai.expect(err.error["message"]).to.equal("not found");
				done();
			});
		});
	});

	it("7. Delete user", (done) => {
		xmplUser.deleteUserExample(user["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});
});
