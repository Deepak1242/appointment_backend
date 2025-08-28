const bcrypt = require('bcryptjs');
const { User } = require('../models/model.js');
const { signToken } = require('../middlewares/auth.middleware.js');


export const loginController = async(req,res)=>{
    try{
        const {email , password} = req.body;

        if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

        const user = await User.findOne({where : {email}})
        if(!user){
            return res.status(401).json({error : "User not found"})
        }
        const isPasswordValid = await bcrypt.compare(password , user.password)
        
        if(!isPasswordValid){
            return res.status(401).json({error : "Invalid password"})
        }
        // !! token creattted //
        const token = signToken(user)
        return res.status(200).json({token,success : true})


    }catch(error){
        console.log("error in login controller......")
        return res.status(500).json({error : error.message})
    }
}

export const registerController = async(req,res)=>{
    try{
        const {name , email , password , role} = req.body;

        if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' });

        if (!["student","professor"].includes(role)) return res.status(400).json({ error: 'Invalid role' });

        const hashedPass = await bcrypt.hash(password , 10)
        const user = await User.create({name , email , password : hashedPass , role})
        const token = signToken(user)
        return res.status(200).json({token,success : true})
    }catch(error){
        console.log("error in register controller......")
        if (error.name === 'SequelizeUniqueConstraintError') return res.status(400).json({ error: 'Email already exists' });
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
}
    

