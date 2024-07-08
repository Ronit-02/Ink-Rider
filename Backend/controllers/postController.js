const Post = require('../schemas/postSchema');
const { uploadOnCloudinary, removeOnCloudinary } = require('../utils/cloudinary');
const fs = require('fs');

const createPost = async (req, res) => {

    try{
        const {title, body, tags} = req.body;
        const decodedTags = tags.split(',').map(tag => tag.trim());
        const author = req.user._id;

        // Extracting file path and adding to cloudinary
        const localImagePath = req.file.path;
        const result = await uploadOnCloudinary(localImagePath);

        // if successfull, remove locally temp saved file
        if(result)
            fs.unlinkSync(localImagePath);
    
        const post = new Post({
            coverImage: result.secure_url,
            title,
            body,
            author,
            tags: decodedTags
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

        // populating related author data inside post data
        const post = await Post.findById(cleanId).populate('author', 'username email');
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
        const { title, body, tags, prevImageUrl } = req.body;
        const decodedTags = tags.split(',').map(tag => tag.trim());
        
        // Verifications
        const post = await Post.findById(id);
        if(!post) {
            return res.status(404).send({message: "Post not found"});
        }
        if(post.author.toString() !== req.user._id.toString()) {
            return res.status(403).send({message: "Unathorized access"});
        }

        // if prev Image, remove it
        if(prevImageUrl){
            await removeOnCloudinary(post.coverImage);
        }

        // if file changed it is local uploaded, upload on cloud, remove local file and update
        if(req.file){
            const result = await uploadOnCloudinary(req.file.path)
            if(result)
                fs.unlinkSync(req.file.path);

            post.coverImage = result.secure_url;
        }

        post.title  = title;
        post.body = body;
        post.tags = decodedTags;

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

        await removeOnCloudinary(post.coverImage);        
        await Post.findByIdAndDelete(id);

        return res.status(200).send({message: "Post deleted successfully"});
    }
    catch (error) {
        return res.status(500).send({message: 'Unable to delete post, try again later..'}) 
    }
}

module.exports = {createPost, getAllPosts, getPost, updatePost, deletePost};