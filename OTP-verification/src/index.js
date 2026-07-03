import express from "express";
import Redis from "ioredis";

const app  = express(); 

app.use(express.json());

const redis = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
);

function OtpKey(phone){
    return `otp:${phone}`;
}


app.post('/otp',async(req,res)=>{
    const {phone} = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(OtpKey(phone), otp, 'EX',30); // opt valid for 30 second

    res.json({message: 'OTP sent successfully',otp}) // in real world we will send otp to user phone number via sms gateway

})

app.post('/otp/verify',async(req,res)=>{
    const {phone , otp} = req.body;

    const savedOtp = await redis.get(OtpKey(phone));

    if(!savedOtp){
        return res.status(400).json({message: 'OTP expired or not found'});
    }

    if(savedOtp !== otp){
        return res.status(400).json({message: 'Invalid OTP'});
    }

// here validate user then delete otp from redis after successful verification
     
    await redis.del(OtpKey(phone));

    res.json({message: 'OTP verified successfully'});
})

app.get('/otp/:phone/ttl',async(req,res)=>{
    const {phone} = req.params;

    const ttl = await redis.ttl(OtpKey(phone));

    res.json({ttl});
})

app.listen(3000, ()=>{
    console.log('Server is running on port 3000');
})