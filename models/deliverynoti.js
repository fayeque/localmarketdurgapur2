var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var deliverynotiSchema=new mongoose.Schema({
	isseen:{type:Boolean,default:false},
	customercancelseen:{type:Boolean,default:false},
	deliverycancelseen:{type:Boolean,default:false},
	userid:String,
	shopkeeperid:String,
	username:String,
	useraddress:String,
	shopkeepername:String,
	shopkeeperaddress:String,
	prname:String,
	prprice:Number,
	policy:String,
	israted:{type:Boolean,default:false},
	// isreplaceable:String,
	// isrefundable:String,
	isorderallseen:{type:Boolean,default:false},
	isprocessed:{type:Boolean,default:false},
	returnreason:String,
	replacereason:String,
	isorderseen:{type:Boolean,default:false},
	isdelivered:{type:Boolean,default:false},
	isreplaced:{type:Boolean,default:false},
	isreturned:{type:Boolean,default:false},
	returnedseen:String,
	replacedseen:String,
	shreturnedseen:{type:Boolean,default:false},
	shreplacedseen:{type:Boolean,default:false},
	ordertime:{type:Date,default:Date.now},
	deliverytime:{type:Date,default:Date.now}
});
deliverynotiSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("Deliverynoti", deliverynotiSchema);