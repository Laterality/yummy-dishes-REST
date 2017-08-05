export const config = {
	port: 3003,
	https: {
		use: true,
		key: "PATH_TO_PRIVATE_KEY",
		cert: "PATH_TO_PUBLIC_KEY",
	},
	db: {
		uri: "MONGODB_URI",

	},
	path_public: "public",
};
