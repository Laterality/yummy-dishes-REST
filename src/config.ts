export const config = {
	port: 3003,
	fcm_auth: "",
	https: {
		use: true,
		key: "PATH_TO_PRIVATE_KEY",
		cert: "PATH_TO_PUBLIC_KEY",
	},
	db: {
		uri: "MONGODB_URI",

	},
	path_public: "/home/server/apps/public/img", // definite path
	test: {
		baseurl: "http://trailblazer.latera.kr/yd/api/v1",
	},
};
