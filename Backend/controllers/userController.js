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

const fetchUserWithPosts = async (req, res) => {
    try{
        const userId = mongoose.Types.ObjectId.createFromHexString(req.params.id);

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
        res.status(500).send({message: 'Cant fetch user details'});
    }
}

const fetchFollowedUserPosts = async (req, res) => {
    try{
        const user = req.user;
        
        if(!user.following || user.following.length === 0)
            return res.status(404).send({message: 'No followed users'});
        
        const posts = await Post.find({ author: { $in: user.following }})
        .populate({
            path: 'author',
            select: 'picture username email'
        });
        
        return res.status(200).json(posts);
    }
    catch(error){
        return res.status(500).send({message: "Unable to fetch posts"})
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
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'liked',
                    foreignField: '_id',
                    as: 'likedPosts'
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'saved',
                    foreignField: '_id',
                    as: 'savedPosts'
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

const followUnfollowUser = async (req, res) => {
    try{
        const authorId = req.params.id;
        const follower = req.user;

        const user = await User.findById(authorId);
        if(!user)
            return res.status(404).send({message: "Author not found"})

        // Unfollow User
        if(follower.following.includes(authorId)){
            // update user
            user.followers--;
            await user.save();
            
            // update follower
            const index = follower.following.indexOf(authorId);
            follower.following.splice(index, 1);
            await follower.save();

            return res.status(200).send({message: "Unfollowed Author successfully"}) 
        }
        // Follow User
        else{
            // update user
            user.followers++;
            await user.save();

            // update follower
            follower.following.push(authorId);
            await follower.save();

            return res.status(200).send({message: "Followed Author successfully"})
        }
    }
    catch(error){
        return res.status(500).send({message: 'Unable to fetch authors at this time'});   
    }
}

module.exports = {fetchUser, fetchUserWithPosts, fetchFollowedUserPosts, fetchProfileWithPosts, searchUser, followUnfollowUser};