const fs = require("fs");
const path = require("path");
const multer = require('multer');

const uploadPath = path.join(__dirname, "../public/temp");

// creating temp directory if not exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// multer configuration
const storage = multer.diskStorage({
    // defining destination and filename for uploaded files
    destination: function(req, file, cb){
        cb(null, uploadPath);
    },
    filename: function(req, file, cb){
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${name}-${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage
});

module.exports = {
    upload
};