import express from "express";
import Redis from "ioredis";

const app  = express();

app.use(express.json());

const redis = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
);



const BANNER_KEY = "app:banner";

app.post('/banner',async(req,res)=>{
    await redis.set(BANNER_KEY, req.body.message || "welcome to redis")
    res.json({success : true})
})

app.get('/banner',async(req,res)=>{
    const message = await redis.get(BANNER_KEY);
    res.json({message})
})

app.delete('/banner',async(req,res)=>{
     await redis.del(BANNER_KEY)
     res.json({success : true})
})

// check msg/key exist in our DB or not
app.get("/banner/check",async(req,res)=>{
    const exists = await redis.exists(BANNER_KEY);
    // res.json({exists : Boolean(exists)})  
    res.json({exists : exists})  
})

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})