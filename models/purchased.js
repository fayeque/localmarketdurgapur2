var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var purchasedSchema = new mongoose.Schema({
	pprice:String,
	prname:String,
	customername:String,
	iscancelled:{type:Boolean,default:false},
	isreturned:{type:Boolean,default:false}
	// username:String,
	// address2:String,
	// landmark:String,
	// City:String,
	// Pin:Number,
	// contact:Number,
});

module.exports = mongoose.model("Purchased",purchasedSchema);