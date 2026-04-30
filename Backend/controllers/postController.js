const fs = require("fs")
const Post = require('../schemas/postSchema')
const { uploadOnCloudinary } = require('../utils/cloudinary');

const createPost = async (req, res) => {

    try{
        const {title, tags, body} = req.body;
        const decodedTags = tags.split(',');

        // Check for required files
        if(!req.file)
            return res.status(400).send({message: 'Cover Image is required'})
        if(!title)
            return res.status(400).send({message: 'Title is required'})
        if(!tags)
            return res.status(400).send({message: 'Tags are required'})

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

        console.log("post created");
        return res.status(200).send({message: 'Post created successfully', postId: post._id});
    }
    catch(error){
        console.log(error);
        return res.status(500).send({message: 'Unable to create post'});
    }
};

const getAllPosts = async (req, res) => {
    try {

        // views -> most viewed on top
        // likes -> most liked on top
        // date -> latest on top
        const { sort } = req.query;

        let sortOptions = {};
        let sortField = '';
        if(sort) {
            if(sort === 'views')
                sortField = 'metadata.views'
            else if(sort === 'date')
                sortField = 'createdAt'
            else
                sortField = sort;

            sortOptions[sortField] = -1;
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
        console.log(error)
        return res.status(500).send({message: 'Error Fetching Posts'})
    }
};

const searchPost = async (req, res) => {
    try{

        // Simulate delay
        // await new Promise(resolve => setTimeout(() => {
        //     console.log('first');
        //     resolve();
        // }, 2000));
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
        
        console.log('posts')
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

module.exports = {
    createPost,
    getAllPosts,
    searchPost,
    searchCategory
}