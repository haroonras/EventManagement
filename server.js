var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var bodyParser= require('body-parser');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');
var app = express();

var JWT_SECRET = "events";
var db=null;
MongoClient.connect("mongodb://localhost:27017/Lister",function(err,dbconn){
    if(!err){
        console.log("We are Connected");
        db=dbconn;
    }
});
app.use(bodyParser.json());
app.use(express.static('user_req'));


app.get('/eventsfromserver',function(req, res, next){
     db.collection('events',function(err,eventsCollection){
         eventsCollection.find().toArray(function(err,events){
             res.json(events);
         });
     });
        
    });

app.post('/eventsfromfront',function(req, res, next) { 
       var token = req.headers.authorization;
       var user = jwt.decode(token, JWT_SECRET);
       /*console.log(token);*/
       db.collection('events',function(err,eventsCollection){
        var PostedEvent={
            user: user._id,
            username:user.User_mail,
            EventName:req.body.PostedEvent,
            EventDescription:req.body.PostedDescription
            
        };
         eventsCollection.insert(PostedEvent,{w:1},function(err){
             res.send();
         });
     });
    
    res.send();
});

app.put('/deleteEvents',function(req, res, next) { 
       var token = req.headers.authorization;
       var user = jwt.decode(token, JWT_SECRET);
    db.collection('events',function(err,eventsCollection){
        var DeletingEvent=req.body.DeletingEvent._id;
         //console.log(DeletingEvent);   
        //console.log(user._id);
         eventsCollection.remove({_id:ObjectId(DeletingEvent), user:user._id},{w:1},function(err,result){
             //console.log(result);
             res.send();
         });
     });
    
    res.send();
});

app.post('/userregister',function(req,res,next){
         
         db.collection('userdetails',function(err,userCollection){
             
             bcrypt.genSalt(10,function(err,salt){
                 bcrypt.hash(req.body.password,salt,function(err,hash){
                     var Userdetails={
                        User_mail: req.body.username,
                        Password: hash
                    };
                      //console.log(Userdetails);
                      userCollection.insert(Userdetails,{w:1},function(err){
                      res.send(); 
                        });
                 });
             });
             
            
           
         });
 });

app.put('/userlogging',function(req,res,next){
    db.collection('userdetails',function(err,userCollection){
        userCollection.findOne({User_mail:req.body.username},function(err,user){
            bcrypt.compare(req.body.password,user.Password,function(err,result){
                if(result){
                    var myToken = jwt.encode(user,JWT_SECRET);
                    res.json({token:myToken});
                }
                else{
                    res.status(400).send();
                }
            });
        });
       
    });
});

app.listen(2300,function() {
    console.log("Listening to the server");
});
