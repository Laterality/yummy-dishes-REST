import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";

import * as xmplNotice from "./notice.examples";
import * as xmplUser from "./user.exmaples";

chai.use(chaiAsPromised);

/**
 * Test scenario
 * 
 * 1. Create Notice
 * 2. Retrieve Notices
 * 3. Update Notice
 * 4. Delete Notice
 */
describe("Test Notice API", () => {
	let userCreated: any;
	const noticesCreated: any[] = [];
	const dates: Date[] = [];

	before((done: any) => {
		xmplUser.createUserExample()
		.then((response: any) => {
			userCreated = response["user"];
			xmplUser.updateUserToAdminExample(userCreated["_id"])
			.then(() => {
				done();
			});
		});
	});

	it("1. Create Notice", (done: any) => {
		xmplNotice.createNoticeExample(userCreated["_id"])
		.then((response1: any) => {
			chai.expect(response1["result"]).to.equal("ok");

			noticesCreated.push(response1["notice"]);
			dates.push(noticesCreated[0]["date_reg"]);

			xmplNotice.createNoticeExample(userCreated["_id"])
			.then((response2: any) => {
				chai.expect(response2["result"]).to.equal("ok");

				noticesCreated.push(response2["notice"]);

				done();
			});
		});
	});

	it("2. Retrieve Notices", (done: any) => {
		xmplNotice.retrieveNoticesExample()
		.then((response: any) => {
			chai.expect(response["result"]).to.equal("ok");
			chai.expect(response["notices"]["length"]).to.equal(2);

			done();
		});
	});

	it("3. Update Notice", (done: any) => {
		xmplNotice.updateNoticeExample(noticesCreated[0]["_id"], {
			content: "changed notice content",
		})
		.then((response1: any) => {
			chai.expect(response1["result"]).to.equal("ok");

			xmplNotice.retrieveNoticeExample(noticesCreated[0]["_id"])
			.then((response2: any) => {
				chai.expect(response2["notice"]["content"]).to.equal("changed notice content");

				done();
			});
		});
	});

	it("4. Delete Notice", (done: any) => {
		xmplNotice.deleteNoticeExample(noticesCreated[0]["_id"])
		.then((response1: any) => {
			chai.expect(response1["result"]).to.equal("ok");

			xmplNotice.deleteNoticeExample(noticesCreated[1]["_id"])
			.then((response2: any) => {
				chai.expect(response2["result"]).to.equal("ok");

				xmplNotice.retrieveNoticeExample(noticesCreated[0]["_id"])
				.catch((err: any) => {
					chai.expect(err.statusCode).to.equal(404);
					done();
				});
			});
		});
	});

	after((done: any) => {
		xmplUser.deleteUserExample(userCreated["_id"])
		.then(() => {
			done();
		});
	});
});
