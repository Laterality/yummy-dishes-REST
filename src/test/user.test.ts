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

	it("user creation API", (done) => {
		examples.createUserExample()
		.then((response: any) => {
			createdUser = response["user"];
			chai.expect(response["result"]).to.equal("ok");
			chai.expect(response).to.have.property("user");
			done();
		});
	});

	it("user retrieve API", (done) => {
		examples.retrieveUserExmaple(createdUser)
		.then((response: any) => {
			// console.log("[test] retirved user response: \n", response);
			chai.expect(response["user"]["_id"]).to.equal(createdUser["_id"]);
			done();
		});
	});

	it("user duplication API - duplicated", (done) => {
		examples.duplicateCheckExample()
		.then((response: any) => {
			chai.expect(response["message"]).to.equal("duplicates");
			done();
		});
	});

	it("user login API", (done) => {
		examples.loginUserExample()
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("user update API", (done) => {
		examples.updateUserExample(createdUser)
		.then((response) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	it("user duplication API - not duplicated", (done) => {
		examples.duplicateCheckExample()
		.then((response: any) => {
			chai.expect(response["message"]).to.equal("not duplicates");
			done();
		});
	});

	it("user deletion API", (done) => {
		examples.deleteUserExample(createdUser)
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			done();
		});
	});

	// retrieve test
	// duplicates test
	it("user retrieve API", (done) => {
		examples.retrieveUserExmaple(createdUser)
		.then((response: any) => {
			chai.expect(response["message"]).to.equal("not found");
			done();
		})
		.catch((err: any) => {
			chai.expect(err.statusCode).to.equal(404);
			chai.expect(err.error["message"]).to.equal("not found");
			done();
		});
	});
});
