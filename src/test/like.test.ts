/**
 * Like API Test
 * 
 * Author: Jin-woo Shin
 * Date: 2017-09-24
 */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as xmplProd from "./category-product.examples";
import * as xmplLike from "./like.example";
import * as xmplUser from "./user.exmaples";

chai.use(chaiAsPromised);

/**
 * Test scenario
 * 
 * 1. Like Product
 * 2. Unlike Product
 */
describe("Test Like API", () => {
	let userCreated: any;
	let categoryCreated: any;
	let productCreated: any;

	before((done: any) => {
		xmplUser.createUserExample()
		.then((responseUserCreation: any) => {
			userCreated = responseUserCreation["user"];

			xmplProd.createCategoryExample()
			.then((responseCategoryCreation: any) => {
				categoryCreated = responseCategoryCreation["category"];

				xmplProd.createProductExample(categoryCreated["_id"])
				.then((responseProductCreation: any) => {
					productCreated = responseProductCreation["product"];

					done();
				});
			});
		});
	});

	it("1. Like Product", (done: any) => {
		xmplLike.likeProductExample(userCreated["_id"], productCreated["_id"])
		.then((responseProductLike: any) => {
			chai.expect(responseProductLike["result"]).to.equal("ok");

			// check user's likes list has the product
			xmplUser.retrieveUserExmaple(userCreated["_id"], "likes")
			.then((responseUserRetrieval: any) => {
				chai.expect(responseUserRetrieval["user"]["likes"]["length"]).to.equal(1);

				// check product's like count has increased
				xmplProd.retrieveProductExample(productCreated["_id"], "cnt_like")
				.then((responseProductRetrieval: any) => {
					chai.expect(responseProductRetrieval["product"]["cnt_like"]).to.equal(1);

					// check duplicated likeness is blocked
					xmplLike.likeProductExample(userCreated["_id"], productCreated["_id"])
					.then(() => {
						chai.assert(false);
						done();
					})
					.catch((err: any) => {
						chai.expect(err.statusCode).to.equal(409);
						chai.expect(err.error["message"]).to.equal("already liked");
						done();
					});
				});
			});
		});
	});

	it("2. Unlike Product", (done: any) => {
		xmplLike.unlikeProductExample(userCreated["_id"], productCreated["_id"])
			.then((responseProductUnlike: any) => {
			chai.expect(responseProductUnlike["result"]).to.equal("ok");

			// check like cnt decreased
			xmplProd.retrieveProductExample(productCreated["_id"], "cnt_like")
			.then((responseProductRetrieval: any) => {
				chai.expect(responseProductRetrieval["product"]["cnt_like"]).to.equal(0);

				// check handling of non-liked product
				xmplLike.unlikeProductExample(userCreated["_id"], productCreated["_id"])
				.then(() => {
					chai.assert(false);
				})
				.catch((err: any) => {
					chai.expect(err.statusCode).to.equal(405);

					// check user's lkes list removed the product
					xmplUser.retrieveUserExmaple(userCreated["_id"], "likes")
					.then((responseUserRetrieval: any) => {
						chai.expect(responseUserRetrieval["user"]["likes"]["length"]).to.equal(0);

						done();
					});
				});
			});
		});
	});

	after((done: any) => {
		xmplProd.deleteProductExample(productCreated["_id"])
		.then(() => {
			xmplProd.deleteCategoryExample(categoryCreated["_id"])
			.then(() => {
				xmplUser.deleteUserExample(userCreated["_id"])
				.then(() => {
					done();
				});
			});
		});
	});
	
});
