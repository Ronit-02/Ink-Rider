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

        // handling views, likes, date
        const { sort, sortType } = req.query;

        let sortOptions = {};
        let sortField = '';
        if(sort && sortType) {
            if(sort === 'views')
                sortField = 'metadata.views'
            else if(sort === 'date')
                sortField = 'createdAt'
            else
                sortField = sort;

            sortOptions[sortField] = sortType === 'descending' ? -1 : 1;
        }

        // populating related post-author-data and comments-author-data
        const posts = await Post.find()
            .populate({
                path: 'author', 
                select: 'picture username email'
            })
            .populate({
                path: 'comments.author',
                select: 'picture username email'
            })
            .sort(sortOptions);

        if(!posts){
            return res.status(403).send({message: 'No posts yet'});
        }

        return res.status(200).json(posts);
    }
    catch (error) {
        return res.status(500).send({message: 'Error Fetching Posts'})
    }
};

const searchPost = async (req, res) => {
    try{
        const {query} = req.query;
        if(!query)
            return res.status(400).send({message: 'Enter query to search'});

        const posts = await Post.find({
            $text: { $search: query }
        })
        .populate({
            path: 'author',
            select: 'picture username email'
        })
        // .limit(5);
        
        return res.status(200).json(posts)
    }
    catch(error){
        console.log(error);
        return res.status(500).send({message: 'Unable to fetch posts at this time'})
    }
}

const searchCategory = async (req, res) => {

    try {
        const { query } = req.query;
        const tagsArray = query.split(',').map(tag => tag.trim());

        if(!query)
            return res.status(400).send({message: 'Enter query to search'});

        const posts = await Post.find({
            tags: { $in: tagsArray }
        })
        .populate({
            path: 'author',
            select: 'picture username email'
        })
        // .limit(5);

        return res.status(200).json(posts)
    }
    catch(error){
        console.log(error);
        return res.status(500).send({message: 'Unable to fetch categories at this time'})
    }
}

const getPost = async (req, res) => {
    try{
        const postId = req.params.id;

        // populating related post-author-data and comments-author-data
        const post = await Post.findById(postId)
            .populate({
                path: 'author', 
                select: 'picture username email'
            })
            .populate({
                path: 'comments.author',
                select: 'picture username email'
            });

        if(!post){
            return res.status(404).send({message: 'Post not found'});    
        }

        // update views
        post.metadata.views++;
        await post.save();

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

const likeUnlikePost = async (req, res) => {
    try{
        const postId = req.params.id;
        const liker = req.user;

        const post = await Post.findById(postId);
        if(!post)
            return res.status(404).send({message: "Post not found"});

        // Unlike Post
        if(liker.liked.includes(postId)){
            // update post
            post.likes--;
            await post.save();
            
            // update user
            const index = liker.liked.indexOf(postId)
            liker.liked.splice(index, 1);
            await liker.save();

            return res.status(200).send({message: "Unliked post successfully"})
        }
        // Like Post
        else{
            // update post
            post.likes++;
            await post.save();
            
            // update user
            liker.liked.push(post._id);
            await liker.save();

            return res.status(200).send({message: "Liked post successfully"});
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).send({message: 'Unable to like-unlike post, try again later..'})
    }
}

const saveUnsavePost = async (req, res) => {
    try{
        const postId = req.params.id;
        const saver = req.user;

        const post = await Post.findById(postId);
        if(!post)
            return res.status(404).send({message: "Post not found"});

        // Unsave Post
        if(saver.saved.includes(postId)){            
            const index = saver.saved.indexOf(postId)
            saver.saved.splice(index, 1);
            await saver.save();

            return res.status(200).send({message: "Unsaved post successfully"})
        }
        // Save Post
        else{            
            saver.saved.push(post._id);
            await saver.save();

            return res.status(200).send({message: "Saved post successfully"});
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).send({message: 'Unable to save-unsave post, try again later..'})
    }
}

const addComment = async (req, res) => {
    try{
        const postId = req.params.id;
        const commentor = req.user;
        const { comment } = req.body;

        const post = await Post.findById(postId);
        if(!post)
            return res.status(400).send({message: "Post doesnt exists"});

        post.comments.push({
            comment: comment,
            author: commentor._id,
            date: new Date()
        });

        await post.save();

        return res.status(200).send({message: "Comment added to the post"});
    }
    catch(error){
        return res.status(500).send({message: "Cant comment at this moment, try again later"})
    }
}

const deleteComment = async (req, res) => {
    try{
        const postId = req.params.id;
        const { commentId } = req.body;

        // Find post
        const post = await Post.findById(postId);

        if(!post)
            return res.status(400).send({message: "Post doesnt exists"});

        // Update comments
        const index = post.comments.findIndex(
            (comment) => comment._id.toString() === commentId
        );
        post.comments.splice(index, 1);
        await post.save();

        return res.status(200).send({message: "Comment deleted successfully"});
    }
    catch(error){
        return res.status(500).send({message: "Cant delete comment at this moment, try again later"})
    }
}

module.exports = {createPost, getAllPosts, searchPost, searchCategory, getPost, updatePost, deletePost, likeUnlikePost, saveUnsavePost, addComment, deleteComment};