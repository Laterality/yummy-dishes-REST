import * as mongoose from "mongoose";

export const NoticeModel = mongoose.model("Notice", new mongoose.Schema({
	title: String,
	category: String,
	content: String,
}));

export const ImageModel = mongoose.model("Image", new mongoose.Schema({
	path: String,
	date_reg: {
		type: Date,
		default: Date.now,
	},
}));

export const CategoryModel = mongoose.model("Category", new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	products: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
	}],
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
	amount: {
		type: String,
		required: true,
	},
	ingredient: {
		type: String,
		required: true,
	},
	contents: [String],
	category: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
		required: true,
	},
	date_reg: {
		type: Date,
		default: Date.now,
	},
	cnt_like: {
		type: Number,
		default: 0,
	},
	avg_rate: {
		type: Number,
		default: 0,
	},
	images: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Image",
	}],
}).index({
	name: "text",
	ingredient: "text",
}));

export const SaleInfo = mongoose.model("SaleInfo", new mongoose.Schema({
	date_sale: {
		type: Date,
		default: Date.now,
	},
	prods_today: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
	}],
	timesale: {
		started: {
			type: Boolean,
			default: false,
		},
		ratio: {
			type: Number,
			default: 0,
		},
		prods: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
		}],
	},
}));

export const Comment = mongoose.model("Comment", new mongoose.Schema({
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
	},
	date_reg: {
		type: Date,
		default: Date.now,
	},
	rate: {
		type: Number,
		min: 0,
		max: 5,
	},
	tastes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Taste",
	}],
	content: {
		text: String,
		images: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image",
		}],
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
	orderer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
	products: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
	},
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
	coupon_num: Number,
	date_reg: {
		type: Date,
		default: Date.now,
	},
	date_expiration: Date,
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
	is_admin: {
		type: Boolean,
		default: false,
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
	access_token: {
		type: String,
		required: false,
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
	bucket: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
	}],
	tastes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Taste",
	}],
	likes: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
	}],
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Comment",
	}],
	coupons: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Coupon",
	}],
	cnt_reviewable: {
		type: Number,
		default: 0,
	},
	cnt_stamp: {
		type: Number,
		default: 0,
	},
}));
