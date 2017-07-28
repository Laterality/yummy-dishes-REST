import * as mongoose from "mongoose";

export const ImageModel = mongoose.model("Image", new mongoose.Schema({
	path: String,
}));

export const NoticeModel = mongoose.model("Notice", new mongoose.Schema({
	title: String,
	category: String,
	content: String,
}));

export const CategoryModel = mongoose.model("Category", new mongoose.Schema({
	name: String,
	products: [mongoose.Types.ObjectId],
}));

export const ProductModel = mongoose.model("Product", new mongoose.Schema({
	name: String,
	ingredients: [String],
	category: mongoose.Types.ObjectId,
	date_reg: {
		type: Number,
		default: Date.now,
	},
	cnt_likes: Number,
	image: String,
}));

export const SaleInfo = mongoose.model("SaleInfo", new mongoose.Schema({
	date_sale: {
		type: Date,
		default: Date.now,
	},
	prods_today: [mongoose.Types.ObjectId],
	timesale: {
		started: {
			type: Boolean,
			default: false,
		},
		ratio: {
			type: Number,
			default: 0,
		},
		prods: [mongoose.Types.ObjectId],
	},
}));

export const Comment = mongoose.model("Comment", new mongoose.Schema({
	author: mongoose.Types.ObjectId,
	product: mongoose.Types.ObjectId,
	date_reg: {
		type: Date,
		default: Date.now,
	},
	rate: {
		type: Number,
		min: 0,
		max: 5,
	},
	taste: [mongoose.Types.ObjectId],
	content: {
		text: String,
		images: [mongoose.Types.ObjectId],
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
	orderer: mongoose.Types.ObjectId,
	products: mongoose.Types.ObjectId,
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
	},
	password: String,
	salt: String,
	login_type: {
		type: String,
		lowercase: true,
		enum: ["none", "google"],
	},
	phone_number: String,
	date_reg: {
		type: Date,
		defaulat: Date.now,
	},
	age: Number,
	accept_push: {
		accepted: Boolean,
		date_accepted: Date,
	},
	accept_privacy: {
		accepted: Boolean,
		date_accepted: Date,
	},
	bucket: [mongoose.Types.ObjectId],
	tastes: [mongoose.Types.ObjectId],
	likes: [mongoose.Types.ObjectId],
	comments: [mongoose.Types.ObjectId],
	coupons: [mongoose.Types.ObjectId],
	cnt_reviewable: {
		type: Number,
		default: 0,
	},
	cnt_stamps: {
		type: Number,
		default: 0,
	},
}));
