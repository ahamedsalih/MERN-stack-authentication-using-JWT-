const express=require("express");

const router=express.Router();

const User=require("../models/user");
const {OAuth2Client}=require("google-auth-library")
const fetch=require("node-fetch");

const bcrypt=require("bcryptjs");

const jwt=require("jsonwebtoken");
const requireLogin = require("../middleware/requireLogin");
const user = require("../models/user");



const client=new OAuth2Client("1006791681132-8ucq2tjnogbsm2u7mpmuj71pmrv9m4hr.apps.googleusercontent.com")







router.post("/signup",(req,res)=>{
    const {name,email,password}=req.body;
    if(!email || !password || !name ){
       return  res.status(422).json({error:"please fill all the fields"});
    }
    User.findOne({email:email})
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"this email address already exits"});
        }

        bcrypt.hash(password,12)
        .then(hasedPassword=>{

            const user =new User({
                email,
                password:hasedPassword,
                name
            })
            user.save()
            .then(user=>{
                res.json({message:"saved successfully"})
            })
            .catch(err=>{
                console.log(err)
            })
        })
        .catch(err=>{
            console.log(err)
        })
        })

       
    
    
})


router.post("/signin",(req,res)=>{
    const {email,password}=req.body;
    if(!email || !password ){
        return res.status(422).json({error:"please fill all the fields"});
    }
    User.findOne({email:email})
    .then(savedUser=>{
        if(!savedUser){
            return res.status(422).json({error:"please put valid email or password"});
        }
        bcrypt.compare(password,savedUser.password)
        .then((doMatch)=>{
            if(doMatch){
               // return res.json({message:"successfully  signed in"});
               const token=jwt.sign({_id:savedUser._id},process.env.JWT_SECRET)
               const {_id,name,email}=savedUser;
               res.json({token,user:{_id,name,email}})
            }else{

                return res.status(422).json({error:"invalid email or password"});
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
})




router.post("/googlelogin",(req,res)=>{
    const {tokenId}=req.body;
    client.verifyIdToken({idToken:tokenId,audience:"1006791681132-8ucq2tjnogbsm2u7mpmuj71pmrv9m4hr.apps.googleusercontent.com"})
    .then(response=>{
        const {email_verified,email,name}=response.payload;
        if(email_verified){
            console.log(response.payload);
            User.findOne({email}).exec((err,user)=>{
                if(err){  return res.status(400).json({
                    error:"does not exist this user"
                })}
                else{
                    if(user){
                        const token=jwt.sign({_id:user._id},process.env.JWT_SECRET)
                        const {_id,name,email}=user;
                         res.json({token,user:{_id,name,email}})
                    }
                    else{
                        const password=email+process.env.JWT_SECRET;
                        const newUser=new User({name,email,password});
                        newUser.save((err,data)=>{
                            if(err){
                                return res.status(400).json({
                                    error:"something went wrong"
                                })
                            }
                            
                                const token=jwt.sign({_id:data._id},process.env.JWT_SECRET)
                                const {_id,name,email}=newUser;
                                 res.json({token,user:{_id,name,email}})
                                
                        
                           
                            
                            
                        })
                    }
                }
              
            })
        }
    })

})


router.post("/facebooklogin",(req,res)=>{
    const {accessToken,userID}=req.body;
    let urlGraphFacebook=`https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`
    fetch(urlGraphFacebook,{
        method:"GET"
    }).then(res=>res.json())
    .then(data=>{
        const {email,name}=data;
        User.findOne({email}).exec((err,users)=>{
            if(err){
                return res.status(400).json({
                    error:"something went wrong"
                })
            }

            else{
                if(users){
                    const token=jwt.sign({_id:users._id},process.env.JWT_SECRET)
                    const {_id,name,email}=users;
                     res.json({token,user:{_id,name,email}})
                }
                else{
                    const password=email+process.env.JWT_SECRET;
                    const newUser=new User({name,email,password});
                    newUser.save((err,data)=>{
                        if(err){
                            return res.status(400).json({
                                error:"something went wrong"
                            })
                        }
                        
                            const token=jwt.sign({_id:data._id},process.env.JWT_SECRET)
                            const {_id,name,email}=newUser;
                             res.json({token,user:{_id,name,email}})
                            
                    
                       
                        
                        
                    })
                }
            }

        })
    })
})




module.exports = router;



