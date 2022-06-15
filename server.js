const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoDBSession = require('connect-mongodb-session')(session);
const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const app = express();
const mongoURI='mongodb://localhost:27017/MINI';
const User = require("./models/User");
const userModel=require("./models/User");

mongoose.connect(mongoURI,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})
.then((res)=>{
    console.log('Mongodb connected');
});

app.set("view engine","ejs");
app.use(express.urlencoded({extended:true}));

const store =new MongoDBSession({
    uri:mongoURI,
    collection:'MiniPro',
});

app.use(session({
    secret:"mini",
    resave: false,
    saveUninitialized: false,
    store:store,
}));

app.use(express.static('public'))
app.use('/css',express.static(__dirname+'public/css'))
app.use('/js',express.static(__dirname+'public/js'))
app.use('/images',express.static(__dirname+'public/images'))
app.use('/assets',express.static(__dirname+'public/assets'))
app.use('/audio',express.static(__dirname+'public/audio'))
app.use('/cssv',express.static(__dirname+'public/cssv'))
app.use('/fonts',express.static(__dirname+'public/fonts'))
app.use('/jsv',express.static(__dirname+'public/jsv'))
app.use('/videos',express.static(__dirname+'public/videos'))
app.use('/vendor',express.static(__dirname+'public/vendor'))
app.use('/music',express.static(__dirname+'public/music'))

const isAuth = (req,res,next)=>{
  if(req.session.isAuth)
  {
    next();
  }
  else{
    res.redirect("/login");
  }
}

app.get("/",(req,res)=>{
  res.render("landing");
});

app.get("/login",(req,res)=>{
  res.render("login");
});

app.post("/login",async(req,res)=>{
  const {email, password}=req.body;
  const user= await userModel.findOne({email});
  if(!user)
  {
    return res.redirect("/register");
  }
  const isMatch= await bcrypt.compare(password,user.password);
  if(!isMatch)
  {
    return res.redirect("/login");
  }
  req.session.isAuth =true;
  res.redirect("/index");

});
app.get('/index',isAuth,(req,res)=>{
  res.render("index");
});
app.get('/books',isAuth,(req,res)=>{

  res.render("books");
});
app.get('/sleep',isAuth,(req,res)=>{
  res.render("sleep");
});
app.get('/med',isAuth,(req,res)=>{
  res.render("med");
});
app.get('/music',isAuth,(req,res)=>{
  res.render("music");
});
app.get('/movie',isAuth,(req,res)=>{
  res.render("movie");
});
app.get("/register",(req,res)=>{
  res.render("register");
});

app.get("/dashboard", isAuth, (req,res)=>{
  res.render("dashboard");
})
app.get("/register",(req,res)=>{
  res.render("register");
});
app.get("/normal",(req,res)=>{
  res.render("normal");
});
app.post("/register",async(req,res)=>{
  const{ username, email, password}=req.body;
  const hashedPsw=await bcrypt.hash(password,12);
  let user=await userModel.findOne({email});
  if(user)
  {
    return res.redirect("/register");
  }
  user =new userModel({
    username,
    email,
    password:hashedPsw,
  });
  await user.save();
  res.redirect("/login");
})
app.post("/logout",(req,res)=>{
  req.session.destroy();
  res.redirect("/");
});

app.listen(5000,console.log("server is running"));