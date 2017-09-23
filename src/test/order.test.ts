/**
 * Order API Test
 * 
 * Author: Jin-woo Shin
 * Date: 2017-09-23
 */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as xmplBucket from "./bucket.examples";
import * as xmplProduct from "./category-product.examples";
import * as xmplOrder from "./order.examples";
import * as xmplUser from "./user.exmaples";

chai.use(chaiAsPromised);

/**
 * Test scenario
 * 
 * 1. Create Order
 * 2. Retrieve Order
 * 3. Retrieve Order by User
 * 4. Update Order state
 * 5. Update Order wrong state
 * 6. Delete Order
 */
describe("Test Order API", () => {
	let userCreated: any;
	let categoryCreated: any;
	const productsCreated: any[] = [];
	const ordersCreated: any[] = [];

	// Pre-test
	before((done: any) => {
		xmplUser.createUserExample()
		.then((responseUserCreation: any) => {
			userCreated = responseUserCreation["user"];
			xmplProduct.createCategoryExample()
			.then((responseCategoryCreation: any) => {
				categoryCreated = responseCategoryCreation["category"];
				xmplProduct.createProductExample(categoryCreated["_id"])
				.then((responseProductCreation1: any) => {
					productsCreated.push(responseProductCreation1["product"]);
					xmplProduct.createProductExample(categoryCreated["_id"])
					.then((responseProductCreation2: any) => {
						productsCreated.push(responseProductCreation2["product"]);
						done();
					});
				});
			});
		});
	}); // #before

	it("1. Create Order", (done: any) => {
		xmplBucket.addBucketItemExmaple(userCreated["_id"], productsCreated[0]["_id"], 2)
		.then(() => {
			xmplBucket.addBucketItemExmaple(userCreated["_id"], productsCreated[1]["_id"], 3)
			.then(() => {
				xmplOrder.createOrderExample(userCreated["_id"])
				.then((responseOrderCreation: any) => {
					chai.expect(responseOrderCreation["result"]).to.equal("ok");
					ordersCreated.push(responseOrderCreation["order"]);

					xmplBucket.addBucketItemExmaple(userCreated["_id"], productsCreated[0]["_id"], 1)
					.then(() => {
						xmplBucket.addBucketItemExmaple(userCreated["_id"], productsCreated[1]["_id"], 2)
						.then(() => {
							xmplOrder.createOrderExample(userCreated["_id"])
							.then((responseOrderCreation2: any) => {
								chai.expect(responseOrderCreation2["result"]).to.equal("ok");
								ordersCreated.push(responseOrderCreation2["order"]);
								done();
							});
						});
					});
				});
			});
		});
	}); // #it

	it("2. Retrieve Order", (done: any) => {
		xmplOrder.retrieveOrderExample(ordersCreated[0]["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("3. Retrieve Order by User", (done: any) => {
		xmplOrder.retrieveOrderByUserExample(userCreated["_id"])
		.then((response: any) => {
			chai.expect(response["orders"]["length"]).to.equal(2);
			done();
		});
	});

	it("4. Update Order state", (done: any) => {
		xmplOrder.updateOrderExample(ordersCreated[0]["_id"], "processing")
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			xmplOrder.updateOrderExample(ordersCreated[1]["_id"], "rejected")
			.then((response2: any) => {
				chai.expect(response2["result"]).to.equal("ok");
				done();
			});
		});
	});

	it("5. Update Order wrong state", (done: any) => {
		xmplOrder.updateOrderExample(ordersCreated[1]["_id"], "processing")
		.catch((err: any) => {
			chai.expect(err["statusCode"]).to.equal(405);
			done();
		});
	});

	it("6. Delete Order", (done: any) => {
		xmplOrder.deleteOrderExample(ordersCreated[0]["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			xmplOrder.deleteOrderExample(ordersCreated[1]["_id"])
			.then((response2: any) => {
				chai.expect(response2["result"]).to.equal("ok");
				xmplOrder.retrieveOrderExample(ordersCreated[0]["_id"])
				.catch((err: any) => {
					chai.expect(err["statusCode"]).to.equal(404);
					xmplOrder.retrieveOrderExample(ordersCreated[1]["_id"])
					.catch((err2: any) => {
						chai.expect(err2["statusCode"]).to.equal(404);
						xmplOrder.retrieveOrderByUserExample(userCreated["_id"])
						.then((response3: any) => {
							chai.expect(response3["orders"]["length"]).to.equal(0);
							done();
						});
					});
				});
			});
		});
	});

	// Post-test
	after((done: any) => {
		xmplProduct.deleteProductExample(productsCreated[0]["_id"])
		.then(() => {
			xmplProduct.deleteProductExample(productsCreated[1]["_id"])
			.then(() => {
				xmplProduct.deleteCategoryExample(categoryCreated["_id"])
				.then(() => {
					xmplUser.deleteUserExample(userCreated["_id"])
					.then(() => {
						done();
					});
				});
			});
		});
	}); // #after
});
