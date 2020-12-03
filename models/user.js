var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var userSchema=new mongoose.Schema({
	username:{type:Number,required:true},
	name:{type:String,required:true},
	email:{type:String,unique:true,required:true},
	otp:String,
	followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'Shopkeeper'
    	}
    ],
	notifications:[
			{
			type: mongoose.Schema.Types.ObjectId,
    		ref: 'Usernotification'
			}
	],
	cart:[
		{
			type: mongoose.Schema.Types .ObjectId,
    		ref: 'Usernotification'
		}
	],
	totalprice:Number,
	address:[
		{
			type: mongoose.Schema.Types.ObjectId,
    		ref: 'Address'
		}
	],
	purchasedproducts:[
		{
			type: mongoose.Schema.Types.ObjectId,
    		ref: 'Deliverynoti'
		}
	],
	cancel:[
	{
			type: mongoose.Schema.Types.ObjectId,
    		ref: 'Deliverynoti'
		}
	],
	usernoti:[
		{
			type: mongoose.Schema.Types.ObjectId,
    		ref: 'Usernotification'
		}
	],
	report:Number,
	isblocked:{type:Boolean,default:false},
	category:{type:String,default:"User"}
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);