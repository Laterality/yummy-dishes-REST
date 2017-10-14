/**
 * Sale Info API Test
 * 
 * Author: Jin-woo Shin
 * Date: 2017-10-14
 */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as xmplProduct from "./category-product.examples";
import * as xmplSaleInfo from "./saleinfo.examples";

chai.use(chaiAsPromised);

/**
 * Test scenario
 * bef. create products
 * 1. Create sale info
 * 2. Retrieve sale info by id
 * 3. Retrieve sale info by date
 * 4. Update sale info
 * 5. Begin time sale
 * 6. Delete sale info
 * af. delete products
 */
describe("Test SaleInfo API", () => {
	const createdProducts: any[] = [];

	let createdCategory: any;
	let createdSaleInfo: any;

	// bef. create products
	before((done: any) => {
		xmplProduct.createCategoryExample()
		.then((res: any) => {
			createdCategory = res["category"];
			xmplProduct.createProductExample(createdCategory["_id"])
			.then((resProd1: any) => {
				createdProducts.push(resProd1["product"]);

				xmplProduct.createProductExample(createdCategory["_id"])
				.then((resProd2: any) => {
					createdProducts.push(resProd2["product"]);

					xmplProduct.createProductExample(createdCategory["_id"])
					.then((resProd3: any) => {
						createdProducts.push(resProd3["product"]);

						done();
					});
				});
			});
		});
	}); // #before

	// 1. Create sale info
	it("1. Create sale info", (done: any) => {
		const prods: any[] = [];
		for (const i of createdProducts) {
			prods.push(i["_id"]);
		}
		xmplSaleInfo.createSaleInfoExample(prods)
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			createdSaleInfo = res["saleInfo"];

			// check blocking duplicated creation
			xmplSaleInfo.createSaleInfoExample(prods.slice(1))
			.catch((err: any) => {
				chai.expect(err.statusCode).to.equal(409);
				done();
			});
		});
	});
	// 2. Retrieve sale info by id
	it("2. Retrieve sale info by id", (done: any) => {
		xmplSaleInfo.retrieveSaleInfoExample(createdSaleInfo["_id"])
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			chai.expect(res["saleInfo"]["_id"]).to.equal(createdSaleInfo["_id"]);
			done();
		});
	});
	// 3. Retrieve sale info by date
	it("3. Retrieve sale info by date", (done: any) => {
		xmplSaleInfo.retrieveSaleInfoByDateExample(new Date(), false)
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			chai.expect(res["saleInfo"]["_id"]).to.equal(createdSaleInfo["_id"]);
			done();
		});
	});
	// 4. Update sale info
	it("4. Update saale info", (done: any) => {
		const prods = [
			createdProducts[0]["_id"],
			createdProducts[2]["_id"],
		];
		xmplSaleInfo.updateSaleInfoExample(createdSaleInfo["_id"], prods)
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");

			// check products list has been modified successfully
			xmplSaleInfo.retrieveSaleInfoExample(createdSaleInfo["_id"])
			.then((res2: any) => {
				chai.expect(res2["saleInfo"]["prods_today"].length).to.equal(prods.length);
				done();
			});
		});
	});
	// 5. Begin time sale
	it("5. Begin time sale", (done: any) => {
		const prods = [
			createdProducts[1]["_id"],
			createdProducts[2]["_id"],
		];
		xmplSaleInfo.beginTimeSaleExample("20", prods)
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			done();
		});
	});
	// 6. Delete sale info
	it("6. Delte sale info", () => {
		xmplSaleInfo.deleteSaleInfoExample(createdSaleInfo["_id"])
		.then((res: any) => {
			chai.expect(res["result"]).to.equal("ok");
			xmplSaleInfo.retrieveSaleInfoExample(createdSaleInfo["_id"])
			.catch((err: any) => {
				chai.expect(err.statusCode).to.equal(404);
				chai.expect(err.error["message"]).to.equal("not found(saleInfo)");
			});
		});
	});

	after((done: any) => {
		xmplProduct.deleteProductExample(createdProducts[0]["_id"])
		.then(() => {
			xmplProduct.deleteProductExample(createdProducts[1]["_id"])
			.then(() => {
				xmplProduct.deleteProductExample(createdProducts[2]["_id"])
				.then(() => {
					xmplProduct.deleteCategoryExample(createdCategory["_id"])
					.then(() => {
						done();
					});
				});
			});
		});
	}); // #after
});
