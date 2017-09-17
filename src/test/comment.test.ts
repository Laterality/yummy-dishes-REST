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
 * 1. Create user who will write comment
 * 2. Create Category
 * 3. Register product which will have comment
 * 4. Create taste
 * 5. Create a comment
 * 6. Retrieve comments with product id - check if has product has comment
 * 7. Update a comment
 * 8. Delete a comment
 * 9. Delete taste
 * 10. Delete product
 * 11. Delete category
 * 12. Delete user
 */
chai.use(chaiAsPromised);
describe("Test comment API", () => {
	let user: any;
	let category: any;
	let product: any;
	let taste: any;
	let comment: any;

	it("1. Create user whil whill write comment", (done) => {
		xmplUser.createUserExample()
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			user = response["user"];
			done();
		});
	});

	it("2. Create category", (done) => {
		xmplProduct.createCategoryExample()
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			category = response["category"];
			done();
		});
	});

	it("3. Register product which will have comment", (done) => {
		xmplProduct.createProductExample(category["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			product = response["product"];
			done();
		});
	});

	it("4. Create taste", (done) => {
		xmplTaste.createTasteExample()
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			taste = response["taste"];
			done();
		});
	});

	it("5. Create a comment", (done) => {
		xmplComment.createCommentExample(user["_id"], product["_id"], [taste["_id"]])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			comment = response["comment"];
			done();
		});
	});

	it("6. Retrieve comment with product id", (done) => {
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

	it("7. Update a comment", (done) => {
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

	it("8. Delete a comment", (done) => {
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

	it("9. Delete taste", (done) => {
		xmplTaste.deleteTasteExample(taste["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("10. Delete product", (done) => {
		xmplProduct.deleteProductExample(product["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("11. Delete category", (done) => {
		xmplProduct.deleteCategoryExample(category["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("12. Delete user", (done) => {
		xmplUser.deleteUserExample(user["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});
});
