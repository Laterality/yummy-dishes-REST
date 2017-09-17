import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as examples from "./user.exmaples";
// describe("get length", () =>
// {
// 	it('"abc"should have length 3', () => {
// 		getLength("abc").should.equal(3);
// 	});
// 	it('"" should have length 0', () => {
// 		getLength('').should.equal(0);
// 	})
// })
chai.use(chaiAsPromised);

describe("User REST API Test", () => {
	let createdUser: any;

	// duplicate test

	it("1. Create User", (done) => {
		examples.createUserExample()
		.then((response: any) => {
			createdUser = response["user"];
			chai.expect(response["result"]).to.equal("ok");
			chai.expect(response).to.have.property("user");
			done();
		});
	});

	it("2. Retrieve User", (done) => {
		examples.retrieveUserExmaple(createdUser["_id"])
		.then((response: any) => {
			// console.log("[test] retirved user response: \n", response);
			chai.expect(response["user"]["_id"]).to.equal(createdUser["_id"]);
			done();
		});
	});

	it("3. Check user duplication - should duplicated", (done) => {
		examples.duplicateCheckExample()
		.then((response: any) => {
			chai.expect(response["message"]).to.equal("duplicates");
			done();
		});
	});

	it("4. Sign in User", (done) => {
		examples.loginUserExample()
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("5. Update User", (done) => {
		examples.updateUserExample(createdUser["_id"])
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("6. Check user duplication - should not duplicated", (done) => {
		examples.duplicateCheckExample()
		.then((response: any) => {
			chai.expect(response["message"]).to.equal("not duplicates");
			done();
		});
	});

	it("7. Delete User", (done) => {
		examples.deleteUserExample(createdUser["_id"])
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");

			examples.retrieveUserExmaple(createdUser["_id"])
			.catch((err: any) => {
				chai.expect(err.statusCode).to.equal(404);
				chai.expect(err.error["message"]).to.equal("not found");
				done();
			});
		});
	});

});
