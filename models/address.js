var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var addressSchema=new mongoose.Schema({
	isdefault:{ type: Boolean, default: true },
	name:String,
	username:String,
	address2:String,
	landmark:String,
	City:String,
	Pin:Number,
	contact:Number,
	delivery:{ 
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Deliverynoti'
	},
	isseen:{ type: Boolean, default: false }
});
addressSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Address", addressSchema);