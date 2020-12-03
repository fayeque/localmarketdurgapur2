var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var availabilitynotiSchema =new mongoose.Schema({
	// isAvailable:{ type: Boolean, default: true },
	pprice:String,
	stock:Number,
	prname:String,
	shopkeeperid:String,
	shopkeepername:String,
	customerid:String,
	customername:String,
	description:String,
	policy:String,
	
	// username:String,
	// address2:String,
	// landmark:String,
	// City:String,
	// Pin:Number,
	// contact:Number,
	// shdetail:
	// 	{
	// 	type: mongoose.Schema.Types.ObjectId,
	// ref: 'Shopkeeper'
	// 	},
	overallrating:Number,
	ratingcount:Number,
	unid:String,
	isavailable:{ type: Boolean, default: false },
	isorderseen:{ type: Boolean, default: false },
	iscartseen:{ type: Boolean, default: false },
	isRead: { type: Boolean, default: false },
	ispurchased: { type: Boolean, default: false },
	lastupdate:{type:Date,default:Date.now}
});

module.exports = mongoose.model("Availabilitynoti", availabilitynotiSchema);