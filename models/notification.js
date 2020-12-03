var mongoose=require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var notificationSchema = new mongoose.Schema({
	username: String,
	prname:String,
	prprice:String,
	userid:String,
	usernotificationid:String,
	url:String,
	author:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
    		ref: 'Usernotification'
		},
		username:String
	},
	isRead: { type: Boolean, default: false }
});

module.exports = mongoose.model("Notification", notificationSchema);