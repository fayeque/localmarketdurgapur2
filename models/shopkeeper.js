var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var shopkeeperSchema=new mongoose.Schema({
	username:{type:Number,required:true},
	name:{type:String,required:true},
	category:String,
	email:{type:String,unique:true,required:true},
	shopkeeperaddress:String,
	tempuserid:String,
	otp:String,
	notifications: [
    {
   		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Notification'
    }
    ],
	availability:[
	{
   		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Availabilitynoti'
    }
	],
	orders:[
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
	deliveredorders:[
				{
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Usernotification'
		}
	],
	returned: [
	{
   		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Deliverynoti'
    }
	],
	replaced: [
	{
   		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Deliverynoti'
    }
	],
	rating: {type: Number,default:0},
	ratingcount:{type: Number,default:0},
	overallrating:{type: Number,default:0},
	address: [
	{
	type: mongoose.Schema.Types.ObjectId,
	ref: 'Address'
	}
	]
});
shopkeeperSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Shopkeeper", shopkeeperSchema);