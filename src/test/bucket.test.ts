/**
 * Bucket API Test
 * 
 * Author: Jin-woo Shin
 * Date: 2017-09-22
 */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as xmplBucket from "./bucket.examples";
import * as xmplProduct from "./category-product.examples";
import * as xmplUser from "./user.exmaples";

chai.use(chaiAsPromised);

/**
 * Test scenario
 * 
 * Pre. crate user, category, product
 * 1. add item bucket
 * 2. update bucket item
 * 3. delete item from bucket
 * Post. delete product, category, user
 */
describe("Test Bucket API", () => {
	let createdUser: any;
	let createdCategory: any;
	let createdProduct: any;

	// Pre-test 
	before((done: any) => {
		xmplUser.createUserExample()
		.then((response1: any) => {
			createdUser = response1["user"];

			xmplProduct.createCategoryExample()
			.then((response2: any) => {
				createdCategory = response2["category"];

				xmplProduct.createProductExample(createdCategory["_id"])
				.then((response3: any) => {
					createdProduct = response3["product"];
					done();
				});
			});
		});

	});

	// 1. add item bucket
	it("1. Add item bucket", (done: any) => {
		xmplBucket.addBucketItemExmaple(createdUser["_id"], createdProduct["_id"], 1)
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");

			xmplUser.retrieveUserExmaple(createdUser["_id"], "bucket")
			.then((responseSecond: any) => {
				chai.expect(responseSecond["result"]).to.equal("ok");
				
				const ids = [];
				for (const c in responseSecond["user"]["bucket"]) {
					ids.push(responseSecond["user"]["bucket"][c]["product"]);
				}
				chai.expect(ids).to.deep.include(createdProduct["_id"]);
				done();
			});
		});
	});

	// 2. update bucket item
	it("2. Update bucket item", (done: any) => {
		xmplBucket.updateBucketItemExample(createdUser["_id"], createdProduct["_id"], 4)
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");

			xmplUser.retrieveUserExmaple(createdUser["_id"], "bucket")
			.then((responseSecond: any) => {
				for (const c in responseSecond["user"]["bucket"]) {
					if (responseSecond["user"]["bucket"][c]["_id"] === createdProduct["_id"]) {
						chai.expect(responseSecond["user"]["bucket"][c]["quantity"] === 4);
					}
				}
				done();
			});
		});
	});

	// 3. delete item from bucket
	it("3. Delete item from bucket", (done: any) => {
		xmplBucket.deleteBucketItem(createdUser["_id"], createdProduct["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			
			// check is bucket array is empty
			xmplUser.retrieveUserExmaple(createdUser["_id"], "bucket")
			.then((responseSecondary: any) => {
				chai.expect(responseSecondary["user"]["bucket"]["length"]).to.equal(0);
				done();
			});
		});
	});

	// Post-test
	after((done: any) => {
		xmplProduct.deleteProductExample(createdProduct["_id"])
		.then(() => {
			xmplProduct.deleteCategoryExample(createdCategory["_id"])
			.then(() => {
				xmplUser.deleteUserExample(createdUser["_id"])
				.then(() => {
					done();
				});
			});
		});
		
	});
});
