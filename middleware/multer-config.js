//middleware/multer-config.js
const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png', 
  'image/webp': 'webp'
};

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const isValid = !!MIME_TYPES[file.mimetype];
  let error = isValid ? null : new Error('Invalid mime type!');
  callback(error, isValid);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 4 * 1024 * 1024 } 
});

module.exports = upload.single('image');