var mongoose=require("mongoose");
var productSchema=mongoose.Schema({
	product_name:String,
	product_price:Number,
	shopkeeper:{
		id:{
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'Shopkeeper'
		},
		name:String,
	},
	lastupdate:{type:Date,default:Date.now}
})
module.exports = mongoose.model("Product", productSchema);