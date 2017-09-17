/**
 * Taste API test
 * 
 * Author: Jin-woo Shin
 * Date: 2017-09-16
 */
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as xmplTaste from "./taste.examples";

/**
 * Test scenario:
 * 
 * 1. create taste
 * 2. retrieve taste list
 * 3. update taste
 * 4. delete taste
 */
chai.use(chaiAsPromised);
describe("Taste REST API Test", () => {
	let taste: any;

	it("1. Create Taste", (done) => {
		xmplTaste.createTasteExample()
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			taste = response["taste"];
			done();
		});
	});

	it("2. Retrieve Taste list", (done) => {
		xmplTaste.retrieveTastesExample()
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			let includes = false;
			for (const i in response["tastes"]) {
				if (response["tastes"][i]["_id"] === taste["_id"]) {
					includes = true;
					break;
				}
			}
			chai.assert(includes);
			done();
		});
	});

	it("3. Update Taste", (done) => {
		xmplTaste.updateTasteExample(taste["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");

			xmplTaste.retrieveTasteExample(taste["_id"])
			.then((retrieveResponse) => {
				chai.expect(retrieveResponse["result"]).to.equal("ok");
				chai.expect(retrieveResponse["taste"]["_id"]).to.equal(taste["_id"]);
				chai.expect(retrieveResponse["taste"]["title"]).not.to.equal(taste["title"]);
				done();
			});
		});
	});

	it("4. Delete Taste", (done) => {
		xmplTaste.deleteTasteExample(taste["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");

			xmplTaste.retrieveTasteExample(taste["_id"])
			.catch((err) => {
				chai.expect(err.statusCode).to.equal(404);
				chai.expect(err.error["message"]).to.equal("not found");
				done();
			});
		});
	});

});
