/**
 * Comment API Test
 * Author: Jin-woo Shin
 * Date: 2017-09-16
 */

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as xmplProduct from "./category-product.examples";
import * as xmplComment from "./comment.examples";
import * as xmplTaste from "./taste.examples";
import * as xmplUser from "./user.exmaples";

/**
 * Test scenario:
 * 
 * 1. Create a comment
 * 2. Retrieve comments with product id - check if has product has comment
 * 3. Update a comment
 * 4. Delete a comment
 */
chai.use(chaiAsPromised);
describe("Test comment API", () => {
	let user: any;
	let category: any;
	let product: any;
	let taste: any;
	let comment: any;

	before((done: any) => {
		xmplUser.createUserExample()
		.then((response) => {
			user = response["user"];
			xmplProduct.createCategoryExample()
			.then((response2) => {
				category = response2["category"];
				xmplProduct.createProductExample(category["_id"])
				.then((response3) => {
					product = response3["product"];
					xmplTaste.createTasteExample()
					.then((response4) => {
						taste = response4["taste"];
						done();
					});
				});
			});
		});
	});

	it("1. Create a comment", (done) => {
		xmplComment.createCommentExample(user["_id"], product["_id"], [taste["_id"]])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			comment = response["comment"];
			done();
		});
	});

	it("2. Retrieve comment with product id", (done) => {
		xmplComment.retrieveCommentsByProductExample(product["_id"])
		.then((response) => {
			xmplComment.retrieveCommentsByProductExample(product["_id"])
			.then((retrieveResponse) => {
				chai.expect(retrieveResponse["result"]).to.equal("ok");
				chai.expect(retrieveResponse["comments"].length).to.equal(1);
				done();
			});
		});
	});

	it("3. Update a comment", (done) => {
		xmplComment.updateCommentExample(comment["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			
			xmplComment.retrieveCommentExample(comment["_id"])
			.then((retrieveResponse) => {
				chai.expect(retrieveResponse["result"]).to.equal("ok");
				chai.expect(retrieveResponse["comment"]["_id"])
				.to.equal(comment["_id"]);
				chai.expect(retrieveResponse["comment"]["content"]["text"]).not.to.equal(comment["content"]["text"]);
				done();
			});
		});
	});

	it("4. Delete a comment", (done) => {
		xmplComment.deleteCommentExample(comment["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");

			xmplComment.retrieveCommentExample(comment["_id"])
			.catch((err) => {
				chai.expect(err.statusCode).to.equal(404);
				chai.expect(err.error["message"]).to.equal("not found");
				done();
			});
		});
	});

	after((done: any) => {
		xmplTaste.deleteTasteExample(taste["_id"])
		.then(() => {
			xmplProduct.deleteProductExample(product["_id"])
			.then(() => {
				xmplProduct.deleteCategoryExample(category["_id"])
				.then(() => {
					xmplUser.deleteUserExample(user["_id"])
					.then((response) => {
						done();
					});
				});
			});
		});
	});
});
