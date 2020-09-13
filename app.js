const express=require("express");
const app=express();


const mongoose=require("mongoose");

const userRouters=require("./routers/user");

require("dotenv").config();

const cors=require("cors");



const port=process.env.PORT || 5000;








//db connection
mongoose.connect(process.env.MONGOURI,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("db connected")
}).catch(err=>{
    console.log("db disconnected")
})
app.use(cors());
app.use(express.json());
app.use(userRouters);




    app.use(express.static("client/build"))
    const path=require("path");

    app.get("*",(req,res)=>{
        res.sendFile(path.resolve(__dirname,"client","build","index.html"))
    })


app.get("/",(req,res)=>{
    res.send("hello world")
})


app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})