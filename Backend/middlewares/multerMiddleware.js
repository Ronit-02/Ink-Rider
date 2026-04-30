const fs = require("fs");
const path = require("path");
const multer = require('multer');

const uploadPath = path.join(__dirname, "../public/temp");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
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