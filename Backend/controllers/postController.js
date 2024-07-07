const Post = require('../schemas/postSchema');
const { uploadOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

const createPost = async (req, res) => {

    try{
        const {title, body, tags} = req.body;
        const author = req.user._id;

        // Extracting file path and adding to cloudinary
        const localImagePath = req.file.path;
        const result = await uploadOnCloudinary(localImagePath);

        // if successfull, remove locally temp saved file
        if(result)
            fs.unlinkSync(localImagePath);

        console.log('Uploaded Image Online!!')
    
        const post = new Post({
            coverImage: result.secure_url,
            title,
            body,
            author,
            tags
        });
    
        await post.save();

        return res.status(200).send({message: 'Post created successfully'});
    }
    catch(error){
        console.log(error);
        return res.status(500).send({message: 'Unable to create post'});
    }
};

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username email');
        // console.log(posts[0].title)
        return res.status(200).json(posts);
    }
    catch (error) {
        return res.status(500).send({message: 'Error Fetching Posts'})
    }
};

const getPost = async (req, res) => {
    try{
        const id = req.params.id;
        const cleanId = id.split(':')[1];
        const post = await Post.findById(cleanId).populate('author', 'username email')
        if(!post)
            return res.status(404).send({message: 'Post not found'})
        
        return res.status(200).json(post);
    }
    catch(error) {
        return res.status(500).send({message: 'Error Fetching Post'})
    }
}

const updatePost = async (req, res) => {
    try {
        const id = req.params.id;
        const { imageURL, title, body, tags } = req.body;

        const post = await Post.fin
        dById(id);
        if(!post) {
            return res.status(404).send({message: "Post not found"});
        }
        if(post.author.toString() !== req.user._id.toString()) {
            return res.status(403).send({message: "Unathorized access"});
        }

        post.imageURL = imageURL || post.imageURL;
        post.title  = title || post.title;
        post.body = body || post.body;
        post.tags = tags || post.tags;

        await post.save();

        return res.status(200).send({message: "Post updated successfully"});
    }
    catch(error) {
        return res.status(500).send({message: 'Unable to update post, try again later..'})
    }
}

const deletePost = async (req, res) => {
    try {
        const id = req.params.id;

        const post = await Post.findById(id);
        if(!post) {
            return res.status(404).send({message: "Post not found"});
        }
        if(post.author.toString() !== req.user._id.toString()) {
            return res.status(403).send({message: "Unathorized access"});
        }

        await post.remove();

        return res.status(200).send({message: "Post deleted successfully"});
    }
    catch (error) {
        return res.status(500).send({message: 'Unable to delete post, try again later..'}) 
    }
}

module.exports = {createPost, getAllPosts, getPost, updatePost, deletePost};