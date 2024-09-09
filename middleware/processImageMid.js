//middleware/processImageMid.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const processImage = async (fileBuffer) => {
  const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.webp`;
  const filePath = path.join('images', filename);
  await sharp(fileBuffer)
    .resize(300)
    .toFormat('webp')
    .toFile(filePath);
  return filePath.replace(/\\/g, '/'); // Assure des slashes forward sur tous les OS
};

const deleteOldImage = async (imageUrl) => {
  if (!imageUrl) return;
  const filename = imageUrl.split('/images/')[1];
  if (!filename) return;
  const filePath = path.join('images', filename);
  try {
    await fs.unlink(filePath);
    console.log(`Old image deleted: ${filePath}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`Error deleting old image: ${error.message}`);
    }
  }
};

const processImageMid = async (req, res, next) => {
  if (req.file) {
    try {
      if (req.method === 'PUT' && req.body.book) {
        const bookData = JSON.parse(req.body.book);
        if (bookData.imageUrl) {
          await deleteOldImage(bookData.imageUrl);
        }
      }

      const filePath = await processImage(req.file.buffer);
      req.imageUrl = `${req.protocol}://${req.get('host')}/${filePath}`;
      next();
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Error processing image' });
    }
  } else {
    next();
  }
};

module.exports = processImageMid;