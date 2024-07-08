const User = require('../schemas/userSchema');

// User Details
const fetchProfile = async (req, res) => {

    try{
        res.status(200).send({user: req.user});
    }
    catch (err){
        res.status(500).send({message: 'Cant fetch user details'});
    }
}

// User Details with Posts
const fetchProfileWithPosts = async (req, res) => {

    const userId = req.user._id;

    try{
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

        return res.status(200).send(userWithPosts[0]);
    }
    catch(error){
        console.log(error);
        return res.status(400).send({message: 'Cant fetch user details'})
    }   
    
}

module.exports = {fetchProfile, fetchProfileWithPosts};