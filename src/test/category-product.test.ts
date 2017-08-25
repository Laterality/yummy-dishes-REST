import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as examples from "./category-product.examples";

chai.use(chaiAsPromised);

describe(("Category and Product REST API Test"), () => {
	let createdCategory: any;
	let createdProduct: any;

	it("category creation API", (done: any) => {
		examples.createCategoryExample()
		.then((response: any) => {
			createdCategory = response["category"];
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("category list retrieval API", (done: any) => {
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

	it("category update API", (done: any) => {
		examples.updateCategoryExample(createdCategory)
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			createdCategory["name"] = "changedTestCategory";
			done();
		});
	});

	it("check updated category", (done: any) => {
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

	it("production creation API", (done: any) => {
		examples.createProductExample(createdCategory)
		.then((response: any) => {
			createdProduct = response["product"];
			chai.expect(response["result"]).to.equal("ok");
			chai.expect(createdProduct["category"]).to.equal(createdCategory["_id"]);
			done();
		});
	});

	it("check product inclusion", (done: any) => {
		examples.retrieveProductsByCategory(createdCategory)
		.then((response: any) => {
			chai.assert((response["category"]["products"] as any[])
			.find((obj: any, index: number, arr: any[]): boolean => {
				return obj["_id"] === createdProduct["_id"];
			}));
			done();
		});
	});

	it("product retrieval API", (done: any) => {
		examples.retrieveProductExample(createdProduct)
		.then((response: any) => {
			chai.expect(response["product"]["_id"]).to.equal(createdProduct["_id"]);
			done();
		});
	});

	it("product update API", (done: any) => {
		examples.updateProductExample(createdProduct)
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("check updated product", (done: any) => {
		examples.retrieveProductExample(createdProduct)
		.then((response: any) => {
			chai.expect(response["product"]["name"]).not.to.equal(createdProduct["name"]);
			done();
		});
	});

	it("product deletion API", (done: any) => {
		examples.deleteProductExample(createdProduct)
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("check product deleted from category", (done: any) => {
		examples.retrieveProductExample(createdProduct)
		.catch((err: any) => {
			chai.expect(err.statusCode).to.equal(404);
			done();
		});
	});

	it("product deletion API", (done: any) => {
		examples.deleteCategoryExample(createdCategory)
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("check category deleted", (done: any) => {
		examples.retrieveProductsByCategory(createdCategory)
		.catch((err: any) => {
			chai.expect(err.statusCode).to.equal(404);
			done();
		});
	});
});
