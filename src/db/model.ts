import * as mongoose from "mongoose";

export const NoticeModel = mongoose.model("Notice", new mongoose.Schema({
	title: String,
	category: String,
	content: String,
}));

export const ImageModel = mongoose.model("Image", new mongoose.Schema({
	path: String,
}));

export const CategoryModel = mongoose.model("Category", new mongoose.Schema({
	name: String,
	products: [mongoose.Schema.Types.ObjectId],
}));

export const ProductModel = mongoose.model("Product", new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	ingredients: [String],
	category: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	date_reg: {
		type: Number,
		default: Date.now,
	},
	cnt_like: {
		type: Number,
		default: 0,
	},
	rate_avg: {
		type: Number,
		default: 0,
	},
	image: mongoose.Schema.Types.ObjectId,
}));

export const SaleInfo = mongoose.model("SaleInfo", new mongoose.Schema({
	date_sale: {
		type: Date,
		default: Date.now,
	},
	prods_today: [mongoose.Schema.Types.ObjectId],
	timesale: {
		started: {
			type: Boolean,
			default: false,
		},
		ratio: {
			type: Number,
			default: 0,
		},
		prods: [mongoose.Schema.Types.ObjectId],
	},
}));

export const Comment = mongoose.model("Comment", new mongoose.Schema({
	author: mongoose.Schema.Types.ObjectId,
	product: mongoose.Schema.Types.ObjectId,
	date_reg: {
		type: Date,
		default: Date.now,
	},
	rate: {
		type: Number,
		min: 0,
		max: 5,
	},
	tastes: [mongoose.Schema.Types.ObjectId],
	content: {
		text: String,
		images: [mongoose.Schema.Types.ObjectId],
	},
}));

export const OrderModel = mongoose.model("Order", new mongoose.Schema({
	date_ordered: {
		type: Date,
		default: Date.now,
	},
	date_to_receive: {
		type: Date,
		default: Date.now,
	},
	orderer: mongoose.Schema.Types.ObjectId,
	products: mongoose.Schema.Types.ObjectId,
	state: {
		type: String,
		enum: ["pending", "processing", "receiving", "received", "rejected"],
	},
	additional: String,
	price_total: Number,
}));

export const TasteModel = mongoose.model("Taste", new mongoose.Schema({
	text: String,
}));

export const CouponModel = mongoose.model("Coupon", new mongoose.Schema({
	cpon_num: Number,
	date_reg: Number,
	date_expiration: Number,
	message: String,
	available: Boolean,
}));

export const UserModel = mongoose.model("User", new mongoose.Schema({
	email: {
		type: String,
		trim: true,
		lowercase: true,
		unique: true,
		required: true,
	},
	username: {
		type: String,
		trim: true,
		unique: true,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	salt: {
		type: String,
		required: true,
	},
	login_type: {
		type: String,
		lowercase: true,
		enum: ["native", "google"],
		required: true,
	},
	phone_number: {
		type: String,
		required: true,
	},
	date_reg: {
		type: Date,
		defaulat: Date.now,
	},
	age: {
		type: Number,
		required: true,
	},
	device_id: {
		type: String,
	},
	accept_push: {
		accepted: {
			type: Boolean,
			default: true,
		},
		date_accepted: {
			type: Date,
			default: Date.now,
		},
	},
	accept_privacy: {
		accepted: {
			type: Boolean,
			default: true,
		},
		date_accepted: {
			type: Date,
			default: Date.now,
		},
	},
	bucket: [mongoose.Schema.Types.ObjectId],
	tastes: [mongoose.Schema.Types.ObjectId],
	likes: [mongoose.Schema.Types.ObjectId],
	comments: [mongoose.Schema.Types.ObjectId],
	coupons: [mongoose.Schema.Types.ObjectId],
	cnt_reviewable: {
		type: Number,
		default: 0,
	},
	cnt_stamp: {
		type: Number,
		default: 0,
	},
}));
