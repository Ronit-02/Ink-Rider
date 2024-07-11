const mongoose = require('mongoose');
const User = require('../schemas/userSchema');


const fetchUser = async (req, res) => {
    try{
        const { username } = req.query;        
        const user = await User.findOne({username})
        
        return res.status(200).json(user);
    }   
    catch(error){
        return res.status(500).send({message: "Cant fetch user details"})
    }
}

const fetchUserWithPosts = async (req, res) => {
    try{
        const userId = new mongoose.Types.ObjectId(req.params.id);

        const userWithPosts = await User.aggregate([
            { $match: {_id: userId} },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'author',
                    as: 'posts'
                }
            }
        ]);

        res.status(200).send(userWithPosts[0]);
    }
    catch (err){
        // console.log(err)
        res.status(500).send({message: 'Cant fetch user details'});
    }
}

const fetchProfileWithPosts = async (req, res) => {
    try{
        const userId = req.user._id;

        const profileWithPosts = await User.aggregate([
            { $match: {_id: userId} },
            {
                $lookup: {
                    from: 'posts',  
                    localField: '_id',
                    foreignField: 'author',
                    as: 'posts'
                }
            }
        ]);

        return res.status(200).send(profileWithPosts[0]);
    }
    catch(error){
        return res.status(400).send({message: 'Cant fetch profile'})
    }   
    
}

const searchUser = async (req, res) => {
    try{
        const { query } = req.query;

        if(!query)
            return res.status(400).send({message: 'Enter query to search'});

        const users = await User.find({
            $text: { $search: query }
        });

        return res.status(200).json(users);
    }
    catch(error) {
        return res.status(500).send({message: 'Unable to fetch authors at this time'});
    }
}

module.exports = {fetchUser, fetchUserWithPosts, fetchProfileWithPosts, searchUser};