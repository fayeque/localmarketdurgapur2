var express          = require("express"),
	PORT			= process.env.PORT||7797,
    app              = express(), 
	twilio 			=  require('twilio')('AC7e437fe931c5e34834df385ac5c4a12c','ee8573663dde1b468be4990959f4d122'),
    bodyParser       = require("body-parser"),
    mongoose         = require("mongoose"),
    flash            = require("connect-flash"),
    passport         = require("passport"),
    LocalStrategy    = require("passport-local"),
    methodOverride   = require("method-override"),
	User			 = require("./models/user"),
	Shopkeeper		= require("./models/shopkeeper"),
	Notification	= require("./models/notification"),
	Usernotification	= require("./models/usernotification"),
	Product			 = require("./models/product"),
	Purchased		 = require("./models/purchased"),
	Delivery		 = require("./models/delivery"),
	Deliverynoti			 = require("./models/deliverynoti"),
	Address		= require("./models/address"),
	Availabilitynoti		= require("./models/availabilitynoti"),
	request			=require("request"),
	forever        =require("forever"),
	session			=require("express-session"),
	cookieParser	=require("cookie-parser"),
	MongoStore   =require("connect-mongo")(session),
	multer=require('multer'),
	sharp=require('sharp');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const messagebird = require('messagebird')('rsflpGXdH1NDR809L0tNmTsQ6');
var async = require("async");
// var nodemailer = require("nodemailer");
var crypto = require("crypto");
const ejsLint = require('ejs-lint');
const cheerio = require('cheerio');
	var moment=require("moment");

var api_key = 'a9b6573687dec263b8ccb6c8b33d7625-074fa10c-ebc1e87c';
var domain = 'sandboxa10d5c3652d04b19a95f13e25c578f70.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
 
  var TeleSignSDK = require('telesignsdk');

  const customerId = "0D7DB14C-889D-4ACE-A4F1-298C3DB709B3";
  const apiKey = "lRB9RIzH9Ipj+HZ+t7AUgaPSLR+YqP9nL7hSz8Mv/K86qVmo4HpefRvBcKQdmYd0yAOPD88VvkF6aVbT8x4W6w==";
  const rest_endpoint = "https://rest-api.telesign.com";
  const timeout = 10*1000; // 10 secs

  // const client = new TeleSignSDK( customerId,
  //     apiKey,
  //     rest_endpoint,
  //     timeout // optional
  //     // userAgent
  // );
const transporter=nodemailer.createTransport(sendgridTransport({
	auth:{
		api_key:'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'
	}
}))

app.locals.moment=require("moment");
mongoose.connect("mongodb+srv://localmkt:Fayeque123@cluster0-wl1fk.mongodb.net/test?retryWrites=true&w=majority",  {useNewUrlParser: true});
// mongoose.connect("mongodb://localhost/local_market",{useNewUrlParser: true});

mongoose.set('useNewUrlParser',true);
mongoose.set('useUnifiedTopology',true);
mongoose.set('useFindAndModify',false);
mongoose.set('useCreateIndex',true);

const fileStorage=multer.diskStorage({
	destination:(req,file,cb) => {
		cb(null,'images');
	},
	filename:(req,file,cb) => {
		cb(null,new Date().toISOString() + '-' + file.originalname);
	}
})
// const fileFilter=(req,file,cb) =>{
// 	if(file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==="image/jpeg"){
// 		cb(null,true);
// 	}else{
// 		cb(null,false);
// 	}
// }
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({storage:fileStorage}).array('image',2));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use('/images',express.static(__dirname + "/images"));
app.use(methodOverride("_method"));
app.use(flash());

app.use(cookieParser());
app.use(session({
    secret: "Once again Rusty wins horriest dog!",
    resave: false,
    saveUninitialized: false,
	store: new MongoStore({mongooseConnection: mongoose.connection}),
	cookie:{maxAge:60*60*1000}
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use('user',new LocalStrategy(User.authenticate()));
passport.use('shopkeeper',new LocalStrategy(Shopkeeper.authenticate()));
// passport.authenticate('user')(req,res,function(){
// 	res.redirect('/front');
// });
// passport.authenticate('shopkeeper')(req,res,function(){
// 	res.redirect('/shopkeeperfront');
// });

passport.serializeUser(function(user,done){
	done(null,user);
});
passport.deserializeUser(function(user,done){
	if(user!=null){
	done(null,user);
	}
});

// passport.serializeUser(Shopkeeper.serializeUser());
// passport.deserializeUser(Shopkeeper.deserializeUser());



// app.use(express.static(__dirname + "/public"))
// app.set("view engine","ejs");
app.use(async function(req,res,next){
	res.locals.currentShopkeeper = req.user;
	res.locals.currentUser = req.user;
 // if(req.user) {
 //    try {
 //      let shopkeeper = await Shopkeeper.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
 //      res.locals.notifications = shopkeeper.notifications;
 //    } catch(err) {
 //      console.log(err.message);
 //    }
 //   }
// if(res.locals.currentUser) {
//     try {
//       let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
//       res.locals.usernotifications = user.notifications;
//     } catch(err) {
//       console.log(err.message);
//     }
//    }
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});

//routes
app.get("/",isusershopIn,function(req,res){
	// Product.create({product_name:'Vu',product_price:4999},function(err,created){
	// 	if(err)
	// 		{
	// 			console.log(err)
	// 		}
	// 	else
	// 		{
	// 			console.log(created);
	// 		}
	// })
	if(req.user){

		User.findById(req.user._id,function(err,found){
			if(err){
				console.log(err);
			}
			else
				{
					// if(found.isblocked==true){
					// 	req.flash("Your account is blocked")
					// 	req.logout();
					// }
					// else{
					// console.log(found);
					Shopkeeper.find({},function(err,allSk){
				if(err)
				{
					console.log(err);
				}
				else
				{
					var i=allSk.length;
					var p=found.followers.length;
					// console.log(allSk[i]);
					// console.log(allSk.length);
					// console.log(found.followers.length);
					if(allSk.length != found.followers.length){
						var z=0;
						// console.log(found.followers.length);
						 allSk.forEach(function(allsks){
							 z++;
					// console.log(allsks._id);
							 // console.log(z);
							 if(z===i){
								 // console.log(z);
								 // console.log(allSk._id);
								 found.followers.push(allsks._id);
								 found.save();
								 // console.log(found);
								
							 }
						
					// console.log(user);
					 })
					}
					
					// res.render("front",{notification:found.notifications});
				}
			});
		}
				// }
	});
		User.findById(req.user._id).populate("notifications",null, {isRead:false}).populate("purchasedproducts").populate("cancel",null,{customercancelseen:false}).exec(function(err,user){
			if(err){
				console.log(err);
			}
			else
				{
					var len=user.notifications.length + user.cancel.length;
					res.render("front",{notification:user.notifications,cart:user.cart,order:user.purchasedproducts,user:user,cancel:user.cancel,length:len});
				}
				});
	}
	else
		{
	res.render("front",{length:0});
		}
	
});
//user forget logic
app.get("/customerforget",function(req,res){
	res.render("custforgetform");
});

app.post("/customerforget",function(req,res){
	User.findOne({email:req.body.email},function(err,user){
		if(err){
			console.log(err);
		}
		else{
			var otp=Math.floor(100000 + Math.random()*900000);
			var otps=otp.toString();
			// console.log(otp);
			// console.log(otps);
			user.otp=otps;
			user.save();
			// console.log(user);
			var number=user.username;
			const params = {
  'originator': 'MessageBird',
  'recipients': [
    number
  ],
    'body': otp
  };

  messagebird.messages.create(params, function (err, response) {
    if (err) {
      return console.log(err);
    }
    console.log(response);
  });
			
			
			
// var data = {
//   from: 'Localmarket <fayequehannan10@gmail.com>',
//   to: user.email,
//   subject: 'OTP from local market',
//   text: otp
// };
 
// mailgun.messages().send(data, function (error, body) {
// 	if(error){
// 		console.log(error);
// 	}
//   console.log(body);
// });
			req.flash("success","otp send to 7797571993" );
			res.render("resetotp.ejs",{user:user});
		}
	})
})
app.post("/verifyotp/:id",function(req,res){
	
	User.findById(req.params.id,function(err,user){
		if(err){
			console.log(err);
		}
		else{
			if(user.otp==req.body.otp){
				console.log("coming there");
				user.otp="";
				user.save();
				req.flash("success","otp verified");
				res.render("resetpassword.ejs",{user:user});
			}else{
				console.log("wronggg there");
				
				res.render("resetotp.ejs",{user:user});
				req.flash("error","wrong otp");
			}
		}
	})
})

app.post("/changepassword/:id",function(req,res){
	User.findById(req.params.id,function(err,user){
		if(err){
			console.log(err);
		}
		else{
			user.setPassword(req.body.password,function(err,userreset){
				if(err){
					console.log(err);
				}
				else{
					user.save();
					req.flash("success","password changed successfully");
					res.redirect("/userlogin");
				}
			})
		}
	})
})

// app.get("/twilio",function(req,res){
// 	twilio.messages.create({
// 	to: '+917699471520',
// 	from: '+18134341159',
//     body: 'hii your otp is 235698'
//    },function(err,data){
// 		if(err)
// 		console.log(err);
// 		console.log(data);
// 		res.send("/");
			
// 	})
  // .then(message => console.log(message.sid));


// Shopkeeper forget logic
app.get("/shopkeeperforget",function(req,res){
	res.render("shopforgetform.ejs");
});

app.post("/shopkeeperforget",function(req,res){
	Shopkeeper.findOne({email:req.body.email},function(err,shopkeeper){
		if(err){
			console.log(err);
		}
		else{
			var otp=Math.floor(100000 + Math.random()*900000);
			var otps=otp.toString();
			console.log(otp);
			console.log(otps);
			shopkeeper.otp=otps;
			shopkeeper.save();
			// console.log(user);
			var number=shopkeeper.username;
			const params = {
  'originator': 'MessageBird',
  'recipients': [
    number
  ],
    'body': otp
  };

  messagebird.messages.create(params, function (err, response) {
    if (err) {
      return console.log(err);
    }
    console.log(response);
  });
			
			
			
// var data = {
//   from: 'Localmarket <fayequehannan10@gmail.com>',
//   to: user.email,
//   subject: 'OTP from local market',
//   text: otp
// };
 
// mailgun.messages().send(data, function (error, body) {
// 	if(error){
// 		console.log(error);
// 	}
//   console.log(body);
// });
			req.flash("success","otp send to 7797571993" );
			res.render("shopkeeperresetotp.ejs",{shopkeeper:shopkeeper});
		}
	})
})
app.post("/shopkeeperverifyotp/:id",function(req,res){
	
	Shopkeeper.findById(req.params.id,function(err,shopkeeper){
		if(err){
			console.log(err);
		}
		else{
			if(shopkeeper.otp==req.body.otp){
				console.log("coming there");
				shopkeeper.otp="";
				shopkeeper.save();
				req.flash("success","otp verified");
				res.render("shopkeeperresetpassword.ejs",{shopkeeper:shopkeeper});
			}else{
				console.log("wronggg there");
				req.flash("error","wrong otp");
				res.render("shopkeeperresetotp.ejs",{shopkeeper:shopkeeper});
				
			}
		}
	})
})

app.post("/shopkeeperchangepassword/:id",function(req,res){
	Shopkeeper.findById(req.params.id,function(err,shopkeeper){
		if(err){
			console.log(err);
		}
		else{
			shopkeeper.setPassword(req.body.password,function(err,shopkeeperreset){
				if(err){
					console.log(err);
				}
				else{
					shopkeeper.save();
					req.flash("success","password changed successfully");
					res.redirect("/shopkeeperlogin");
				}
			})
		}
	})
})





app.get("/shopkeeper",function(req,res){
	// Product.create({product_name:'Vu',product_price:4999},function(err,created){
	// 	if(err)
	// 		{
	// 			console.log(err)
	// 		}
	// 	else
	// 		{
	// 			console.log(created);
	// 		}
	// }) 
	
			res.render("shopkeeper");
	
	
	
});
//signup routes
app.get("/register",function(req,res){
	res.render("register0.ejs",{message:req.flash("signup")});
})
app.get("/userregister",function(req,res){
	res.render("register.ejs");
});
app.post("/previousregister",function(req,res){
		var otp=Math.floor(100000 + Math.random()*900000);
			var otps=otp.toString();
			// console.log(otp);
			// console.log(otps);
	const data={username:req.body.username,name:req.body.name,email:req.body.email,otp:otp,report:0};
  // const params = {
  // 'originator': 'MessageBird',
  // 'recipients': [
  //   '+917903084194'
  // ],
  //   'body': otp
  // };

  // messagebird.messages.create(params, function (err, response) {
  //   if (err) {
  //     return console.log(err);
  //   }
  //   console.log(response);
  res.render("register2.ejs",{data:data});
  // });
	
})
app.get("/shopkeeperregister",function(req,res){
	// Delivery.create({username:123456789,name:"Admin",email:"fayequehannan@gmail.com"},function(err,created){
	// 							 if(err){
	// 							 console.log(err);
	// 							 }
	// 							 else{
	// 							 console.log(created);
	// 							 }
	// 							 });
	res.render("shopkeeperregister.ejs");
})
app.post("/register",function(req,res){
	
	User.findOne({email:req.body.email},function(err,founduser){
		if(err){
			console.log(err);
		}else{
			if(founduser){
				req.flash("error","E-mail is already registered");
				res.redirect("/userregister");
			}
			else{
	var newUser=new User({username:req.body.username,name:req.body.name,email:req.body.email,otp:"",report:0});
	// var userName=new User();
	// console.log(newUser);
	// console.log(User.findOne({username:"ronit"}).mobile);
	User.register(newUser,req.body.password,function(err,user){
	 	if(err)
			{
				console.log(err);
				req.flash("error","Mobile or email is already in use.");
				res.redirect("back");
	 		}
		else{
	 	passport.authenticate("user")(req,res,function(){
			req.flash("success","Successfully registered and logged in");
	 		// res.redirect("/");
					Shopkeeper.find({},function(err,allSk){
			if(err)
				{
					console.log(err);
				}
			else
				{
					allSk.forEach(function(allsks){
						// console.log(allsks._id);
						user.followers.push(allsks._id);
						// console.log(user);
					})
					
					user.save();
					transporter.sendMail({
						to:'fayequehannan@gmail.com',
						from:'fayequehannan10@gmail.com',
						subject:'Sign up to local market succeded',
						html:'<h1>You successfully signed up to local market</h1>'
					});
					res.redirect("/");
				}
		});
	 	});
		// console.log(req.user);
		}
	 });
		}
		}
	});
});
app.post("/shopkeeperregister",function(req,res){
	// var newUser=new User({username:req.body.username,mobile:req.body.mobile,email:req.body.email});
	// console.log(typeof(req.body.selectpicker));
	
	if(req.body.secretcode=="localmarket"){
		Shopkeeper.findOne({email:req.body.email},function(err,foundshopkeeper){
			if(err){
				console.log(err);
			}
			else{
				if(foundshopkeeper){
					req.flash("error","E-mail is already registered");
					res.redirect("/shopkeeperregister");
				}
				else{
					
	var newUser=new Shopkeeper({username:req.body.username,name:req.body.name,email:req.body.email,tempuserid:"",otp:"",category:req.body.selectpicker,shopkeeperaddress:req.body.address});
	// var userName=new User();
	// console.log(newUser);
	// console.log(User.findOne({username:"ronit"}).mobile);
	Shopkeeper.register(newUser,req.body.password,function(err,user){
	 	if(err)
			{
				console.log(err);
				req.flash("error",err.message);
				res.redirect("/shopkeeperregister");
	 		}
	 	passport.authenticate("shopkeeper")(req,res,function(){
			// console.log(err.message);
			req.flash("success","Successfully registered and logged in");
			// console.log(req.user);
	 		res.redirect("/shopkeeperloggedin");
	 	});
	 });
			}
		}
	})
	}
	else{
		req.flash("error","Please enter the correct secret code");
		res.redirect("/shopkeeperregister");
	}
	});
app.get("/login",function(req,res){
	res.render("login0.ejs");
})
app.get("/userlogin",function(req,res){
	res.render("loginform.ejs");
})
app.get("/shopkeeperlogin",function(req,res){
	res.render("shopkeeperlogin.ejs");
})
app.get("/error",function(req,res){
	req.flash("error","Mobile no. or password is incorrect");
		res.redirect("/userlogin");
});
app.post("/login",passport.authenticate("user",
	{
		
		 successRedirect:"/",
	// req.flash("success","successfully logged in");
		failureRedirect:"/error"
	}),function(req,res){
});
// app.get("/shopkeeperloggedin",isLoggedIn,function(req,res){
// 	console.log(req.user);
// 	Shopkeeper.findById(req.user._id).populate("notifications",null,{isRead:false}).populate("orders",null,{isorderallseen:false}).populate("availability",null,{isavailable:false}).populate("returned",null,{shreturnedseen:false}).populate("replaced",null,{shreplacedseen:false}).exec(function(err,foundsh){
// 		if(err){
// 			console.log(err);
// 		}
// 		else
// 			{
// 	var lensh=foundsh.notifications.length + foundsh.orders.length + foundsh.availability.length + foundsh.returned.length + foundsh.replaced.length;
// 				res.render("shopkeeper",{notifications:foundsh.notifications,order:foundsh.orders,availability:foundsh.availability,returned:foundsh.returned,replaced:foundsh.replaced,lensh:lensh});
// 			}
// 	})
// })

app.get("/shopkeeperloggedin",isLoggedIn,async function(req,res){
	try{
	const foundsh=await Shopkeeper.findById(req.user._id).populate("notifications",null,{isRead:false}).populate("orders",null,{isorderallseen:false}).populate("availability",null,{isavailable:false}).populate("returned",null,{shreturnedseen:false}).populate("replaced",null,{shreplacedseen:false}).exec();
	var lensh=foundsh.notifications.length + foundsh.orders.length + foundsh.availability.length + foundsh.returned.length + foundsh.replaced.length;
res.render("shopkeeper",{notifications:foundsh.notifications,order:foundsh.orders,availability:foundsh.availability,returned:foundsh.returned,replaced:foundsh.replaced,lensh:lensh});
	}catch(err){
		console.log(err);
		res.redirect("back");
	}
})

app.get("/shopkeepererror",function(req,res){
	req.flash("error","Mobile no. or password is incorrect");
	res.redirect("/shopkeeperlogin");
})
app.post("/shopkeeperlogin",passport.authenticate("shopkeeper",
	{
		
		 successRedirect:"/shopkeeperloggedin",
	// successFlash("success","successfully logged in"),
		failureRedirect:"/shopkeepererror"
	}),function(req,res){
});
// Forgot routes



app.get("/stockavailability/:shopkeeperid/:usernotiid/:id",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.params.shopkeeperid,function(err,foundsh){
		if(err){
			console.log(err);
		}
		else{
			Usernotification.findById(req.params.usernotiid,function(err,foundnoti){
				// foundnoti.isavailable=false;
				// foundnoti.save();
			Availabilitynoti.create({			pprice:foundnoti.pprice,stock:foundnoti.stock,prname:foundnoti.prname,shopkeeperid:foundnoti.shopkeeperid,shopkeepername:foundnoti.shopkeepername,customerid:foundnoti.customerid,description:foundnoti.description,policy:foundnoti.policy,overallrating:foundnoti.overallrating,ratingcount:foundnoti.ratingcount,unid:req.params.usernotiid
				},function(err,avnoti){;
				foundsh.tempuserid=req.params.id;
			foundsh.availability.push(avnoti._id);
			foundsh.save();
			req.flash("success","notification send to shopkeeper");
			res.redirect("/");
			console.log(`The availibility noti is here ----- ${avnoti}`);
		});
			})

		}
	})
})


app.get("/search",function(req,res){
	if(req.user){
		var url=req.query.search;
		var buttonbook=req.query.book;
		var buttonelectronics=req.query.electronics;
		var n=url.search(/http/i);
		if(n===-1){
			var pr_name_text=req.query.search;
			search(pr_name_text,0,url,req,res,buttonbook,buttonelectronics);
		}
	else{
		url=url.slice(n);
		var usernotificationid="";
		var f=url.search(/flipkart/i);
		var a=url.search(/amazon/i);
		var s=url.search(/snapdeal/i);
		var j=url.search(/jabong/i);
		var p=url.search(/paytm/i);
	if(f != -1){
		request(url,function(err,response,html){
			const $ = cheerio.load(html);
			const pr_name=$("._35KyD6");
			const pr_name_text=pr_name.text();
			const pr_price=$("._1vC4OE._3qQ9m1");
			const pr_price_text=pr_price.text();
			var pname ='"'+pr_name_text+'"';
			console.log(pr_name_text);
			search(pr_name_text,pr_price_text,url,req,res,buttonbook,buttonelectronics);
});
	}
		else if(s != -1){
			request(url,async function(err,response,html){
			try{
			const $ = await cheerio.load(html);
			const pr_name=await $("h1.pdp-e-i-head");
			const pr_name_text=pr_name.text();
			const pr_price=await $(".payBlkBig");
			const pr_price_text=pr_price.text();
			console.log(pr_name_text);
			console.log(pr_price_text);
			search(pr_name_text,pr_price_text,url,req,res,buttonbook,buttonelectronics);
			}catch(err){
				console.log(err);
			}
});
	}
		else if(p != -1){
					request(url,function(err,response,html){
			const $ = cheerio.load(html);
			const pr_name=$(".NZJI");
			const pr_name_text=pr_name.text();
			const pr_price=$("._1V3w");
			const pr_price_text=pr_price.text();
			console.log(pr_name_text);
			console.log(pr_price_text);
			search(pr_name_text,pr_price_text,url,req,res,buttonbook,buttonelectronics);
});
		}
		else if(j != -1){
			request(url,function(err,response,html){
			const $ = cheerio.load(html);
			const pr_name=$("._35KyD6");
			const pr_name_text=pr_name.text();
			const pr_price=$("._1vC4OE._3qQ9m1");
			const pr_price_text=pr_price.text();
			var pname ='"'+pr_name_text+'"';
			console.log(pr_name_text);
			search(pr_name_text,pr_price_text,url,req,res,buttonbook,buttonelectronics);	
});
		}
	}
}
else{
	req.flash("error","please login or signup first");
	res.redirect("/userlogin")
}
});




app.get("/shopkeepernotification",isLoggedIn,async function(req,res){
	try{
	const shopkeeper=await Shopkeeper.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
		res.render("shopkeepernotification",{notification:shopkeeper.notifications,id:shopkeeper._id});
	}catch(err){
		console.log(err);
	}
	
});
app.get("/report/:userid/:notificationid",isLoggedIn,function(req,res){
	User.findById(req.params.userid,function(err,found){
		if(err){
			console.log(err);
		}
		else{
			found.report++;
			console.log(found.report);

		if(found.report==10){
			console.log("commerr");
			
			found.isblocked=true;
		}
			Shopkeeper.findById(req.user._id,function(err,shopkeeper){
				if(err){
					console.log(err);
				}
				else{
			shopkeeper.notifications.remove(req.params.notificationid);
			shopkeeper.save();
			found.save();
			res.redirect("/shopkeepernotification");
				}
			})
			
		}
		;
	})
})



app.get("/shopkeeperavailability",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate('availability', null, { isavailable: false }).exec(function(err,shopkeeper){
		if(err)
			{
				console.log(err);
				res.redirect("back");
			}
		else{
			// console.log(shopkeeper);
			res.render("shopkeeperavailability",{notification:shopkeeper.availability,id:shopkeeper._id,userid:shopkeeper.tempuserid});
		}
	})
});
app.get("/shopkeeperreturned",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate('returned', null, { shreturnedseen:false }).exec(function(err,shopkeeper){
		if(err)
			{
				console.log(err);
				res.redirect("back");
			}
		else{
			// console.log(shopkeeper);
			shopkeeper.returned.forEach(function(shp){
				shp.shreturnedseen=true;
				shp.save();
			})
			res.render("shopkeeperreturned",{notification:shopkeeper.returned,id:shopkeeper._id,userid:shopkeeper.tempuserid});
		}
	})
});
app.get("/shopkeeperreplaced",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate('replaced', null, { shreplacedseen:false }).exec(function(err,shopkeeper){
		if(err)
			{
				console.log(err);
				res.redirect("back");
			}
		else{
			// console.log(shopkeeper);
			shopkeeper.replaced.forEach(function(shp){
				shp.shreplacedseen=true;
				shp.save();
			})
			res.render("shopkeeperreplaced",{notification:shopkeeper.replaced,id:shopkeeper._id,userid:shopkeeper.tempuserid});
		}
	})
});

app.get("/shopkeepercancelreplaced/:shopkeeperid/:deliverynotiid",isLoggedIn,function(req,res){
		Shopkeeper.findById(req.user._id).populate("replaced").populate("address").exec(function(err,foundsh){
		if(err){
			console.log(err);
		}
		else{
			Delivery.find({}).populate("replaced").exec(function(err,found){
				if(err){
					console.log(err);
				}
				else{
					// console.log(req.params.pastorderid);
					// console.log(found);
					found[0].cancel.push(req.params.deliverynotiid);
					Deliverynoti.findById(req.params.deliverynotiid,function(err,foundnoti){
						if(err){
							console.log(err);
						}
						else{
							foundnoti.replacedseen="done";
							foundnoti.save()
					found[0].replaced.remove(req.params.deliverynotiid);
					found[0].save();
					User.findById(foundnoti.userid,function(err,user){
						if(err){
							console.log(err);
						}
						else{
							// console.log(user);
							user.purchasedproducts.remove(foundnoti);
							user.cancel.push(foundnoti);
							user.save();
							req.flash("replacement request is cancel product will be rwturned");
							res.redirect("/shopkeeperloggedin");
						}
					})
						}
					})
				}
			})
		}
		})
})




app.get("/pastshopkeeperreturned",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate('returned', null, { shreturnedseen:true }).exec(function(err,shopkeeper){
		if(err)
			{
				console.log(err);
				res.redirect("back");
			}
		else{
			// console.log(shopkeeper);
			res.render("pastshopkeeperreturned",{notification:shopkeeper.returned,id:shopkeeper._id,userid:shopkeeper.tempuserid});
		}
	})
})
app.get("/pastshopkeeperreplaced",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate('replaced', null, { shreplacedseen:true }).exec(function(err,shopkeeper){
		if(err)
			{
				console.log(err);
				res.redirect("back");
			}
		else{
			// console.log(shopkeeper);
			res.render("pastshopkeeperreplaced",{notification:shopkeeper.replaced,id:shopkeeper._id,userid:shopkeeper.tempuserid});
		}
	})
})
app.get("/shopkeeper/:id/:notificationid",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.params.id,function(err,shopkeeper){
		if(err){
			console.log(err);
		}else{
			// console.log(req.params.notificationid);
			// console.log(shopkeeper);
			shopkeeper.notifications.remove(req.params.notificationid);
			shopkeeper.save();
			res.redirect("/shopkeepernotification");
		}
	})
})


app.post("/user/:id/:notificationid/:shopkeeperid",isLoggedIn,async function(req,res){
	var prprice=req.body.prprice;
	var stock=req.body.stock;
	var desc=req.body.description;
	// var image=req.files;
	var shopkeeperid=req.user.id;
	var shopkeepername=req.user.name;
	var policy=req.body.selectpicker;

	// const imageUrl1=image[0].path;
	// const imageUrl2=image[1].path;
	// console.log(imageUrl1);
	// console.log(imageUrl2);
	try{
	const foundnoti=await Notification.findById(req.params.notificationid);
	const sh=await Shopkeeper.findById(req.params.shopkeeperid); 		
	const usernoti=await Usernotification.create({pprice:prprice,stock:stock,prname:foundnoti.prname,shopkeeperid:req.params.shopkeeperid,shopkeepername:shopkeepername,customerid:req.params.id,description:desc,policy:policy,overallrating:sh.overallrating,ratingcount:sh.ratingcount});
		usernoti.shdetail=req.params.shopkeeperid;
		usernoti.save();
		// console.log(usernoti);
	const updatinguser=await User.findById(req.params.id).populate("notifications").exec();
				updatinguser.notifications.push(usernoti._id);
				updatinguser.save();
				foundnoti.isRead=true;
				foundnoti.save();
				req.flash("success","Response send successfully to user");
				res.redirect("/shopkeepernotification");
	}catch(err){
		console.log(err);
		res.redirect("back");
	}
});



app.post("/useravailability/:id/:notificationid/:avnotiid/:shopkeeperid/:userid",isLoggedIn,function(req,res){
	var prprice=req.body.prprice;
	var stock=req.body.stock;
	var desc=req.body.description;
	var shopkeeperid=req.user.id;
	var shopkeepername=req.user.name;
	var policy=req.body.selectpicker;
		Usernotification.findById(req.params.notificationid,function(err,founduserupdatenoti){
			if(err){
				console.log(err);
			}
			else{
				// console.log(founduserupdatenoti);
				
				founduserupdatenoti.pprice=prprice;
				founduserupdatenoti.stock=stock;
				founduserupdatenoti.desc=desc;
				founduserupdatenoti.policy=policy;
				// founduserupdatenoti.lastupdate=moment(founduserupdatenoti.lastupdate).fromNow();
				founduserupdatenoti.isavailable=true;
				founduserupdatenoti.shdetail=req.params.shopkeeperid;
				founduserupdatenoti.save();		
				// console.log(founduserupdatenoti);
				
Shopkeeper.findById(req.params.shopkeeperid,function(err,sh){
	if(err){
		console.log(err);
	}
	else{
	Availabilitynoti.findById(req.params.avnotiid,function(err,anid){
		if(err){
			console.log(err);
		}
		else{
			anid.isavailable=true;
			anid.save();

Usernotification.create({pprice:prprice,stock:stock,prname:founduserupdatenoti.prname,shopkeeperid:req.params.shopkeeperid,shopkeepername:shopkeepername,customerid:req.params.id,description:desc,policy:policy,overallrating:sh.overallrating,ratingcount:sh.ratingcount},function(err,usernoti){
				if(err){
					console.log(err);
				}
				else{
					// console.log(usernoti);
					usernoti.shdetail=sh._id;
					usernoti.save();
					User.findById(req.params.userid).populate("notifications").exec(function(err,updatinguser){
		if(err){
			console.log(err);
			req.flash("error",err.message);
			// res.redirect("back");
		}
		else
			{
				updatinguser.notifications.push(usernoti._id);
				updatinguser.save();
				req.flash("success","Response send successfully to user");
			res.redirect("/shopkeeperavailability");
				}
			});
		}
	});
		}
	});
	}
});
			// founduserupdatenoti.isavailable=true;
			// founduserupdatenoti.save();
			
			}
		});
});
		
		
		
app.get("/usernotification",isLoggedIn,function(req,res){
	User.findById(req.user._id).populate("notifications",null,{isRead:false}).exec(function(err,usernotification){
		if(err){
			console.log(err);
		}
		else
		{	
			usernotification.notifications.forEach(function(eachnoti){
				eachnoti.isRead=true;
			eachnoti.save();
			// console.log(eachnoti);
		});
			// console.log(usernotification);
				res.render("usernotification",{notification:usernotification.notifications});
				
		}
	})
})
app.get("/pastnotification",isLoggedIn,function(req,res){
	User.findById(req.user._id).populate("notifications").exec(function(err,user){
		if(err){
			console.log(err);
		}
		else
			{

				res.render("pastnotification",{notification:user.notifications});
			}
	})
})
app.get("/local",function(req,res){
		if(req.user){
			var url=req.query.search;
			if(url == ""){
				req.flash("error","Please enter the product to be searched");
				res.redirect("/");
			}
			else{
				const regex = new RegExp(escapeRegex(url), 'gi');
				Usernotification.find({"prname":regex}).populate("shdetail").exec(function(err,foundnoti){
					if(err){
						console.log(err);
					}
					else{
						const marr=(foundnoti.filter((v,i,a) => a.findIndex(t=>(t.shopkeepername===v.shopkeepername && t.prname===v.prname))===i));
						// console.log(marr);
						console.log("------------------------------------- here here here");
						console.log(marr);
						const smarr =marr.sort((a,b) => {
						return a.pprice-b.pprice;
						});
						res.render("localdata",{product:smarr,id:req.user._id});
							// console.log(foundnoti);
					}
				});
			}
		}
	else{
		req.flash("error","please login or signup first");
		res.redirect("/userlogin");
	}
	
});

app.get("/vieworders/:id",isLoggedIn,function(req,res){
	User.findById(req.params.id).populate("purchasedproducts").exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			console.log("-----------------------");
			// console.log(found);
			// console.log(found);
			// console.log(found.purchasedproduct[0]);
			// console.log(found.purchasedproduct[0].isdelivered);
			// console.log(found.purchasedproduct[0].id);
			// console.log(found.purchasedproduct[0].pprice);
			// console.log(found.purchasedproduct[0].prname);
			// console.log(found.purchasedproduct);
			// console.log(found.purchasedproducts);
			// console.log(found);
			res.render("yourorders",{orders:found});
		}
	})
})

app.get("/deliverynotis/:id/rating",function(req,res){
	Deliverynoti.findById(req.params.id,function(err,fd){
		res.render("rating",{did:fd});
	})
	
})
app.post("/deliverynotis/:id/rating",function(req,res){
		console.log(req.body.review.rating);
		Deliverynoti.findById(req.params.id,function(err,fd){
			fd.israted=true;
			fd.save();
		Shopkeeper.findById(fd.shopkeeperid,function(err,sh){
			sh.rating=sh.rating + parseInt(req.body.review.rating);
			sh.ratingcount++;
			var count=sh.ratingcount;
			sh.overallrating=sh.rating/count;
			sh.save();
			// console.log(sh);
		res.redirect("/")
		});
		});
})



app.get("/return/:deliverynotiid",function(req,res){
		res.render("reasonreturn",{deliverynotiid:req.params.deliverynotiid});
});

app.get("/replace/:deliverynotiid",function(req,res){
		res.render("reasonreplace",{deliverynotiid:req.params.deliverynotiid});
});



app.post("/returnit/:deliverynotiid",function(req,res){
	var text=req.body.posttext;
	Deliverynoti.findById(req.params.deliverynotiid,function(err,foundnoti){
		if(err){
			console.log(err);
		}
		else{
			foundnoti.isreturned=true;
			foundnoti.returnreason=text;
			foundnoti.returnedseen="return";
		Shopkeeper.findById(foundnoti.shopkeeperid,function(err,foundsh){
			if(err){
				console.log(err);
			}
			else{
				foundsh.returned.push(foundnoti._id);
				foundsh.orders.remove(foundnoti._id);
				foundsh.save();

			Delivery.find({},function(err,found){
				if(err){
					console.log(err);
				}
				else{
				found[0].returned.push(foundnoti._id);
				found[0].notifications.remove(foundnoti._id);
				found[0].save();
				foundnoti.save();
				req.flash("success","return request is sent");
				res.redirect("/");
				}
	
			})
	}
		})

		}
	})
})


app.post("/replaceit/:deliverynotiid",function(req,res){
	var text=req.body.posttext;
	Deliverynoti.findById(req.params.deliverynotiid,function(err,foundnoti){
		if(err){
			console.log(err);
		}
		else{
			foundnoti.isreplaced=true;
			foundnoti.replacereason=text;
			foundnoti.replacedseen="replace";
			Shopkeeper.findById(foundnoti.shopkeeperid,function(err,foundsh){
			if(err){
				console.log(err);
			}
			else{
				foundsh.replaced.push(foundnoti._id);
				foundsh.orders.remove(foundnoti._id);
				foundsh.save();
			Delivery.find({},function(err,found){
				if(err){
					console.log(err);
				}
				else{
				found[0].replaced.push(foundnoti._id);
				found[0].notifications.remove(foundnoti._id);
				found[0].save();
				foundnoti.save();
				req.flash("success","return request is sent");
				res.redirect("/");
				}
	
			})
			}
			})
		}
	})
})

// app.get("/showaddress/:usernotiid",function(req,res){
// 	User.findById(req.user._id).populate("notifications").exec(function(err,found){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			console.log(found.address.length);
// 			if(found.usernoti.length == 0){
// 				found.usernoti.push(req.params.usernotiid);
// 				found.save();
// 			}
			
			
// 			if(found.address.length != 0 ){
// 				res.render("viewcart",{user:found});
// 			}
// 			else{
// 				res.render("checkout");
// 			}
// 		}
// 	})
	
// })

app.post("/productbuy",isLoggedIn,function(req,res){
		var addressdetail={
	 username:req.body.address1,
	 address2:req.body.address2,
	 landmark:req.body.landmark,
	 City:req.body.city,
	 Pin:req.body.pin,
	 contact:req.body.contact,
	 name:req.body.name
	 }
		Address.create(addressdetail,function(err,created){
			if(err){
				console.log(err);
			}
			else{
				User.findById(req.user._id,function(err,found){
					if(err){
						console.log(err);
					}
					else{
						found.address.push(created);
						found.save();
						req.flash("success","address saved");
						res.redirect("back");
					}
				})
			}
		})
	
})
app.post("/buying/:userid/:usernotiid",isLoggedIn,function(req,res){
	User.findById(req.user._id).populate("notifications").populate("usernoti").exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			var address=req.body.name + " " + req.body.address1 + " " + req.body.address2 + " " + req.body.landmark + " " + req.body.City + " " + req.body.Pin + " " + req.body.contact;
			Usernotification.findById(req.params.usernotiid,function(err,foundusernoti){
				if(err){
					console.log(err)
				}
				else{
					Shopkeeper.findById(foundusernoti.shopkeeperid,function(err,foundsh){
				if(err){
					console.log(err);
				}
				else{
		Deliverynoti.create({username:found.name,useraddress:address,shopkeepername:foundsh.name,shopkeeperaddress:foundsh.shopkeeperaddress,prname:foundusernoti.prname,prprice:foundusernoti.pprice,policy:foundusernoti.policy,returnedseen:"notknown",replacedseen:"notknown",shopkeeperid:foundsh._id,userid:found._id},function(err,deliverynoti){
 							if(err){
								console.log(err);
							}
							else{
								// console.log(deliverynoti._id);
													// console.log(foundsh);
					foundsh.orders.push(deliverynoti._id);
					foundsh.address.push(req.params.addressid);
					foundusernoti.stock--;
					foundusernoti.save();
					if(foundusernoti.stock == 0){
						req.flash("error","out of stock");
						res.redirect("/");
					}
					foundsh.save();
								found.purchasedproducts.push(deliverynoti._id);
								found.usernoti.pop();
								found.save();
								Delivery.find({},function(err,delivery){
								if(err){
										console.log(err);
									}
 									else{
									delivery[0].notifications.push(deliverynoti._id);
									delivery[0].save();
									req.flash("success","order placed");
									res.redirect("/");
									}	
								});
				}
			})
		}
	})
				}
			})
			
		}
	})
	});
// app.get("/buying/:id/:addressid/:usernotiid",function(req,res){
// 	User.findById(req.params.id).populate("notifications").populate("usernoti").exec(function(err,found){
// 		if(err){
// 			console.log(err);
// 		}
// 		else{
// 		Address.findById(req.params.addressid,function(err,foundaddress){
// 		if(err){
// 			console.log(err);
// 		}else{
// 			var address=foundaddress.name + " " + foundaddress.username + " " + foundaddress.address2 + " " + foundaddress.landmark + " " + 						foundaddress.City + " " + foundaddress.Pin + " " + foundaddress.contact;
// 			Usernotification.findById(req.params.usernotiid,function(err,foundusernoti){
// 				if(err){
// 					console.log(err)
// 				}
// 				else{
// 					Shopkeeper.findById(foundusernoti.shopkeeperid,function(err,foundsh){
// 				if(err){
// 					console.log(err);
// 				}
// 				else{
// 		Deliverynoti.create({username:found.name,useraddress:address,shopkeepername:foundsh.name,shopkeeperaddress:foundsh.shopkeeperaddress,prname:foundusernoti.prname,prprice:foundusernoti.pprice,policy:foundusernoti.policy,returnedseen:"notknown",replacedseen:"notknown",shopkeeperid:foundsh._id,userid:found._id},function(err,deliverynoti){
//  							if(err){
// 								console.log(err);
// 							}
// 							else{
// 								console.log(deliverynoti._id);
// 													// console.log(foundsh);
// 					foundsh.orders.push(deliverynoti._id);
// 					foundsh.address.push(req.params.addressid);
// 					foundusernoti.stock--;
// 					foundusernoti.save();
// 					if(foundusernoti.stock == 0){
// 						req.flash("error","out of stock");
// 						res.redirect("/");
// 					}
// 					foundsh.save();
// 								found.purchasedproducts.push(deliverynoti._id);
// 								found.usernoti.pop();
// 								found.save();
// 								Delivery.find({},function(err,delivery){
// 								if(err){
// 										console.log(err);
// 									}
//  									else{
// 									delivery[0].notifications.push(deliverynoti._id);
// 									delivery[0].save();
// 									req.flash("success","order placed");
// 									res.redirect("/");
// 									}	
// 								});
// 				}
// 			})
// 		}
// 	})
// 				}
// 			})
			
// 		}
// 	})
// 		}
// })
// 	});
app.get("/buyproduct/:notificationid",isLoggedIn,function(req,res){
	User.findById(req.user._id).populate("notifications").exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			if(found.address.length != 0){
				res.render("viewcart2",{user:found,notiid:req.params.notificationid});
			}
			else{
				res.render("checkout");
			}
		}
	})
})
app.get("/buytheproduct/:id/:notificationid/:addressid",isLoggedIn,function(req,res){
	User.findById(req.params.id).populate("notifications").exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
		Address.findById(req.params.addressid,function(err,foundaddress){
		if(err){
			console.log(err);
		}else{
			var address=foundaddress.name + " " + foundaddress.username + " " + foundaddress.address2 + " " + foundaddress.landmark + " " + foundaddress.City + " " + foundaddress.Pin + " " + foundaddress.contact;
			Usernotification.findById(req.params.notificationid,function(err,foundusernoti){
				if(err){
					console.log(err)
				}
				else{
					Shopkeeper.findById(foundusernoti.shopkeeperid,function(err,foundsh){
				if(err){
					console.log(err);
				}
				else{					
Deliverynoti.create({username:found.name,useraddress:address,shopkeepername:foundsh.name,shopkeeperaddress:foundsh.shopkeeperaddress,prname:foundusernoti.prname,prprice:foundusernoti.pprice,policy:foundusernoti.policy,returnedseen:"not known",replacedseen:"not known",shopkeeperid:foundsh._id,userid:found._id},function(err,deliverynoti){
 							if(err){
								console.log(err);
							}
							else{
								// console.log(deliverynoti._id);
								// console.log(foundsh);
					foundsh.orders.push(deliverynoti._id);
					foundsh.address.push(req.params.addressid);
						if(foundusernoti.stock <= 0){
						req.flash("error","out of stock");
						res.redirect("/");
					}
					foundusernoti.stock--;
					foundusernoti.save();

					foundsh.save();
								found.purchasedproducts.push(deliverynoti._id);
								found.save();
								Delivery.find({},function(err,delivery){
								if(err){
										console.log(err);
									}
 									else{
									delivery[0].notifications.push(deliverynoti._id);
									delivery[0].save();
									req.flash("success","order placed");
									res.redirect("/");
									}	
								});
				}
			})
		}
	})
				}
			})
			
		}
	})
		}
})
});


app.get("/viewcancelorders",isLoggedIn,function(req,res){
	User.findById(req.user._id).populate("cancel",null,{customercancelseen:false}).exec(function(err,user){
		if(err){
			console.log(err);
		}
		else{
			user.cancel.forEach(function(user){
				user.customercancelseen=true;
				user.save();
			})
			res.render("customercancelorders",{cancel:user.cancel});
		}
	})
})
app.get("/customerpastcancelorders",isLoggedIn,function(req,res){
	User.findById(req.user._id).populate("cancel",null,{customercancelseen:true}).exec(function(err,user){
		if(err){
			console.log(err);
		}
		else{
			res.render("customerpastcanncelorders",{cancel:user.cancel});
		}
	})
})






app.get("/removeproduct/:id",function(req,res){
	User.findById(req.user._id).populate("cart").exec(function(err,user){
		if(err){
			console.log(err);
		}
		else
			{
				user.cart.remove(req.params.id);
				user.save();
				// user.cart.forEach(function(remove){
				// 	if(remove._id === req.params.id){
						
				// 	}
				// })
				// 	else{
						res.redirect("/viewcart");
				// 	}
				// })
			}
	})
});
app.get("/checkout/:userid/:notiid",isLoggedIn,function(req,res){
	User.findById(req.user._id).populate("address").exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
				// console.log(found.address.length);
			// if(found.address.is)
				res.render("checkout2",{userid:req.params.userid,notiid:req.params.notiid});
			// }
			// else{
			// 	res.render("checkout");
			// }
		}
	})
	
});
app.get("/edit/:addressid/:notiid",function(req,res){
	Address.findById(req.params.addressid,function(err,found){
		if(err){
			console.log(err);
		}
		else{
			res.render("editaddress",{address:found,addid:req.params.addressid,notiid:req.params.notiid});
		}
	})
});
app.post("/edit/:addressid/:notiid",isLoggedIn,function(req,res){
	Address.findByIdAndUpdate(req.params.addressid,req.body.address,function(err,updated){
		if(err){
			console.log(err);
		}else{
			res.redirect("/buyproduct/" + req.params.notiid);
		}
	})
})

	
app.get("/delivery",function(req,res){
		var length=0;
	var returnlength=0;
	var replacelength=0;
	var i=0;
		Deliverynoti.find({},function(err,foundnoti){
		if(err){
			console.log(err);
		}
		else{
			foundnoti.forEach(function(notii){
				if(notii.isseen==false){
					length++;
				}
				if(notii.returnedseen=="return"){
					returnlength++;
				}
				if(notii.replacedseen=="replace"){
					replacelength++;
				}
			});
			Delivery.find({}).populate("cancel",null,{deliverycancelseen:false}).exec(function(err,deliv){
				if(err){
					console.log(err);
				}
				else{
					res.render("delivery",{cancel:deliv[0].cancel,length:length,returnlength:returnlength,replacelength:replacelength});
				}
			})
			
		}
	})
	
});




app.get("/deliverycancel",function(req,res){
	Delivery.find({}).populate("cancel",null,{deliverycancelseen:false}).exec(function(err,deliv){
		if(err){
			console.log(err);
		}
		else{
			deliv[0].cancel.forEach(function(deliv){
				deliv.deliverycancelseen=true;
				deliv.save();
			})
			res.render("deliverycancelorders",{cancel:deliv[0].cancel});
		}
	})
});


app.get("/deliverycancelpast",function(req,res){
	Delivery.find({}).populate("cancel",null,{deliverycancelseen:true}).exec(function(err,deliv){
		if(err){
			console.log(err);
		}
		else{
			res.render("deliverycancelpastorders",{cancel:deliv[0].cancel});
		}
	})
})




app.get("/deliveryaddresses",function(req,res){
	Delivery.find({}).populate("notifications",null,{isseen:false}).exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			// console.log(found);
			// found[0].notifications.forEach(function(founded){
			// 	founded.isseen=true;
			// 	founded.save();
			// });
			res.render("deliveryadd",{foundnoti:found});
		}
	})
});
app.get("/delivered/:notiid",function(req,res){
	Deliverynoti.findById(req.params.notiid,function(err,found){
		if(err){
			console.log(err);
		}
		else{
			found.isdelivered=true;
			found.isseen=true;
			// found.deliverytime=Date.now;
			found.save();
			res.redirect("/deliveryaddresses");
		}
	})
})
app.get("/deliveryreturned",function(req,res){
	Delivery.find({}).populate("returned",null,{returnedseen:"return"}).exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			res.render("deliveryreturn",{found:found});
		}
	})
});
app.get("/deliveryreplaced",function(req,res){
	Delivery.find({}).populate("replaced",null,{replacedseen:"replace"}).exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			res.render("deliveryreplace",{found:found});
		}
	})
});
app.get("/deliveryreturned/:notiid",function(req,res){
		Deliverynoti.findById(req.params.notiid,function(err,found){
		if(err){
			console.log(err);
		}
		else{
			// found.isreturned=true;
			found.returnedseen="done";
			found.save();
			res.redirect("/delivery");
		}
	})
});
app.get("/deliveryreplaced/:notiid",function(req,res){
		Deliverynoti.findById(req.params.notiid,function(err,found){
		if(err){
			console.log(err);
		}
		else{
			// found.isreturned=true;
			found.replacedseen="done";
			found.save();
			res.redirect("/delivery");
		}
	})
});
app.get("/deliveryreturnpast",function(req,res){
		Delivery.find({}).populate("returned",null,{returnedseen:"done"}).exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			// console.log(found);
			// found[0].notifications.forEach(function(founded){
			// 	founded.isseen=true;
			// 	founded.save();
			// });
			// if(found[0].returned.length > 0){
			console.log("we are here--------------------------");
			// console.log(found[0].returned);
			res.render("deliveryreturnpast",{foundnoti:found});
			// }
			// else{
			// 	res.send("<h1> No past returned product </h1>")
			// }
		}
	})
})
app.get("/deliveryreplacepast",function(req,res){
		Delivery.find({}).populate("replaced",null,{replacedseen:"done"}).exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			// console.log(found);
			// found[0].notifications.forEach(function(founded){
			// 	founded.isseen=true;
			// 	founded.save();
			// });
			// if(found[0].returned.length > 0){
			// console.log("we are here--------------------------");
			// console.log(found[0].returned);
			res.render("deliveryreplacepast",{foundnoti:found});
			// }
			// else{
			// 	res.send("<h1> No past returned product </h1>")
			// }
		}
	})
})

app.get("/deliverypast",function(req,res){
		Delivery.find({}).populate("notifications",null,{isseen:true,isreturned:false,isreplaced:false}).exec(function(err,found){
		if(err){
			console.log(err);
		}
		else{
			// console.log(found);
			// found[0].notifications.forEach(function(founded){
			// 	founded.isseen=true;
			// 	founded.save();
			// });
			res.render("deliverypast",{foundnoti:found});
		}
	})
})
app.get("/shopkeeperorders",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate("orders",null,{isorderallseen:false}).populate("address").exec(function(err,foundsh){
		if(err){
			console.log(err);
		}
		else
			{
				// foundsh.orders.forEach(function(order){
				// 	order.isorderseen=true;
				// 	order.save();
				// });
				// foundsh.address.forEach(function(address){
				// 	address.isseen=true;
				// 	address.save();
				// })
				// console.log(foundsh.address.username);
						res.render("vieworder",{order:foundsh.orders,address:foundsh.address});
					
				
			
				
			}
	})
});
app.get("/pastorders/:pastorderid",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate("orders").populate("address").exec(function(err,foundsh){
		if(err){
			console.log(err);
		}
		else{
			Deliverynoti.findById(req.params.pastorderid,function(err,found){
				if(err){
					console.log(err);
				}
				else{
			found.isprocessed=true;
			found.isorderallseen=true;
			found.save();
			// console.log(foundsh);
			res.redirect("/shopkeeperorders");
				}
			})

			// console.log(foundsh.orders);
			// console.log(req.params.pastorderid);
			// var l=foundsh.orders.length;
			// console.log(foundsh.orders[0]._id);

			// console.log(l);
			// for(var i=0;i<l;i++){
			// 	console.log("here we go");
			// 	if(foundsh.orders[i]._id==req.params.pastorderid){
			// 		console.log("here");
			// 		console.log(foundsh.orders[i]._id);
			// 		foundsh.deliveredorders.push(foundsh.orders[i]._id);
			// 		foundsh.orders.splice(i,1);
			// 		foundsh.save();
			// 		console.log(foundsh);
			// 		// console.log(foundsh.orders.splice(i,1));
			// 		// foundsh.save();
			// 		break;
			// 	}
			// }
			// console.log(foundsh);
			
			// var index=foundsh.orders.indexOf(req.params.pastorderid);
			// console.log(index);
			// foundsh.orders.splice(index,1);
			
			// res.render("pastorder",{past:foundsh.orders,address:foundsh.address});

		}
	})
});
app.get("/cancel/:pastorderid",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate("orders").populate("address").exec(function(err,foundsh){
		if(err){
			console.log(err);
		}
		else{
			Delivery.find({}).populate("notifications").exec(function(err,found){
				if(err){
					console.log(err);
				}
				else{
					// console.log(req.params.pastorderid);
					// console.log(found);
					found[0].cancel.push(req.params.pastorderid);
					Deliverynoti.findById(req.params.pastorderid,function(err,foundnoti){
						if(err){
							console.log(err);
						}
						else{
							foundnoti.isseen=true;
							foundnoti.save()
					found[0].notifications.remove(req.params.pastorderid);
					found[0].save();
					User.findById(foundnoti.userid,function(err,user){
						if(err){
							console.log(err);
						}
						else{
							// console.log(user);
							user.purchasedproducts.remove(foundnoti);
							user.cancel.push(foundnoti);
							user.save();
				
			var l=foundsh.orders.length;
			// console.log(foundsh.orders[0]._id);

			console.log(l);
			for(var i=0;i<l;i++){
				// console.log("here we go");
				if(foundsh.orders[i]._id==req.params.pastorderid){
					// console.log("here");
					// console.log(foundsh.orders[i]._id);
					foundsh.orders.splice(i,1);
					// foundsh.deliveredorders.push(req.params.pastorderid);
					foundsh.save();
					// console.log(foundsh.orders.splice(i,1));
					// foundsh.save();
					break;
				}
		}
			res.redirect("/shopkeeperorders");
													}
					})
								}
			})
							}
					})
		}
	})
});
app.get("/pastorders",isLoggedIn,function(req,res){
	Shopkeeper.findById(req.user._id).populate("deliveredorders").exec(function(err,foundsh){
		if(err){
			console.log(err);
		}
		else{
			// console.log(foundsh);
			// console.log(foundsh.deliveredorders);
			res.render("pastorder",{order:foundsh});
		}
	});
});
app.get("/logout",function(req,res){
	req.logout();
	req.flash("success","logged you out");
	res.redirect("/");
});
app.get("/shopkeeperlogout",function(req,res){
	req.logout();
	req.flash("success","logged you out");
	res.redirect("/");
});
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/");
}
function isusershopIn(req,res,next){
	if(req.user){
		if(req.user.category=="Electronics" || req.user.category=="Book"){
		return res.redirect('/shopkeeperloggedin');
		}else{
			return next();
		}
	}else{
		return next();
	}
	
}
async function search(pr_name_text,pr_price_text,url,req,res,buttonbook,buttonelectronics){
	try{
	const user=await User.findById(req.user._id).populate('followers').exec();
			if(user.isblocked == true){
							req.flash("error","Your account is blocked");
							res.redirect("/");
						}
					else{
						var newNotification = {
        				username: req.user.name,
       					prname:pr_name_text,
						prprice:pr_price_text,
						url:url,
						userid: req.user._id,
						}
						for(const follower of user.followers){
							// console.log(follower.category);
							if(follower.category===buttonbook){
							const creatednoti=await Notification.create(newNotification);
									follower.notifications.push(creatednoti);
									follower.save();
							}
							if(follower.category===buttonelectronics){
								const creatednoti=await Notification.create(newNotification);
									follower.notifications.push(creatednoti);
									follower.save();
								}
						};
					req.flash("success","Your request sent to the shopkeepers");
					res.redirect("/");
					}
					}catch(err){
						console.log(err);
						res.redirect("back");
					}
}
app.listen(PORT,function(req,res){
	console.log("local market server strated")
})