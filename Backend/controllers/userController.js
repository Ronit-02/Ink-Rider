const mongoose = require('mongoose');
const User = require('../schemas/userSchema');
const Post = require('../schemas/postSchema');


const fetchUser = async (req, res) => {
    try{
        const { email } = req.query;        
        const user = await User.findOne({email})
        
        return res.status(200).json(user);
    }   
    catch(error){
        return res.status(500).send({message: "Cant fetch user details"});
    }
}

module.exports = {
    fetchUser
}