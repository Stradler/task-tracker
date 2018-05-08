var express = require("express");
var app = express();
var db = require("./models");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var nodemailer = require('nodemailer');
var crypto = require("crypto");
var mongooseLocal = require("passport-local-mongoose");
var methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  const origin = req.get('origin');

  // TODO Add origin validation
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');

  // intercept OPTIONS method
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

app.use(require("express-session")({
  secret: "To have a tasker or not to have a tasker",
  resave: false,
  saveUninitialized : false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(db.User.authenticate()));
passport.serializeUser(db.User.serializeUser());
passport.deserializeUser(db.User.deserializeUser());



//AUTH ROUTES
//==================

app.get("/", function(req, res){
  res.json("'lol':'kek'");
});

app.post("/register", function(req,res){
   db.User.register(new db.User
    ({
      name: req.body.name, 
      surname: req.body.surname,
      role: req.body.role,
      username: req.body.email
    }), 
      req.body.password, function(err, user){
        if(err){
          console.log(err);
        } else {
          var token = new db.Token({_userId: user._id, token: crypto.randomBytes(16).toString('hex')});
          token.save(function(err){});
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                   user: 'devnaykan1@gmail.com',
                   pass: 'devnaykan12'
               }
           });
           const mailOptions = {
            from: 'simple-task-tracker',
            to: user.username, 
            subject: 'Verify',
            text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n'
          };
          transporter.sendMail(mailOptions, function (err, info) {
            if(err)
              console.log(err)
            else
              res.status(200).send("A verification mail has been sent. Check your email! ")
         });
        }
   })
});

app.get("/confirmation/:token", function(req, res){

  db.Token.findOne({token: req.params.token}, function(err, token){

    if(!token){
      return res.status(400).send("You token probably expired or you're already verified! Try to resend it, if you can't log in!");
    }

    db.User.findOne({_id: token._userId}, function(err, user){
      if(!user) {return res.status(400).send("Unable to find username with this token! ");}
      if (user.isVerified) {return res.status(400).send("Already verified!");}
      user.isVerified = true;
      console.log(user.isVerified);
      user.save(function(err){
        if(err){ return res.status(500).send({msg: err.message});}
        db.Token.findOneAndRemove({token: req.params.token});
        res.status(200).send("Please log in!");
      });
    });
  });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    console.log(req.body);
    if (err) { return next(err); }
    if (!user) { console.log(req.body); return res.json("'status': 'not ok'"); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      console.log(req.user);
      return res.json("'status': 'ok'");
    });
  })(req, res, next);
});




//RESTFUL ROUTES
//=================


//PROJECT
//==========

//List of projects name of current user
app.get("/project", isLoggedIn, function(req, res){
  db.User.findById(req.user._id).populate("projects")
  .then(u => {
    return res.json({"projects" : u.projects});
  });
});

//Inserting newly created project to db
app.post("/project", isLoggedIn, function(req, res){
  if(req.user.role === "manager"){
   db.User.findById(req.user._id)
   .then(u => {
    var proj = new db.Project({
      name: req.body.name,
      creator: req.user.username
   });
   proj.save().then(p => {
      u.projects.push(p._id);
      u.save();
   });
   });
  } else {
    res.send("unauthorized try to make new project! only managers could do this!");
  }
});
//Get detailed info about project
app.get("/project/:id", isLoggedIn, function(req, res){
  db.Project.findById(req.params.id).populate("tasks").populate("developers")
  .then(p => {
     res.json(p);
  });
});

//Insert Developer into Project (into array)
app.post("/project/:id/newdev", isLoggedIn, function(req, res){
  db.Project.findById(req.paramas.id)
  .then(p => {
    db.User.findOne({name: req.body.name, surname: req.body.surname})
  .then(u => {
    p.developers.push(u._id);
  });
  });
});

//insert task into project
app.post("/project/:id/newtask", isLoggedIn, function(req, res){
  db.Project.findById(req.paramas.id)
  .then(p => {
    const task_temp = new db.Task({
      name: req.body.name,
      description: req.body.description
    });
    task_temp.save()
    .then(t => {
      p.tasks.push(t._id);
      p.save();
    })
  });
});

//TASK
//==========
//add dev to the task
app.post("/project/:id/task/:id_t", isLoggedIn, function(req, res){
   db.Task.findById(req.params.id_t)
   .then(t =>{
    db.User.findOne({name: req.body.name, surname: req.body.surname})
    .then(u =>{
      t.developers.push(u._id);
      t.save();
    })
   });
});


//get detailed info about clicked task
app.get("/project/:id/task/:id_t", isLoggedIn, function(req, res){
  
});

//change status of task and return it
app.put("/project/:id/task/:id_t", isLoggedIn, function(req, res){
  
});

//filter tasks by developer
app.post("/project/:id/task", isLoggedIn, function(req, res){

});

//COMMENT
//=============
//insert new comment to db
app.post("/project/:id/task/:id_t/", isLoggedIn, function(req, res){
  
});

//edit comment 
app.put("/project/:id/task/:id_t/comment/:id_c",isLoggedIn, function(req, res){
  
});

//delete comment
app.delete("/project/:id/task/:id_t/comment/:id_c", isLoggedIn, function(req, res){
  
});
 
//===================
//UTILITY

app.listen(8081, "localhost", function(){
  console.log("Server is running!");
});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    if(req.user.isVerified){
      return next();
    }
  }

  res.json("'err': 'loggin!'");
}