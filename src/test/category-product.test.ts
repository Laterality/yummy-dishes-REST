import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as examples from "./category-product.examples";

chai.use(chaiAsPromised);

describe(("Category and Product REST API Test"), () => {
	let createdCategory: any;
	let createdProduct: any;

	it("1. Create Category", (done: any) => {
		examples.createCategoryExample()
		.then((response: any) => {
			createdCategory = response["category"];
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("2. Retrieve Category", (done: any) => {
		examples.retrieveCategoriesExample()
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			// chai.expect(response["categories"]).to.contain(createdCategory);
			chai.assert((response["categories"] as any[])
			.find((obj: any, index: number, arr: any[]): boolean => {
				return obj["_id"] === createdCategory["_id"] &&
					obj["name"] === createdCategory["name"];
			}));
			done();
		});
	});

	it("3. Update Category", (done: any) => {
		examples.updateCategoryExample(createdCategory["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			createdCategory["name"] = "changedTestCategory";
			
			examples.retrieveCategoriesExample()
			.then((retrieveResponse: any) => {
				chai.expect(retrieveResponse["result"]).to.equal("ok");
				// chai.expect(retrieveResponse["categories"]).to.contain(createdCategory);
				chai.assert((retrieveResponse["categories"] as any[])
				.find((obj: any, index: number, arr: any[]): boolean => {
					return obj["_id"] === createdCategory["_id"] &&
						obj["name"] === createdCategory["name"];
				}));
				done();
			});
		});
	});

	it("4. Create Product", (done: any) => {
		examples.createProductExample(createdCategory["_id"])
		.then((response: any) => {
			createdProduct = response["product"];
			chai.expect(response["result"]).to.equal("ok");
			chai.expect(createdProduct["category"]).to.equal(createdCategory["_id"]);
			done();
		});
	});

	it("5. Check if Product included in category", (done: any) => {
		examples.retrieveProductsByCategory(createdCategory["_id"])
		.then((response: any) => {
			chai.assert((response["category"]["products"] as any[])
			.find((obj: any, index: number, arr: any[]): boolean => {
				return obj["_id"] === createdProduct["_id"];
			}));
			done();
		});
	});

	it("6. Retrieve Product", (done: any) => {
		examples.retrieveProductExample(createdProduct["_id"])
		.then((response: any) => {
			chai.expect(response["product"]["_id"]).to.equal(createdProduct["_id"]);
			done();
		});
	});

	it("7. Update Product", (done: any) => {
		examples.updateProductExample(createdProduct["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");

			examples.retrieveProductExample(createdProduct["_id"])
			.then((retrieveResponse: any) => {
				chai.expect(retrieveResponse["product"]["name"]).not.to.equal(createdProduct["name"]);
				done();
			});
		});
	});

	it("8. Delete Product", (done: any) => {
		examples.deleteProductExample(createdProduct["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");

			examples.retrieveProductExample(createdProduct["_id"])
			.catch((err: any) => {
				chai.expect(err.statusCode).to.equal(404);
				done();
			});
		});
	});

	it("9. Delete category", (done: any) => {
		examples.deleteCategoryExample(createdCategory["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");

			examples.retrieveProductsByCategory(createdCategory["_id"])
			.catch((err: any) => {
				chai.expect(err.statusCode).to.equal(404);
				done();
			});
		});
	});

});
