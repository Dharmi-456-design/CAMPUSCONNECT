const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const ApiResponse = require('../utils/apiResponse');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images and PDF files
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only images and PDF files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

const uploadToCloudinary = (fileBuffer, folder = 'campusconnect') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = { upload, uploadToCloudinary };
