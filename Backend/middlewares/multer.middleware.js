const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
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
        const extensionByMime = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/webp': '.webp',
            'image/gif': '.gif',
        };
        cb(null, `${crypto.randomUUID()}${extensionByMime[file.mimetype]}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 8 * 1024 * 1024,
        files: 1,
    },
    fileFilter: function(req, file, cb) {
        const allowedTypes = new Set([
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
        ]);

        if (!allowedTypes.has(file.mimetype)) {
            return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
        }
        return cb(null, true);
    },
});

const detectImageMime = (buffer) => {
    if (!Buffer.isBuffer(buffer)) return null;
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
    if (buffer.length >= 8 && Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).equals(buffer.subarray(0, 8))) return 'image/png';
    if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
    if (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii'))) return 'image/gif';
    return null;
};

const validateImageFile = async (req, res, next) => {
    if (!req.file) return next();

    let handle;
    try {
        handle = await fs.promises.open(req.file.path, 'r');
        const header = Buffer.alloc(12);
        const { bytesRead } = await handle.read(header, 0, header.length, 0);
        const detectedMime = detectImageMime(header.subarray(0, bytesRead));
        if (detectedMime !== req.file.mimetype) {
            await handle.close();
            handle = null;
            await fs.promises.unlink(req.file.path).catch(() => {});
            return res.status(400).json({
                success: false,
                code: 'INVALID_IMAGE_FILE',
                message: 'Uploaded cover image content is invalid',
            });
        }
        return next();
    } catch {
        if (handle) await handle.close().catch(() => {});
        await fs.promises.unlink(req.file.path).catch(() => {});
        return res.status(400).json({
            success: false,
            code: 'INVALID_IMAGE_FILE',
            message: 'Uploaded cover image content is invalid',
        });
    } finally {
        if (handle) await handle.close().catch(() => {});
    }
};

module.exports = {
    upload,
    detectImageMime,
    validateImageFile,
};
