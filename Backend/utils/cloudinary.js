const { v2:cloudinary } = require('cloudinary');
const config = require('../config/config.js')

cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath)
            return null;

        // uploading
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        return response;
    }
    catch(error){
        console.error('Cloudinary upload failed');
        return null;
    }
}

const removeOnCloudinary = async (imageURL) => {

    // extracting public id from url
    const publicId = imageURL.split('/upload/')[1].split('/')[1].split('.')[0];
    await cloudinary.uploader.destroy(publicId)
}

module.exports = {
    uploadOnCloudinary, 
    removeOnCloudinary
};
