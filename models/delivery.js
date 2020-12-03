var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var deliverySchema=new mongoose.Schema({
	username:Number,
	name:String,
	email:String,
	notifications: [
    {
   		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Deliverynoti'
    }
    ],
	returned:[
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
	replaced: [
	{
   		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Deliverynoti'
    }
	]
});
deliverySchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Delivery", deliverySchema);